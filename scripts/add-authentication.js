require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addAuthentication() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Adding authentication system...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'database', 'add-authentication.sql'),
      'utf8'
    );
    
    await client.query(sql);
    
    console.log('✅ Authentication system added successfully!');
    console.log('📋 Created:');
    console.log('   - users table');
    console.log('   - user_id columns in all tables');
    console.log('   - indexes for performance');
    
  } catch (error) {
    console.error('❌ Error adding authentication:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addAuthentication().catch(console.error);
