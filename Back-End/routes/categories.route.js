const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories.controller');
const upload = require('../helper/upload');

router.get('/', categoryController.getCategories); // Lấy tất cả

router.get('/:id', categoryController.getCategoryById); // Lấy theo ID

router.get('/parent/:parentId', categoryController.getChildrenByParentId); // Lấy theo parent_id

router.post('/', upload.single('image'), categoryController.createCategory); // Thêm mới

router.put('/:id', upload.single('image'), categoryController.updateCategory); //sử danh mục

router.delete('/:id', categoryController.deleteCategory); // Xóa

router.patch('/:id/is_primary', categoryController.togglePrimary); //ghim danh mục lên trangh chủ

router.patch('/:id/is_active', categoryController.toggleActive); //ẩn hiện danh mục

module.exports = router;
