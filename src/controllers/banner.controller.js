const bannerService = require('../services/banner.service');

const createBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                status: "400",
                message: "Vui lòng upload ảnh banner"
            });
        }

        if (!req.body.name) {
            return res.status(400).send({
                status: "400",
                message: "Tên banner là bắt buộc"
            });
        }

        const bannerData = {
            name: req.body.name,
            imageUrl: req.file.path,
            visible: req.body.visible === 'false' ? false : true
        };

        const banner = await bannerService.createBanner(bannerData);
        
        return res.status(201).send({
            status: "201",
            message: "Tạo banner thành công",
            banner
        });
    } catch (error) {
        console.error("Create Banner Error:", error);
        
        return res.status(500).send({
            status: "500",
            message: "Lỗi khi tạo banner",
            error: error.message || "Internal server error"
        });
    }
};

const updateBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        
        if (!bannerId) {
            return res.status(400).send({
                status: "400",
                message: "Banner ID là bắt buộc"
            });
        }

        const bannerData = {
            name: req.body.name,
            visible: req.body.visible === 'false' ? false : true
        };

        if (req.file) {
            bannerData.imageUrl = req.file.path;
        }

        const banner = await bannerService.updateBanner(bannerId, bannerData);
        
        return res.status(200).send({
            status: "200",
            message: "Cập nhật banner thành công",
            banner
        });
    } catch (error) {
        console.error("Update Banner Error:", error);
        
        return res.status(500).send({
            status: "500",
            message: "Lỗi khi cập nhật banner",
            error: error.message || "Internal server error"
        });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const message = await bannerService.deleteBanner(bannerId);
        res.status(200).send({
            status: "200",
            message
        });
    } catch (error) {
        res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

const getAllBanners = async (req, res) => {
    try {
        const banners = await bannerService.getAllBanners();
        res.status(200).send({
            status: "200",
            message: "Lấy danh sách banner thành công",
            banners
        });
    } catch (error) {
        res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

module.exports = {
    createBanner,
    updateBanner,
    deleteBanner,
    getAllBanners
}; 