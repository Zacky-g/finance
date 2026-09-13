-- Mengaktifkan ekstensi UUID untuk PostgreSQL jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. TABEL CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = System Default Category, Non-NULL = Custom User Category
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('INCOME', 'EXPENSE')) NOT NULL,
    icon VARCHAR(50) DEFAULT 'default-icon',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type VARCHAR(10) CHECK (type IN ('INCOME', 'EXPENSE')) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount_limit NUMERIC(15, 2) NOT NULL CHECK (amount_limit > 0),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_category_period UNIQUE (user_id, category_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, month, year);

-- Index untuk mempercepat query berdasarkan user dan tanggal transaksi
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- Seed Data Kategori Bawaan Sistem (user_id IS NULL)
INSERT INTO categories (user_id, name, type) VALUES
(NULL, 'Gaji', 'INCOME'),
(NULL, 'Uang Saku', 'INCOME'),
(NULL, 'Freelance', 'INCOME'),
(NULL, 'Bonus', 'INCOME'),
(NULL, 'Lainnya (Pemasukan)', 'INCOME'),
(NULL, 'Makanan', 'EXPENSE'),
(NULL, 'Transportasi', 'EXPENSE'),
(NULL, 'Pendidikan', 'EXPENSE'),
(NULL, 'Hiburan', 'EXPENSE'),
(NULL, 'Belanja', 'EXPENSE'),
(NULL, 'Tagihan', 'EXPENSE'),
(NULL, 'Kesehatan', 'EXPENSE'),
(NULL, 'Lainnya (Pengeluaran)', 'EXPENSE')
ON CONFLICT DO NOTHING;