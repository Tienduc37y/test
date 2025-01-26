const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
// Route tạo đơn hàng ZaloPay
router.post('/create-zalopay-order/:orderId', paymentController.createZaloPayOrder);

// Route callback từ ZaloPay
router.post('/zalopay-callback', paymentController.handleZaloPayCallback);

// Route kiểm tra trạng thái đơn hàng
router.get('/order-status/:app_trans_id',adminAuthMiddleware, paymentController.getOrderStatus);

// Thêm route mới để kiểm tra tất cả đơn hàng
router.get('/all-orders-status', adminAuthMiddleware, paymentController.getAllOrdersStatus);

module.exports = router;
