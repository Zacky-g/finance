const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Ambil header Authorization: "Bearer <TOKEN>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan',
    });
  }

  try {
    // Verifikasi token JWT menggunakan secret key dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user (id & email) di object request
    next(); // Lanjut ke controller yang dilindungi
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluwarsa',
    });
  }
};

module.exports = authenticateToken;