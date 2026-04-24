const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

// Data seed
const categories = [
  { name: 'Elektronik', description: 'Perangkat elektronik dan gadget' },
  { name: 'Pakaian', description: 'Pakaian pria dan wanita' },
  { name: 'Makanan & Minuman', description: 'Produk makanan dan minuman' },
  { name: 'Kesehatan', description: 'Produk kesehatan dan kecantikan' },
  { name: 'Olahraga', description: 'Peralatan dan pakaian olahraga' },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Hapus data lama
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('Data lama berhasil dihapus');

    // Buat admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin',
      phone: '081234567890',
      address: {
        street: 'Jl. Admin No. 1',
        city: 'Medan',
        province: 'Sumatera Utara',
        postalCode: '20111',
      },
    });
    console.log('Admin user berhasil dibuat');

    // Buat user biasa
    const user = await User.create({
      name: 'User Test',
      email: 'user@ecommerce.com',
      password: 'user123',
      role: 'user',
      phone: '081298765432',
      address: {
        street: 'Jl. User No. 2',
        city: 'Medan',
        province: 'Sumatera Utara',
        postalCode: '20112',
      },
    });
    console.log('User test berhasil dibuat');

    // Buat categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Kategori berhasil dibuat');

    // Buat products
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'Smartphone Apple terbaru dengan chip A17 Pro',
        price: 21999000,
        stock: 50,
        category: createdCategories[0]._id,
        image: 'iphone15.jpg',
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone Samsung flagship dengan S Pen',
        price: 19999000,
        stock: 45,
        category: createdCategories[0]._id,
        image: 'samsung-s24.jpg',
      },
      {
        name: 'Laptop ASUS ROG Strix',
        description: 'Laptop gaming dengan RTX 4060 dan Intel i7',
        price: 18500000,
        stock: 25,
        category: createdCategories[0]._id,
        image: 'asus-rog.jpg',
      },
      {
        name: 'Kaos Polos Premium',
        description: 'Kaos polos bahan cotton combed 30s',
        price: 89000,
        stock: 200,
        category: createdCategories[1]._id,
        image: 'kaos-polos.jpg',
      },
      {
        name: 'Jaket Hoodie Unisex',
        description: 'Jaket hoodie bahan fleece tebal',
        price: 175000,
        stock: 150,
        category: createdCategories[1]._id,
        image: 'hoodie.jpg',
      },
      {
        name: 'Kopi Arabika Gayo 250gr',
        description: 'Kopi arabika asli Gayo, Aceh',
        price: 65000,
        stock: 100,
        category: createdCategories[2]._id,
        image: 'kopi-gayo.jpg',
      },
      {
        name: 'Vitamin C 1000mg',
        description: 'Suplemen vitamin C untuk daya tahan tubuh',
        price: 45000,
        stock: 300,
        category: createdCategories[3]._id,
        image: 'vitamin-c.jpg',
      },
      {
        name: 'Dumbbell Set 20kg',
        description: 'Set dumbbell adjustable untuk latihan di rumah',
        price: 350000,
        stock: 80,
        category: createdCategories[4]._id,
        image: 'dumbbell.jpg',
      },
    ];

    await Product.insertMany(products);
    console.log('Produk berhasil dibuat');

    console.log('\n=== SEED DATA BERHASIL ===');
    console.log('Admin  -> email: admin@ecommerce.com | password: admin123');
    console.log('User   -> email: user@ecommerce.com  | password: user123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
