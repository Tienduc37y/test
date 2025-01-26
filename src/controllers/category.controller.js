const categoryService = require('../services/category.service')

const findAllThirdLevelCategory = async (req, res) => {
    try {
        const categories = await categoryService.findAllThirdLevelCategory();
        return res.status(200).send({
            status: "200",
            message: "Lấy danh mục cấp 3 thành công",
            categories: categories
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

const findMenShirtCategories = async (req, res) => {
    try {
        const categories = await categoryService.findCategoriesByGenderAndType('nam', 'ao');
        return res.status(200).send({
            status: "200",
            message: "Lấy danh mục áo nam thành công",
            categories: categories
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

const findMenPantCategories = async (req, res) => {
    try {
        const categories = await categoryService.findCategoriesByGenderAndType('nam', 'quan');
        return res.status(200).send({
            status: "200",
            message: "Lấy danh mục quần nam thành công",
            categories: categories
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

const findWomenShirtCategories = async (req, res) => {
    try {
        const categories = await categoryService.findCategoriesByGenderAndType('nu', 'ao');
        return res.status(200).send({
            status: "200",
            message: "Lấy danh mục áo nữ thành công",
            categories: categories
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

const findWomenPantCategories = async (req, res) => {
    try {
        const categories = await categoryService.findCategoriesByGenderAndType('nu', 'quan');
        return res.status(200).send({
            status: "200",
            message: "Lấy danh mục quần nữ thành công",
            categories: categories
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

const findAllTopLevelCategory = async (req, res) => {
    try {
        const categories = await categoryService.findAllTopLevelCategory();
        return res.status(200).send({
            status: "200",
            message: "Lấy danh mục cấp 1 thành công",
            categories: categories
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

const findAllSecondLevelCategory = async (req, res) => {
    try {
        const categories = await categoryService.findAllSecondLevelCategory();
        return res.status(200).send({
            status: "200",
            message: "Lấy danh mục cấp 2 thành công",
            categories: categories
        });
    } catch (error) {
        return res.status(500).send({
            status: "500",
            error: error.message
        });
    }
};

module.exports = {
    findAllTopLevelCategory,
    findAllSecondLevelCategory,
    findAllThirdLevelCategory,
    findMenShirtCategories,
    findMenPantCategories,
    findWomenShirtCategories,
    findWomenPantCategories
};
