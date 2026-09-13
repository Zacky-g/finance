require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Verifikasi koneksi ke DB sebelum mendengarkan port
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error(' Gagal terhubung ke database:', err.stack);
  } else {
    console.log(' Database Check OK. Server Time:', res.rows[0].now);
    
    app.listen(PORT, () => {
      console.log(` Server berjalan di http://localhost:${PORT}`);
    });
  }
});