const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validateInput');
const authenticateToken = require('../middleware/authMiddleware');

console.log('Isi validateRegister:', validateRegister);
console.log('Isi register:', register);

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected Route (Harus menyertakan Bearer Token)
router.get('/me', authenticateToken, getProfile);

module.exports = router;