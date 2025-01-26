const reviewService = require("../services/review.service")

const createReview = async(req, res) => {
    const user = req.user
    try {
        let review = await reviewService.createReview(req.body, user, req.files)
        return res.status(201).send({
            status: "201",
            message: "Tạo review thành công",
            review
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}

const getAllReviews = async(req, res) => {
    const productId = req.params.productId
    try {
        let reviews = await reviewService.getAllReview(productId)
        return res.status(200).send({
            status: "200",
            message: "Lấy danh sách review thành công",
            reviews
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}

// Cập nhật controller getAllReviewsAdmin
const getAllReviewsAdmin = async (req, res) => {
    try {
        const { rating } = req.query;
        const reviews = await reviewService.getAllReviewsAdmin(rating);
        res.status(200).json({
            status: "success",
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

const replyToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reply } = req.body;
        
        if (!reply) {
            return res.status(400).json({
                status: "error",
                message: "Nội dung phản hồi không được để trống"
            });
        }

        const updatedReview = await reviewService.replyToReview(reviewId, reply);
        res.status(200).json({
            status: "success",
            data: updatedReview
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

const updateReplyReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reply } = req.body;
        
        if (!reply) {
            return res.status(400).json({
                status: "error",
                message: "Nội dung phản hồi không được để trống"
            });
        }

        const updatedReview = await reviewService.updateReplyReview(reviewId, reply);
        res.status(200).json({
            status: "success",
            message: "Cập nhật phản hồi thành công",
            data: updatedReview
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

const deleteReplyReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const deletedReply = await reviewService.deleteReplyReview(reviewId);
        res.status(200).json({
            status: "success",
            message: "Xóa phản hồi thành công",
            data: deletedReply
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

const findReviewByProduct = async(req, res) => {
    try {
        const { title } = req.query;
        
        if (!title) {
            return res.status(400).send({
                status: "400",
                message: "Vui lòng nhập tên sản phẩm"
            });
        }

        const reviews = await reviewService.findReviewByProduct(title);
        
        return res.status(200).send({
            status: "200",
            message: "Tìm kiếm review thành công",
            reviews
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
}

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        await reviewService.deleteReview(reviewId);
        
        return res.status(200).send({
            status: "200",
            message: "Xóa đánh giá thành công"
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
}

const getAverageRating = async(req, res) => {
    const productId = req.params.productId;
    try {
        const ratingStats = await reviewService.getAverageRating(productId);
        return res.status(200).send({
            status: "200",
            message: "Lấy thông tin rating thành công",
            data: ratingStats
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
}

module.exports = {
    createReview,
    getAllReviews,
    getAllReviewsAdmin,
    replyToReview,
    updateReplyReview,
    deleteReplyReview,
    findReviewByProduct,
    deleteReview,
    getAverageRating
}