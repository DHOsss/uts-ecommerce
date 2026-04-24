const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware untuk proteksi route (harus login)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Ambil token dari header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil data user dari token (tanpa password)
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak, token tidak ditemukan',
    });
  }
};

// Middleware untuk cek role admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak, hanya admin yang diizinkan',
    });
  }
};

module.exports = { protect, admin };
