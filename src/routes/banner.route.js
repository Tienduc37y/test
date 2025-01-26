const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const { uploadBanner } = require('../config/cloudinary');

router.post("/create", adminAuthMiddleware, uploadBanner.single('image'), bannerController.createBanner);
router.put("/update/:id", adminAuthMiddleware, uploadBanner.single('image'), bannerController.updateBanner);
router.delete("/delete/:id", adminAuthMiddleware, bannerController.deleteBanner);
router.get("/all", bannerController.getAllBanners);

module.exports = router; 