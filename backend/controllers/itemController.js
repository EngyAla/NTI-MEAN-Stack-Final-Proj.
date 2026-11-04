const Item = require('../models/Item');
const Category = require('../models/Category');
const { getRequestedLanguage, localizeItem } = require('../utils/localization');

/**
 * @desc    Get all items (public or manager) with localization
 * @route   GET /api/items
 * @access  Public (without quantity) / Manager (with quantity)
 */
const getItems = async (req, res, next) => {
  try {
    const { category, search, featured, sort } = req.query;
    const isManager = Boolean(req.isManager || req.manager);
    const lang = getRequestedLanguage(req);

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { 'name.en': { $regex: term, $options: 'i' } },
        { 'name.ar': { $regex: term, $options: 'i' } },
        { 'description.en': { $regex: term, $options: 'i' } },
        { 'description.ar': { $regex: term, $options: 'i' } },
        // Fallback for legacy string fields
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'name-asc') sortOption = lang === 'ar' ? { 'name.ar': 1 } : { 'name.en': 1 };

    const items = await Item.find(filter)
      .populate('category')
      .sort(sortOption);

    const localizedItems = items.map((item) => localizeItem(item, lang, isManager));

    res.status(200).json({
      success: true,
      lang,
      count: localizedItems.length,
      data: localizedItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get manager items (always includes stock quantity and bilingual objects)
 * @route   GET /api/items/manager/all
 * @access  Private (Manager only)
 */
const getManagerItems = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const lang = getRequestedLanguage(req);
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { 'name.en': { $regex: term, $options: 'i' } },
        { 'name.ar': { $regex: term, $options: 'i' } },
        { 'description.en': { $regex: term, $options: 'i' } },
        { 'description.ar': { $regex: term, $options: 'i' } },
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'quantity-asc') sortOption = { quantity: 1 };
    else if (sort === 'quantity-desc') sortOption = { quantity: -1 };

    const items = await Item.find(filter)
      .populate('category')
      .sort(sortOption);

    const localizedItems = items.map((item) => localizeItem(item, lang, true));

    res.status(200).json({
      success: true,
      lang,
      count: localizedItems.length,
      data: localizedItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Public / Manager
 */
const getItemById = async (req, res, next) => {
  try {
    const isManager = Boolean(req.isManager || req.manager);
    const lang = getRequestedLanguage(req);

    const item = await Item.findById(req.params.id).populate('category');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const localized = localizeItem(item, lang, isManager);

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
 * @desc    Get items by category
 * @route   GET /api/items/category/:categoryId
 * @access  Public
 */
const getItemsByCategory = async (req, res, next) => {
  try {
    const isManager = Boolean(req.isManager || req.manager);
    const lang = getRequestedLanguage(req);

    const items = await Item.find({ category: req.params.categoryId })
      .populate('category')
      .sort({ createdAt: -1 });

    const localizedItems = items.map((item) => localizeItem(item, lang, isManager));

    res.status(200).json({
      success: true,
      lang,
      count: localizedItems.length,
      data: localizedItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Validate cart quantities against stock (Public)
 * @route   POST /api/items/validate-cart
 * @access  Public
 * @note    Validates without exposing exact stock quantity
 */
const validateCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    const lang = getRequestedLanguage(req);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required for validation.',
      });
    }

    let allAvailable = true;
    const validationResults = [];

    for (const cartItem of items) {
      const item = await Item.findById(cartItem.itemId);

      if (!item) {
        allAvailable = false;
        validationResults.push({
          itemId: cartItem.itemId,
          available: false,
          message:
            lang === 'ar'
              ? 'هذه القطعة لم تعد متوفرة في مجموعتنا.'
              : 'This accessory is no longer available in our collection.',
        });
        continue;
      }

      const requestedQty = Number(cartItem.quantity) || 1;
      const isAvailable = item.quantity >= requestedQty;

      const itemName =
        typeof item.name === 'object'
          ? (item.name[lang] || item.name.en || '')
          : (item.name || '');

      if (!isAvailable) {
        allAvailable = false;
        validationResults.push({
          itemId: cartItem.itemId,
          name: itemName,
          available: false,
          message:
            lang === 'ar'
              ? requestedQty > item.quantity
                ? `الكمية المطلوبة لـ "${itemName}" تتجاوز المخزون الحالي.`
                : `"${itemName}" غير متوفر حالياً في المخزن.`
              : requestedQty > item.quantity
              ? `Requested quantity for "${itemName}" exceeds current stock.`
              : `"${itemName}" is currently out of stock.`,
        });
      } else {
        validationResults.push({
          itemId: cartItem.itemId,
          name: itemName,
          available: true,
          message: lang === 'ar' ? 'متوفر' : 'In stock.',
        });
      }
    }

    res.status(200).json({
      success: true,
      lang,
      allAvailable,
      items: validationResults,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new item (Manager only)
 * @route   POST /api/items
 * @access  Private (Manager only)
 */
const createItem = async (req, res, next) => {
  try {
    const {
      name,
      nameEn,
      nameAr,
      description,
      descriptionEn,
      descriptionAr,
      price,
      quantity,
      category,
      imageUrl,
      image,
      images,
      material,
      materialEn,
      materialAr,
      dimensions,
      isFeatured,
    } = req.body;

    const normalizedName = {
      en: nameEn ? String(nameEn).trim() : (name && typeof name === 'object' ? String(name.en || '').trim() : String(name || '').trim()),
      ar: nameAr ? String(nameAr).trim() : (name && typeof name === 'object' ? String(name.ar || '').trim() : ''),
    };

    const normalizedDesc = {
      en: descriptionEn ? String(descriptionEn).trim() : (description && typeof description === 'object' ? String(description.en || '').trim() : (typeof description === 'string' ? description.trim() : '')),
      ar: descriptionAr ? String(descriptionAr).trim() : (description && typeof description === 'object' ? String(description.ar || '').trim() : ''),
    };

    const normalizedMaterial = {
      en: materialEn ? String(materialEn).trim() : (material && typeof material === 'object' ? String(material.en || '').trim() : (typeof material === 'string' ? material.trim() : 'Full-Grain Italian Calfskin / Gilded Brass')),
      ar: materialAr ? String(materialAr).trim() : (material && typeof material === 'object' ? String(material.ar || '').trim() : 'جلد عجل إيطالي / نحاس مطلي بذهب'),
    };

    if (!normalizedName.en) {
      return res.status(400).json({
        success: false,
        message: 'English item name is required.',
      });
    }

    if (!normalizedName.ar) {
      return res.status(400).json({
        success: false,
        message: 'Arabic item name is required.',
      });
    }

    if (!normalizedDesc.en) {
      return res.status(400).json({
        success: false,
        message: 'English item description is required.',
      });
    }

    if (!normalizedDesc.ar) {
      return res.status(400).json({
        success: false,
        message: 'Arabic item description is required.',
      });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Item price is required.',
      });
    }

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: 'Item stock quantity is required.',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      });
    }

    const img = (imageUrl || image || '').trim();
    if (!img) {
      return res.status(400).json({
        success: false,
        message: 'Primary image URL is required.',
      });
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Specified category does not exist.',
      });
    }

    const item = await Item.create({
      name: normalizedName,
      description: normalizedDesc,
      price: Number(price),
      quantity: Number(quantity),
      category,
      imageUrl: img,
      image: img,
      images: Array.isArray(images) ? images : [],
      material: normalizedMaterial,
      dimensions: dimensions ? dimensions.trim() : undefined,
      isFeatured: Boolean(isFeatured),
    });

    const populated = await Item.findById(item._id).populate('category');
    const lang = getRequestedLanguage(req);
    const localized = localizeItem(populated, lang, true);

    res.status(201).json({
      success: true,
      message: 'Item created successfully.',
      data: localized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item (Manager only)
 * @route   PUT /api/items/:id
 * @access  Private (Manager only)
 */
const updateItem = async (req, res, next) => {
  try {
    const {
      name,
      nameEn,
      nameAr,
      description,
      descriptionEn,
      descriptionAr,
      price,
      quantity,
      category,
      imageUrl,
      image,
      images,
      material,
      materialEn,
      materialAr,
      dimensions,
      isFeatured,
    } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Specified category does not exist.',
        });
      }
      item.category = category;
    }

    // Update names
    const currentName = typeof item.name === 'object' ? item.name : { en: item.name, ar: item.name };
    const newEnName = nameEn !== undefined ? String(nameEn).trim() : (name && typeof name === 'object' && name.en !== undefined ? String(name.en).trim() : currentName.en);
    const newArName = nameAr !== undefined ? String(nameAr).trim() : (name && typeof name === 'object' && name.ar !== undefined ? String(name.ar).trim() : currentName.ar);

    if (!newEnName || !newArName) {
      return res.status(400).json({
        success: false,
        message: 'Both English and Arabic item names are required.',
      });
    }
    item.name = { en: newEnName, ar: newArName };

    // Update descriptions
    const currentDesc = typeof item.description === 'object' ? item.description : { en: item.description || '', ar: item.description || '' };
    const newEnDesc = descriptionEn !== undefined ? String(descriptionEn).trim() : (description && typeof description === 'object' && description.en !== undefined ? String(description.en).trim() : currentDesc.en);
    const newArDesc = descriptionAr !== undefined ? String(descriptionAr).trim() : (description && typeof description === 'object' && description.ar !== undefined ? String(description.ar).trim() : currentDesc.ar);

    if (!newEnDesc || !newArDesc) {
      return res.status(400).json({
        success: false,
        message: 'Both English and Arabic item descriptions are required.',
      });
    }
    item.description = { en: newEnDesc, ar: newArDesc };

    // Update material
    const currentMat = typeof item.material === 'object' ? item.material : { en: item.material || '', ar: item.material || '' };
    const newEnMat = materialEn !== undefined ? String(materialEn).trim() : (material && typeof material === 'object' && material.en !== undefined ? String(material.en).trim() : currentMat.en);
    const newArMat = materialAr !== undefined ? String(materialAr).trim() : (material && typeof material === 'object' && material.ar !== undefined ? String(material.ar).trim() : currentMat.ar);
    item.material = { en: newEnMat, ar: newArMat };

    if (price !== undefined) item.price = Number(price);
    if (quantity !== undefined) item.quantity = Number(quantity);

    if (imageUrl !== undefined || image !== undefined) {
      const img = (imageUrl || image || '').trim();
      item.imageUrl = img;
      item.image = img;
    }

    if (images !== undefined) item.images = Array.isArray(images) ? images : [];
    if (dimensions !== undefined) item.dimensions = dimensions.trim();
    if (isFeatured !== undefined) item.isFeatured = Boolean(isFeatured);

    await item.save();

    const populated = await Item.findById(item._id).populate('category');
    const lang = getRequestedLanguage(req);
    const localized = localizeItem(populated, lang, true);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully.',
      data: localized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete item
 * @route   DELETE /api/items/:id
 * @access  Private (Manager only)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item was deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getManagerItems,
  getItemById,
  getItemsByCategory,
  validateCart,
  createItem,
  updateItem,
  deleteItem,
};
