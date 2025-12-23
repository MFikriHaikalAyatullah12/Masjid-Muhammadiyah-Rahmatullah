import { Pool } from 'pg';

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false
  } : false,
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  statement_timeout: 60000,
  query_timeout: 60000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Enhanced retry settings
  application_name: 'masjid_app',
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

export default pool;