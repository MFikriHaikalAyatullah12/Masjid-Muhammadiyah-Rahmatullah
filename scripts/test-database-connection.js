const { Pool } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📧 Environment:', process.env.NODE_ENV);
  
  // Create pool with extended timeout and retry options
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Extended timeout
    statement_timeout: 60000,
    query_timeout: 60000,
    // Add retry settings
    retryDelay: 5000,
    maxRetriesPerRequest: 3
  });

  let client;
  
  try {
    console.log('🔗 Attempting connection...');
    client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    console.log('🧪 Testing basic query...');
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Query successful:', {
      time: result.rows[0].current_time,
      database: result.rows[0].version.split(' ')[0]
    });
    
    // Test table existence
    console.log('📋 Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('✅ Tables found:', tablesResult.rows.map(row => row.table_name));
    
    // Test dashboard query
    console.log('📊 Testing dashboard query...');
    const zakatMalResult = await client.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(jumlah_zakat), 0) as total 
      FROM zakat_mal 
      WHERE EXTRACT(YEAR FROM tanggal_bayar) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    
    console.log('✅ Dashboard query successful:', {
      zakatMalCount: zakatMalResult.rows[0].count,
      zakatMalTotal: zakatMalResult.rows[0].total
    });
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 SOLUTIONS:');
      console.log('1. Check internet connection');
      console.log('2. Verify DNS settings');
      console.log('3. Try using different DNS (8.8.8.8, 1.1.1.1)');
      console.log('4. Check firewall/antivirus blocking');
      console.log('5. Try using VPN');
      console.log('6. Verify Neon database is still active');
    }
    
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnection };