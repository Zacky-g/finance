const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Mengizinkan SSL di Vercel/Supabase
  }
});

module.exports = pool;