const db = require('../config/db');

// 1. SET / UPDATE BUDGET
const setBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category_id, amount_limit, month, year } = req.body;

    if (!category_id || !amount_limit || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Kategori, limit budget, bulan, dan tahun wajib diisi',
      });
    }

    // Menggunakan UPSERT (INSERT ... ON CONFLICT DO UPDATE)
    const query = `
      INSERT INTO budgets (user_id, category_id, amount_limit, month, year)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, category_id, month, year)
      DO UPDATE SET amount_limit = EXCLUDED.amount_limit, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [userId, category_id, amount_limit, month, year];
    const result = await db.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Anggaran berhasil ditetapkan',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error Set Budget:', error);
    res.status(500).json({ success: false, message: 'Gagal mengatur anggaran' });
  }
};

// 2. GET BUDGET MONITORING (Menghitung Pengeluaran Aktual vs Limit)
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = req.query.month || new Date().getMonth() + 1;
    const currentYear = req.query.year || new Date().getFullYear();

    const query = `
      SELECT 
        b.id,
        b.category_id,
        c.name AS category_name,
        b.amount_limit,
        b.month,
        b.year,
        COALESCE(SUM(t.amount), 0) AS actual_used,
        (b.amount_limit - COALESCE(SUM(t.amount), 0)) AS remaining
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.user_id = b.user_id
        AND t.type = 'EXPENSE'
        AND EXTRACT(MONTH FROM t.transaction_date) = b.month
        AND EXTRACT(YEAR FROM t.transaction_date) = b.year
      WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
      GROUP BY b.id, c.name
      ORDER BY c.name ASC
    `;

    const result = await db.query(query, [userId, currentMonth, currentYear]);

    // Kalkulasi persentase dan penentuan status warning
    const budgetsWithAnalysis = result.rows.map((b) => {
      const limit = parseFloat(b.amount_limit);
      const used = parseFloat(b.actual_used);
      const percentage = limit > 0 ? Number(((used / limit) * 100).toFixed(2)) : 0;

      let status = 'NORMAL';
      let message = 'Pengeluaran masih dalam batas aman';

      if (percentage >= 100) {
        status = 'EXCEEDED';
        message = `⚠️ Budget ${b.category_name} telah terlampaui!`;
      } else if (percentage >= 90) {
        status = 'WARNING';
        message = `⚠️ Budget ${b.category_name} telah mencapai ${percentage}%`;
      }

      return {
        id: b.id,
        category_id: b.category_id,
        category_name: b.category_name,
        amount_limit: limit,
        actual_used: used,
        remaining: parseFloat(b.remaining),
        percentage,
        status,
        message,
      };
    });

    res.status(200).json({
      success: true,
      period: { month: Number(currentMonth), year: Number(currentYear) },
      data: budgetsWithAnalysis,
    });
  } catch (error) {
    console.error('Error Get Budgets:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data anggaran' });
  }
};

// 3. DELETE BUDGET
const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Anggaran tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Anggaran berhasil dihapus' });
  } catch (error) {
    console.error('Error Delete Budget:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus anggaran' });
  }
};

module.exports = { setBudget, getBudgets, deleteBudget };