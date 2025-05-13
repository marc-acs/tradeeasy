const express = require('express');
const router = express.Router();
const priceController = require('../controllers/price.controller');
const authController = require('../controllers/auth.controller');

// Public routes
router.get('/:code/history', priceController.getPriceHistory);
router.get('/:code/current', priceController.getCurrentPrice);

// Protected routes - require authentication
router.use(authController.protect);
router.post('/compare', priceController.comparePrices);

// Admin only routes
router.use(authController.restrictTo('admin'));
router.post('/', priceController.addPrice);
router.patch('/:id', priceController.updatePrice);
router.delete('/:id', priceController.deletePrice);

module.exports = router;