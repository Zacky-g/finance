const db = require('../config/db');

// 1. TAMBAH TRANSAKSI BARU
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari JWT Auth Middleware
    const { category_id, type, amount, description, transaction_date } = req.body;

    // Validasi Input
    if (!category_id || !type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Kategori, tipe transaksi, dan nominal wajib diisi',
      });
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipe transaksi harus INCOME atau EXPENSE',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal transaksi harus lebih besar dari 0',
      });
    }

    const tDate = transaction_date || new Date().toISOString().split('T')[0];

    const query = `
      INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [userId, category_id, type, amount, description || null, tDate];
    const result = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dicatat',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error Create Transaction:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan transaksi' });
  }
};

// 2. GET DAFTAR TRANSAKSI (Filter & Pagination)
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category_id, type, start_date, end_date, limit = 10, page = 1 } = req.query;

    let query = `
      SELECT t.id, t.amount, t.type, t.description, t.transaction_date, t.created_at,
             c.id as category_id, c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;

    const queryParams = [userId];
    let paramIndex = 2;

    // Filter berdasarkan Kategori
    if (category_id) {
      query += ` AND t.category_id = $${paramIndex}`;
      queryParams.push(category_id);
      paramIndex++;
    }

    // Filter berdasarkan Tipe (INCOME/EXPENSE)
    if (type) {
      query += ` AND t.type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    // Filter berdasarkan Rentang Tanggal
    if (start_date && end_date) {
      query += ` AND t.transaction_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      queryParams.push(start_date, end_date);
      paramIndex += 2;
    }

    // Urutkan dari transaksi terbaru
    query += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;

    // Pagination Limit & Offset
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await db.query(query, queryParams);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      page: Number(page),
      data: result.rows,
    });
  } catch (error) {
    console.error('Error Get Transactions:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi' });
  }
};

// 3. DELETE TRANSAKSI (Ownership Security Guaranteed)
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Pastikan transaksi yang dihapus benar-benar milik user yang sedang login
    const result = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan atau Anda tidak memiliki akses',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaksi berhasil dihapus',
    });
  } catch (error) {
    console.error('Error Delete Transaction:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus transaksi' });
  }
};

module.exports = { createTransaction, getTransactions, deleteTransaction };