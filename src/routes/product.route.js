const express = require('express')

const router = express.Router()
const productController = require('../controllers/product.controller')


router.get("/", productController.getAllProducts)
router.get("/id/:id", productController.findProductById)
router.post("/find_by_name", productController.findProductByName)
router.post("/increment-view/:id", productController.incrementProductView)

module.exports = router
