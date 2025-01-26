const express = require('express')

const router = express.Router()
const orderController = require('../controllers/order.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post("/", authMiddleware, orderController.createOrder)
router.get("/user/history", authMiddleware, orderController.orderHistory)
router.get("/:id",authMiddleware, orderController.findOrderById)

module.exports = router
