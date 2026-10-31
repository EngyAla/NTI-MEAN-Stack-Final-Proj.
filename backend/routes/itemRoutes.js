const express = require('express');
const router = express.Router();
const {
  getItems,
  getManagerItems,
  getItemById,
  getItemsByCategory,
  validateCart,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/auth');

// Manager explicit endpoint (always includes quantity)
router.get('/manager/all', protect, getManagerItems);

// Cart validation (Public - does not leak quantity)
router.post('/validate-cart', validateCart);

// Category items (Public - excludes quantity unless manager)
router.get('/category/:categoryId', optionalAuth, getItemsByCategory);

// General items list (Public - excludes quantity unless manager)
router.get('/', optionalAuth, getItems);

// Single item details (Public - excludes quantity unless manager)
router.get('/:id', optionalAuth, getItemById);

// Manager protected CRUD
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
