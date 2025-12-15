const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupNewFeatures() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Checking and creating tables for new features...\n');

    // Check if tables exist
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('donatur_bulanan', 'pembayaran_donatur', 'tabungan_qurban', 'cicilan_qurban', 'pengambilan_qurban')
    `);

    const existingTables = checkTables.rows.map(r => r.table_name);
    console.log('Existing tables:', existingTables);

    if (existingTables.length === 5) {
      console.log('✅ All new feature tables already exist!');
      return;
    }

    console.log('\n📦 Creating missing tables...\n');

    // Create donatur_bulanan table
    await client.query(`
      CREATE TABLE IF NOT EXISTS donatur_bulanan (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        alamat TEXT,
        no_telepon VARCHAR(15),
        email VARCHAR(100),
        jumlah_donasi DECIMAL(15,2) NOT NULL,
        tanggal_mulai DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'aktif',
        metode_pembayaran VARCHAR(50) DEFAULT 'transfer',
        tanggal_pembayaran INTEGER DEFAULT 1,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created table: donatur_bulanan');

    // Create pembayaran_donatur table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pembayaran_donatur (
        id SERIAL PRIMARY KEY,
        donatur_id INTEGER REFERENCES donatur_bulanan(id) ON DELETE CASCADE,
        tanggal_bayar DATE NOT NULL,
        bulan INTEGER NOT NULL,
        tahun INTEGER NOT NULL,
        jumlah DECIMAL(15,2) NOT NULL,
        metode_pembayaran VARCHAR(50),
        status VARCHAR(20) DEFAULT 'lunas',
        bukti_pembayaran VARCHAR(255),
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created table: pembayaran_donatur');

    // Create tabungan_qurban table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tabungan_qurban (
        id SERIAL PRIMARY KEY,
        nama_penabung VARCHAR(100) NOT NULL,
        alamat TEXT,
        no_telepon VARCHAR(15),
        email VARCHAR(100),
        jenis_hewan VARCHAR(50) NOT NULL,
        target_tabungan DECIMAL(15,2) NOT NULL,
        total_terkumpul DECIMAL(15,2) DEFAULT 0,
        sisa_kekurangan DECIMAL(15,2) NOT NULL,
        tanggal_mulai DATE NOT NULL,
        target_qurban_tahun INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'menabung',
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created table: tabungan_qurban');

    // Create cicilan_qurban table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cicilan_qurban (
        id SERIAL PRIMARY KEY,
        tabungan_id INTEGER REFERENCES tabungan_qurban(id) ON DELETE CASCADE,
        tanggal_bayar DATE NOT NULL,
        jumlah DECIMAL(15,2) NOT NULL,
        metode_pembayaran VARCHAR(50) DEFAULT 'tunai',
        bukti_pembayaran VARCHAR(255),
        petugas VARCHAR(100),
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created table: cicilan_qurban');

    // Create pengambilan_qurban table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pengambilan_qurban (
        id SERIAL PRIMARY KEY,
        tabungan_id INTEGER REFERENCES tabungan_qurban(id),
        tanggal_pengambilan DATE NOT NULL,
        jenis_hewan VARCHAR(50) NOT NULL,
        jumlah_hewan INTEGER DEFAULT 1,
        harga_hewan DECIMAL(15,2) NOT NULL,
        supplier VARCHAR(100),
        keterangan TEXT,
        petugas VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created table: pengambilan_qurban');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_donatur_status ON donatur_bulanan(status);
      CREATE INDEX IF NOT EXISTS idx_pembayaran_donatur_tanggal ON pembayaran_donatur(tanggal_bayar);
      CREATE INDEX IF NOT EXISTS idx_tabungan_qurban_status ON tabungan_qurban(status);
      CREATE INDEX IF NOT EXISTS idx_cicilan_qurban_tanggal ON cicilan_qurban(tanggal_bayar);
    `);
    console.log('✅ Created indexes');

    // Check if update_updated_at_column function exists
    const funcCheck = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'update_updated_at_column'
    `);

    if (funcCheck.rows.length === 0) {
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      console.log('✅ Created function: update_updated_at_column');
    }

    // Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_donatur_bulanan_updated_at ON donatur_bulanan;
      CREATE TRIGGER update_donatur_bulanan_updated_at 
        BEFORE UPDATE ON donatur_bulanan
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_pembayaran_donatur_updated_at ON pembayaran_donatur;
      CREATE TRIGGER update_pembayaran_donatur_updated_at 
        BEFORE UPDATE ON pembayaran_donatur
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_tabungan_qurban_updated_at ON tabungan_qurban;
      CREATE TRIGGER update_tabungan_qurban_updated_at 
        BEFORE UPDATE ON tabungan_qurban
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_cicilan_qurban_updated_at ON cicilan_qurban;
      CREATE TRIGGER update_cicilan_qurban_updated_at 
        BEFORE UPDATE ON cicilan_qurban
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_pengambilan_qurban_updated_at ON pengambilan_qurban;
      CREATE TRIGGER update_pengambilan_qurban_updated_at 
        BEFORE UPDATE ON pengambilan_qurban
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Created triggers');

    console.log('\n🎉 All tables and features created successfully!');
    console.log('\nYou can now use:');
    console.log('  📅 Donatur Bulanan: /donatur-bulanan');
    console.log('  🐑 Tabungan Qurban: /tabungan-qurban');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupNewFeatures().catch(console.error);
