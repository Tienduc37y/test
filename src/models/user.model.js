const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required:true,
        enum: ['CUSTOMER', 'ADMIN'],
        default:"CUSTOMER"
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addresses",
        default: null
    },
    tokens:{
        access:{
            token: {
                type: String,
            },
            expiresAt: {
                type: Date,
            }
        },
        refresh:{
            token: {
                type: String,
            },
            expiresAt: {
                type: Date,
            }
        }
    },
    tokenResetPassword: {
        token:{
            type: String
        },
        expiresTime: {
            type: Date
        }
    },
    createdAt: {
        type: Date,
        default: () => {
            const now = new Date();
            return new Date(now.getTime() + 7 * 60 * 60 * 1000);
        }
    }
})

const User = mongoose.model("users",userSchema)
module.exports = User
