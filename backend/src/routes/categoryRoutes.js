const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken); // Proteksi seluruh route kategori dengan JWT

router.get('/', getCategories);
router.post('/', createCategory);

module.exports = router;