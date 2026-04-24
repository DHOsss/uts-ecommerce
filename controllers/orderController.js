const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');


const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Validasi input
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Alamat pengiriman dan metode pembayaran wajib diisi',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product'
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keranjang belanja kosong',
      });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'Salah satu produk di keranjang tidak ditemukan',
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok ${item.product.name} tidak mencukupi. Stok tersedia: ${item.product.stock}`,
        });
      }

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      });

      totalPrice += item.product.price * item.quantity;

      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order berhasil dibuat',
      data: order,
    });
  } catch (error) {
    console.error('createOrder Error:', error.message);
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

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('getMyOrders Error:', error.message);
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


const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.product',
      'name image'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses ke order ini',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('getOrderById Error:', error.message);
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

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    );

    res.status(200).json({
      success: true,
      count: orders.length,
      totalRevenue,
      data: orders,
    });
  } catch (error) {
    console.error('getAllOrders Error:', error.message);
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


const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    const validTransitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak bisa diubah dari '${order.status}' ke '${status}'`,
      });
    }

    order.status = status;

    if (status === 'delivered') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    if (status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Status order berhasil diupdate ke '${status}'`,
      data: order,
    });
  } catch (error) {
    console.error('updateOrderStatus Error:', error.message);
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
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
