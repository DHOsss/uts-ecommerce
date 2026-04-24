const Category = require('../models/Category');

// @desc    Get semua kategori
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('getCategories Error:', error.message);
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

// @desc    Get satu kategori berdasarkan ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('getCategoryById Error:', error.message);
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

// @desc    Buat kategori baru
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: category,
    });
  } catch (error) {
    console.error('createCategory Error:', error.message);
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

// @desc    Update kategori
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: category,
    });
  } catch (error) {
    console.error('updateCategory Error:', error.message);
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

// @desc    Hapus kategori
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
  } catch (error) {
    console.error('deleteCategory Error:', error.message);
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
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
