const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage cho products
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce_products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'jfif', 'webp'],
  }
});

// Storage cho banners với kích thước phù hợp cho banner
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce_banners',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'jfif', 'webp'],
  }
});

const reviewStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce_reviews',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'jfif', 'webp'],
  }
});

const upload = multer({ storage: storage });
const uploadBanner = multer({ storage: bannerStorage });
const uploadReview = multer({ storage: reviewStorage });

module.exports = { 
  cloudinary, 
  upload, 
  uploadBanner,
  uploadReview 
};