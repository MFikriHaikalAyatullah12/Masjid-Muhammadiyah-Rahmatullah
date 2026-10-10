import { Pool } from 'pg';

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const isProduction = process.env.NODE_ENV === 'production';

function createPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: isProduction ? 25 : 5,
    // Neon's pooler drops idle connections server-side; holding a minimum pool
    // and long idle timeouts cause "Connection terminated unexpectedly".
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
    statement_timeout: 45000,
    query_timeout: 45000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    application_name: 'masjid_neon_optimized',
    allowExitOnIdle: true,
  });

  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
  });

  // Idle client errors (e.g. server closed the socket) are expected with
  // serverless Postgres; the pool discards the client and reconnects on demand.
  pool.on('error', (err) => {
    if (err.message?.includes('Connection terminated')) {
      console.warn('Idle database connection closed by server; will reconnect on next query');
      return;
    }
    console.error('Database connection error:', err);
  });

  return pool;
}

// Reuse the pool across Next.js hot reloads in development
const globalForPool = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPool.__pgPool ?? createPool();
if (!isProduction) {
  globalForPool.__pgPool = pool;
}

// Database warmup function for Neon
export async function warmupDatabase() {
  try {
    await pool.query('SELECT 1');
    console.log('Database warmed up successfully');
  } catch (error) {
    console.error('Database warmup failed:', error);
  }
}

// Auto warmup on module load
if (isProduction) {
  warmupDatabase();
}

export default pool;