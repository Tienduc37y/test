const userService = require('../services/user.service')

const getUserProfile = async (req, res) => {
    try {
      const user = req.user;
      const dataUser = await userService.findUserById(user.userId)
      if (!dataUser) {
        return res.status(404).json({
          status: "404",
          error: "Không tìm thấy người dùng",
        });
      }
  
      const userDoc = dataUser._doc || dataUser;
      const { password: _, ...userInfo } = userDoc;
  
      return res.status(200).json({
        status: "200",
        message: "Lấy thông tin user thành công",
        data: {
          user: userInfo,
        },
      });
    } catch (error) {
      console.error('Lỗi trong getUserProfile:', error);
      return res.status(500).json({
        status: "500",
        error: error.message || "Lỗi server",
      });
    }
};

const editUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;
        const updatedUser = await userService.editUser(userId, userData);
        return res.status(200).send({
            status: "200",    
            message: "Cập nhật thông tin người dùng thành công",
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",    
            error: error.message || "Lỗi server", 
        });
    }
};

const updateAddress = async (req, res) => {
    try {
        const userId = req.params.id;
        const addressData = req.body;
        const updatedUser = await userService.updateAddress(userId, addressData);
        
        return res.status(200).send({
            status: "200",    
            message: "Cập nhật địa chỉ thành công",
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",    
            error: error.message || "Lỗi server", 
        });
    }
};

module.exports = {getUserProfile, editUser, updateAddress}