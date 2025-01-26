const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const adminAuth = require('../middlewares/adminAuth.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/apply', authMiddleware, promotionController.applyPromotion);
router.post('/remove', authMiddleware, promotionController.removePromotion);
router.post('/create', adminAuth, promotionController.createPromotion);
router.put('/update/:id', adminAuth, promotionController.updatePromotion);
router.delete('/delete/:id', adminAuth, promotionController.deletePromotion);
router.get('/all', promotionController.getAllPromotions);
router.patch('/toggle-visibility/:id', adminAuth, promotionController.toggleVisibility);
router.get('/find/:code',adminAuth, promotionController.findPromotionByCode);

module.exports = router;
