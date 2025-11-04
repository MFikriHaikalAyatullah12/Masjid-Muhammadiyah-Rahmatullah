import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkKasHarian() {
  await client.connect();
  
  const result = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'kas_harian'
    ORDER BY ordinal_position
  `);
  
  console.log('KAS_HARIAN table columns:');
  result.rows.forEach(row => {
    console.log(`- ${row.column_name}: ${row.data_type}`);
  });
  
  await client.end();
}

checkKasHarian().catch(console.error);