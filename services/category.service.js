const Category = require('../models/category.model');

const findAllThirdLevelCategory = async () => {
    try {
        const categories = await Category.find({ level: 3 })
            .populate({
                path: 'parentCategory',
                populate: {
                    path: 'parentCategory'
                }
            });

        // Lọc trùng dựa trên slugCategory
        const uniqueCategories = [...new Set(categories.map(cat => cat.slugCategory))]
            .map(slug => {
                const category = categories.find(cat => cat.slugCategory === slug);
                return {
                    _id: category._id,
                    name: category.name,
                    slugCategory: category.slugCategory,
                    level: category.level,
                    parentCategory: category.parentCategory
                };
            });

        return uniqueCategories;
    } catch (error) {
        throw error;
    }
};

const findCategoriesByGenderAndType = async (gender, type) => {
    try {
        const categories = await Category.find({ level: 3 })
            .populate({
                path: 'parentCategory',
                match: { slugCategory: type },
                populate: {
                    path: 'parentCategory',
                    match: { slugCategory: gender }
                }
            });

        // Lọc ra các categories có đủ cả parentCategory (type) và parentCategory.parentCategory (gender)
        const filteredCategories = categories.filter(
            category => category.parentCategory?.parentCategory
        );

        // Sử dụng Set để loại bỏ trùng lặp
        const uniqueCategories = [...new Set(filteredCategories.map(category => category.slugCategory))]
            .map(slug => {
                const category = filteredCategories.find(cat => cat.slugCategory === slug);
                return {
                    name: category.name,
                    slugCategory: category.slugCategory
                };
            });

        return uniqueCategories;
    } catch (error) {
        console.error(`Error in findCategoriesByGenderAndType (${gender}, ${type}):`, error);
        throw error;
    }
};

const findAllTopLevelCategory = async () => {
    try {
        const categories = await Category.find({ level: 1 })
            .select('name slugCategory level');

        // Lọc trùng dựa trên slugCategory
        const uniqueCategories = [...new Set(categories.map(cat => cat.slugCategory))]
            .map(slug => {
                const category = categories.find(cat => cat.slugCategory === slug);
                return {
                    _id: category._id,
                    name: category.name,
                    slugCategory: category.slugCategory,
                    level: category.level
                };
            });

        return uniqueCategories;
    } catch (error) {
        throw error;
    }
};

const findAllSecondLevelCategory = async () => {
    try {
        const categories = await Category.find({ level: 2 })
            .populate({
                path: 'parentCategory',
                select: 'name slugCategory'
            })
            .select('name slugCategory level parentCategory');

        // Lọc trùng dựa trên slugCategory
        const uniqueCategories = [...new Set(categories.map(cat => cat.slugCategory))]
            .map(slug => {
                const category = categories.find(cat => cat.slugCategory === slug);
                return {
                    _id: category._id,
                    name: category.name,
                    slugCategory: category.slugCategory,
                    level: category.level,
                    parentCategory: category.parentCategory
                };
            });

        return uniqueCategories;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    findAllTopLevelCategory,
    findAllSecondLevelCategory,
    findAllThirdLevelCategory,
    findCategoriesByGenderAndType
};
