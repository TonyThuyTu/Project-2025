const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories.controller');

router.get('/', categoryController.getCategories); // Lấy tất cả

router.get('/:id', categoryController.getCategoryById); // Lấy theo ID

router.get('/parent/:parentId', categoryController.getChildrenByParentId); // Lấy theo parent_id

router.post('/', categoryController.createCategory); // Thêm mới

router.put('/:id', categoryController.updateCategory); // Cập nhật

router.delete('/:id', categoryController.deleteCategory); // Xóa

module.exports = router;
