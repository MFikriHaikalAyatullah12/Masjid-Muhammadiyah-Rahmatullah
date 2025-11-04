import dotenv from 'dotenv';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Drop all tables first
    console.log('Dropping all tables...');
    await client.query('DROP TABLE IF EXISTS distribusi_zakat CASCADE');
    await client.query('DROP TABLE IF EXISTS settings CASCADE');
    await client.query('DROP TABLE IF EXISTS pengeluaran CASCADE');
    await client.query('DROP TABLE IF EXISTS kas_harian CASCADE');
    await client.query('DROP TABLE IF EXISTS zakat_mal CASCADE');
    await client.query('DROP TABLE IF EXISTS zakat_fitrah CASCADE');
    await client.query('DROP TABLE IF EXISTS mustahiq CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');

    // Read and execute schema
    console.log('Creating tables from schema...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);

    // Insert sample data
    console.log('Inserting sample data...');
    
    // Sample users
    await client.query(`
      INSERT INTO users (username, email, password_hash) VALUES 
      ('admin', 'admin@masjid.com', '$2a$10$dummy.hash.for.testing.purposes')
    `);

    // Sample mustahiq
    await client.query(`
      INSERT INTO mustahiq (nama, alamat, no_telepon, kategori, status) VALUES 
      ('Ahmad Fakir', 'Jl. Merdeka No. 1', '081234567890', 'fakir', 'aktif'),
      ('Siti Miskin', 'Jl. Kemerdekaan No. 2', '081234567891', 'miskin', 'aktif'),
      ('Budi Gharim', 'Jl. Proklamasi No. 3', '081234567892', 'gharim', 'aktif')
    `);

    // Sample zakat fitrah
    await client.query(`
      INSERT INTO zakat_fitrah (nama_muzakki, alamat_muzakki, no_telepon, jumlah_jiwa, jenis_bayar, jumlah_bayar, harga_per_kg, total_rupiah, tanggal_bayar, tahun_hijriah, keterangan) VALUES 
      ('Ahmad Hidayat', 'Jl. Sudirman No. 1', '081234567890', 4, 'uang', 10, 15000, 600000, '2025-03-20', '1446', 'Zakat fitrah keluarga Ahmad'),
      ('Siti Nurhaliza', 'Jl. Thamrin No. 2', '081234567891', 3, 'beras', 7.5, 15000, 112500, '2025-03-21', '1446', 'Zakat fitrah keluarga Siti')
    `);

    // Sample zakat mal
    await client.query(`
      INSERT INTO zakat_mal (nama_muzakki, alamat_muzakki, no_telepon, jenis_harta, nilai_harta, nisab, jumlah_zakat, tanggal_bayar, tahun_hijriah, keterangan) VALUES 
      ('Budi Santoso', 'Jl. Gatot Subroto No. 3', '081234567892', 'emas', 100000000, 85000000, 2500000, '2025-03-22', '1446', 'Zakat emas 100 gram'),
      ('Dewi Lestari', 'Jl. Rasuna Said No. 4', '081234567893', 'uang', 50000000, 42000000, 1250000, '2025-03-23', '1446', 'Zakat tabungan')
    `);

    // Sample kas harian with proper saldo calculation
    let saldo = 0;
    const kasData = [
      { tanggal: '2025-01-01', jenis: 'masuk', kategori: 'zakat_fitrah', deskripsi: 'Zakat fitrah Ahmad', jumlah: 600000, petugas: 'Admin' },
      { tanggal: '2025-01-02', jenis: 'masuk', kategori: 'zakat_mal', deskripsi: 'Zakat mal Budi', jumlah: 2500000, petugas: 'Admin' },
      { tanggal: '2025-01-03', jenis: 'keluar', kategori: 'distribusi_zakat', deskripsi: 'Distribusi untuk fakir miskin', jumlah: 1000000, petugas: 'Admin' }
    ];

    for (const kas of kasData) {
      const saldoSebelum = saldo;
      saldo = kas.jenis === 'masuk' ? saldo + kas.jumlah : saldo - kas.jumlah;
      
      await client.query(`
        INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [kas.tanggal, kas.jenis, kas.kategori, kas.deskripsi, kas.jumlah, saldoSebelum, saldo, kas.petugas]);
    }

    // Sample pengeluaran
    await client.query(`
      INSERT INTO pengeluaran (tanggal, kategori, sub_kategori, deskripsi, penerima, jumlah, metode_pembayaran, disetujui_oleh, status, keterangan) VALUES 
      ('2025-01-01', 'distribusi_zakat', 'fakir', 'Bantuan untuk keluarga fakir', 'Ahmad Fakir', 500000, 'tunai', 'Admin', 'disetujui', 'Distribusi rutin'),
      ('2025-01-02', 'operasional', 'listrik', 'Bayar listrik masjid', 'PLN', 300000, 'transfer', 'Admin', 'disetujui', 'Pembayaran bulanan')
    `);

    // Sample distribusi zakat
    await client.query(`
      INSERT INTO distribusi_zakat (mustahiq_id, tanggal_distribusi, jenis_zakat, jumlah, keterangan, petugas) VALUES 
      (1, '2025-01-01', 'fitrah', 300000, 'Distribusi zakat fitrah', 'Admin'),
      (2, '2025-01-02', 'mal', 500000, 'Distribusi zakat mal', 'Admin')
    `);

    console.log('✓ Database fixed and seeded successfully!');
    await client.end();
  } catch (error) {
    console.error('Error fixing database:', (error as Error).message);
    await client.end();
    process.exit(1);
  }
}

fixDatabase();