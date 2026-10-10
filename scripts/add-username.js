require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addUsername() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'add-username.sql'), 'utf8');
    await client.query(sql);
    const { rows } = await client.query('SELECT id, username, email, nama, role FROM users ORDER BY id');
    console.log('✅ Kolom username ditambahkan. Daftar akun:');
    console.table(rows);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

addUsername();
