const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get cart user yang sedang login
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name price stock image'
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Hitung total harga
    let totalPrice = 0;
    cart.items.forEach((item) => {
      if (item.product) {
        totalPrice += item.product.price * item.quantity;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        totalPrice,
        totalItems: cart.items.length,
      },
    });
  } catch (error) {
    console.error('getCart Error:', error.message);
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

// @desc    Tambah item ke cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Cek apakah produk ada
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    // Cek stok
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Stok tersedia: ${product.stock}`,
      });
    }

    // Cari atau buat cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Cek apakah produk sudah ada di cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity jika produk sudah ada
      existingItem.quantity += quantity;
    } else {
      // Tambah item baru
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate untuk response
    cart = await cart.populate('items.product', 'name price stock image');

    res.status(200).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke keranjang',
      data: cart,
    });
  } catch (error) {
    console.error('addToCart Error:', error.message);
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

// @desc    Update quantity item di cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity harus minimal 1',
      });
    }

    // Cek stok
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Stok tersedia: ${product.stock}`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Keranjang tidak ditemukan',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan di keranjang',
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    cart = await cart.populate('items.product', 'name price stock image');

    res.status(200).json({
      success: true,
      message: 'Keranjang berhasil diupdate',
      data: cart,
    });
  } catch (error) {
    console.error('updateCartItem Error:', error.message);
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

// @desc    Hapus item dari cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Keranjang tidak ditemukan',
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    cart = await cart.populate('items.product', 'name price stock image');

    res.status(200).json({
      success: true,
      message: 'Item berhasil dihapus dari keranjang',
      data: cart,
    });
  } catch (error) {
    console.error('removeFromCart Error:', error.message);
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

// @desc    Kosongkan cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Keranjang tidak ditemukan',
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Keranjang berhasil dikosongkan',
      data: cart,
    });
  } catch (error) {
    console.error('clearCart Error:', error.message);
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
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
