const cartService = require('../services/cart.service')
const Order = require('../models/order.model')
const OrderItem = require('../models/orderItems.model')
const User = require('../models/user.model')
const Cart = require('../models/cart.model')
const CartItem = require('../models/cartItem.model')
const Product = require('../models/product.model')
const Address = require('../models/address.model')
const Promotion = require('../models/promotion.model')
const Review = require('../models/review.model')

// Hàm helper để cập nhật số lượng sản phẩm
async function updateProductQuantities(orderItems, isIncrease = true) {
    try {
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                const variantIndex = product.variants.findIndex(v => v.color === item.color);
                if (variantIndex !== -1) {
                    const sizeIndex = product.variants[variantIndex].sizes.findIndex(s => s.size === item.size);
                    if (sizeIndex !== -1) {
                        // Tăng/giảm số lượng của size cụ thể
                        product.variants[variantIndex].sizes[sizeIndex].quantityItem += isIncrease ? item.quantity : -item.quantity;
                    }
                }

                // Tăng/giảm tổng số lượng sản phẩm
                product.quantity += isIncrease ? item.quantity : -item.quantity;
                
                // Giảm/tăng số lượng đã bán
                product.sellQuantity = Math.max(0, product.sellQuantity + (isIncrease ? -item.quantity : item.quantity));

                await product.save();
            }
        }
    } catch (error) {
        throw new Error(`Failed to update product quantities: ${error.message}`);
    }
}
async function createOrder(user, shippingAddress, paymentMethod, code) {
    try {
        let userDoc = await User.findById(user.userId);
        if (!userDoc) {
            throw new Error('Vui lòng đăng nhập');
        }

        const cart = await cartService.findUserCart(userDoc._id)
        if (!cart) {
            throw new Error('Cart not found');
        }

        // Kiểm tra giỏ hàng có sản phẩm không
        if (!cart.cartItems || cart.cartItems.length === 0) {
            throw new Error('Giỏ hàng trống, không thể tạo đơn hàng');
        }

        let promotion = null;
        if (code !== '') {
            promotion = await Promotion.findOne({ 
                code: code.toUpperCase(),
            });

            if (promotion) {
                const now = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
                if (promotion.endDate <= now) {
                    throw new Error('Mã giảm giá đã hết hạn, xóa mã giảm giá và thử lại');
                }

                // Kiểm tra điều kiện giá trị đơn hàng tối thiểu
                if (cart.totalDiscountedPrice < promotion.minOrderValue) {
                    throw new Error(`Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã giảm giá này. Bạn cần mua thêm ${(promotion.minOrderValue - cart.totalDiscountedPrice).toLocaleString('vi-VN')}đ nữa`);
                }
            }
        }

        let address;
        if (userDoc.address) {
            address = await Address.findByIdAndUpdate(
                userDoc.address,
                {
                    firstName: shippingAddress.firstName,
                    lastName: shippingAddress.lastName,
                    streetAddress: shippingAddress.streetAddress,
                    city: shippingAddress.city,
                    district: shippingAddress.district,
                    ward: shippingAddress.ward,
                    mobile: shippingAddress.mobile
                },
                { new: true }
            );
        } else {
            address = new Address(shippingAddress);
            await address.save();
            address.user = userDoc;
            await address.save();

            userDoc.address = address._id;
            await userDoc.save();
        }

        const orderItems = []

        for(const item of cart.cartItems) {
            const orderItem = new OrderItem({
                price: item.price,
                product: item.product,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                userId: item.userId,
                discountedPrice: item.discountedPrice
            })
            const createdOrderItem = await orderItem.save()
            orderItems.push(createdOrderItem)
        }

        const createdOrder = new Order({
            user: userDoc._id,
            orderItems,
            totalPrice: cart.totalPrice,
            totalDiscountedPrice: cart.totalDiscountedPrice,
            discounte: cart.discounte,
            totalItem: cart.totalItem,
            shippingAddress: {
                id: address._id,
                address: {
                    firstName: shippingAddress.firstName,
                    lastName: shippingAddress.lastName,
                    streetAddress: shippingAddress.streetAddress,
                    city: shippingAddress.city,
                    district: shippingAddress.district,
                    ward: shippingAddress.ward,
                    mobile: shippingAddress.mobile
                }
            },
            paymentDetails: {
                paymentMethod: paymentMethod,
            },
            promotion: promotion && 
                      promotion.endDate > new Date(new Date().getTime() + 7 * 60 * 60 * 1000) && 
                      cart.totalDiscountedPrice >= promotion.minOrderValue
                ? promotion 
                : null,
            discountCode: cart.discountCode
        })

        const saveOrder = await createdOrder.save()
        
        // Xóa toàn bộ cartItems nhưng giữ nguyên cart
        await CartItem.deleteMany({ cart: cart._id });

        // Cập nhật cart
        cart.cartItems = [];
        cart.totalPrice = 0;
        cart.totalDiscountedPrice = 0;
        cart.discounte = 0;
        cart.totalItem = 0;
        cart.promotion = null;
        cart.discountCode = 0;
        await cart.save();

        // Cập nhật số lượng sản phẩm
        for (const item of orderItems) {
            const product = await Product.findById(item.product._id);
            if (product) {
                const variantIndex = product.variants.findIndex(v => v.color === item.color);
                if (variantIndex !== -1) {
                    const sizeIndex = product.variants[variantIndex].sizes.findIndex(s => s.size === item.size);
                    if (sizeIndex !== -1) {
                        // Giảm số lượng của size cụ thể
                        product.variants[variantIndex].sizes[sizeIndex].quantityItem -= item.quantity;
                    }
                }

                // Giảm tổng số lượng sản phẩm
                product.quantity -= item.quantity;
                product.quantity = Math.max(product.quantity, 0);

                // Tăng số lượng đã bán
                product.sellQuantity += item.quantity;

                await product.save();
            }
        }

        return saveOrder;
    } catch (error) {
        throw new Error(`${error.message}`);
    }
}

async function placeOrder(orderId) {
    try {
        const order = await findOrderById(orderId);
        order.orderStatus = "Đặt hàng thành công"
        return await order.save()
    } catch (error) {
        throw new Error(`Failed to place order: ${error.message}`);
    }
}

async function cancelOrder(orderId) {
    try {
        const order = await findOrderById(orderId);
        await updateProductQuantities(order.orderItems, true); // true để tăng số lượng
        order.orderStatus = "Đã hủy";
        order.completeOrderDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
        return await order.save();
    } catch (error) {
        throw new Error(`Failed to cancel order: ${error.message}`);
    }
}

async function refundOrder(orderId) {
    try {
        const order = await findOrderById(orderId);
        await updateProductQuantities(order.orderItems, true); // true để tăng số lượng
        order.orderStatus = "Hoàn trả hàng";
        order.completeOrderDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
        return await order.save();
    } catch (error) {
        throw new Error(`Failed to refund order: ${error.message}`);
    }
}

async function pendingOrder(orderId) {
    try {
        const order = await findOrderById(orderId);
        order.orderStatus = "Đang chờ xử lý"
        return await order.save()
    } catch (error) {
        throw new Error(`Failed to pending order: ${error.message}`);
    }
}

async function confirmedOrder(orderId) {
    try {
        const order = await findOrderById(orderId);
        order.orderStatus = "Xác nhận đơn hàng"
        return await order.save()
    } catch (error) {
        throw new Error(`Failed to confirm order: ${error.message}`);
    }
}

async function shipOrder(orderId) {
    try {
        const order = await findOrderById(orderId);
        order.orderStatus = "Đang giao hàng"
        return await order.save()
    } catch (error) {
        throw new Error(`Failed to ship order: ${error.message}`);
    }
}

async function deliverOrder(orderId) {
    try {
        const order = await findOrderById(orderId);
        order.orderStatus = "Đã giao hàng"
        return await order.save()
    } catch (error) {
        throw new Error(`Failed to deliver order: ${error.message}`);
    }
}

async function confirmPayment(orderId) {
    try {
        const order = await findOrderById(orderId);
        order.orderStatus = "Đã thanh toán"
        return await order.save()
    } catch (error) {
        throw new Error(`Failed to confirm payment: ${error.message}`);
    }
}

async function completeOrder(orderId) {
    try {
        const order = await findOrderById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        order.orderStatus = "Đã hoàn thành";
        order.completeOrderDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
        await order.save();
        return order;
    } catch (error) {
        throw new Error(`Failed to complete order: ${error.message}`);
    }
}

async function findOrderById(orderId) {
    try {
        const order = await Order.findById(orderId)
            .populate("user")
            .populate({path: "orderItems",populate:{path: "product"}})
            .populate("promotion")
        if (!order) {
            throw new Error('Order not found');
        }
        return order
    } catch (error) {
        throw new Error(`Failed to find order: ${error.message}`);
    }
}

async function usersOrderHistory(userId, statuses, page = 1, limit = 10) {
    try {
        // Đảm bảo page và limit là số
        page = parseInt(page);
        limit = parseInt(limit);
        
        // Tạo query dựa trên các status
        const query = { user: userId };
        if (statuses) {
            const statusArray = statuses.split(','); // Chuyển chuỗi thành mảng
            query.orderStatus = { $in: statusArray };
        }

        // Kiểm tra và điều chỉnh page nếu vượt quá
        const total = await Order.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        // Điều chỉnh page nếu vượt quá totalPages
        if (page > totalPages) {
            page = totalPages > 0 ? totalPages : 1;
        }

        // Tính skip sau khi đã điều chỉnh page
        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "orderItems",
                populate: { 
                    path: "product",
                    select: 'title variants price discountedPrice' 
                }
            })
            .populate("promotion")
            .lean();

        return {
            orders,
            totalOrders: total,
            currentPage: page,
            totalPages,
            limit
        };
    } catch (error) {
        throw new Error(`Failed to get user's order history: ${error.message}`);
    }
}

async function getAllOrders(pageNumber, pageSize, status, sort, paymentMethod, date) {
    try {
        let query = {};

        // Filter theo status nếu có
        if (status) {
            query.orderStatus = status;
        }

        // Filter theo paymentMethod nếu có
        if (paymentMethod) {
            query['paymentDetails.paymentMethod'] = paymentMethod;
        }

        // Filter theo ngày nếu có
        if (date && date !== 'null' && date !== 'undefined') {
            // Tạo startDate là 00:00:00 của ngày được chọn
            const startDate = new Date(date);
            startDate.setUTCHours(0, 0, 0, 0);
            
            // Tạo endDate là 23:59:59 của ngày được chọn
            const endDate = new Date(date);
            endDate.setUTCHours(23, 59, 59, 999);

            query.orderDate = {
                $gte: startDate,
                $lte: endDate
            };

        }

        // Tính toán skip để phân trang
        const skip = (pageNumber - 1) * pageSize;

        // Mặc định sắp xếp theo ngày mới nhất nếu không có sort
        let sortCondition = { orderDate: -1 }; 
        if (sort) {
            sortCondition = sort === 'asc' ? { orderDate: 1 } : { orderDate: -1 };
        }

        const orders = await Order.find(query)
            .populate({
                path: 'user',
                select: 'firstName lastName username email'
            })
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                }
            })
            .populate("promotion")
            .sort(sortCondition)
            .skip(skip)
            .limit(pageSize);
        // Đếm tổng số orders thỏa mãn điều kiện
        const totalOrders = await Order.countDocuments(query);

        // Tính tổng số trang
        const totalPages = Math.ceil(totalOrders / pageSize);

        return {
            orders,
            totalPages,
            currentPage: pageNumber,
            totalOrders,
            limit: pageSize
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

async function deleteOrder(orderId) {
    try {
        const order = await findOrderById(orderId)
        await Order.findByIdAndDelete(order._id)
    } catch (error) {
        throw new Error(`Failed to delete order: ${error.message}`);
    }
}

async function getOrderStatistics() {
    try {
        // Số đơn hàng đã hoàn thành
        const completedOrders = await Order.countDocuments({ orderStatus: "Đã hoàn thành" });
        
        // Lấy ngày hiện tại và đầu tháng
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Lấy doanh thu theo ngày (toàn bộ)
        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    orderStatus: "Đã hoàn thành"
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$orderDate",
                            timezone: "+07:00"
                        }
                    },
                    revenue: { $sum: "$totalDiscountedPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } } // Sắp xếp ngày mới nhất lên đầu
        ]);

        // Lấy doanh thu theo tháng (toàn bộ)
        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    orderStatus: "Đã hoàn thành"
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$orderDate", timezone: "+07:00" } },
                        month: { $month: { date: "$orderDate", timezone: "+07:00" } }
                    },
                    revenue: { $sum: "$totalDiscountedPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: 1
                                }
                            }
                        }
                    },
                    revenue: 1,
                    orderCount: 1
                }
            },
            { $sort: { _id: -1 } } // Sắp xếp tháng mới nhất lên đầu
        ]);

        // Tổng doanh thu
        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    orderStatus: "Đã hoàn thành"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalDiscountedPrice" }
                }
            }
        ]);

        // Doanh thu tháng hiện tại
        const currentMonthRevenue = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startOfMonth },
                    orderStatus: "Đã hoàn thành"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalDiscountedPrice" },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        // Thêm thống kê cho các trạng thái đơn hàng
        const canceledOrders = await Order.countDocuments({ orderStatus: "Đã hủy" });
        const refundedOrders = await Order.countDocuments({ orderStatus: "Hoàn trả hàng" });
        const processingOrders = await Order.countDocuments({ 
            orderStatus: { 
                $nin: ["Đã hoàn thành", "Đã hủy", "Hoàn trả hàng"] 
            } 
        });

        const totalOrders = completedOrders + canceledOrders + refundedOrders + processingOrders;

        // Lấy top 10 sản phẩm bán chạy nhất
        const topSellingProducts = await Product.aggregate([
            {
                $project: {
                    title: 1,
                    price: 1,
                    discountedPrice: 1,
                    sellQuantity: 1,
                    views: 1,
                    thumbnail: { 
                        $first: {
                            $map: {
                                input: "$variants",
                                as: "variant",
                                in: "$$variant.imageUrl"
                            }
                        }
                    }
                }
            },
            {
                $sort: { sellQuantity: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Lấy top 10 sản phẩm xem nhiều nhất
        const topViewedProducts = await Product.aggregate([
            {
                $project: {
                    title: 1,
                    price: 1,
                    view: 1,
                    thumbnail: { 
                        $first: {
                            $map: {
                                input: "$variants",
                                as: "variant",
                                in: "$$variant.imageUrl"
                            }
                        }
                    }
                }
            },
            {
                $sort: { view: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Lấy 5 review mới nhất
        const latestReviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'username firstName lastName avatar')
            .populate('product', 'title variants')
            .lean();

        // Format lại dữ liệu review và lọc bỏ các review không hợp lệ
        const formattedReviews = latestReviews
            .filter(review => review.user && review.product && review.product.variants?.length > 0)
            .map(review => ({
                id: review._id,
                user: {
                    id: review.user._id,
                    username: review.user.username,
                    firstName: review.user.firstName || '',
                    lastName: review.user.lastName || '',
                    avatar: review.user.avatar || ''
                },
                product: {
                    id: review.product._id,
                    title: review.product.title,
                    thumbnail: review.product.variants[0]?.imageUrl || ''
                },
                rating: review.rating,
                review: review.review,
                images: review.imgUrl || [],
                createdAt: review.createdAt
            }));

        // Lấy danh sách sản phẩm sắp hết hàng (quantityItem < 5)
        const lowStockProducts = await Product.aggregate([
            // Unwind để tách các variants
            { $unwind: "$variants" },
            // Unwind để tách các sizes
            { $unwind: "$variants.sizes" },
            // Match để lọc các sản phẩm có số lượng < 5 và > 0
            {
                $match: {
                    "variants.sizes.quantityItem": { $lt: 5, $gt: 0 }
                }
            },
            // Group lại theo product để tránh trùng lặp
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    thumbnail: { $first: "$variants.imageUrl" },
                    totalQuantity: { $sum: "$variants.sizes.quantityItem" }
                }
            },
            // Sort theo số lượng tồn kho tăng dần
            { $sort: { totalQuantity: 1 } },
            // Giới hạn 10 sản phẩm
            { $limit: 10 },
            // Project để format lại dữ liệu trả về
            {
                $project: {
                    id: "$_id",
                    title: 1,
                    thumbnail: 1,
                    quantityItem: "$totalQuantity"
                }
            }
        ]);

        const topUsers = await Order.aggregate([
            {
                $group: { _id: "$user", orderCount: { $sum: 1 } }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    pipeline: [{ $project: { username: 1, mobile: 1 } }], // Lọc trường ngay trong lookup
                    as: "userInfo"
                }
            },
            { $sort: { orderCount: -1 } },
            { $limit: 10 },
            { $unwind: "$userInfo" },
            {
                $replaceRoot: { // Thay th root document
                    newRoot: {
                        $mergeObjects: ["$userInfo", { 
                            orderCount: "$orderCount" 
                        }]
                    }
                }
            }
        ]);

        return {
            orders: {
                total: totalOrders,
                completed: completedOrders,
                completionRate: ((completedOrders / totalOrders) * 100).toFixed(2),
                orderStatusRates: {
                    completed: ((completedOrders / totalOrders) * 100).toFixed(2),
                    canceled: ((canceledOrders / totalOrders) * 100).toFixed(2),
                    refunded: ((refundedOrders / totalOrders) * 100).toFixed(2),
                    processing: ((processingOrders / totalOrders) * 100).toFixed(2)
                }
            },
            revenue: {
                total: totalRevenue[0]?.total || 0,
                currentMonth: {
                    total: currentMonthRevenue[0]?.total || 0,
                    orderCount: currentMonthRevenue[0]?.orderCount || 0
                },
                daily: dailyRevenue,
                monthly: monthlyRevenue
            },
            topProducts: {
                selling: topSellingProducts.map(product => ({
                    id: product._id,
                    title: product.title,
                    price: product.price,
                    discountedPrice: product.discountedPrice,
                    sellQuantity: product.sellQuantity,
                    views: product.views,
                    thumbnail: product.thumbnail
                })),
                viewed: topViewedProducts.map(product => ({
                    id: product._id,
                    title: product.title,
                    price: product.price,
                    view: product.view,
                    thumbnail: product.thumbnail
                })),
                lowStock: lowStockProducts
            },
            latestReviews: formattedReviews,
            topUsers: topUsers
        };
    } catch (error) {
        throw new Error(`Failed to get order statistics: ${error.message}`);
    }
}

module.exports = {
    createOrder,
    placeOrder,
    confirmedOrder,
    shipOrder,
    deliverOrder,
    cancelOrder,
    getAllOrders,
    findOrderById,
    deleteOrder,
    usersOrderHistory,
    confirmPayment,
    completeOrder,
    pendingOrder,
    getOrderStatistics,
    refundOrder
}
