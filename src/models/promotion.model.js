const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    minOrderValue: {
        type: Number,
        required: true,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    visible: {
        type: Boolean,
        default: true
    },
    endDate: {
        type: Date,
        required: true,
        default: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
    }
});

module.exports = mongoose.model('promotions', promotionSchema);
