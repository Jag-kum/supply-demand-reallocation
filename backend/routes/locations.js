const express = require('express');
const { body } = require('express-validator');
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/locationController');
const { authenticateToken, validateApiKey, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const locationValidation = [
  body('name').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('latitude').isNumeric(),
  body('longitude').isNumeric()
];

// Apply authentication and API key validation to all routes
router.use(authenticateToken);
router.use(validateApiKey);

// Routes
router.get('/', getLocations);
router.get('/:id', getLocation);
router.post('/', authorizeRole(['manager', 'admin']), locationValidation, createLocation);
router.put('/:id', authorizeRole(['manager', 'admin']), locationValidation, updateLocation);
router.delete('/:id', authorizeRole(['admin']), deleteLocation);

module.exports = router;
