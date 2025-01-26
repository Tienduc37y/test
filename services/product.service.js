const Category = require('../models/category.model')
const Product = require('../models/product.model')
const unidecode = require('unidecode')
const { cloudinary } = require('../config/cloudinary');
const slugify = require('slugify');

function roundToInteger(number) {
    return Math.round(number);
}

function createSlug(text) {
    return slugify(text, {
        lower: true,
        strict: true,
        locale: 'vi'
    });
}

async function createProduct(reqData) {
    let topLevel = await Category.findOne({name: reqData.category.topLevelCategory})
    if(!topLevel) {
        topLevel = new Category({
            name: reqData.category.topLevelCategory,
            level: 1,
            slugCategory: createSlug(reqData.category.topLevelCategory)
        })
        await topLevel.save()
    }
    let secondLevel = await Category.findOne({
        name: reqData.category.secondLevelCategory,
        parentCategory: topLevel._id
    })
    if(!secondLevel) {
        secondLevel = new Category({
            name: reqData.category.secondLevelCategory,
            parentCategory: topLevel._id,
            level: 2,
            slugCategory: createSlug(reqData.category.secondLevelCategory)
        })
        await secondLevel.save()
    }
    let thirdLevel = await Category.findOne({
        name: reqData.category.thirdLevelCategory,
        parentCategory: secondLevel._id
    })
    if(!thirdLevel){
        thirdLevel = new Category({
            name: reqData.category.thirdLevelCategory,
            parentCategory: secondLevel._id,
            level: 3,
            slugCategory: createSlug(reqData.category.thirdLevelCategory)
        })
        await thirdLevel.save()
    } 
    if (reqData.variants && Array.isArray(reqData.variants)) {
        reqData.variants = reqData.variants.map(variant => ({
            ...variant,
            color: variant.color,
            slugColor: createSlug(variant.nameColor),
            nameColor: variant.nameColor,
            sizes: variant.sizes.map(size => ({
                size: size.size,
                quantityItem: size.quantityItem
            }))
        }));
    }

    // Tính tổng quantity từ variants
    if (reqData.variants && Array.isArray(reqData.variants)) {
        const totalQuantity = reqData.variants.reduce((total, variant) => {
            return total + variant.sizes.reduce((sizeTotal, size) => {
                return sizeTotal + (size.quantityItem || 0);
            }, 0);
        }, 0);
        reqData.quantity = totalQuantity;
    }

    const product = new Product({
        title: reqData.title,
        slugProduct: createSlug(reqData.title),
        description: reqData.description,
        price: roundToInteger(reqData.price),
        discountedPrice: roundToInteger(reqData.discountedPrice),
        discountedPersent: reqData.discountedPersent,
        brand: reqData.brand,
        quantity: reqData.quantity,
        variants: reqData.variants,
        category: {
            topLevelCategory: {
                _id: topLevel._id,
                name: topLevel.name,
                level: topLevel.level,
                slugCategory: topLevel.slugCategory,
                parentCategory: topLevel.parentCategory
            },
            secondLevelCategory: {
                _id: secondLevel._id,
                name: secondLevel.name,
                level: secondLevel.level,
                slugCategory: secondLevel.slugCategory,
                parentCategory: secondLevel.parentCategory
            },
            thirdLevelCategory: {
                _id: thirdLevel._id,
                name: thirdLevel.name,
                level: thirdLevel.level,
                slugCategory: thirdLevel.slugCategory,
                parentCategory: thirdLevel.parentCategory
            }
        },
    });

    return await product.save();
}

async function deleteProduct(productId) {
    const product = await findProductById(productId)
    
    if (product.variants && Array.isArray(product.variants)) {
        for (let variant of product.variants) {
            if (variant.imageUrl) {
                try {
                    const publicId = variant.imageUrl.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error('Lỗi khi xóa ảnh từ Cloudinary:', error);
                }
            }
        }
    }
    await Product.findByIdAndDelete(product._id)
    return "Xóa sản phẩm và ảnh liên quan thành công"
}

async function updateProduct(productId, reqData) {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
    }

    // Tìm và xóa ảnh của các variant bị loại bỏ
    if (product.variants && Array.isArray(product.variants)) {
        // Lấy danh sách imageUrl của các variant mới
        const newVariantImageUrls = reqData.variants
            .filter(v => v.imageUrl)
            .map(v => v.imageUrl);

        // Tìm các variant cũ có ảnh không còn trong danh sách mới
        const removedVariants = product.variants.filter(oldVariant => 
            oldVariant.imageUrl && !newVariantImageUrls.includes(oldVariant.imageUrl)
        );

        // Xóa ảnh của các variant bị loại bỏ
        for (let variant of removedVariants) {
            try {
                const publicId = variant.imageUrl.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error('Lỗi khi xóa ảnh từ Cloudinary:', error);
            }
        }
    }

    // Tiếp tục xử lý categories
    let topLevel = await Category.findOne({name: reqData.category.topLevelCategory})
    if(!topLevel) {
        topLevel = new Category({
            name: reqData.category.topLevelCategory,
            level: 1,
            slugCategory: createSlug(reqData.category.topLevelCategory)
        })
        await topLevel.save()
    }
    let secondLevel = await Category.findOne({
        name: reqData.category.secondLevelCategory,
        parentCategory: topLevel._id
    })
    if(!secondLevel) {
        secondLevel = new Category({
            name: reqData.category.secondLevelCategory,
            parentCategory: topLevel._id,
            level: 2,
            slugCategory: createSlug(reqData.category.secondLevelCategory)
        })
        await secondLevel.save()
    }
    let thirdLevel = await Category.findOne({
        name: reqData.category.thirdLevelCategory,
        parentCategory: secondLevel._id
    })
    if(!thirdLevel){
        thirdLevel = new Category({
            name: reqData.category.thirdLevelCategory,
            parentCategory: secondLevel._id,
            level: 3,
            slugCategory: createSlug(reqData.category.thirdLevelCategory)
        })
        await thirdLevel.save()
    }

    if (reqData.variants && Array.isArray(reqData.variants)) {
        reqData.variants = reqData.variants.map(variant => ({
            ...variant,
            color: variant.color,
            slugColor: createSlug(variant.color),
            nameColor: variant.nameColor,
            sizes: variant.sizes.map(size => ({
                size: size.size,
                quantityItem: size.quantityItem
            }))
        }));
    }

    // Tính tổng quantity từ variants
    if (reqData.variants && Array.isArray(reqData.variants)) {
        const totalQuantity = reqData.variants.reduce((total, variant) => {
            return total + variant.sizes.reduce((sizeTotal, size) => {
                return sizeTotal + (size.quantityItem || 0);
            }, 0);
        }, 0);
        reqData.quantity = totalQuantity;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
        title: reqData.title,
        slugProduct: createSlug(reqData.title),
        description: reqData.description,
        price: roundToInteger(reqData.price),
        discountedPrice: roundToInteger(reqData.discountedPrice),
        discountedPersent: reqData.discountedPersent,
        brand: reqData.brand,
        quantity: reqData.quantity,
        variants: reqData.variants,
        category: {
            topLevelCategory: {
                _id: topLevel._id,
                name: topLevel.name,
                level: topLevel.level,
                slugCategory: topLevel.slugCategory,
                parentCategory: topLevel.parentCategory
            },
            secondLevelCategory: {
                _id: secondLevel._id,
                name: secondLevel.name,
                level: secondLevel.level,
                slugCategory: secondLevel.slugCategory,
                parentCategory: secondLevel.parentCategory
            },
            thirdLevelCategory: {
                _id: thirdLevel._id,
                name: thirdLevel.name,
                level: thirdLevel.level,
                slugCategory: thirdLevel.slugCategory,
                parentCategory: thirdLevel.parentCategory
            }
        },
    }, { new: true });

    return updatedProduct;
}

async function findProductById(productId) {
    const product = await Product.findById(productId).populate('category').exec()
    if(!product){
        throw new Error("Không có sản phẩm")
    }
    return product
}

async function findProductByName(productName, pageNumber, pageSize) {
    try {
        const skip = (pageNumber - 1) * pageSize;
        
        // Hàm chuẩn hóa text: bỏ dấu và chuyển thành chữ thường
        const normalizeText = (text) => {
            return unidecode(text)
                .toLowerCase()
                .trim();
        };
        
        // Chuẩn hóa từ khóa tìm kiếm
        const normalizedSearchTerm = normalizeText(productName);

        // Tìm sản phẩm với title đã được chuẩn hóa
        const products = await Product.find().lean();
        
        // Lọc sản phẩm dựa trên title đã chuẩn hóa
        const filteredProducts = products.filter(product => {
            const normalizedTitle = normalizeText(product.title);
            
            // Nếu searchTerm chỉ có 1 ký tự, tìm kiếm ký tự đó trong title
            if (normalizedSearchTerm.length === 1) {
                return normalizedTitle.includes(normalizedSearchTerm);
            }
            
            // Nếu searchTerm có nhiều ký tự, tìm kiếm theo từ
            const searchWords = normalizedSearchTerm.split(/\s+/);
            const titleWords = normalizedTitle.split(/\s+/);
            
            return searchWords.every(searchWord => 
                // Tìm kiếm từ hoàn chỉnh hoặc một phần của từ
                titleWords.some(titleWord => 
                    titleWord.includes(searchWord) || searchWord.includes(titleWord)
                )
            );
        });

        // Tính toán phân trang
        const totalItems = filteredProducts.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        
        // Lấy sản phẩm theo trang
        const paginatedProducts = filteredProducts
            .slice(skip, skip + pageSize);

        return {
            content: paginatedProducts,
            currentPage: parseInt(pageNumber),
            totalPages,
            totalItems
        };

    } catch (error) {
        throw new Error("Lỗi khi tìm kiếm sản phẩm: " + error.message);
    }
}

async function getAllProducts(reqQuery) {
    let {topLevelCategory, secondLevelCategory, thirdLevelCategory, color, sizes, minPrice, maxPrice, minDiscount, sort, stock, pageNumber, pageSize} = reqQuery;
    pageSize = pageSize || 10;
    pageNumber = pageNumber || 1;

    let query = Product.find().populate('category');

    // Category filter
    if (topLevelCategory || secondLevelCategory || thirdLevelCategory) {
        let categoryQuery = {};
        if (topLevelCategory) {
            categoryQuery["category.topLevelCategory.slugCategory"] = topLevelCategory;
        }
        if (secondLevelCategory) {
            categoryQuery["category.secondLevelCategory.slugCategory"] = secondLevelCategory;
        }
        if (thirdLevelCategory) {
            categoryQuery["category.thirdLevelCategory.slugCategory"] = thirdLevelCategory;
        }
        query = query.where(categoryQuery);
    }

    // Color filter
    if (color) {
        const colorSet = new Set(color.split("_").map(c => createSlug(c.trim()))); // Sử dụng createSlug để chuẩn hóa
        if (colorSet.size > 0) {
            query = query.where({
                'variants': {
                    $elemMatch: {
                        'slugColor': { $in: [...colorSet] }
                    }
                }
            });
        }
    }

    // Size filter
    if (sizes) {
        const sizesSet = new Set(sizes.split("_").map(s => s.trim()));
        if (sizesSet.size > 0) {
            query = query.where({
                'variants': {
                    $elemMatch: {
                        'sizes': {
                            $elemMatch: {
                                'size': { $in: [...sizesSet] },
                                'quantityItem': { $gt: 0 }
                            }
                        }
                    }
                }
            });
        }
    }

    // Price filter
    if (minPrice && maxPrice) {
        query = query.where("discountedPrice").gte(minPrice).lte(maxPrice);
    }

    // Discount filter
    if (minDiscount) {
        query = query.where("discountedPersent").gte(minDiscount);
    }    

    // Stock filter
    if (stock) {
        switch(stock) {
            case 'in_stock':
                // Lấy các sản phẩm có quantity > 0
                query = query.where('quantity').gt(0);
                break;
            case 'out_of_stock':
                // Lấy các sản phẩm có quantity = 0
                query = query.where('quantity').equals(0);
                break;
            case 'low_stock':
                // Lấy các sản phẩm có ít nhất một size trong variants có quantityItem < 5
                query = query.where({
                    'variants': {
                        $elemMatch: {
                            'sizes': {
                                $elemMatch: {
                                    'quantityItem': { 
                                        $gt: 0,  // Vẫn còn hàng
                                        $lt: 5   // Nhưng ít hơn 5
                                    }
                                }
                            }
                        }
                    }
                });
                break;
            default:
                break;
        }
    }

    // Sorting
    if (sort) {
        switch(sort) {
            case "price_high":
                query = query.sort({discountedPrice: -1});
                break;
            case "price_low":
                query = query.sort({discountedPrice: 1});
                break;
            case "newest":
                query = query.sort({createdAt: -1});
                break;
            case "best_selling":
                query = query.sort({sellQuantity: -1});
                break;
            default:
                // Mặc định sắp xếp theo createdAt giảm dần (mới nhất trước)
                query = query.sort({createdAt: -1});
        }
    } else {
        // Nếu không có tham số sort, mặc định sắp xếp theo createdAt giảm dần
        query = query.sort({createdAt: -1});
    }

    // Pagination
    const totalProducts = await Product.countDocuments(query);
    const skip = (pageNumber - 1) * pageSize;
    query = query.skip(skip).limit(pageSize);

    // Execute the query
    const products = await query.exec();
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Tính tổng quantity của tất cả sản phẩm
    const totalQuantity = await Product.aggregate([
        { 
            $group: {
                _id: null,
                total: { $sum: "$quantity" }
            }
        }
    ]);

    return {
        content: products,
        currentPage: pageNumber,
        totalPages,
        totalProducts,
        totalQuantity: totalQuantity[0]?.total || 0
    };
}


async function incrementProductView(productId) {
    const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { view: 1 } },
        { new: true }
    );
    if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
    }
    return product;
}

module.exports = {
    createProduct,
    deleteProduct,
    updateProduct,
    getAllProducts,
    findProductById,
    findProductByName,
    incrementProductView
}
