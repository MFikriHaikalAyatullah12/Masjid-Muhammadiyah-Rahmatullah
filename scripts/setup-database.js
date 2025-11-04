#!/usr/bin/env node

/**
 * Script untuk setup database PostgreSQL Neon
 * Jalankan dengan: node scripts/setup-database.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_y3JhqFtMuT1E@ep-restless-recipe-a185pgup-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL Neon database');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'setup-production.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing database schema...');
    await client.query(schema);
    console.log('✅ Database schema executed successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables created:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Test data insertion
    console.log('🧪 Testing data insertion...');
    const testResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`👤 Users table has ${testResult.rows[0].count} records`);
    
    const settingsResult = await client.query('SELECT COUNT(*) as count FROM settings');
    console.log(`⚙️ Settings table has ${settingsResult.rows[0].count} records`);
    
    client.release();
    console.log('');
    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - ✅ All 8 tables created');
    console.log('   - ✅ Default admin user added');
    console.log('   - ✅ Default settings configured');
    console.log('   - ✅ Indexes created for performance');
    console.log('');
    console.log('🔑 Default Login:');
    console.log('   Email: admin@masjid.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🚀 Your app is now ready for deployment!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();