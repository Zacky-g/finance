const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken); // Proteksi seluruh route transaksi dengan JWT

router.get('/', getTransactions);
router.post('/', createTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;