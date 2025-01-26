const productService = require('../services/product.service')
const { cloudinary } = require('../config/cloudinary')

const createProduct = async (req, res) => {
    try {
        let productData = req.body;

        // Xử lý variants và ảnh đã được upload
        if (Array.isArray(productData.variants)) {
            productData.variants = productData.variants.map((variant, index) => ({
                ...variant,
                imageUrl: req.files && req.files[index] ? req.files[index].path : variant.imageUrl
            }));
        }

        const product = await productService.createProduct(productData);
        res.status(201).send({
            status: "201",
            message: "Tạo sản phẩm thành công",
            product
        });
    } catch (error) {
        res.status(500).send({
            status: "500",
            error: error.message,
        });
    }
};

const deleteProduct = async (req, res) => {
    const productId = req.params.id
    try {
        const message = await productService.deleteProduct(productId)
        return res.status(200).send({
            status: "200",
            message: message,
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}

const updateProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        let productData = req.body;
        productData.id = productId;
        if (typeof productData.variants === 'string') {
            productData.variants = JSON.parse(productData.variants);
        }

        const oldProduct = await productService.findProductById(productId);

        // Xử lý variants và ảnh đã được upload
        if (Array.isArray(productData.variants)) {
            productData.variants = await Promise.all(productData.variants.map(async (variant, index) => {
                const oldVariant = oldProduct.variants[index];
                
                // Tìm file dựa vào fieldname images{index}
                const variantImage = req.files?.find(file => file.fieldname === `images${index}`);

                if (variantImage) {
                    // Nếu có ảnh mới được upload cho variant này
                    if (oldVariant && oldVariant.imageUrl) {
                        // Xóa ảnh cũ trên cloudinary nếu tồn tại
                        const publicId = oldVariant.imageUrl.split('/').slice(-2).join('/').split('.')[0];
                        await cloudinary.uploader.destroy(publicId);
                    }
                    // Cập nhật URL mới
                    variant.imageUrl = variantImage.path;
                } else {
                    // Nếu không có ảnh mới, giữ nguyên ảnh cũ
                    variant.imageUrl = oldVariant ? oldVariant.imageUrl : variant.imageUrl;
                }
                return variant;
            }));
        }

        const updatedProduct = await productService.updateProduct(productId, productData);
        res.status(200).send({
            status: "200",
            message: "Cập nhật sản phẩm thành công",
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).send({
            status: "500",
            error: error.message,
        });
    }
};

const findProductById = async (req, res) => {
    const productId = req.params.id
    try {
        const products = await productService.findProductById(productId)
        return res.status(200).send({
            status: "200",
            message: "Lấy sản phẩm thành công",
            products
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}

const findProductByName = async (req, res) => {
    const { productName, pageNumber = 1, pageSize = 7 } = req.body;
    try {
        const result = await productService.findProductByName(productName, pageNumber, pageSize);
        res.status(200).json({
            status: "200",
            message: "Tìm kiếm sản phẩm thành công",
            products: result.content,
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems
        });
    } catch (error) {
        res.status(400).json({
            status: "400",
            message: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts(req.query)
        
        return res.status(200).send({
            status: "200",
            message: "Lấy sản phẩm thành công",
            data : products
        })
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        })
    }
}

const incrementProductView = async (req, res) => {
    const productId = req.params.id;
    try {
        const updatedProduct = await productService.incrementProductView(productId);
        res.status(200).json({
            status: "200",
            message: "Đã tăng lượt xem sản phẩm",
            product: updatedProduct
        });
    } catch (error) {
        res.status(400).json({
            status: "400",
            message: error.message
        });
    }
}

module.exports = {
    createProduct,
    deleteProduct,
    updateProduct,
    getAllProducts,
    findProductByName,
    findProductById,
    incrementProductView
}
