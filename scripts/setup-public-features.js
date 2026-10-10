const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const SQL_FILES = ['add-public-features.sql', 'add-infaq-kategori.sql'];

async function main() {
  const client = await pool.connect();
  try {
    for (const file of SQL_FILES) {
      const sql = fs.readFileSync(path.join(__dirname, '../database', file), 'utf8');
      await client.query(sql);
      console.log(`✓ ${file}`);
    }
    const { rows } = await client.query('SELECT key FROM settings ORDER BY key');
    console.log('✅ Fitur laman publik siap. Settings:', rows.map(r => r.key).join(', '));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌ Gagal:', err.message);
  process.exit(1);
});
