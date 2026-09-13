// Function helper sederhana untuk validasi register
const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Semua field (nama, email, password, konfirmasi password) wajib diisi',
    });
  }

  // Format Email Regex Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Format email tidak valid',
    });
  }

  // Minimum password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password minimal 6 karakter',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Password dan Konfirmasi Password tidak cocok',
    });
  }

  next(); // Lanjut ke Controller
};

// Function helper untuk validasi login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email dan password wajib diisi',
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };