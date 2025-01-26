const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwtProvider = require('../config/jwtProvider')
const Address = require('../models/address.model')

const createUser = async(userData) => {
    try {
        let {firstName, lastName,email, username, password, mobile} = userData

        const isUserExist = await User.findOne({username})
        const isEmailExist = await User.findOne({email})
        const isMobileExist = await User.findOne({mobile})
        if(!isUserExist){
            if(!isEmailExist){
                if(!isMobileExist){
                    password = await bcrypt.hash(password,10)
                    const user = await User.create({firstName, lastName, email, username, password, mobile})
                    return user
                }
                else {
                    throw new Error("Số điện thoại đã tồn tại")
                }
            }
            else {
                throw new Error("Email đã tồn tại")
            }
        }
        else {
            throw new Error("Tài khoản đã tồn tại !")
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

const findUserById = async (userId) => {
    try {
        
        const user = await User.findById(userId).populate("address");
        if (!user) {
            throw new Error("Không tìm thấy người dùng với id: " + userId);
        }
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

const findUserByUserName = async (username) => {
    try {
        const user = await User.findOne({username});
        if(!user) {
            throw new Error("Tài khoản không tồn tại")
        }
        return user
    } catch (error) {
        throw new Error(error.message)
    }
}

const getUserProfileByToken = async (token) => {
    try {
        const userId = jwtProvider.getUserIdFromToken(token)

        const user = await findUserById(userId)

        if(!user) {
            throw new Error("user not found with id :",userId)
        }

        return user

    } catch (error) {
        throw new Error(error.message)
    }
}

const saveResetToken = async (email, token) => {
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await User.findOneAndUpdate(
        { email },
        { tokenResetPassword: { token:token, expiresTime:expiry } },
        { new: true, upsert: true }
    );
};

const verifyResetToken = async (email, token) => {
    const user = await User.findOne({ email });

    if (!user || user.tokenResetPassword.token !== token || user.tokenResetPassword.expiresTime < Date.now()) {
        return false;
    }
    return true;
};

const updatePassword = async (email, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
        { email },
        { password: hashedPassword}
    );
};

const deleteResetToken = async (email) => {
    await User.findOneAndUpdate(
        { email },
        { tokenResetPassword: { token:"", expiresTime: null } }
    );
};

const editUser = async (userId, userData) => {
    try {
        const { email, mobile } = userData;

        // Kiểm tra xem email mới có trùng với user khác không
        if (email) {
            const existingUserWithEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUserWithEmail) {
                throw new Error("Email đã được sử dụng bởi người dùng khác");
            }
        }

        // Kiểm tra xem số điện thoại mới có trùng với user khác không
        if (mobile) {
            const existingUserWithMobile = await User.findOne({ mobile, _id: { $ne: userId } });
            if (existingUserWithMobile) {
                throw new Error("Số điện thoại đã được sử dụng bởi người dùng khác");
            }
        }

        // Nếu không có trùng lặp, tiến hành cập nhật
        const user = await User.findByIdAndUpdate(userId, userData, { new: true }).populate("address");
        if (!user) {
            throw new Error("Không tìm thấy người dùng với id: " + userId);
        }
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const updateAddress = async (userId, addressData) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        let address;
        if (user.address) {
            // Nếu user đã có địa chỉ, cập nhật địa chỉ cũ
            address = await Address.findByIdAndUpdate(
                user.address,
                {
                    firstName: addressData.firstName,
                    lastName: addressData.lastName,
                    streetAddress: addressData.streetAddress,
                    city: addressData.city,
                    district: addressData.district,
                    ward: addressData.ward,
                    mobile: addressData.mobile
                },
                { new: true }
            );
        } else {
            // Nếu user chưa có địa chỉ, tạo địa chỉ mới
            address = new Address(addressData);
            await address.save();
            address.user = user;
            await address.save();

            // Cập nhật reference địa chỉ cho user
            user.address = address._id;
            await user.save();
        }

        // Trả về user đã được populate address
        return await User.findById(userId).populate("address");
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {createUser, findUserById, findUserByUserName, getUserProfileByToken, saveResetToken, verifyResetToken, updatePassword, deleteResetToken, editUser, findUserByEmail, updateAddress}