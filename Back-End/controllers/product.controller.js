const db = require('../models/index.model');
const Product = db.Product;
const Category = db.Category;

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: { model: Category, attributes: ['name'], as: 'category' }, 
      order: [['id_products', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findByPk(id, {
      include: { model: Category, attributes: ['name'], as: 'category' }
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      category_id,
      products_name,
      products_market_price,
      products_sale_price,
      products_description,
      products_status
    } = req.body;

    const product = await Product.create({
      category_id,
      products_name,
      products_market_price,
      products_sale_price,
      products_description,
      products_status
    });

    res.json({ message: "Product created successfully", id: product.id_products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const [updated] = await Product.update(updatedData, { where: { id_products: id } });
    if (updated === 0) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Product.destroy({ where: { id_products: id } });
    if (deleted === 0) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
