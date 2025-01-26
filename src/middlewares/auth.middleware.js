const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send({ 
            status: "401",
            message: 'Bạn cần có quyền truy cập' 
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).send({ 
            status: "403",
            message: 'Mã không hợp lệ' 
        });
    }
};

module.exports = authMiddleware;
