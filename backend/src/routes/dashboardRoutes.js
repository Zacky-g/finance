const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken); // Proteksi dengan JWT

router.get('/summary', getDashboardSummary);

module.exports = router;