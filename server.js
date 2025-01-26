require('dotenv').config();
const app = require(".");
const { connectDb } = require("./config/db");

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await connectDb();
        console.log("Kết nối MongoDB thành công");

        app.listen(PORT, () => {
            console.log(`Ecommerce API đang lắng nghe trên cổng: ${PORT}`);
        });
    } catch (error) {
        console.error("Lỗi khởi động server:", error);
        process.exit(1);
    }
};

startServer();
