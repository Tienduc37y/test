const Cart = require('../models/cart.model')
const CartItem = require('../models/cartItem.model')
const Product = require('../models/product.model')

async function createCart(user) {
    try {
        const cart  = new Cart({user})
        const createdCart = await cart.save()

        return createdCart
    } catch (error) {
        throw new Error(error.message)
    }
}

async function findUserCart(userId) {
    try {
        let cart = await Cart.findOne({user:userId}).populate("promotion")

        if (!cart) {
            throw new Error("Giỏ hàng không tồn tại")
        }

        let cartItems = await CartItem.find({cart:cart._id}).populate("product")

        // Nếu không có cartItem nào, reset promotion và discountCode
        if (cartItems.length === 0) {
            await Cart.updateOne(
                { _id: cart._id },
                {
                    $set: {
                        totalPrice: 0,
                        totalItem: 0,
                        discounte: 0,
                        totalDiscountedPrice: 0,
                        promotion: null,
                        discountCode: 0,
                        cartItems: []
                    }
                }
            )
            
            cart = await Cart.findOne({user:userId})
            return cart
        }

        const cartData = {
            totalPrice: 0,
            totalDiscountedPrice: 0,
            totalItem: 0,
            cartItems: cartItems
        }
        
        for(let cartItem of cartItems) {
            cartData.totalPrice += cartItem.price
            cartData.totalDiscountedPrice += cartItem.discountedPrice
            cartData.totalItem += cartItem.quantity
        }

        // Cập nhật cart bằng updateOne để tránh xung đột version
        await Cart.updateOne(
            { _id: cart._id },
            {
                $set: {
                    totalPrice: cartData.totalPrice,
                    totalItem: cartData.totalItem,
                    discounte: cartData.totalPrice - cartData.totalDiscountedPrice,
                    totalDiscountedPrice: cart.promotion && 
                        cart.promotion.endDate > new Date(new Date().getTime() + 7 * 60 * 60 * 1000) 
                        ? cartData.totalDiscountedPrice - cart.discountCode 
                        : cartData.totalDiscountedPrice,
                    cartItems: cartItems.map(item => item._id),
                    discountCode: cart.promotion && 
                        cart.promotion.endDate > new Date(new Date().getTime() + 7 * 60 * 60 * 1000) 
                        ? cart.discountCode 
                        : 0,
                    promotion: cart.promotion && 
                        cart.promotion.endDate > new Date(new Date().getTime() + 7 * 60 * 60 * 1000) 
                        ? cart.promotion 
                        : null
                }
            }
        )

        // Lấy cart đã cập nhật
        cart = await Cart.findOne({user:userId})
            .populate("promotion")
            .populate({
                path: "cartItems",
                populate: {
                    path: "product"
                }
            })

        return cart
    } catch (error) {
        throw new Error(error.message)
    }
}

async function addCartItem(userId, req) {
    try {
        let cart = await Cart.findOne({user: userId}).populate("promotion")
        if (!cart) cart = await createCart(userId)

        const product = await Product.findById(req.productId)
        if (!product) throw new Error("Sản phẩm không tồn tại")
        
        let cartItem = await CartItem.findOne({
            cart: cart._id, 
            product: product._id, 
            userId,
            size: req.size,
            color: req.color
        })

        if (cartItem) {
            cartItem.quantity += req.quantity
            cartItem.price = cartItem.quantity * product.price
            cartItem.discountedPrice = cartItem.quantity * product.discountedPrice
            await cartItem.save()
        } else {
            cartItem = new CartItem({
                product: product._id,
                cart: cart._id,
                quantity: req.quantity,
                color: req.color,
                userId,
                price: product.price * req.quantity,
                size: req.size,
                discountedPrice: product.discountedPrice * req.quantity,
                discountedPersent: product.discountedPersent
            })
            await cartItem.save()
            cart.cartItems.push(cartItem)
        }

        return await recalculateCart(cart)
    } catch (error) {
        throw new Error(error.message)
    }
}

// Thêm hàm helper để tính toán và cập nhật giỏ hàng
async function recalculateCart(cart) {
    const cartItems = await CartItem.find({cart: cart._id}).populate("product")
    
    let totalPrice = 0
    let totalDiscountedPrice = 0
    let totalItem = 0

    // Nếu không có cartItem nào, reset promotion và discountCode
    if (cartItems.length === 0) {
        cart.totalPrice = 0
        cart.totalItem = 0
        cart.discounte = 0
        cart.totalDiscountedPrice = 0
        cart.promotion = null
        cart.discountCode = 0
        return await cart.save()
    }

    for(let item of cartItems) {
        totalPrice += item.price
        totalDiscountedPrice += item.discountedPrice
        totalItem += item.quantity
    }

    cart.totalPrice = totalPrice
    cart.totalItem = totalItem
    cart.discounte = totalPrice - totalDiscountedPrice

    // Kiểm tra và áp dụng promotion
    if (cart.promotion) {
        // Kiểm tra hạn sử dụng và giá trị đơn hàng tối thiểu
        if (cart.promotion.endDate > new Date(new Date().getTime() + 7 * 60 * 60 * 1000) && 
            totalDiscountedPrice >= cart.promotion.minOrderValue) {
            const discountValue = Math.floor((totalDiscountedPrice * cart.promotion.discountPercentage) / 100)
            cart.discountCode = discountValue
            cart.totalDiscountedPrice = totalDiscountedPrice - discountValue
        } else {
            // Nếu không đủ điều kiện, xóa promotion
            cart.promotion = null
            cart.discountCode = 0
            cart.totalDiscountedPrice = totalDiscountedPrice
        }
    } else {
        cart.totalDiscountedPrice = totalDiscountedPrice
    }

    return await cart.save()
}

module.exports = {
    createCart,
    findUserCart,
    addCartItem,
    recalculateCart
}
