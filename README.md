# 🛒 E-Commerce REST API

REST API untuk platform E-Commerce yang dibangun menggunakan **Node.js**, **Express**, dan **MongoDB (Mongoose)**.

> Project UTS - Backend Programming - Genap 2025/2026

---

## 📋 Daftar Isi

- [Teknologi](#-teknologi-yang-digunakan)
- [Instalasi](#-instalasi)
- [Menjalankan Server](#-menjalankan-server)
- [Struktur Folder](#-struktur-folder)
- [Dokumentasi API](#-dokumentasi-api)
  - [Authentication](#1-authentication)
  - [Products](#2-products)
  - [Categories](#3-categories)
  - [Cart](#4-cart)
  - [Orders](#5-orders)
- [Cara Menggunakan Token](#-cara-menggunakan-token-authorization)

---

## 🛠 Teknologi yang Digunakan

| Teknologi | Keterangan |
|-----------|------------|
| Node.js | Runtime JavaScript |
| Express.js | Framework untuk REST API |
| MongoDB | Database NoSQL |
| Mongoose | ODM untuk MongoDB |
| JWT | Autentikasi berbasis token |w
| Bcrypt.js | Enkripsi password |
| Dotenv | Manajemen environment variable |
| CORS | Cross-Origin Resource Sharing |

---

## 🚀 Instalasi

1. **Clone repository**
```bash
git clone <url-repository>
cd ecommerce-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Buat file `.env`** di root folder
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

4. **Jalankan seeder** (mengisi data awal)
```bash
node seeder.js
```

---

## ▶ Menjalankan Server

```bash
# Mode development (auto-restart)
npm run dev

# Mode production
npm start
```

Server berjalan di: `http://localhost:5000`

### Akun Default (setelah seeder):
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | admin123 |
| User | user@ecommerce.com | user123 |

---

## 📁 Struktur Folder

```
ecommerce-api/
├── config/
│   └── db.js                    # Konfigurasi koneksi MongoDB
├── controllers/
│   ├── authController.js        # Logic autentikasi (register, login, profile)
│   ├── productController.js     # Logic CRUD produk
│   ├── categoryController.js    # Logic CRUD kategori
│   ├── cartController.js        # Logic keranjang belanja
│   └── orderController.js       # Logic pemesanan
├── middleware/
│   ├── auth.js                  # Middleware JWT & role admin
│   └── errorHandler.js          # Middleware error handler global
├── models/
│   ├── User.js                  # Schema user (dengan bcrypt)
│   ├── Product.js               # Schema produk
│   ├── Category.js              # Schema kategori
│   ├── Cart.js                  # Schema keranjang
│   └── Order.js                 # Schema pesanan
├── routes/
│   ├── authRoutes.js            # Route autentikasi
│   ├── productRoutes.js         # Route produk
│   ├── categoryRoutes.js        # Route kategori
│   ├── cartRoutes.js            # Route keranjang
│   └── orderRoutes.js           # Route pesanan
├── .env                         # Environment variables
├── .gitignore                   # File yang diabaikan git
├── package.json                 # Dependencies & scripts
├── seeder.js                    # Script pengisi data awal
└── server.js                    # Entry point aplikasi
```

---

## 📖 Dokumentasi API

Base URL: `http://localhost:5000`

### 1. Authentication

#### Register User Baru
```
POST /api/auth/register
```
**Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "081234567890",
  "address": {
    "street": "Jl. Contoh No. 1",
    "city": "Medan",
    "province": "Sumatera Utara",
    "postalCode": "20111"
  }
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### Login
```
POST /api/auth/login
```
**Body (JSON):**
```json
{
  "email": "user@ecommerce.com",
  "password": "user123"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "_id": "...",
    "name": "User Test",
    "email": "user@ecommerce.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### Get Profil User
```
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profil User
```
PUT /api/auth/profile
Authorization: Bearer <token>
```
**Body (JSON):**
```json
{
  "name": "Nama Baru",
  "phone": "089876543210"
}
```

---

### 2. Products

#### Get Semua Produk (Public)
```
GET /api/products
```
**Query Parameters (opsional):**
| Parameter | Contoh | Keterangan |
|-----------|--------|------------|
| search | `?search=iphone` | Cari berdasarkan nama |
| category | `?category=<category_id>` | Filter berdasarkan kategori |
| minPrice | `?minPrice=100000` | Harga minimal |
| maxPrice | `?maxPrice=500000` | Harga maksimal |
| sort | `?sort=price_asc` | Urutkan: `price_asc`, `price_desc`, `name_asc` |

**Contoh:**
```
GET /api/products?search=iphone&sort=price_asc
```

---

#### Get Produk by ID (Public)
```
GET /api/products/:id
```

#### Tambah Produk Baru (Admin)
```
POST /api/products
Authorization: Bearer <admin_token>
```
**Body (JSON):**
```json
{
  "name": "Produk Baru",
  "description": "Deskripsi produk",
  "price": 150000,
  "stock": 100,
  "category": "<category_id>",
  "image": "produk.jpg"
}
```

#### Update Produk (Admin)
```
PUT /api/products/:id
Authorization: Bearer <admin_token>
```

#### Hapus Produk (Admin)
```
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

---

### 3. Categories

#### Get Semua Kategori (Public)
```
GET /api/categories
```

#### Get Kategori by ID (Public)
```
GET /api/categories/:id
```

#### Tambah Kategori (Admin)
```
POST /api/categories
Authorization: Bearer <admin_token>
```
**Body (JSON):**
```json
{
  "name": "Kategori Baru",
  "description": "Deskripsi kategori"
}
```

#### Update Kategori (Admin)
```
PUT /api/categories/:id
Authorization: Bearer <admin_token>
```

#### Hapus Kategori (Admin)
```
DELETE /api/categories/:id
Authorization: Bearer <admin_token>
```

---

### 4. Cart

> Semua endpoint cart membutuhkan autentikasi (login)

#### Lihat Keranjang
```
GET /api/cart
Authorization: Bearer <token>
```

#### Tambah ke Keranjang
```
POST /api/cart
Authorization: Bearer <token>
```
**Body (JSON):**
```json
{
  "productId": "<product_id>",
  "quantity": 2
}
```

#### Update Quantity di Keranjang
```
PUT /api/cart/:productId
Authorization: Bearer <token>
```
**Body (JSON):**
```json
{
  "quantity": 3
}
```

#### Hapus Item dari Keranjang
```
DELETE /api/cart/:productId
Authorization: Bearer <token>
```

#### Kosongkan Keranjang
```
DELETE /api/cart/clear
Authorization: Bearer <token>
```

---

### 5. Orders

> Semua endpoint order membutuhkan autentikasi (login)

#### Buat Pesanan (Checkout dari Cart)
```
POST /api/orders
Authorization: Bearer <token>
```
**Body (JSON):**
```json
{
  "shippingAddress": {
    "street": "Jl. Merdeka No. 10",
    "city": "Medan",
    "province": "Sumatera Utara",
    "postalCode": "20111"
  },
  "paymentMethod": "transfer_bank"
}
```
**Payment Method yang tersedia:** `transfer_bank`, `cod`, `e_wallet`

---

#### Lihat Pesanan Saya
```
GET /api/orders
Authorization: Bearer <token>
```

#### Lihat Detail Pesanan
```
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Lihat Semua Pesanan (Admin)
```
GET /api/orders/admin/all
Authorization: Bearer <admin_token>
```

#### Update Status Pesanan (Admin)
```
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
```
**Body (JSON):**
```json
{
  "status": "processing"
}
```
**Alur Status Pesanan:**
```
pending → processing → shipped → delivered
   ↓          ↓
cancelled  cancelled
```

---

## 🔐 Cara Menggunakan Token (Authorization)

Beberapa endpoint membutuhkan **token JWT** untuk mengakses. Berikut cara menggunakannya:

### Step 1: Login untuk mendapatkan token
Kirim request `POST /api/auth/login` → dapatkan `token` dari response.

### Step 2: Gunakan token di Postman
1. Buka tab **Authorization**
2. Pilih Type: **Bearer Token**
3. Paste token di kolom **Token**
4. Kirim request

### Tipe Akses:
| Endpoint | Akses | Keterangan |
|----------|-------|------------|
| Register, Login | Public | Tidak perlu token |
| Get Products, Categories | Public | Tidak perlu token |
| Cart, Orders, Profile | Private | Perlu token user |
| CRUD Products, Categories, Update Order Status | Admin | Perlu token admin |

---

## 👥 Anggota Kelompok

| Nama | NIM | Kontribusi |
|------|-----|------------|
| | | |
| | | |
| | | |

---

## 📄 Lisensi

Project ini dibuat untuk keperluan UTS Backend Programming - Genap 2025/2026.
