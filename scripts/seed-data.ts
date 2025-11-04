import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedData() {
  await client.connect();
  console.log('Connected to database');

  try {
    await client.query('BEGIN');

    // Insert sample zakat fitrah data
    console.log('Inserting sample zakat fitrah...');
    await client.query(`
      INSERT INTO zakat_fitrah (id, "muzakkiId", "jumlahJiwa", jenis, jumlah, tahun, "tanggalBayar", keterangan, "createdAt", "updatedAt") VALUES 
      ('zf1', 'Ahmad Hidayat', 4, 'uang', 120000, 2025, '2025-03-20', 'Zakat fitrah keluarga Ahmad', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('zf2', 'Fatimah Zahra', 2, 'beras', 50000, 2025, '2025-03-21', 'Zakat fitrah keluarga Fatimah', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('zf3', 'Muhammad Yusuf', 6, 'uang', 180000, 2025, '2025-03-22', 'Zakat fitrah keluarga Yusuf', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `);

    // Insert sample zakat mal data
    console.log('Inserting sample zakat mal...');
    await client.query(`
      INSERT INTO zakat_mal (id, "muzakkiId", "jenisHarta", "jumlahHarta", nisab, "jumlahZakat", "tanggalBayar", keterangan, "createdAt", "updatedAt") VALUES 
      ('zm1', 'Ahmad Hidayat', 'emas', 100000000, 85000000, 2500000, '2025-03-20', 'Zakat emas Ahmad', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('zm2', 'Fatimah Zahra', 'uang', 50000000, 85000000, 1250000, '2025-03-21', 'Zakat uang simpanan Fatimah', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('zm3', 'Muhammad Yusuf', 'perdagangan', 200000000, 85000000, 5000000, '2025-03-22', 'Zakat perdagangan Yusuf', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `);

    // Insert initial kas data
    console.log('Inserting initial kas harian...');
    await client.query(`
      INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas) VALUES 
      ('2025-03-20', 'masuk', 'zakat_fitrah', 'Zakat fitrah Ahmad Hidayat', 120000, 0, 120000, 'Admin'),
      ('2025-03-20', 'masuk', 'zakat_mal', 'Zakat emas Ahmad Hidayat', 2500000, 120000, 2620000, 'Admin'),
      ('2025-03-21', 'masuk', 'zakat_fitrah', 'Zakat fitrah Fatimah Zahra', 50000, 2620000, 2670000, 'Admin'),
      ('2025-03-21', 'masuk', 'zakat_mal', 'Zakat uang Fatimah Zahra', 1250000, 2670000, 3920000, 'Admin'),
      ('2025-03-22', 'masuk', 'zakat_fitrah', 'Zakat fitrah Muhammad Yusuf', 180000, 3920000, 4100000, 'Admin'),
      ('2025-03-22', 'masuk', 'zakat_mal', 'Zakat perdagangan Muhammad Yusuf', 5000000, 4100000, 9100000, 'Admin')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample pengeluaran data
    console.log('Inserting sample pengeluaran...');
    await client.query(`
      INSERT INTO pengeluaran (tanggal, kategori, sub_kategori, deskripsi, penerima, jumlah, metode_pembayaran, status, keterangan) VALUES 
      ('2025-03-23', 'operasional', 'listrik', 'Bayar listrik masjid', 'PLN', 500000, 'transfer', 'pending', 'Tagihan bulanan'),
      ('2025-03-24', 'sosial', 'santunan', 'Santunan anak yatim', 'Panti Asuhan Al-Ikhlas', 1000000, 'cash', 'pending', 'Santunan bulanan'),
      ('2025-03-25', 'dakwah', 'kajian', 'Honor ustadz kajian', 'Ustadz Abdullah', 300000, 'transfer', 'pending', 'Kajian mingguan')
      ON CONFLICT DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('✓ Sample data inserted successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting sample data:', error);
  } finally {
    await client.end();
  }
}

seedData().catch(console.error);