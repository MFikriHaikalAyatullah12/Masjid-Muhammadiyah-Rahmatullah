import dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanAndSeed() {
  await client.connect();
  console.log('Cleaning and reseeding database...');
  
  try {
    await client.query('BEGIN');
    
    // Drop all tables and recreate them without foreign keys
    console.log('Dropping and recreating tables...');
    
    await client.query('DROP TABLE IF EXISTS distribusi CASCADE');
    await client.query('DROP TABLE IF EXISTS zakat_mal CASCADE');
    await client.query('DROP TABLE IF EXISTS zakat_fitrah CASCADE');
    await client.query('DROP TABLE IF EXISTS mustahik CASCADE');
    await client.query('DROP TABLE IF EXISTS muzakki CASCADE');
    
    // Create muzakki table
    await client.query(`
      CREATE TABLE muzakki (
        id TEXT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        alamat TEXT,
        no_telepon VARCHAR(15),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create mustahik table
    await client.query(`
      CREATE TABLE mustahik (
        id TEXT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        alamat TEXT,
        no_telepon VARCHAR(15),
        kategori VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create zakat_fitrah table (without foreign key)
    await client.query(`
      CREATE TABLE zakat_fitrah (
        id TEXT PRIMARY KEY,
        "muzakkiId" TEXT NOT NULL,
        "jumlahJiwa" INTEGER NOT NULL,
        jenis TEXT NOT NULL,
        jumlah DECIMAL(15,2) NOT NULL,
        tahun INTEGER NOT NULL,
        "tanggalBayar" DATE NOT NULL,
        keterangan TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create zakat_mal table (without foreign key)
    await client.query(`
      CREATE TABLE zakat_mal (
        id TEXT PRIMARY KEY,
        "muzakkiId" TEXT NOT NULL,
        "jenisHarta" TEXT NOT NULL,
        "jumlahHarta" DECIMAL(15,2) NOT NULL,
        nisab DECIMAL(15,2) NOT NULL,
        "jumlahZakat" DECIMAL(15,2) NOT NULL,
        "tanggalBayar" DATE NOT NULL,
        keterangan TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create distribusi table (without foreign key)
    await client.query(`
      CREATE TABLE distribusi (
        id TEXT PRIMARY KEY,
        "mustahikId" TEXT NOT NULL,
        "jenisZakat" TEXT NOT NULL,
        jenis TEXT NOT NULL,
        jumlah DECIMAL(15,2) NOT NULL,
        "tanggalDistribusi" DATE NOT NULL,
        petugas TEXT NOT NULL,
        keterangan TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Tables recreated successfully');
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    // Insert muzakki
    await client.query(`
      INSERT INTO muzakki (id, nama, alamat, no_telepon, email) VALUES 
      ('muz1', 'Ahmad Hidayat', 'Jl. Masjid No. 1', '081234567890', 'ahmad@email.com'),
      ('muz2', 'Fatimah Zahra', 'Jl. Pondok No. 2', '081234567891', 'fatimah@email.com'),
      ('muz3', 'Muhammad Yusuf', 'Jl. Pesantren No. 3', '081234567892', 'yusuf@email.com')
    `);
    
    // Insert mustahik
    await client.query(`
      INSERT INTO mustahik (id, nama, alamat, no_telepon, kategori, status) VALUES 
      ('mus1', 'Siti Aminah', 'Jl. Fakir No. 1', '081234567893', 'fakir', 'aktif'),
      ('mus2', 'Abdullah Rahman', 'Jl. Miskin No. 2', '081234567894', 'miskin', 'aktif'),
      ('mus3', 'Khadijah Binti Ali', 'Jl. Fisabilillah No. 3', '081234567895', 'fisabilillah', 'aktif')
    `);
    
    // Insert zakat_fitrah
    await client.query(`
      INSERT INTO zakat_fitrah (id, "muzakkiId", "jumlahJiwa", jenis, jumlah, tahun, "tanggalBayar", keterangan) VALUES 
      ('zf1', 'Ahmad Hidayat', 4, 'uang', 120000, 2025, '2025-03-20', 'Zakat fitrah keluarga Ahmad'),
      ('zf2', 'Fatimah Zahra', 2, 'beras', 50000, 2025, '2025-03-21', 'Zakat fitrah keluarga Fatimah'),
      ('zf3', 'Muhammad Yusuf', 6, 'uang', 180000, 2025, '2025-03-22', 'Zakat fitrah keluarga Yusuf')
    `);
    
    // Insert zakat_mal
    await client.query(`
      INSERT INTO zakat_mal (id, "muzakkiId", "jenisHarta", "jumlahHarta", nisab, "jumlahZakat", "tanggalBayar", keterangan) VALUES 
      ('zm1', 'Ahmad Hidayat', 'emas', 100000000, 85000000, 2500000, '2025-03-20', 'Zakat emas Ahmad'),
      ('zm2', 'Fatimah Zahra', 'uang', 50000000, 85000000, 1250000, '2025-03-21', 'Zakat uang simpanan Fatimah'),
      ('zm3', 'Muhammad Yusuf', 'perdagangan', 200000000, 85000000, 5000000, '2025-03-22', 'Zakat perdagangan Yusuf')
    `);
    
    // Update kas_harian with current saldo
    await client.query(`
      UPDATE kas_harian SET saldo_sesudah = 8850000 
      WHERE id = (SELECT id FROM kas_harian ORDER BY tanggal DESC, created_at DESC LIMIT 1)
    `);
    
    if (await client.query('SELECT COUNT(*) as count FROM kas_harian').then(r => r.rows[0].count) == 0) {
      await client.query(`
        INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas) VALUES 
        ('2025-03-20', 'masuk', 'zakat_fitrah', 'Zakat fitrah Ahmad Hidayat', 120000, 0, 120000, 'Admin'),
        ('2025-03-20', 'masuk', 'zakat_mal', 'Zakat emas Ahmad Hidayat', 2500000, 120000, 2620000, 'Admin'),
        ('2025-03-21', 'masuk', 'zakat_fitrah', 'Zakat fitrah Fatimah Zahra', 50000, 2620000, 2670000, 'Admin'),
        ('2025-03-21', 'masuk', 'zakat_mal', 'Zakat uang Fatimah Zahra', 1250000, 2670000, 3920000, 'Admin'),
        ('2025-03-22', 'masuk', 'zakat_fitrah', 'Zakat fitrah Muhammad Yusuf', 180000, 3920000, 4100000, 'Admin'),
        ('2025-03-22', 'masuk', 'zakat_mal', 'Zakat perdagangan Muhammad Yusuf', 5000000, 4100000, 9100000, 'Admin')
      `);
    }
    
    await client.query('COMMIT');
    console.log('✓ Database cleaned and seeded successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

cleanAndSeed().catch(console.error);