const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { authenticateToken, validateApiKey, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const productValidation = [
  body('name').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('description').optional().trim()
];

// Apply authentication and API key validation to all routes
router.use(authenticateToken);
router.use(validateApiKey);

// Routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authorizeRole(['seller', 'manager', 'admin']), productValidation, createProduct);
router.put('/:id', authorizeRole(['seller', 'manager', 'admin']), productValidation, updateProduct);
router.delete('/:id', authorizeRole(['manager', 'admin']), deleteProduct);

module.exports = router;
