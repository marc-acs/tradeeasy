const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecast.controller');
const authController = require('../controllers/auth.controller');

// Protected routes - all forecast routes require authentication
router.use(authController.protect);

// Basic subscription routes
router.get('/:code', forecastController.getForecast);

// Premium subscription routes
router.get('/:code/multi-horizon', forecastController.getMultiHorizonForecasts);
router.post('/compare', forecastController.compareForecasts);

module.exports = router;