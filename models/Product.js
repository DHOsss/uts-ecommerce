const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama produk wajib diisi'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Deskripsi produk wajib diisi'],
    },
    price: {
      type: Number,
      required: [true, 'Harga produk wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    stock: {
      type: Number,
      required: [true, 'Stok produk wajib diisi'],
      min: [0, 'Stok tidak boleh negatif'],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori produk wajib diisi'],
    },
    image: {
      type: String,
      default: 'no-image.jpg',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
