const Item = require('../models/Item');
const Category = require('../models/Category');

/**
 * Helper to sanitize item for public consumption (removes quantity)
 */
const sanitizePublicItem = (item) => {
  const itemObj = item.toObject ? item.toObject() : { ...item };
  delete itemObj.quantity;
  return itemObj;
};

/**
 * @desc    Get all items (public or manager)
 * @route   GET /api/items
 * @access  Public (without quantity) / Manager (with quantity)
 */
const getItems = async (req, res, next) => {
  try {
    const { category, search, featured, sort } = req.query;
    const isManager = Boolean(req.isManager || req.manager);

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'name-asc') sortOption = { name: 1 };

    // Projection: exclude quantity if not manager
    const projection = isManager ? {} : { quantity: 0 };

    const items = await Item.find(filter, projection)
      .populate('category', 'name')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get manager items (always includes stock quantity)
 * @route   GET /api/items/manager/all
 * @access  Private (Manager only)
 */
const getManagerItems = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'quantity-asc') sortOption = { quantity: 1 };
    else if (sort === 'quantity-desc') sortOption = { quantity: -1 };
    else if (sort === 'name-asc') sortOption = { name: 1 };

    const items = await Item.find(filter)
      .populate('category', 'name')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
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
    const projection = isManager ? {} : { quantity: 0 };

    const item = await Item.findById(req.params.id, projection).populate('category', 'name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
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
    const projection = isManager ? {} : { quantity: 0 };

    const items = await Item.find({ category: req.params.categoryId }, projection)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Validate cart quantities against stock (Public)
 * @route   POST /api/items/validate-cart
 * @access  Public
 * @note    Validates without exposing stock quantity
 */
const validateCart = async (req, res, next) => {
  try {
    const { items } = req.body; // array of { itemId, quantity }

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
          message: 'This accessory is no longer available in our collection.',
        });
        continue;
      }

      const requestedQty = Number(cartItem.quantity) || 1;
      const isAvailable = item.quantity >= requestedQty;

      if (!isAvailable) {
        allAvailable = false;
        validationResults.push({
          itemId: cartItem.itemId,
          name: item.name,
          available: false,
          message: requestedQty > item.quantity 
            ? `Requested quantity for "${item.name}" exceeds current stock.` 
            : `"${item.name}" is currently out of stock.`,
        });
      } else {
        validationResults.push({
          itemId: cartItem.itemId,
          name: item.name,
          available: true,
          message: 'In stock.',
        });
      }
    }

    res.status(200).json({
      success: true,
      allAvailable,
      items: validationResults,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new item
 * @route   POST /api/items
 * @access  Private (Manager only)
 */
const createItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      category,
      imageUrl,
      images,
      material,
      dimensions,
      isFeatured,
    } = req.body;

    if (!name || !description || price === undefined || quantity === undefined || !category || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, quantity, category, and primary image are required.',
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
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      quantity: Number(quantity),
      category,
      imageUrl: imageUrl.trim(),
      images: Array.isArray(images) ? images : [],
      material: material ? material.trim() : undefined,
      dimensions: dimensions ? dimensions.trim() : undefined,
      isFeatured: Boolean(isFeatured),
    });

    const populatedItem = await Item.findById(item._id).populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Item created successfully.',
      data: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private (Manager only)
 */
const updateItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      category,
      imageUrl,
      images,
      material,
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

    if (name) item.name = name.trim();
    if (description) item.description = description.trim();
    if (price !== undefined) item.price = Number(price);
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (imageUrl) item.imageUrl = imageUrl.trim();
    if (images !== undefined) item.images = Array.isArray(images) ? images : [];
    if (material !== undefined) item.material = material.trim();
    if (dimensions !== undefined) item.dimensions = dimensions.trim();
    if (isFeatured !== undefined) item.isFeatured = Boolean(isFeatured);

    await item.save();

    const populatedItem = await Item.findById(item._id).populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Item updated successfully.',
      data: populatedItem,
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
      message: `Item "${item.name}" was deleted successfully.`,
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
