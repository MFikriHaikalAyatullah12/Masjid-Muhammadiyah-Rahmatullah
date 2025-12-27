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

    const client = await pool.connect();

    try {
      // Check if user_id column exists first
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'tabungan_qurban' 
        AND column_name = 'user_id'
      `);
      
      const hasUserIdColumn = columnCheck.rows.length > 0;
      
      // Build queries conditionally based on whether user_id column exists
      const userFilter = hasUserIdColumn ? 'WHERE tq.user_id = $1' : '';
      const queryParams = hasUserIdColumn ? [user.userId] : [];

      // Detail tabungan qurban
      const tabunganQuery = `
        SELECT 
          tq.nama_penabung,
          tq.alamat,
          cq.jumlah as jumlah_setor,
          0 as jumlah_tarik,
          tq.total_terkumpul as saldo_akhir,
          cq.tanggal_bayar as tanggal_setor,
          cq.keterangan
        FROM cicilan_qurban cq
        JOIN tabungan_qurban tq ON cq.tabungan_id = tq.id
        ${userFilter}
        ORDER BY cq.tanggal_bayar DESC, tq.nama_penabung ASC
      `;
      const tabunganResult = await client.query(tabunganQuery, queryParams);
      
      // Summary statistics
      const summaryQuery = `
        SELECT 
          COUNT(DISTINCT tq.nama_penabung) as total_penabung,
          COUNT(cq.id) as total_transaksi,
          COALESCE(SUM(cq.jumlah), 0) as total_setor,
          0 as total_tarik,
          COALESCE(SUM(tq.total_terkumpul), 0) as total_saldo
        FROM cicilan_qurban cq
        JOIN tabungan_qurban tq ON cq.tabungan_id = tq.id
        ${userFilter}
      `;
      const summaryResult = await client.query(summaryQuery, queryParams);
      
      // Detail per penabung
      const penabungQuery = `
        SELECT 
          tq.nama_penabung,
          tq.alamat,
          COUNT(cq.id) as jumlah_transaksi,
          COALESCE(SUM(cq.jumlah), 0) as total_setor,
          0 as total_tarik,
          COALESCE(MAX(tq.total_terkumpul), 0) as saldo_terakhir,
          MIN(cq.tanggal_bayar) as tanggal_pertama,
          MAX(cq.tanggal_bayar) as tanggal_terakhir
        FROM cicilan_qurban cq
        JOIN tabungan_qurban tq ON cq.tabungan_id = tq.id
        ${userFilter}
        GROUP BY tq.nama_penabung, tq.alamat
        ORDER BY total_setor DESC, tq.nama_penabung ASC
      `;
      const penabungResult = await client.query(penabungQuery, queryParams);

      const response = {
        summary: {
          totalPenabung: parseInt(summaryResult.rows[0].total_penabung) || 0,
          totalTransaksi: parseInt(summaryResult.rows[0].total_transaksi) || 0,
          totalSetor: parseFloat(summaryResult.rows[0].total_setor) || 0,
          totalTarik: parseFloat(summaryResult.rows[0].total_tarik) || 0,
          totalSaldo: parseFloat(summaryResult.rows[0].total_saldo) || 0
        },
        detail: tabunganResult.rows.map(row => ({
          namaPenabung: row.nama_penabung,
          alamat: row.alamat,
          jumlahSetor: parseFloat(row.jumlah_setor) || 0,
          jumlahTarik: parseFloat(row.jumlah_tarik) || 0,
          saldoAkhir: parseFloat(row.saldo_akhir) || 0,
          tanggalSetor: row.tanggal_setor,
          keterangan: row.keterangan
        })),
        penabung: penabungResult.rows.map(row => ({
          namaPenabung: row.nama_penabung,
          alamat: row.alamat,
          jumlahTransaksi: parseInt(row.jumlah_transaksi) || 0,
          totalSetor: parseFloat(row.total_setor) || 0,
          totalTarik: parseFloat(row.total_tarik) || 0,
          saldoTerakhir: parseFloat(row.saldo_terakhir) || 0,
          tanggalPertama: row.tanggal_pertama,
          tanggalTerakhir: row.tanggal_terakhir
        }))
      };

      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching laporan tabungan qurban:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan tabungan qurban' },
      { status: 500 }
    );
  }
}