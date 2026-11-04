const express = require('express');
const router = express.Router();
const {
  getTranslations,
  getTranslationByKey,
  updateTranslation,
} = require('../controllers/translationController');
const { protect } = require('../middleware/auth');

router.get('/:lang', getTranslations);
router.get('/:lang/:key', getTranslationByKey);
router.put('/:key', protect, updateTranslation);

module.exports = router;
