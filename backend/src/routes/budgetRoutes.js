const express = require('express');
const router = express.Router();
const { setBudget, getBudgets, deleteBudget } = require('../controllers/budgetController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getBudgets);
router.post('/', setBudget);
router.delete('/:id', deleteBudget);

module.exports = router;