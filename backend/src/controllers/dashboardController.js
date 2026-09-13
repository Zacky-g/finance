const db = require('../config/db');

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Hitung Total Saldo Keseluruhan (All-time Income - All-time Expense)
    const balanceQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_balance
      FROM transactions
      WHERE user_id = $1
    `;

    // 2. Hitung Summary Pemasukan & Pengeluaran Bulan Ini
    const monthlySummaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS monthly_income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS monthly_expense
      FROM transactions
      WHERE user_id = $1 
        AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    // 3. Distribusi Pengeluaran berdasarkan Kategori Bulan Ini (Untuk Chart Pie/Donut)
    const categoryExpenseQuery = `
      SELECT 
        c.name AS category_name,
        COALESCE(SUM(t.amount), 0) AS total_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 
        AND t.type = 'EXPENSE'
        AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY c.name
      ORDER BY total_amount DESC
    `;

    // 4. Ambil 5 Transaksi Terbaru
    const recentTransactionsQuery = `
      SELECT 
        t.id, t.amount, t.type, t.description, t.transaction_date,
        c.name AS category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 5
    `;

    // Jalankan semua query secara paralel menggunakan Promise.all (Sangat Efisien)
    const [balanceRes, monthlyRes, categoryRes, recentRes] = await Promise.all([
      db.query(balanceQuery, [userId]),
      db.query(monthlySummaryQuery, [userId]),
      db.query(categoryExpenseQuery, [userId]),
      db.query(recentTransactionsQuery, [userId]),
    ]);

    const totalBalance = parseFloat(balanceRes.rows[0].total_balance);
    const monthlyIncome = parseFloat(monthlyRes.rows[0].monthly_income);
    const monthlyExpense = parseFloat(monthlyRes.rows[0].monthly_expense);

    // Hitung Rasio/Persentase Pengeluaran terhadap Pemasukan Bulan Ini
    const expenseRatio = monthlyIncome > 0 
      ? Number(((monthlyExpense / monthlyIncome) * 100).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_balance: totalBalance,
          monthly_income: monthlyIncome,
          monthly_expense: monthlyExpense,
          expense_to_income_ratio: expenseRatio,
        },
        category_expenses: categoryRes.rows.map(row => ({
          category: row.category_name,
          amount: parseFloat(row.total_amount)
        })),
        recent_transactions: recentRes.rows,
      },
    });
  } catch (error) {
    console.error('Error Get Dashboard Summary:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan dashboard' });
  }
};

module.exports = { getDashboardSummary };