# 💰 SaaS Finance Management App

Aplikasi manajemen keuangan pribadi berbasis Web (Full-Stack) yang dirancang untuk membantu pengguna mengelola transaksi harian, mengontrol anggaran bulanan per kategori, serta memantau kesehatan finansial melalui visualisasi data ringkas.

---

## 🚀 Fitur Utama

- **Authentication System**: Login & Register aman menggunakan JSON Web Token (JWT) dan enkripsi password (bcrypt).
- **Dashboard Analytics**: Visualisasi pemasukan vs pengeluaran, ringkasan saldo, dan riwayat transaksi terbaru menggunakan chart interaktif.
- **Transaction Management**: Pencatatan transaksi (Income/Expense) lengkap dengan filter kategori, tanggal, dan pagination.
- **Budget Tracking**: Penetapan batas maksimal anggaran bulanan per kategori dilengkapi *progress bar* dan indikator peringatan (*Over Budget*).
- **Category Management**: Pengelolaan kategori kustom untuk penyesuaian jenis pengeluaran/pemasukan.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM / Query Builder**: Prisma / pg
- **Authentication**: JWT (JSON Web Token) & bcryptjs

---

## 📁 Struktur Proyek

```text
personal-finance-app/
├── backend/          # Server Express.js & konfigurasi Database
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── config/
│   └── package.json
│
└── frontend/         # Client React.js
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    └── package.json
