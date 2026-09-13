const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function runMigration() {
  try {
    // Membaca isi file database/schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Mengkonfigurasi tabel database...');

    // Jalankan perintah SQL ke PostgreSQL
    await db.query(sql);

    console.log(' Migration berhasil! Tabel users telah dibuat/diperbarui.');
    process.exit(0);
  } catch (error) {
    console.error(' Migration gagal:', error);
    process.exit(1);
  }
}

runMigration();