const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    product: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    imgUrl: [{
        type: String,
    }],
    review: {
        type: String,
        required: true
    },
    reply: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: () => {
            const now = new Date();
            return new Date(now.getTime() + 7 * 60 * 60 * 1000);
        }
    }
})

const Review = mongoose.model("reviews",reviewSchema)
module.exports = Review