const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const { validateApiKey } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['buyer', 'seller', 'manager', 'admin'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', validateApiKey, registerValidation, register);
router.post('/login', validateApiKey, loginValidation, login);

module.exports = router;
