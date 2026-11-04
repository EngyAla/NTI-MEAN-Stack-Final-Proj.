const Translation = require('../models/Translation');
const { SUPPORTED_LANGS, DEFAULT_LANG } = require('../utils/localization');

/**
 * @desc    Get all translations for a language as a key-value dictionary
 * @route   GET /api/translations/:lang
 * @access  Public
 */
const getTranslations = async (req, res, next) => {
  try {
    let lang = String(req.params.lang || DEFAULT_LANG).toLowerCase().trim();
    if (!SUPPORTED_LANGS.includes(lang)) {
      lang = DEFAULT_LANG;
    }

    const translations = await Translation.find().lean();

    // Map into key-value dictionary for instant frontend access
    const dictionary = {};
    translations.forEach((item) => {
      dictionary[item.key] = item[lang] || item.en || item.key;
    });

    res.status(200).json({
      success: true,
      lang,
      count: translations.length,
      data: dictionary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single translation by key
 * @route   GET /api/translations/:lang/:key
 * @access  Public
 */
const getTranslationByKey = async (req, res, next) => {
  try {
    let lang = String(req.params.lang || DEFAULT_LANG).toLowerCase().trim();
    if (!SUPPORTED_LANGS.includes(lang)) {
      lang = DEFAULT_LANG;
    }

    const { key } = req.params;
    const translation = await Translation.findOne({ key });

    if (!translation) {
      return res.status(404).json({
        success: false,
        message: `Translation key "${key}" not found.`,
      });
    }

    res.status(200).json({
      success: true,
      key,
      lang,
      translation: translation[lang] || translation.en || key,
      en: translation.en,
      ar: translation.ar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update or create a translation (Manager only)
 * @route   PUT /api/translations/:key
 * @access  Private (Manager only)
 */
const updateTranslation = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { en, ar } = req.body;

    if (!en && !ar) {
      return res.status(400).json({
        success: false,
        message: 'At least one translation (en or ar) must be provided.',
      });
    }

    const updateData = {};
    if (en !== undefined) updateData.en = String(en).trim();
    if (ar !== undefined) updateData.ar = String(ar).trim();

    const translation = await Translation.findOneAndUpdate(
      { key },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Translation for "${key}" updated successfully.`,
      data: translation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTranslations,
  getTranslationByKey,
  updateTranslation,
};
