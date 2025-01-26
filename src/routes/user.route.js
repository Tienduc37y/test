const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const validateRequest = require('../middlewares/validateRequest')
const { editUser } = require('../utils/validationSchemas')

router.get('/profile', authMiddleware, userController.getUserProfile)
router.put('/update_user/:id', authMiddleware, validateRequest(editUser), userController.editUser)
router.put('/update_address/:id', authMiddleware, userController.updateAddress)

module.exports = router