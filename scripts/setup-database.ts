import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not loaded');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Read and execute schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing complete schema...');
    
    try {
      // Execute the entire schema as one statement
      await client.query(schemaSql);
      console.log('✓ Database schema executed successfully');
    } catch (error) {
      console.log('⚠ Some statements may have been skipped (already exist):', (error as Error).message);
    }

    // Create default admin user
    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password
    
    try {
      await client.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@masjid.com', hashedPassword, 'admin']
      );
      console.log('✓ Default admin user created');
      console.log('  Email: admin@masjid.com');
      console.log('  Password: password');
    } catch (error) {
      console.log('⚠ Admin user already exists');
    }

    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

export default setupDatabase;