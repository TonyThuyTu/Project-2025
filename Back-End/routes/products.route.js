const express = require('express');
const router = express.Router();
const upload = require('../helper/upload'); // dùng multer
const productController = require('../controllers/product.controller');

// Thêm sản phẩm
router.post('/', upload.array('images', 5), productController.createProduct);

// Cập nhật sản phẩm
router.put('/:id', productController.updateProduct);

// Xoá sản phẩm
router.delete('/:id', productController.deleteProduct);

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// Lấy sản phẩm theo id
router.get('/:id', productController.getProductById);

module.exports = router;
