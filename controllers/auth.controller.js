const crypto = require('crypto')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const userService = require('../services/user.service')
const jwtProvider = require('../config/jwtProvider')
const cartService = require('../services/cart.service')
const {saveResetToken, verifyResetToken, updatePassword, deleteResetToken} = require('../services/user.service')
const { error } = require('console')

const register = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        const accessToken = jwtProvider.generateAccessToken(user._id,user.role);
        const refreshToken = jwtProvider.generateRefreshToken(user._id,user.role);
        user.tokens = {
            access: {
                token: accessToken.token,
                expiresAt: accessToken.expiresAt,
            },
            refresh: {
                token: refreshToken.token,
                expiresAt: refreshToken.expiresAt,
            }
        };
        
        await user.save();
        await cartService.createCart(user);
        
        const { password: _, ...userInfo } = user._doc;

        return res.status(201).send({
            status: "201",
            message: "Đăng ký thành công",
            data: {
                user: userInfo,
            },
        });
    } catch (error) {
        return res.status(400).send({
            status: "400",
            error: error.message || "Đăng ký không thành công"
        });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await userService.findUserByUserName(username);

        if (!user) {
            return res.status(401).send({
                status: 401,
                error: "Tài khoản không hợp lệ",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).send({
                status: "401",
                error: "Tài khoản hoặc mật khẩu không đúng",
            });
        }

        // Kiểm tra token hiện tại
        let accessToken = null;
        let refreshToken = null;

        const now = new Date();
        // Chuyển đổi sang múi giờ UTC+7
        now.setHours(now.getHours() + 7);

        if (user.tokens?.access?.expiresAt && new Date(user.tokens.access.expiresAt) > now) {
            accessToken = {
                token: user.tokens.access.token,
                expiresAt: user.tokens.access.expiresAt
            };
        } else {
            accessToken = jwtProvider.generateAccessToken(user._id);
        }

        if (user.tokens?.refresh?.expiresAt && new Date(user.tokens.refresh.expiresAt) > now) {
            refreshToken = {
                token: user.tokens.refresh.token,
                expiresAt: user.tokens.refresh.expiresAt
            };
        } else {
            refreshToken = jwtProvider.generateRefreshToken(user._id);
        }

        user.tokens = {
            access: accessToken,
            refresh: refreshToken
        };

        await user.save();
        
        const { password: _, ...userInfo } = user._doc;

        return res.status(200).send({
            status: "200",
            message: "Đăng nhập thành công",
            data: {
                user: userInfo,
            },
        });
    } catch (error) {
        return res.status(500).send({
            error: error.message,
        });
    }
};

const refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).send({
            message: "Không có token"
        });
    }
    
    try {
        const decoded = jwtProvider.verifyToken(token);
        const user = await userService.findUserById(decoded.userId);

        if (!user?.tokens?.refresh?.token || user.tokens.refresh.token !== token) {
            return res.status(403).send({
                error: "Refresh token không hợp lệ"
            });
        }

        const now = new Date();
        now.setHours(now.getHours() + 7);

        // Kiểm tra thời gian hết hạn từ database
        if (new Date(user.tokens.refresh.expiresAt) <= now) {
            return res.status(403).send({
                error: "Refresh token đã hết hạn"
            });
        }

        const newAccessToken = jwtProvider.generateAccessToken(decoded.userId);

        user.tokens.access = {
            token: newAccessToken.token,
            expiresAt: newAccessToken.expiresAt
        } 

        await user.save();

        const { password: _, ...userInfo } = user._doc;

        return res.status(200).send({
            status:"200",
            message: "Tạo mới Access Token thành công",
            data: {
                user: userInfo,
            }
        });
    } catch (error) {
        return res.status(403).send({
            status: "403",
            error: "Token hết hạn hoặc không hợp lệ"
        });
    }
}

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await userService.findUserById(req.user.userId);

        if (!user) {
            return res.status(404).send({ 
                status: "404",
                error: 'Tài khoản không tồn tại' 
            });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(400).send({ 
                status: "400",
                error: 'Mật khẩu hiện tại không đúng' 
            });
        }

        // Kiểm tra xem mật khẩu mới có giống mật khẩu cũ không
        const isNewPasswordSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isNewPasswordSameAsOld) {
            return res.status(400).send({ 
                status: "400",
                error: 'Mật khẩu mới không được giống mật khẩu cũ' 
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        await user.save();

        const { password: _, ...userInfo } = user._doc;

        return res.status(200).send({
            status: "200",
            message: "Đổi mật khẩu thành công",
            data: {
                user: userInfo,
            }
        });
    } catch (error) {
        return res.status(500).send({ 
            status: "500",
            error: error.message 
        });
    }
}

const getResetToken = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userService.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                status: "404",
                error: 'Email không tồn tại trong hệ thống'
            });
        }

        const token = crypto.randomInt(100000, 999999);

        await saveResetToken(email, token);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Xác thực mã code',
            text: `Mã reset mật khẩu của bạn là ${token}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({
                    status: "500",
                    error: 'Lỗi khi gửi email: ' + error.message
                });
            }
            res.status(200).json({
                status: "200",
                message: 'Mã reset mật khẩu đã được gửi đến email của bạn'
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: "500",
            error: 'Lỗi server: ' + error.message
        });
    }
}

const resetPassword = async (req, res) => {
    const { email, token } = req.body;

    const isValid = await verifyResetToken(email, token);

    if (!isValid) {
        return res.status(400).json({ error: 'Mã code hết hạn hoặc không hợp lệ' });
    }

    const newPassword = crypto.randomBytes(8).toString('hex');
    
    await updatePassword(email, newPassword);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Your New Password',
        text: `Your new password is ${newPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ 
                status: "500",
                error: 'Lỗi gửi mật khẩu đến gmail' 
            });
        }
        res.status(200).json({ 
            status: "200",
            message: 'Mật khẩu mới đã gửi đến gmail' 
        });
    });

    await deleteResetToken(email);
}

module.exports = {register, login, refreshToken, changePassword, getResetToken, resetPassword}