import dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  await client.connect();
  
  console.log('DISTRIBUSI table:');
  const distribusi = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'distribusi\' ORDER BY ordinal_position');
  distribusi.rows.forEach(row => console.log('- ' + row.column_name));
  
  console.log('\nPENGELUARAN table:');
  const pengeluaran = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'pengeluaran\' ORDER BY ordinal_position');
  pengeluaran.rows.forEach(row => console.log('- ' + row.column_name));
  
  await client.end();
}

checkTables().catch(console.error);