const SUPPORTED_LANGS = ['en', 'ar'];
const DEFAULT_LANG = 'en';

/**
 * Extracts and validates requested language from query parameter or Accept-Language header
 */
const getRequestedLanguage = (req) => {
  if (req.query && req.query.lang) {
    const q = String(req.query.lang).toLowerCase().trim();
    if (SUPPORTED_LANGS.includes(q)) return q;
  }

  const header = req.headers['accept-language'];
  if (header) {
    const primary = header.split(',')[0].trim().substring(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(primary)) return primary;
  }

  return DEFAULT_LANG;
};

/**
 * Localizes a single category document
 */
const localizeCategory = (cat, lang = 'en') => {
  if (!cat) return null;
  const obj = cat.toObject ? cat.toObject() : { ...cat };

  const nameEn = obj.name && typeof obj.name === 'object' ? obj.name.en || '' : obj.name || '';
  const nameAr = obj.name && typeof obj.name === 'object' ? obj.name.ar || nameEn : obj.name || '';
  const descEn = obj.description && typeof obj.description === 'object' ? obj.description.en || '' : obj.description || '';
  const descAr = obj.description && typeof obj.description === 'object' ? obj.description.ar || descEn : obj.description || '';

  const activeName = lang === 'ar' ? nameAr : nameEn;
  const activeDesc = lang === 'ar' ? descAr : descEn;

  return {
    ...obj,
    name: activeName,
    nameObj: { en: nameEn, ar: nameAr },
    description: activeDesc,
    descriptionObj: { en: descEn, ar: descAr },
    imageUrl: obj.imageUrl || obj.image || '',
    image: obj.imageUrl || obj.image || '',
  };
};

/**
 * Localizes a single item document
 */
const localizeItem = (item, lang = 'en', isManager = false) => {
  if (!item) return null;
  const obj = item.toObject ? item.toObject() : { ...item };

  const nameEn = obj.name && typeof obj.name === 'object' ? obj.name.en || '' : obj.name || '';
  const nameAr = obj.name && typeof obj.name === 'object' ? obj.name.ar || nameEn : obj.name || '';

  const descEn = obj.description && typeof obj.description === 'object' ? obj.description.en || '' : obj.description || '';
  const descAr = obj.description && typeof obj.description === 'object' ? obj.description.ar || descEn : obj.description || '';

  const matEn = obj.material && typeof obj.material === 'object' ? obj.material.en || '' : obj.material || '';
  const matAr = obj.material && typeof obj.material === 'object' ? obj.material.ar || matEn : obj.material || '';

  const activeName = lang === 'ar' ? nameAr : nameEn;
  const activeDesc = lang === 'ar' ? descAr : descEn;
  const activeMaterial = lang === 'ar' ? matAr : matEn;

  // Localize populated category if present
  let categoryFormatted = obj.category;
  let categoryName = '';
  if (obj.category && typeof obj.category === 'object') {
    const localizedCat = localizeCategory(obj.category, lang);
    categoryFormatted = localizedCat;
    categoryName = localizedCat.name;
  }

  const result = {
    ...obj,
    name: activeName,
    nameObj: { en: nameEn, ar: nameAr },
    description: activeDesc,
    descriptionObj: { en: descEn, ar: descAr },
    material: activeMaterial,
    materialObj: { en: matEn, ar: matAr },
    category: categoryFormatted,
    categoryName,
    imageUrl: obj.imageUrl || obj.image || '',
    image: obj.imageUrl || obj.image || '',
  };

  // Strictly omit stock quantity for public users
  if (!isManager) {
    delete result.quantity;
  }

  return result;
};

/**
 * Localizes an order document snapshot
 */
const localizeOrder = (order, lang = 'en') => {
  if (!order) return null;
  const obj = order.toObject ? order.toObject() : { ...order };

  if (obj.items && Array.isArray(obj.items)) {
    obj.items = obj.items.map((itm) => {
      const nameEn = itm.name && typeof itm.name === 'object' ? itm.name.en || '' : itm.name || '';
      const nameAr = itm.name && typeof itm.name === 'object' ? itm.name.ar || nameEn : itm.name || '';
      const activeName = lang === 'ar' ? nameAr : nameEn;

      return {
        ...itm,
        name: activeName,
        nameObj: { en: nameEn, ar: nameAr },
        imageUrl: itm.imageUrl || itm.image || '',
        image: itm.imageUrl || itm.image || '',
      };
    });
  }

  return obj;
};

module.exports = {
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  getRequestedLanguage,
  localizeCategory,
  localizeItem,
  localizeOrder,
};
