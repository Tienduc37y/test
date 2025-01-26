const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    orderItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "orderItems",
        }
    ],
    orderDate: {
        type: Date,
        required: true,
        default: () => {
            const now = new Date();
            // now.setMonth(now.getMonth()- 1);
            // now.setDate(now.getDate() - 2);
            return new Date(now.getTime() + 7 * 60 * 60 * 1000);
        }
    },
    completeOrderDate: {
        type: Date,
    },
    shippingAddress: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "addresses"
        },
        address: {
            firstName:{
                type:String,
                required:true
            },
            lastName:{
                type:String,
                required:true
            },
            streetAddress:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            district:{
                type:String,
                required:true
            },
            ward:{
                type:String,
                required:true
            },
            mobile: {
                type:String,
                required:true
            }
        }
    },
    paymentDetails: {
        paymentMethod: {
            type: String,
            required: true,
            enum: ['COD', 'ZALOPAY'],
        },
        zalopayTransactionId: {
            type: String,
            default: null
        },
        statusMessage: String,
        subReturnCode: String,
        subReturnMessage: String,
        paymentStatus: {
            type: String,
            enum: ['Đang chờ thanh toán', 'Đang trong quá trình thanh toán', 'Đã thanh toán', 'Chưa thanh toán', 'Lỗi thanh toán'],
            default: 'Đang chờ thanh toán'
        },
        isProcessing: {
            type: String,
            enum: ["Chưa xử lý", "Đang xử lý", "Đã xử lý"],
            default: "Chưa xử lý"
        },
        appTransactionId: {
            type: String,
            default: null
        }
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalDiscountedPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalItem: {
        type: Number,
        required: true,
        min: 0
    },
    discounte: {
        type: Number,
        required: true,
        min: 0
    },
    orderStatus: {
        type: String,
        enum: ["Đặt hàng thành công", "Đang chờ xử lý", "Xác nhận đơn hàng", "Đang giao hàng", "Đã giao hàng", "Đã hủy", "Đã thanh toán", "Đã hoàn thành","Hoàn trả hàng"],
        default: "Đặt hàng thành công"
    },
    promotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "promotions"
    },
    discountCode: {
        type: Number,
        default: 0
    }
})

const Order = mongoose.model("orders",orderSchema)
module.exports = Order
