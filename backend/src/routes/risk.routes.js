const express = require('express');
const router = express.Router();
const riskController = require('../controllers/risk.controller');
const authController = require('../controllers/auth.controller');

// Protected routes - all risk routes require authentication
router.use(authController.protect);

// User routes
router.get('/', riskController.getAllRisks);
router.get('/hscode/:code', riskController.getRisksForHsCode);
router.get('/region/:region', riskController.getRisksByRegion);
router.post('/weather', riskController.getWeatherForecast);

// Admin only routes
router.use(authController.restrictTo('admin'));
router.post('/', riskController.createRisk);
router.patch('/:id', riskController.updateRisk);
router.delete('/:id', riskController.deleteRisk);
router.patch('/:id/deactivate', riskController.deactivateRisk);

module.exports = router;