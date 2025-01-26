const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const validateRequest = require('../middlewares/validateRequest')
const { 
  userRegister, 
  userLogin, 
  changePassword, 
  getResetToken, 
  resetPassword 
} = require('../utils/validationSchemas')

router.post('/signup', validateRequest(userRegister), authController.register)
router.post('/signin', validateRequest(userLogin), authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/change-password', authMiddleware, validateRequest(changePassword), authController.changePassword)
router.post('/get-reset-token', validateRequest(getResetToken), authController.getResetToken)
router.post('/reset-password', validateRequest(resetPassword), authController.resetPassword)

module.exports = router