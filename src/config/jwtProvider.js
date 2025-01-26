const jwt = require("jsonwebtoken")

const SECRET_KEY = process.env.SECRET_KEY

const generateAccessToken = (userId) => {
    const token = jwt.sign({userId}, SECRET_KEY, {expiresIn:"60m"})
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
    return {token, expiresAt}
}
const generateRefreshToken = (userId) => {
    const token = jwt.sign({userId}, SECRET_KEY, {expiresIn:"15d"})
    const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
    return {token, expiresAt}
}

const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
}

const getUserIdFromToken = (token) => {
    const decodeToken = jwt.verify(token, SECRET_KEY)
    return decodeToken.userId
}

module.exports = {generateAccessToken, generateRefreshToken, verifyToken, getUserIdFromToken}