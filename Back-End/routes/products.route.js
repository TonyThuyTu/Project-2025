const express = require('express');
const router = express.Router();
const upload = require('../helper/upload'); // dùng multer
const productController = require('../controllers/product.controller');
const validateJsonMiddleware = require('../middlewares/validateJson');

//search product
router.get('/search', productController.searchProducts);

//add product
router.post(
  '/',
  upload.fields([
    { name: 'commonImages', maxCount: 30 },
    { name: 'optionImages', maxCount: 30 }
  ]),
  validateJsonMiddleware(['specs', 'attributes', 'variants']),
  productController.createProducts
);
  

//update product
router.put(
  '/:id',
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'optionFiles', maxCount: 30}
  ]),
  productController.updateProduct
);

//get product by id
router.get('/:id', productController.getProductsById);

//get all products
router.get('/', productController.getAllProducts);

//primany products
router.patch('/:id/toggle-primary', productController.togglePrimary);

//delete product for tester
router.delete('/:id', productController.deleteProductHard);

//get product by id
router.get('/same-products/:id/same', productController.getSameProducts);

// router.get('/test', productController.getHomepageData);

// Thêm sản phẩm
// router.post('/', upload.fields([
//   { name: 'product_images', maxCount: 10 },
//   { name: 'option_images_0', maxCount: 10 },
//   { name: 'option_images_1', maxCount: 10 }
// ])
// , productController.createProduct);

// Cập nhật sản phẩm
// router.put('/:id', productController.updateProduct);

// // Xoá sản phẩm
// router.delete('/:id', productController.deleteProduct);

// Lấy tất cả sản phẩm
// router.get('/', productController.getAllProducts);

// // Lấy sản phẩm theo id
// router.get('/:id', productController.getProductById);

module.exports = router;
