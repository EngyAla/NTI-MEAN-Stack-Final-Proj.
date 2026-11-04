const Order = require('../models/Order');
const Item = require('../models/Item');
const { getRequestedLanguage, localizeOrder } = require('../utils/localization');

/**
 * Generate human-friendly order identifier
 * e.g. AUR-2026-98432
 */
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `AUR-${year}-${randomSuffix}`;
};

/**
 * @desc    Submit new order (Public)
 * @route   POST /api/orders
 * @access  Public
 */
const createOrder = async (req, res, next) => {
  try {
    const { customer, items } = req.body;
    const lang = getRequestedLanguage(req);

    // Validate customer details
    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message:
          lang === 'ar'
            ? 'الاسم الكامل، ورقم الهاتف، وعنوان التوصيل كلها حقول مطلوبة.'
            : 'Full name, phone number, and delivery address are required.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          lang === 'ar'
            ? 'يجب أن يحتوي الطلب على قطعة واحدة على الأقل.'
            : 'Order must contain at least one item.',
      });
    }

    // Process and validate items & stock
    const orderItems = [];
    let calculatedTotalPrice = 0;

    // Stage 1: Validate all items exist and have sufficient stock
    for (const orderItem of items) {
      const itemId = orderItem.item || orderItem._id || orderItem.itemId;
      const requestedQty = parseInt(orderItem.quantity, 10);

      if (!itemId || !requestedQty || requestedQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item or quantity in order payload.',
        });
      }

      const itemDoc = await Item.findById(itemId);
      if (!itemDoc) {
        return res.status(404).json({
          success: false,
          message: `Item with id ${itemId} was not found.`,
        });
      }

      const itemNameEn = typeof itemDoc.name === 'object' ? itemDoc.name.en : itemDoc.name;
      const itemNameAr = typeof itemDoc.name === 'object' ? itemDoc.name.ar : itemDoc.name;
      const activeName = lang === 'ar' ? itemNameAr : itemNameEn;

      if (itemDoc.quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          message:
            lang === 'ar'
              ? `المخزون غير كافٍ لـ "${activeName}". المطلوب: ${requestedQty}. يرجى تعديل الكمية.`
              : `Insufficient stock for "${activeName}". Requested: ${requestedQty}. Please adjust your quantity.`,
        });
      }

      const subtotal = itemDoc.price * requestedQty;
      calculatedTotalPrice += subtotal;

      // Historical bilingual snapshot
      orderItems.push({
        item: itemDoc._id,
        name: {
          en: itemNameEn,
          ar: itemNameAr,
        },
        price: itemDoc.price,
        quantity: requestedQty,
        subtotal,
        imageUrl: itemDoc.imageUrl || itemDoc.image || '',
        image: itemDoc.imageUrl || itemDoc.image || '',
      });
    }

    // Stage 2: Deduct stock atomically
    for (const oi of orderItems) {
      const updateResult = await Item.updateOne(
        { _id: oi.item, quantity: { $gte: oi.quantity } },
        { $inc: { quantity: -oi.quantity } }
      );

      if (updateResult.modifiedCount === 0) {
        // Rollback already deducted items if concurrency issue occurred
        for (const rolledBack of orderItems) {
          if (rolledBack.item.toString() === oi.item.toString()) break;
          await Item.updateOne(
            { _id: rolledBack.item },
            { $inc: { quantity: rolledBack.quantity } }
          );
        }

        const fallbackName = typeof oi.name === 'object' ? (oi.name[lang] || oi.name.en) : oi.name;
        return res.status(400).json({
          success: false,
          message:
            lang === 'ar'
              ? `حدث تعارض في المخزون أثناء حجز "${fallbackName}". يرجى مراجعة حقيبة التسوق والمحاولة مجدداً.`
              : `Stock conflict occurred while reserving "${fallbackName}". Please review your cart and try again.`,
        });
      }
    }

    // Stage 3: Create Order document
    let orderNumber = generateOrderNumber();
    while (await Order.findOne({ orderNumber })) {
      orderNumber = generateOrderNumber();
    }

    const order = await Order.create({
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        notes: customer.notes ? customer.notes.trim() : '',
      },
      items: orderItems,
      totalPrice: Math.round(calculatedTotalPrice * 100) / 100,
      status: 'opened',
      internalNotes: '',
    });

    const localized = localizeOrder(order, lang);

    res.status(201).json({
      success: true,
      lang,
      message:
        lang === 'ar'
          ? 'تم استلام طلبكم بنجاح. سيتواصل معكم مدير البوتيك هاتفياً لتأكيد التفاصيل وموعد التسليم.'
          : 'Your order has been received successfully. Our concierge manager will contact you shortly by phone to confirm order details and delivery arrangement.',
      data: localized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Manager only)
 * @route   GET /api/orders
 * @access  Private (Manager only)
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const lang = getRequestedLanguage(req);
    const filter = {};

    if (status && ['opened', 'closed'].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    }

    if (search && search.trim()) {
      filter.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'customer.fullName': { $regex: search.trim(), $options: 'i' } },
        { 'customer.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('items.item');

    const localizedOrders = orders.map((ord) => localizeOrder(ord, lang));

    res.status(200).json({
      success: true,
      lang,
      count: localizedOrders.length,
      data: localizedOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID (Manager only)
 * @route   GET /api/orders/:id
 * @access  Private (Manager only)
 */
const getOrderById = async (req, res, next) => {
  try {
    const lang = getRequestedLanguage(req);
    const order = await Order.findById(req.params.id).populate('items.item');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const localized = localizeOrder(order, lang);

    res.status(200).json({
      success: true,
      lang,
      data: localized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (opened / closed)
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Manager only)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const lang = getRequestedLanguage(req);

    if (!status || !['opened', 'closed'].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be either "opened" or "closed".',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    order.status = status.toLowerCase();
    await order.save();

    const localized = localizeOrder(order, lang);

    res.status(200).json({
      success: true,
      lang,
      message: `Order status updated to "${order.status}".`,
      data: localized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order internal notes
 * @route   PATCH /api/orders/:id/notes
 * @access  Private (Manager only)
 */
const updateOrderNotes = async (req, res, next) => {
  try {
    const { internalNotes } = req.body;
    const lang = getRequestedLanguage(req);

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    order.internalNotes = internalNotes !== undefined ? String(internalNotes).trim() : '';
    await order.save();

    const localized = localizeOrder(order, lang);

    res.status(200).json({
      success: true,
      lang,
      message: 'Internal order notes updated successfully.',
      data: localized,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderNotes,
};
