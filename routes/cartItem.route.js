const express = require('express')

const router = express.Router()
const cartItemController = require('../controllers/cartItem.controller')
const authMiddleware = require('../middlewares/auth.middleware')


router.put('/update_cart_item/:id',authMiddleware,cartItemController.updateCartItem)
router.delete('/remove_cart_item/:id',authMiddleware,cartItemController.removeCartItem)

module.exports = router