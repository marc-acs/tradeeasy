const express = require('express');
const router = express.Router();
const hsCodeController = require('../controllers/hsCode.controller');
const authController = require('../controllers/auth.controller');

// Public routes
router.get('/', hsCodeController.getAllHsCodes);
router.get('/:code', hsCodeController.getHsCode);

// Protected routes - require authentication
router.use(authController.protect);
router.get('/saved/list', hsCodeController.getSavedHsCodes);
router.post('/:code/save', hsCodeController.saveHsCode);
router.delete('/:code/unsave', hsCodeController.unsaveHsCode);

// Admin only routes
router.use(authController.restrictTo('admin'));
router.post('/', hsCodeController.createHsCode);
router.patch('/:code', hsCodeController.updateHsCode);
router.delete('/:code', hsCodeController.deleteHsCode);

module.exports = router;