const bcrypt = require('bcryptjs');
const pool = require('../config/db'); 
const jwt = require('jsonwebtoken'); // Pastikan jsonwebtoken sudah di-import

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validasi input dasar
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Semua field (nama, email, password) wajib diisi' });
  }

  try {
    // 2. Cek apakah email sudah terdaftar di Supabase
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar. Gunakan email lain.' });
    }

    // 3. Encrypt password dengan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Simpan user baru ke database Supabase
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: {
        user: newUser.rows[0]
      }
    });
  } catch (error) {
    console.error('Error saat Registrasi:', error.message);
    return res.status(500).json({ 
      message: 'Gagal mendaftar ke server: ' + error.message 
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  try {
    // 1. Cari user berdasarkan email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    const user = userResult.rows[0];

    // 2. Cocokkan password yang diinput dengan password di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    // 3. Buat JWT Token
    // Pastikan Anda sudah mengatur JWT_SECRET di Environment Variables Vercel
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'rahasia_default_jangan_dipakai_di_production', 
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Error saat Login:', error.message);
    return res.status(500).json({ 
      message: 'Gagal login ke server: ' + error.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    // req.user didapatkan dari middleware authenticateToken Anda
    const userId = req.user.id; 

    // Ambil data user tanpa menyertakan password
    const userResult = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: userResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error saat mengambil profil:', error.message);
    return res.status(500).json({ message: 'Gagal memuat profil: ' + error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile
};