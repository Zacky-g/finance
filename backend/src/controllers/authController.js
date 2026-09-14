const bcrypt = require('bcrypt');
const pool = require('../config/db'); // Sesuaikan dengan path file database Anda

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

module.exports = { register };