const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/getThirdLevelCategory', categoryController.findAllThirdLevelCategory);
router.get('/men/shirts', categoryController.findMenShirtCategories);
router.get('/men/pants', categoryController.findMenPantCategories);
router.get('/women/shirts', categoryController.findWomenShirtCategories);
router.get('/women/pants', categoryController.findWomenPantCategories);
router.get('/getTopLevelCategory', categoryController.findAllTopLevelCategory);
router.get('/getSecondLevelCategory', categoryController.findAllSecondLevelCategory);

module.exports = router;
