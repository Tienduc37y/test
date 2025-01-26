const promotionService = require('../services/promotion.service');

exports.applyPromotion = async (req, res) => {
    try {
        const { code } = req.body;
        const result = await promotionService.applyPromotion(req.user.userId, code);
        res.status(200).json({
            status: "200",
            message: "Áp dụng thành công",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: "400",
            error: error.message
        });
    }
};

exports.removePromotion = async (req, res) => {
    try {
        const { code } = req.body;
        const result = await promotionService.removePromotion(req.user.userId, code);
        res.status(200).json({
            status: "200",
            message: "Xóa mã giảm giá thành công",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: "400",
            error: error.message
        });
    }
};

exports.createPromotion = async (req, res) => {
    try {
        const { code, discountPercentage, minOrderValue, description, endDate } = req.body;
        const result = await promotionService.createPromotion(
            code, 
            discountPercentage,
            minOrderValue,
            description,
            endDate
        );
        res.status(201).json({
            status: "201",
            message: "Tạo mã giảm giá thành công",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: "400",
            error: error.message
        });
    }
};

exports.updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await promotionService.updatePromotion(id, req.body);
        res.status(200).json({
            status: "200",
            message: "Cập nhật mã giảm giá thành công",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: "400",
            error: error.message
        });
    }
};

exports.deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        await promotionService.deletePromotion(id);
        res.status(200).json({
            status: "200",
            message: "Xóa mã giảm giá thành công"
        });
    } catch (error) {
        res.status(400).json({
            status: "400",
            error: error.message
        });
    }
};

exports.getAllPromotions = async (req, res) => {
    try {
        const { page = 1, limit = 7 } = req.query;
        const promotions = await promotionService.getAllPromotions(parseInt(page), parseInt(limit));
        res.status(200).json({
            status: "200",
            message: "Lấy tất cả mã giảm giá thành công",
            data: promotions
        });
    } catch (error) {
        res.status(500).json({ 
            status: "500",
            error: error.message
        });
    }
};

exports.toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await promotionService.toggleVisibility(id);
        res.status(200).json({
            status: "200",
            message: `Đã ${result.visible ? 'hiển thị' : 'ẩn'} mã giảm giá`,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: "400",
            error: error.message
        });
    }
};

exports.findPromotionByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const { page = 1, limit = 7 } = req.query;
        const result = await promotionService.findPromotionByCode(
            code.toUpperCase(),
            parseInt(page),
            parseInt(limit)
        );
        res.status(200).json({
            status: "200",
            message: "Tìm thấy mã giảm giá",
            data: result
        });
    } catch (error) {
        res.status(404).json({
            status: "404",
            error: error.message
        });
    }
};
