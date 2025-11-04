import dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixDB() {
  await client.connect();
  console.log('Removing foreign key constraints...');
  
  try {
    // Drop foreign key constraints
    await client.query('ALTER TABLE zakat_fitrah DROP CONSTRAINT IF EXISTS zakat_fitrah_muzakkiId_fkey');
    await client.query('ALTER TABLE zakat_mal DROP CONSTRAINT IF EXISTS zakat_mal_muzakkiId_fkey');
    await client.query('ALTER TABLE distribusi DROP CONSTRAINT IF EXISTS distribusi_mustahikId_fkey');
    
    console.log('✓ Foreign key constraints removed');
  } catch (error) {
    console.log('Warning:', (error as Error).message);
  }
  
  await client.end();
}

fixDB().catch(console.error);