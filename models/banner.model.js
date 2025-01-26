const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên banner là bắt buộc'],
        trim: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Ảnh banner là bắt buộc']
    },
    visible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner; 