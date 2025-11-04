import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2000ms
  statement_timeout: 60000,
  query_timeout: 60000,
  // Add connection retry settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

export default pool;