const Category = require('../models/Category');
const Item = require('../models/Item');

/**
 * @desc    Get all categories with item counts
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Populate item counts
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Item.countDocuments({ category: cat._id });
        return {
          _id: cat._id,
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
          itemCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const itemCount = await Item.countDocuments({ category: category._id });

    res.status(200).json({
      success: true,
      data: {
        _id: category._id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        itemCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Manager only)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: {
        _id: category._id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        itemCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Manager only)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    if (name && name.trim()) {
      const duplicate = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name already exists.',
        });
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (imageUrl !== undefined) {
      category.imageUrl = imageUrl.trim();
    }

    await category.save();

    const itemCount = await Item.countDocuments({ category: category._id });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: {
        _id: category._id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        itemCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Manager only)
 * @rule    Prevent deleting category if it contains products
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Check if category contains products
    const itemCount = await Item.countDocuments({ category: category._id });
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}". It still contains ${itemCount} item(s). Please reassign or delete these items first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" was deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
