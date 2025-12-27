import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { getUserFromToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  const timeout = setTimeout(() => {
    throw new Error('Request timeout');
  }, 15000);

  try {
    const user = await getUserFromToken();
    if (!user) {
      clearTimeout(timeout);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari') || '2024-01-01';
    const sampai = searchParams.get('sampai') || new Date().toISOString().split('T')[0];

    const client = await pool.connect();
    client.query('SET statement_timeout = 10000'); // 10 second timeout

    try {
      // Jalankan semua query secara paralel untuk mempercepat response
      const [
        zakatFitrahResult,
        zakatMalResult,
        kasResult,
        saldoResult,
        pengeluaranResult,
        donaturResult,
        tabunganResult
      ] = await Promise.all([
        // Zakat Fitrah
        client.query(`
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(total_rupiah), 0) as total_uang,
            COALESCE(SUM(CASE WHEN jenis_bayar != 'uang' THEN jumlah_bayar ELSE 0 END), 0) as total_beras
          FROM zakat_fitrah 
          WHERE tanggal_bayar BETWEEN $1 AND $2 AND user_id = $3
        `, [dari, sampai, user.userId]),
        
        // Zakat Mal
        client.query(`
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(jumlah_zakat), 0) as total
          FROM zakat_mal 
          WHERE tanggal_bayar BETWEEN $1 AND $2 AND user_id = $3
        `, [dari, sampai, user.userId]),
        
        // Kas Harian
        client.query(`
          SELECT 
            COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' THEN jumlah ELSE 0 END), 0) as pemasukan,
            COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar' THEN jumlah ELSE 0 END), 0) as pengeluaran
          FROM kas_harian 
          WHERE tanggal BETWEEN $1 AND $2 AND user_id = $3
        `, [dari, sampai, user.userId]),
        
        // Saldo akhir
        client.query(`
          SELECT COALESCE(saldo_sesudah, 0) as saldo
          FROM kas_harian
          WHERE user_id = $1 AND tanggal <= $2
          ORDER BY tanggal DESC, created_at DESC
          LIMIT 1
        `, [user.userId, sampai]),
        
        // Pengeluaran
        client.query(`
          SELECT 
            COALESCE(SUM(jumlah), 0) as total_pengeluaran
          FROM pengeluaran 
          WHERE tanggal BETWEEN $1 AND $2 AND user_id = $3
        `, [dari, sampai, user.userId]),
        
        // Donatur Bulanan
        client.query(`
          SELECT 
            COUNT(DISTINCT pd.id) as count,
            COALESCE(SUM(pd.jumlah), 0) as total
          FROM pembayaran_donatur pd
          JOIN donatur_bulanan db ON pd.donatur_id = db.id
          WHERE pd.tanggal_bayar BETWEEN $1 AND $2 AND db.user_id = $3
        `, [dari, sampai, user.userId]),
        
        // Tabungan Qurban
        client.query(`
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(cq.jumlah), 0) as total_setor,
            0 as total_tarik
          FROM cicilan_qurban cq
          JOIN tabungan_qurban tq ON cq.tabungan_id = tq.id
          WHERE tq.user_id = $1 AND cq.tanggal_bayar BETWEEN $2 AND $3
        `, [user.userId, dari, sampai])
      ]);
      
      // Extract data dari result
      const zakatFitrah = zakatFitrahResult.rows[0];
      const zakatMal = zakatMalResult.rows[0];
      const kas = kasResult.rows[0];
      const saldoAkhir = saldoResult.rows.length > 0 ? parseFloat(saldoResult.rows[0].saldo) : 0;
      const pengeluaran = pengeluaranResult.rows[0];
      const donatur = donaturResult.rows[0];
      const tabungan = tabunganResult.rows[0];

      // Get distribusi data from pengeluaran table with status 'disetujui' and kategori 'distribusi zakat'
      let distribusi = { count: 0, total: 0 };
      try {
        const distribusiQuery = `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(jumlah), 0) as total
          FROM pengeluaran 
          WHERE tanggal BETWEEN $1 AND $2 
            AND user_id = $3
            AND LOWER(kategori) LIKE '%distribusi%zakat%'
            AND LOWER(status) = 'disetujui'
        `;
        const distribusiResult = await client.query(distribusiQuery, [dari, sampai, user.userId]);
        distribusi = distribusiResult.rows[0];
      } catch (error) {
        console.log('distribusi pengeluaran query failed, using defaults:', error);
      }

      const response = {
        zakatFitrah: {
          total: parseFloat(zakatFitrah.total_uang) || 0,
          count: parseInt(zakatFitrah.count) || 0,
          beras: parseFloat(zakatFitrah.total_beras) || 0,
          uang: parseFloat(zakatFitrah.total_uang) || 0
        },
        zakatMal: {
          total: parseFloat(zakatMal.total) || 0,
          count: parseInt(zakatMal.count) || 0
        },
        donaturBulanan: {
          total: parseFloat(donatur.total) || 0,
          count: parseInt(donatur.count) || 0
        },
        tabunganQurban: {
          totalSetor: parseFloat(tabungan.total_setor) || 0,
          totalTarik: parseFloat(tabungan.total_tarik) || 0,
          count: parseInt(tabungan.count) || 0
        },
        kasHarian: {
          pemasukan: parseFloat(kas.pemasukan) || 0,
          pengeluaran: parseFloat(kas.pengeluaran) || 0,
          saldo: saldoAkhir
        },
        pengeluaran: {
          total: parseFloat(pengeluaran.total_pengeluaran) || 0
        },
        distribusi: {
          total: parseFloat(String(distribusi.total)) || 0,
          count: parseInt(String(distribusi.count)) || 0
        }
      };

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300'
        }
      });
    } finally {
      clearTimeout(timeout);
      client.release();
    }
  } catch (error) {
    clearTimeout(timeout);
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}