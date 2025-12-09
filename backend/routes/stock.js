const express = require('express');
const { body } = require('express-validator');
const {
  getStockByLocation,
  getAllStock,
  updateStock,
  getStockSummary
} = require('../controllers/stockController');
const { authenticateToken, validateApiKey, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const stockValidation = [
  body('productId').isMongoId(),
  body('locationId').isMongoId(),
  body('quantity').isNumeric().isInt({ min: 0 })
];

// Apply authentication and API key validation to all routes
router.use(authenticateToken);
router.use(validateApiKey);

// Routes
router.get('/location/:locationId', getStockByLocation);
router.get('/all', getAllStock);
router.get('/summary', getStockSummary);
router.put('/', authorizeRole(['seller', 'manager', 'admin']), stockValidation, updateStock);

module.exports = router;
