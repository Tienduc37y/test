const orderService = require('../services/order.service')

const getAllOrders = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const status = req.query.status || '';
        const sort = req.query.sort || 'desc';
        const paymentMethod = req.query.paymentMethod || '';
        const date = req.query.date || '';
        const ordersData = await orderService.getAllOrders(page, limit, status, sort, paymentMethod, date);
        
        return res.status(200).send({
            status: "200",
            message: "Lấy thông tin order thành công",
            orders: {
                orders: ordersData.orders,
                totalPages: ordersData.totalPages,
                currentPage: ordersData.currentPage,
                totalOrders: ordersData.totalOrders,
                limit: ordersData.limit
            }
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
}

const refundOrder = async(req, res) => {
    try {
        const orderId = req.params.orderId;
        const orders = await orderService.refundOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Hoàn trả hàng thành công",
            orders
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
}

const pendingOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.pendingOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Chuyển sang trạng thái đang chờ xử lý thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const confirmedOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.confirmedOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Confirm order thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const shipOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.shipOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Ship order thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const deliverOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.deliverOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Deliver order thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const cancelOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.cancelOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Hủy order thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const confirmPaymentOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.confirmPayment(orderId);
        return res.status(200).send({
            status: "200",
            message: "Xác nhận thanh toán thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const completeOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.completeOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Hoàn thành đơn hàng thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const deleteOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.deleteOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Xóa order thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const placeOrders = async(req, res) => {
    const orderId = req.params.orderId
    try {
        const orders = await orderService.placeOrder(orderId);
        return res.status(200).send({
            status: "200",
            message: "Đặt hàng thành công",
            orders
        })
    } catch (error) {
        return res.status(500).send({
            status:"500",
            error: error.message
        })
    }
}

const getOrderStats = async(req, res) => {
    try {
        const stats = await orderService.getOrderStatistics();
        return res.status(200).send({
            status: "200",
            message: "Lấy thống kê đơn hàng thành công",
            data: {
                orders: {
                    total: stats.orders.total,
                    completed: stats.orders.completed,
                    completionRate: stats.orders.completionRate,
                    orderStatusRates: {
                        completed: stats.orders.orderStatusRates.completed,
                        canceled: stats.orders.orderStatusRates.canceled,
                        refunded: stats.orders.orderStatusRates.refunded,
                        processing: stats.orders.orderStatusRates.processing
                    }
                },
                revenue: {
                    total: stats.revenue.total,
                    currentMonth: {
                        total: stats.revenue.currentMonth.total,
                        orderCount: stats.revenue.currentMonth.orderCount
                    },
                    daily: stats.revenue.daily.map(item => ({
                        date: item._id,
                        revenue: item.revenue,
                        orderCount: item.orderCount
                    })),
                    monthly: stats.revenue.monthly.map(item => ({
                        month: item._id,
                        revenue: item.revenue,
                        orderCount: item.orderCount
                    }))
                },
                topProducts: {
                    selling: stats.topProducts.selling,
                    viewed: stats.topProducts.viewed,
                    lowStock: stats.topProducts.lowStock
                },
                latestReviews: stats.latestReviews,
                topUsers: stats.topUsers
            }
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
}

module.exports = {
    getAllOrders,
    placeOrders,
    pendingOrders,
    confirmedOrders,
    shipOrders,
    deliverOrders,
    cancelOrders,
    confirmPaymentOrders,
    completeOrders,
    deleteOrders,
    getOrderStats,
    refundOrder
}