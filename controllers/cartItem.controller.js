const cartItemService = require('../services/cartItem.service')

const updateCartItem = async (req, res) => {
    const user = req.user
    try {
        const updatedCartItem = await cartItemService.updateCartItem(user.userId, req.params.id, req.body)
        return res.status(200).send({
            status: "200",
            message: "Cập nhật thành công",
            cartItem: updatedCartItem
        }) 
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}

const removeCartItem = async (req, res) => {
    const user = await req.user
    try {
        const updatedCartItem = await cartItemService.removeCartItem(user.userId,req.params.id)
        return res.status(200).send({
            status: "200",
            message: "Xóa thành công",
        }) 
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}
module.exports = {
    updateCartItem,
    removeCartItem
}