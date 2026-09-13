const db = require('../config/db');

// Mendapatkan semua kategori (Kategori Bawaan + Kategori Kustom milik User)
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT id, name, type, icon, 
             CASE WHEN user_id IS NULL THEN true ELSE false END as is_default
      FROM categories 
      WHERE user_id IS NULL OR user_id = $1
      ORDER BY type ASC, name ASC
    `;

    const result = await db.query(query, [userId]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error Get Categories:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kategori' });
  }
};

// Menambahkan Kategori Kustom Baru oleh User
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type } = req.body;

    if (!name || !type || !['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori dan tipe (INCOME/EXPENSE) harus valid',
      });
    }

    const result = await db.query(
      'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, type]
    );

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error Create Category:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat kategori baru' });
  }
};

module.exports = { getCategories, createCategory };