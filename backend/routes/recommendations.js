const express = require('express');
const { body } = require('express-validator');
const {
  getRecommendations,
  getRecommendation,
  approveRecommendation,
  createRecommendation
} = require('../controllers/recommendationController');
const { authenticateToken, validateApiKey, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const recommendationValidation = [
  body('productId').isMongoId(),
  body('fromLocationId').isMongoId(),
  body('toLocationId').isMongoId(),
  body('quantity').isNumeric().isInt({ min: 1 }),
  body('priority').optional().isIn(['low', 'medium', 'high'])
];

// Apply authentication and API key validation to all routes
router.use(authenticateToken);
router.use(validateApiKey);

// Routes
router.get('/', getRecommendations);
router.get('/:id', getRecommendation);
router.post('/:id/approve', authorizeRole(['seller', 'manager', 'admin']), approveRecommendation);
router.post('/', authorizeRole(['manager', 'admin']), recommendationValidation, createRecommendation);

module.exports = router;
