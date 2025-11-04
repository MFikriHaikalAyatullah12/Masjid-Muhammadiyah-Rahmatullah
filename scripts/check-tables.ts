import dotenv from 'dotenv';
import { Client } from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check zakat_fitrah table structure
    console.log('\n=== ZAKAT_FITRAH TABLE STRUCTURE ===');
    const zakatFitrahResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'zakat_fitrah'
      ORDER BY ordinal_position
    `);
    
    if (zakatFitrahResult.rows.length === 0) {
      console.log('Table zakat_fitrah does not exist!');
    } else {
      zakatFitrahResult.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }

    // Check zakat_mal table structure
    console.log('\n=== ZAKAT_MAL TABLE STRUCTURE ===');
    const zakatMalResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'zakat_mal'
      ORDER BY ordinal_position
    `);
    
    if (zakatMalResult.rows.length === 0) {
      console.log('Table zakat_mal does not exist!');
    } else {
      zakatMalResult.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }

    // List all tables
    console.log('\n=== ALL TABLES IN DATABASE ===');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTables().catch(console.error);