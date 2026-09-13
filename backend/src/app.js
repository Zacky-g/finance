const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const budgetRoutes = require('./routes/budgetRoutes'); // <--- Import ini

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes); // <--- Mount /api/budgets

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server Personal Finance API berjalan dengan baik',
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;