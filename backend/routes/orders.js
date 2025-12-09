const express = require('express');
const { body } = require('express-validator');
const {
  orderProduct,
  purchaseProduct,
  getUserOrders,
  cancelOrder
} = require('../controllers/orderController');
const { authenticateToken, validateApiKey } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const orderValidation = [
  body('productId').isMongoId(),
  body('locationId').isMongoId(),
  body('quantity').isNumeric().isInt({ min: 1 })
];

// Apply authentication and API key validation to all routes
router.use(authenticateToken);
router.use(validateApiKey);

// Routes
// Create order
router.post('/order', orderValidation, orderProduct);
router.post('/purchase/:orderId', purchaseProduct);
router.get('/user/:userId', getUserOrders);
router.put('/cancel/:orderId', cancelOrder);

module.exports = router;
