import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari') || '2024-01-01';
    const sampai = searchParams.get('sampai') || new Date().toISOString().split('T')[0];

    const client = await pool.connect();

    try {
      // Zakat Fitrah
      const zakatFitrahQuery = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total_rupiah), 0) as total_uang
        FROM zakat_fitrah 
        WHERE tanggal_bayar BETWEEN $1 AND $2
      `;
      const zakatFitrahResult = await client.query(zakatFitrahQuery, [dari, sampai]);
      const zakatFitrah = zakatFitrahResult.rows[0];

      // Zakat Mal
      const zakatMalQuery = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(jumlah_zakat), 0) as total
        FROM zakat_mal 
        WHERE tanggal_bayar BETWEEN $1 AND $2
      `;
      const zakatMalResult = await client.query(zakatMalQuery, [dari, sampai]);
      const zakatMal = zakatMalResult.rows[0];

      // Kas Harian
      const kasQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' THEN jumlah ELSE 0 END), 0) as pemasukan,
          COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar' THEN jumlah ELSE 0 END), 0) as pengeluaran
        FROM kas_harian 
        WHERE tanggal BETWEEN $1 AND $2
      `;
      const kasResult = await client.query(kasQuery, [dari, sampai]);
      const kas = kasResult.rows[0];

      // Pengeluaran
      const pengeluaranQuery = `
        SELECT 
          COALESCE(SUM(jumlah), 0) as total_pengeluaran
        FROM pengeluaran 
        WHERE tanggal BETWEEN $1 AND $2
      `;
      const pengeluaranResult = await client.query(pengeluaranQuery, [dari, sampai]);
      const pengeluaran = pengeluaranResult.rows[0];

      // Distribusi Zakat
      let distribusi = { count: 0, total: 0 };
      try {
        const distribusiQuery = `
          SELECT 
            COUNT(DISTINCT mustahiq_id) as count,
            COALESCE(SUM(jumlah), 0) as total
          FROM distribusi_zakat 
          WHERE tanggal_distribusi BETWEEN $1 AND $2
        `;
        const distribusiResult = await client.query(distribusiQuery, [dari, sampai]);
        distribusi = distribusiResult.rows[0];
      } catch (error) {
        console.log('distribusi_zakat table query failed, using defaults:', error);
      }

      const response = {
        zakatFitrah: {
          total: parseFloat(zakatFitrah.total_uang) || 0,
          count: parseInt(zakatFitrah.count) || 0,
          beras: 0, // Simplified since we don't have separate beras tracking
          uang: parseFloat(zakatFitrah.total_uang) || 0
        },
        zakatMal: {
          total: parseFloat(zakatMal.total) || 0,
          count: parseInt(zakatMal.count) || 0
        },
        kasHarian: {
          pemasukan: parseFloat(kas.pemasukan) || 0,
          pengeluaran: parseFloat(kas.pengeluaran) || 0,
          saldo: (parseFloat(kas.pemasukan) || 0) - (parseFloat(kas.pengeluaran) || 0)
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