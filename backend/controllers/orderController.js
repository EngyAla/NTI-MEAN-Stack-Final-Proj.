const Order = require('../models/Order');
const Item = require('../models/Item');

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

    // Validate customer details
    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone number, and delivery address are required.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.',
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

      if (itemDoc.quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${itemDoc.name}". Requested: ${requestedQty}. Please adjust your quantity.`,
        });
      }

      const subtotal = itemDoc.price * requestedQty;
      calculatedTotalPrice += subtotal;

      // Historical snapshot
      orderItems.push({
        item: itemDoc._id,
        name: itemDoc.name,
        price: itemDoc.price,
        quantity: requestedQty,
        subtotal,
        imageUrl: itemDoc.imageUrl,
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

        return res.status(400).json({
          success: false,
          message: `Stock conflict occurred while reserving "${oi.name}". Please review your cart and try again.`,
        });
      }
    }

    // Stage 3: Create Order document
    let orderNumber = generateOrderNumber();
    // Guarantee uniqueness
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

    res.status(201).json({
      success: true,
      message:
        'Your order has been received successfully. Our concierge manager will contact you shortly by phone to confirm order details and delivery arrangement.',
      data: {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        items: order.items,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
      },
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
      .populate('items.item', 'name imageUrl category');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
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
    const order = await Order.findById(req.params.id).populate(
      'items.item',
      'name imageUrl category'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
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

    res.status(200).json({
      success: true,
      message: `Order status updated to "${order.status}".`,
      data: order,
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

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    order.internalNotes = internalNotes !== undefined ? String(internalNotes).trim() : '';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Internal order notes updated successfully.',
      data: order,
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
