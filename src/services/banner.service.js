const Banner = require('../models/banner.model');
const { cloudinary } = require('../config/cloudinary');

const createBanner = async (bannerData) => {
    const banner = new Banner(bannerData);
    await banner.save();
    return banner;
};

const updateBanner = async (bannerId, bannerData) => {
    const banner = await Banner.findById(bannerId);
    if (!banner) {
        throw new Error('Không tìm thấy banner');
    }

    // Nếu có ảnh mới, xóa ảnh cũ trên cloudinary
    if (bannerData.imageUrl && banner.imageUrl) {
        const publicId = banner.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
        bannerId,
        bannerData,
        { new: true }
    );
    return updatedBanner;
};

const deleteBanner = async (bannerId) => {
    const banner = await Banner.findById(bannerId);
    if (!banner) {
        throw new Error('Không tìm thấy banner');
    }

    // Xóa ảnh trên cloudinary
    if (banner.imageUrl) {
        const publicId = banner.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    }

    await Banner.findByIdAndDelete(bannerId);
    return 'Xóa banner thành công';
};

const getAllBanners = async () => {
    return await Banner.find();
};

module.exports = {
    createBanner,
    updateBanner,
    deleteBanner,
    getAllBanners
}; 