const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discountedPrice: {
        type: Number,
    },
    discountedPersent: {
        type: Number,
    },
    brand: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    variants: [{
        color: {
            type: String,
            required: true
        },
        slugColor: {
            type: String,
        },
        nameColor: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        sizes: [{
            size: {
                type: String,
                required: true
            },
            quantityItem: {
                type: Number,
                required: true,
                min: 0
            }
        }]
    }],
    slugProduct: {
        type: String,
    },
    category: {
        topLevelCategory: {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
            name: String,
            level: Number,
            slugCategory: String,
            parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
        },
        secondLevelCategory: {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
            name: String,
            level: Number,
            slugCategory: String,
            parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
        },
        thirdLevelCategory: {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
            name: String,
            level: Number,
            slugCategory: String,
            parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
        }
    },
    view: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: () => {
            const now = new Date();
            return new Date(now.getTime() + 7 * 60 * 60 * 1000);
        }
    },
    sellQuantity: {
        type: Number,
        default: 0
    }
})

const Product = mongoose.model("products", productSchema)
module.exports = Product
