const express = require('express')

const router = express.Router()
const productController = require('../controllers/product.controller')
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware')
const validateRequest = require('../middlewares/validateRequest')
const {upload} = require('../config/cloudinary')
const { createProduct, updateProduct } = require('../utils/validationSchemas')

router.post("/create_product", adminAuthMiddleware, upload.array('images', 5), validateRequest(createProduct), productController.createProduct)
router.delete("/:id", adminAuthMiddleware, productController.deleteProduct)
router.put("/update_product/:id", adminAuthMiddleware, upload.any(), validateRequest(updateProduct), productController.updateProduct)

module.exports = router