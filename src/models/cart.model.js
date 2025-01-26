const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    cartItems:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartItems",
        required: true
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalItem: {
        type: Number,
        required: true,
        default: 0
    },
    totalDiscountedPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPriceAfterDiscount: {
        type: Number,
        default: 0
    },
    discounte: {
        type: Number,
        required: true,
        default: 0
    },
    promotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "promotions",
    },
    discountCode: {
        type: Number,
        default: 0
    }
    
})

const Cart = mongoose.model("cart",cartSchema)
module.exports = Cart