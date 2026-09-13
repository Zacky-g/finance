const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 1. REGISTER USER
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Periksa apakah email sudah terdaftar
    const userExist = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar, silakan gunakan email lain',
      });
    }

    // Hashing password dengan Bcrypt (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Simpan user baru ke database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email.toLowerCase(), passwordHash]
    );

    const createdUser = newUser.rows[0];

    // Response sukses (Jangan pernah sertakan password_hash dalam response)
    res.status(201).json({
      success: true,
      message: 'Registrasi akun berhasil',
      data: {
        user: createdUser,
      },
    });
  } catch (error) {
    console.error('Error Register:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi',
    });
  }
};

// 2. LOGIN USER
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    const user = result.rows[0];

    // Verifikasi password hashing
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    // Buat JWT Token (Berlaku 1 Hari / 24 Hours)
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('Error Login:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login',
    });
  }
};

// 3. GET CURRENT USER PROFILE (Protected Route)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Error Get Profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil pengguna',
    });
  }
};

module.exports = { register, login, getProfile };