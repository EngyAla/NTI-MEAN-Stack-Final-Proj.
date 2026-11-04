const Category = require('../models/Category');
const Item = require('../models/Item');
const { getRequestedLanguage, localizeCategory } = require('../utils/localization');

/**
 * @desc    Get all categories with item counts and localization
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const lang = getRequestedLanguage(req);
    const categories = await Category.find().sort({ createdAt: -1 });

    // Populate item counts and localize
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Item.countDocuments({ category: cat._id });
        const localized = localizeCategory(cat, lang);
        return {
          ...localized,
          itemCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      lang,
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
    const lang = getRequestedLanguage(req);
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const itemCount = await Item.countDocuments({ category: category._id });
    const localized = localizeCategory(category, lang);

    res.status(200).json({
      success: true,
      lang,
      data: {
        ...localized,
        itemCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to normalize bilingual input
 */
const extractBilingualField = (input, fallbackEn = '', fallbackAr = '') => {
  if (!input) return { en: fallbackEn, ar: fallbackAr };
  if (typeof input === 'object') {
    return {
      en: input.en ? String(input.en).trim() : fallbackEn,
      ar: input.ar ? String(input.ar).trim() : fallbackAr,
    };
  }
  const str = String(input).trim();
  return { en: str || fallbackEn, ar: str || fallbackAr };
};

/**
 * @desc    Create new category (Manager only)
 * @route   POST /api/categories
 * @access  Private (Manager only)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, nameEn, nameAr, description, descriptionEn, descriptionAr, imageUrl, image } =
      req.body;

    const normalizedName = {
      en: nameEn ? String(nameEn).trim() : (name && typeof name === 'object' ? String(name.en || '').trim() : String(name || '').trim()),
      ar: nameAr ? String(nameAr).trim() : (name && typeof name === 'object' ? String(name.ar || '').trim() : ''),
    };

    const normalizedDesc = {
      en: descriptionEn ? String(descriptionEn).trim() : (description && typeof description === 'object' ? String(description.en || '').trim() : (typeof description === 'string' ? description.trim() : '')),
      ar: descriptionAr ? String(descriptionAr).trim() : (description && typeof description === 'object' ? String(description.ar || '').trim() : ''),
    };

    if (!normalizedName.en) {
      return res.status(400).json({
        success: false,
        message: 'English category name is required.',
      });
    }

    if (!normalizedName.ar) {
      return res.status(400).json({
        success: false,
        message: 'Arabic category name is required.',
      });
    }

    // Check duplicate
    const existing = await Category.findOne({
      $or: [
        { 'name.en': { $regex: new RegExp(`^${normalizedName.en}$`, 'i') } },
        { 'name.ar': normalizedName.ar },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists in English or Arabic.',
      });
    }

    const img = imageUrl ? imageUrl.trim() : (image ? image.trim() : '');

    const category = await Category.create({
      name: normalizedName,
      description: normalizedDesc,
      imageUrl: img,
      image: img,
    });

    const lang = getRequestedLanguage(req);
    const localized = localizeCategory(category, lang);

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: {
        ...localized,
        itemCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category (Manager only)
 * @route   PUT /api/categories/:id
 * @access  Private (Manager only)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, nameEn, nameAr, description, descriptionEn, descriptionAr, imageUrl, image } =
      req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Update names
    const currentName = typeof category.name === 'object' ? category.name : { en: category.name, ar: category.name };
    const newEnName = nameEn !== undefined ? String(nameEn).trim() : (name && typeof name === 'object' && name.en !== undefined ? String(name.en).trim() : currentName.en);
    const newArName = nameAr !== undefined ? String(nameAr).trim() : (name && typeof name === 'object' && name.ar !== undefined ? String(name.ar).trim() : currentName.ar);

    if (!newEnName || !newArName) {
      return res.status(400).json({
        success: false,
        message: 'Both English and Arabic category names are required.',
      });
    }

    // Check duplicate
    const duplicate = await Category.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { 'name.en': { $regex: new RegExp(`^${newEnName}$`, 'i') } },
        { 'name.ar': newArName },
      ],
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Another category with this name already exists.',
      });
    }

    category.name = { en: newEnName, ar: newArName };

    // Update descriptions
    const currentDesc = typeof category.description === 'object' ? category.description : { en: category.description || '', ar: category.description || '' };
    const newEnDesc = descriptionEn !== undefined ? String(descriptionEn).trim() : (description && typeof description === 'object' && description.en !== undefined ? String(description.en).trim() : currentDesc.en);
    const newArDesc = descriptionAr !== undefined ? String(descriptionAr).trim() : (description && typeof description === 'object' && description.ar !== undefined ? String(description.ar).trim() : currentDesc.ar);
    category.description = { en: newEnDesc, ar: newArDesc };

    // Update image
    if (imageUrl !== undefined || image !== undefined) {
      const img = (imageUrl || image || '').trim();
      category.imageUrl = img;
      category.image = img;
    }

    await category.save();

    const itemCount = await Item.countDocuments({ category: category._id });
    const lang = getRequestedLanguage(req);
    const localized = localizeCategory(category, lang);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: {
        ...localized,
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
      const catDisplayName = typeof category.name === 'object' ? (category.name.en || category.name.ar) : category.name;
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${catDisplayName}". It still contains ${itemCount} item(s). Please reassign or delete these items first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category was deleted successfully.',
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
