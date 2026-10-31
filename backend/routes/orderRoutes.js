const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderNotes,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Public checkout endpoint
router.post('/', createOrder);

// Manager protected endpoints
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/notes', protect, updateOrderNotes);

module.exports = router;
