const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariff.controller');
const authController = require('../controllers/auth.controller');

// Public routes
router.get('/:code/current', tariffController.getCurrentTariff);
router.get('/:code/history', tariffController.getTariffHistory);

// Protected routes - require authentication
router.use(authController.protect);
router.post('/calculate', tariffController.calculateDuties);

// Admin only routes
router.use(authController.restrictTo('admin'));
router.post('/', tariffController.addTariff);
router.patch('/:id', tariffController.updateTariff);
router.delete('/:id', tariffController.deleteTariff);

module.exports = router;