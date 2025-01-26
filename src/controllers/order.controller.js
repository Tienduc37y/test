const orderService = require('../services/order.service')

const createOrder = async(req, res) => {
    const user = await req.user
    try {
        const { shippingAddress, paymentMethod, code } = req.body;
        let createdOrder = await orderService.createOrder(user, shippingAddress, paymentMethod, code)
        return res.status(201).send({
            status: "201",
            message: "Tạo order thành công",
            order: createdOrder
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}

const findOrderById = async(req, res) => {
    try {
        let createdOrder = await orderService.findOrderById(req.params.id)
        return res.status(200).send({
            status: "200",
            message: "Tìm order thành công",
            order: createdOrder
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}

const orderHistory = async(req, res) => {
    try {
        const user = req.user;
        const { status, page = 1, limit = 10 } = req.query;

        const orders = await orderService.usersOrderHistory(
            user.userId,
            status,
            parseInt(page),
            parseInt(limit)
        );

        return res.status(200).json({
            status: "200",
            message: "Lấy order history thành công",
            data: orders
        });
    } catch (error) {
        return res.status(500).json({
            status: "500",
            error: error.message
        });
    }
}

module.exports = {
    createOrder,
    findOrderById,
    orderHistory,
}
