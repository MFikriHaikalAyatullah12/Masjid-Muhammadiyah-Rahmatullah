const { Pool } = require('pg');
require('dotenv').config();

async function checkDistribusiZakatTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking distribusi_zakat table structure...');
    
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'distribusi_zakat' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 distribusi_zakat table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // Check if there's data in the table
    const countResult = await client.query('SELECT COUNT(*) as count FROM distribusi_zakat');
    console.log(`\n📊 Records in table: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDistribusiZakatTable();