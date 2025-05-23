const Product = require('../models/products');

// Lấy tất cả sản phẩm
exports.getAllProducts = (req, res) => {
  Product.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Lấy sản phẩm theo ID
exports.getProductById = (req, res) => {
  const id = req.params.id;
  Product.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: "Product not found" });

    const product = results[0];
    Product.getSpecsByProductId(id, (err, specs) => {
      if (err) return res.status(500).json({ error: err });
      Product.getImagesByProductId(id, (err, images) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ ...product, specs, images });
      });
    });
  });
};

// Thêm sản phẩm
exports.createProduct = (req, res) => {
  const {
    category_id,
    products_name,
    products_market_price,
    products_sale_price,
    products_description,
    products_status,
    specs
  } = req.body;

  const files = req.files || [];

  const productData = {
    category_id,
    products_name,
    products_market_price,
    products_sale_price,
    products_description,
    products_status
  };

  Product.create(productData, (err, result) => {
    if (err) return res.status(500).json({ error: err });

    const newProductId = result.insertId;

    // specs là JSON string -> parse ra
    let specsParsed = [];
    try {
      specsParsed = JSON.parse(specs);
    } catch (_) {}

    Product.addSpecs(newProductId, specsParsed, (err) => {
      if (err) return res.status(500).json({ error: err });

      Product.addImages(newProductId, files, (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({ message: "Product created successfully", id: newProductId });
      });
    });
  });
};

// Cập nhật sản phẩm
exports.updateProduct = (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  Product.update(id, updatedData, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Product updated successfully" });
  });
};

// Xoá sản phẩm
exports.deleteProduct = (req, res) => {
  const id = req.params.id;
  Product.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Product deleted successfully" });
  });
};
