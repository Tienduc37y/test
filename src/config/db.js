const mongoose = require("mongoose");
require("dotenv").config();

const mongoDBUrl = process.env.MONGODB_URL;

const connectDb = async () => {
    try {
        await mongoose.connect(mongoDBUrl);
        console.log("Kết nối MongoDB thành công");
    } catch (error) {
        console.error("Lỗi kết nối MongoDB:", error);
        process.exit(1);
    }
};

module.exports = { connectDb };
