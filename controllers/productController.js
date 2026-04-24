const Product = require('../models/Product');

// @desc    Get semua produk
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    // Query params untuk filtering
    const { category, search, minPrice, maxPrice, sort } = req.query;
    let query = {};

    // Filter berdasarkan kategori
    if (category) {
      query.category = category;
    }

    // Search berdasarkan nama produk
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter berdasarkan range harga
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: terbaru
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('getProducts Error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} sudah terdaftar` });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// @desc    Get satu produk berdasarkan ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('getProductById Error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} sudah terdaftar` });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// @desc    Buat produk baru
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image,
    });

    const populatedProduct = await product.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: populatedProduct,
    });
  } catch (error) {
    console.error('createProduct Error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} sudah terdaftar` });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// @desc    Update produk
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Produk berhasil diupdate',
      data: product,
    });
  } catch (error) {
    console.error('updateProduct Error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} sudah terdaftar` });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// @desc    Hapus produk
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus',
    });
  } catch (error) {
    console.error('deleteProduct Error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} sudah terdaftar` });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
