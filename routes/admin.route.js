const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware')


router.get('/get_all_user', adminAuthMiddleware, adminController.getAllUser)
router.delete('/delete_user/:id', adminAuthMiddleware, adminController.deleteUser)
// Đổi lại thành POST
router.post('/find_user', adminAuthMiddleware, adminController.findUserByName)

module.exports = router
