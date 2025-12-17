import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { getUserFromToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari') || '2024-01-01';
    const sampai = searchParams.get('sampai') || new Date().toISOString().split('T')[0];

    const client = await pool.connect();

    try {
      // Zakat Fitrah
      const zakatFitrahQuery = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total_rupiah), 0) as total_uang,
          COALESCE(SUM(CASE WHEN jenis_bayar != 'uang' THEN jumlah_bayar ELSE 0 END), 0) as total_beras
        FROM zakat_fitrah 
        WHERE tanggal_bayar BETWEEN $1 AND $2 AND user_id = $3
      `;
      const zakatFitrahResult = await client.query(zakatFitrahQuery, [dari, sampai, user.userId]);
      const zakatFitrah = zakatFitrahResult.rows[0];

      // Zakat Mal
      const zakatMalQuery = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(jumlah_zakat), 0) as total
        FROM zakat_mal 
        WHERE tanggal_bayar BETWEEN $1 AND $2 AND user_id = $3
      `;
      const zakatMalResult = await client.query(zakatMalQuery, [dari, sampai, user.userId]);
      const zakatMal = zakatMalResult.rows[0];

      // Kas Harian
      const kasQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' THEN jumlah ELSE 0 END), 0) as pemasukan,
          COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar' THEN jumlah ELSE 0 END), 0) as pengeluaran
        FROM kas_harian 
        WHERE tanggal BETWEEN $1 AND $2 AND user_id = $3
      `;
      const kasResult = await client.query(kasQuery, [dari, sampai, user.userId]);
      const kas = kasResult.rows[0];

      // Saldo akhir dari kas_harian
      const saldoQuery = `
        SELECT COALESCE(saldo_sesudah, 0) as saldo
        FROM kas_harian
        WHERE user_id = $1 AND tanggal <= $2
        ORDER BY tanggal DESC, created_at DESC
        LIMIT 1
      `;
      const saldoResult = await client.query(saldoQuery, [user.userId, sampai]);
      const saldoAkhir = saldoResult.rows.length > 0 ? parseFloat(saldoResult.rows[0].saldo) : 0;

      // Pengeluaran
      const pengeluaranQuery = `
        SELECT 
          COALESCE(SUM(jumlah), 0) as total_pengeluaran
        FROM pengeluaran 
        WHERE tanggal BETWEEN $1 AND $2 AND user_id = $3
      `;
      const pengeluaranResult = await client.query(pengeluaranQuery, [dari, sampai, user.userId]);
      const pengeluaran = pengeluaranResult.rows[0];

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

      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}