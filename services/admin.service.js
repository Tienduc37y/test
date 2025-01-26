const User = require('../models/user.model')
const getAllUser = async (page = 1, limit = 7) => {
    try {
        const skip = (page - 1) * limit;
        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        return {
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalUsers,
                itemsPerPage: limit
            }
        }
    } catch (error) {
        throw new Error(error.message)
    }
}
const deleteUserById = async (userId) => {
    try {
      const result = await User.findByIdAndDelete(userId);
      if (!result) {
        throw new Error('User not found');
      }
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
};

const findUserByName = async (userName, page = 1, limit = 7) => {
    try {
        const skip = (page - 1) * limit;
        
        // Tìm users với pagination
        const users = await User.find({
            username: { $regex: userName, $options: 'i' }
        })
        .skip(skip)
        .limit(limit);

        // Đếm tổng số users thỏa mãn điều kiện tìm kiếm
        const totalUsers = await User.countDocuments({
            username: { $regex: userName, $options: 'i' }
        });
        
        const totalPages = Math.ceil(totalUsers / limit);

        if (users.length === 0) {
            throw new Error("Không tìm thấy người dùng");
        }

        return {
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalUsers,
                itemsPerPage: limit
            }
        };
    } catch (error) {
        throw error;
    }
}

module.exports = {getAllUser,deleteUserById,findUserByName}
