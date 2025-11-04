const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function debugKasHarian() {
  try {
    console.log('=== DEBUGGING KAS HARIAN & PENGELUARAN ===\n');
    
    // 1. Check kas_harian table
    console.log('1. Data di tabel kas_harian:');
    const kasResult = await pool.query('SELECT * FROM kas_harian ORDER BY tanggal DESC, created_at DESC');
    console.log(`Total records: ${kasResult.rows.length}`);
    kasResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. [${row.tanggal}] ${row.jenis_transaksi} - ${row.kategori}: ${row.deskripsi} = Rp ${row.jumlah}`);
    });
    
    console.log('\n2. Data pengeluaran yang disetujui:');
    const pengeluaranResult = await pool.query("SELECT * FROM pengeluaran WHERE status = 'disetujui' ORDER BY tanggal DESC");
    console.log(`Total pengeluaran disetujui: ${pengeluaranResult.rows.length}`);
    pengeluaranResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. [${row.tanggal}] ${row.kategori}: ${row.deskripsi} = Rp ${row.jumlah} (${row.status})`);
    });
    
    console.log('\n3. Summary kas_harian berdasarkan jenis transaksi:');
    const summaryResult = await pool.query(`
      SELECT 
        jenis_transaksi,
        COUNT(*) as count,
        SUM(jumlah) as total
      FROM kas_harian 
      GROUP BY jenis_transaksi
      ORDER BY jenis_transaksi
    `);
    summaryResult.rows.forEach(row => {
      console.log(`${row.jenis_transaksi}: ${row.count} transaksi, total Rp ${row.total}`);
    });
    
    console.log('\n4. Current saldo calculation:');
    const saldoResult = await pool.query('SELECT saldo_sesudah FROM kas_harian ORDER BY tanggal DESC, created_at DESC LIMIT 1');
    const currentSaldo = saldoResult.rows.length > 0 ? parseFloat(saldoResult.rows[0].saldo_sesudah) : 0;
    console.log(`Current saldo: Rp ${currentSaldo}`);
    
    console.log('\n5. Check if pengeluaran exist in kas_harian:');
    const matchResult = await pool.query(`
      SELECT 
        p.id as pengeluaran_id,
        p.deskripsi as pengeluaran_desc,
        p.jumlah as pengeluaran_amount,
        kh.id as kas_id,
        kh.deskripsi as kas_desc,
        kh.jumlah as kas_amount
      FROM pengeluaran p
      LEFT JOIN kas_harian kh ON (
        kh.deskripsi LIKE '%' || p.deskripsi || '%' 
        AND kh.jenis_transaksi = 'keluar' 
        AND kh.jumlah = p.jumlah
      )
      WHERE p.status = 'disetujui'
      ORDER BY p.tanggal DESC
    `);
    
    matchResult.rows.forEach(row => {
      const status = row.kas_id ? 'FOUND in kas_harian' : 'NOT FOUND in kas_harian';
      console.log(`Pengeluaran ID ${row.pengeluaran_id}: ${row.pengeluaran_desc} (Rp ${row.pengeluaran_amount}) - ${status}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

debugKasHarian();