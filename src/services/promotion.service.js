const Promotion = require('../models/promotion.model');
const CartModel = require('../models/cart.model');
const Cart = require('../services/cart.service')

exports.applyPromotion = async (userId, code) => {
    const promotion = await Promotion.findOne({ 
        code: code.toUpperCase(),
        endDate: { $gt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) }
    });

    if (!promotion) {
        throw new Error('Mã khuyến mãi không tồn tại hoặc đã hết hạn');
    }

    const cart = await Cart.findUserCart(userId);

    if (!cart) {
        throw new Error('Không tìm thấy giỏ hàng');
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (cart.totalDiscountedPrice < promotion.minOrderValue) {
        throw new Error(`Giá trị đơn hàng tối thiểu phải từ ${promotion.minOrderValue.toLocaleString('vi-VN')}đ`);
    }

    // Tính toán giá trị giảm giá dựa trên tổng giá sau khi đã giảm giá sản phẩm
    let discountValue = Math.floor((cart.totalDiscountedPrice * promotion.discountPercentage) / 100);

    // Cập nhật cart
    cart.promotion = promotion;
    cart.discountCode = discountValue;
    cart.totalDiscountedPrice = cart.totalDiscountedPrice - discountValue;

    return await cart.save();
};

exports.removePromotion = async (userId, code) => {
    const cart = await Cart.findUserCart(userId);

    if (!cart) {
        throw new Error('Không tìm thấy giỏ hàng');
    }

    if (!cart.promotion) {
        throw new Error('Không có mã giảm giá nào được áp dụng');
    }

    // Kiểm tra xem mã giảm giá đang áp dụng có phải là mã cần xóa không
    if (cart.promotion.code !== code) {
        throw new Error('Mã giảm giá này không được áp dụng cho giỏ hàng');
    }

    // Tính lại giá sau khi xóa mã giảm giá
    cart.totalDiscountedPrice = cart.totalDiscountedPrice + cart.discountCode;

    // Xóa mã giảm giá khỏi giỏ hàng
    cart.promotion = null;
    cart.discountCode = 0;
    // Lưu giỏ hàng đã cập nhật
    return await cart.save();
};

exports.createPromotion = async (code, discountPercentage, minOrderValue, description, endDate, visible = true) => {
    const existingPromotion = await Promotion.findOne({ code: code.toUpperCase() });
    if (existingPromotion) {
        throw new Error('Mã giảm giá đã tồn tại');
    }

    const newPromotion = new Promotion({
        code: code.toUpperCase(),
        discountPercentage,
        minOrderValue,
        description,
        visible,
        endDate: new Date(endDate)
    });

    return await newPromotion.save();
};

exports.updatePromotion = async (id, updateData) => {
    const promotion = await Promotion.findById(id);
    if (!promotion) {
        throw new Error('Không tìm thấy mã giảm giá');
    }

    let codeChanged = false;
    if (updateData.code && updateData.code !== promotion.code) {
        const existingPromotion = await Promotion.findOne({ code: updateData.code.toUpperCase() });
        if (existingPromotion) {
            throw new Error('Mã giảm giá mới đã tồn tại');
        }
        promotion.code = updateData.code.toUpperCase();
        codeChanged = true;
    }

    if (updateData.discountPercentage) {
        promotion.discountPercentage = updateData.discountPercentage;
    }

    if (updateData.minOrderValue !== undefined) {
        promotion.minOrderValue = updateData.minOrderValue;
    }

    if (updateData.description !== undefined) {
        promotion.description = updateData.description;
    }

    if (updateData.visible !== undefined) {
        promotion.visible = updateData.visible;
    }

    if (updateData.endDate) {
        promotion.endDate = new Date(updateData.endDate);
    }

    // Lưu promotion đã cập nhật
    await promotion.save();

    // Tìm tất cả các giỏ hàng đang sử dụng promotion này
    const cartsUsingPromotion = await CartModel.find({ promotion: id });

    // Cập nhật lại giá trị giảm giá cho mỗi giỏ hàng
    for (let cart of cartsUsingPromotion) {
        let discountValue = (cart.totalDiscountedPrice * promotion.discountPercentage) / 100;

        // Đảm bảo giá trị giảm giá không vượt quá tổng giá trị đơn hàng
        if (discountValue > cart.totalDiscountedPrice) {
            discountValue = cart.totalDiscountedPrice;
        }

        // Cập nhật totalDiscountedPrice và discountCode trong giỏ hàng
        cart.totalDiscountedPrice = cart.totalDiscountedPrice - discountValue;

        if (codeChanged) {
            cart.promotion = promotion;
            cart.discountCode = discountValue;
        }

        // Lưu giỏ hàng đã cập nhật
        await cart.save();
    }

    return promotion;
};

exports.deletePromotion = async (id) => {
    const promotion = await Promotion.findById(id);
    if (!promotion) {
        throw new Error('Không tìm thấy mã giảm giá');
    }

    const cartsUsingPromotion = await CartModel.find({ promotion: id });
    if (cartsUsingPromotion.length > 0) {
        throw new Error('Không thể xóa mã giảm giá đang được sử dụng');
    }

    await Promotion.findByIdAndDelete(id);
};

exports.getAllPromotions = async (page = 1, limit = 7) => {
    try {
        // Đảm bảo page và limit là số dương
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));

        // Đếm tổng số promotions
        const total = await Promotion.countDocuments();

        // Tính tổng số trang
        const totalPages = Math.ceil(total / limit);

        // Tính skip
        const skip = (page - 1) * limit;

        // Query promotions với pagination
        const promotions = await Promotion.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return {
            promotions,
            totalPromotions: total,
            currentPage: page,
            totalPages,
            limit
        };
    } catch (error) {
        throw new Error(`Failed to get all promotions: ${error.message}`);
    }
};

exports.toggleVisibility = async (id) => {
    const promotion = await Promotion.findById(id);
    if (!promotion) {
        throw new Error('Không tìm thấy mã giảm giá');
    }

    // Đảo ngược trạng thái visible
    promotion.visible = !promotion.visible;
    
    // Lưu thay đổi
    await promotion.save();
    
    return promotion;
};

exports.findPromotionByCode = async (code, page = 1, limit = 7) => {
    try {
        // Đảm bảo page và limit là số dương
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));

        const regex = new RegExp(code.toUpperCase(), 'i');
        
        // Đếm tổng số promotions thỏa mãn điều kiện tìm kiếm
        const total = await Promotion.countDocuments({ code: regex });

        // Tính tổng số trang
        const totalPages = Math.ceil(total / limit);

        // Tính skip
        const skip = (page - 1) * limit;

        // Query promotions với pagination
        const promotions = await Promotion.find({ code: regex })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (promotions.length === 0) {
            throw new Error('Không tìm thấy mã giảm giá');
        }

        return {
            promotions,
            totalPromotions: total,
            currentPage: page,
            totalPages,
            limit
        };
    } catch (error) {
        throw new Error(error.message);
    }
};
