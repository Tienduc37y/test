const Review = require('../models/review.model')
const Product = require('../models/product.model')
const productService = require('../services/product.service')
const cloudinary = require('cloudinary')

async function createReview(reqData, user, files) {
    const product = await productService.findProductById(reqData.productId);
    
    // Lấy các URL ảnh từ files đã upload
    const imageUrls = files ? files.map(file => file.path) : [];
    
    const review = new Review({
        user: user.userId,
        product: product._id,
        review: reqData.review,
        rating: reqData.rating,
        imgUrl: imageUrls,
        createdAt: new Date()
    })
    
    return await review.save()
}

async function getAllReview(productId) {
    return await Review.find({ product: productId })
        .populate({
            path: "user",
            select: "username email"
        })
        .populate({
            path: "product",
            select: "title variants",
            transform: doc => ({
                title: doc.title,
                image: doc.variants && doc.variants.length > 0 
                    ? doc.variants[0].imageUrl  // Lấy imageUrl từ variant đầu tiên
                    : null
            })
        })
        .sort({ createdAt: -1 });
}

// Cập nhật hàm getAllReviewsAdmin
async function getAllReviewsAdmin(rating) {
    let query = {};
    
    // Thêm điều kiện lọc theo rating nếu có
    if (rating) {
        query.rating = parseInt(rating);
    }

    return await Review.find(query)
        .populate({
            path: "user",
            select: "username email"
        })
        .populate({
            path: "product",
            select: "title variants",
            transform: doc => ({
                title: doc.title,
                image: doc.variants && doc.variants.length > 0 
                    ? doc.variants[0].imageUrl
                    : null
            })
        })
        .sort({ createdAt: -1 });
}

async function replyToReview(reviewId, replyText) {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error('Không tìm thấy đánh giá');
    }
    
    review.reply = replyText;
    return await review.save();
}

async function updateReplyReview(reviewId, replyText) {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error('Không tìm thấy đánh giá');
    }
    
    if (!review.reply) {
        throw new Error('Chưa có phản hồi để cập nhật');
    }
    
    review.reply = replyText;
    return await review.save();
}

async function deleteReplyReview(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error('Không tìm thấy đánh giá');
    }
    
    if (!review.reply) {
        throw new Error('Không có phản hồi để xóa');
    }
    
    review.reply = null;
    return await review.save();
}

async function findReviewByProduct(title) {
    try {
        // Tìm các sản phẩm có title match với từ khóa
        const products = await Product.find({
            title: { $regex: new RegExp(title, 'i') }
        });

        if (!products || products.length === 0) {
            return [];
        }

        // Lấy tất cả productIds
        const productIds = products.map(product => product._id);

        // Tìm reviews cho các sản phẩm đó
        const reviews = await Review.find({
            product: { $in: productIds }
        })
        .populate({
            path: "user",
            select: "name email"
        })
        .populate({
            path: "product",
            select: "title variants",
            transform: doc => ({
                title: doc.title,
                image: doc.variants && doc.variants.length > 0 
                    ? doc.variants[0].imageUrl
                    : null
            })
        })
        .sort({ createdAt: -1 });

        return reviews;
    } catch (error) {
        throw new Error(`Lỗi khi tìm review: ${error.message}`);
    }
}

async function deleteReview(reviewId) {
    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            throw new Error('Không tìm thấy đánh giá');
        }
        // Xóa các ảnh từ Cloudinary nếu có
        if (review.imgUrl && review.imgUrl.length > 0) {
            for (const imageUrl of review.imgUrl) {
                try {
                    // Lấy public_id từ URL
                    const urlParts = imageUrl.split('/');
                    const fileName = urlParts[urlParts.length - 1]; 
                    const folderName = urlParts[urlParts.length - 2];
                    const publicId = `${folderName}/${fileName.split('.')[0]}`;
                    
                    console.log('Attempting to delete image with public_id:', publicId);
                    
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Lỗi khi xóa ảnh từ Cloudinary:', cloudinaryError);
                }
            }
        }

        // Xóa review từ database
        await Review.findByIdAndDelete(reviewId);
        
        return true;
    } catch (error) {
        console.error('Lỗi trong quá trình xóa review:', error);
        throw new Error(`Lỗi khi xóa đánh giá: ${error.message}`);
    }
}

async function getAverageRating(productId) {
    try {
        const reviews = await Review.find({ product: productId });
        
        if (!reviews || reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingCounts: {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0
                }
            };
        }

        // Tính tổng rating và đếm số lượng mỗi rating
        const ratingCounts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += review.rating;
            ratingCounts[review.rating]++;
        });

        // Tính rating trung bình và làm tròn đến 1 chữ số thập phân
        const averageRating = Number((totalRating / reviews.length).toFixed(1));

        return {
            averageRating,
            totalReviews: reviews.length,
            ratingCounts
        };
    } catch (error) {
        throw new Error(`Lỗi khi tính rating trung bình: ${error.message}`);
    }
}

module.exports = {
    createReview,
    getAllReview,
    getAllReviewsAdmin,
    replyToReview,
    updateReplyReview,
    deleteReplyReview,
    findReviewByProduct,
    deleteReview,
    getAverageRating
}