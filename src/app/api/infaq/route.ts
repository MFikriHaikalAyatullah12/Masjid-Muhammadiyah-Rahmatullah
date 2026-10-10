import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const schema = z.object({
  nama: z.string().trim().min(2).max(100),
  no_telepon: z.string().trim().max(20).optional().or(z.literal('')),
  jenis: z.enum(['infaq', 'sedekah']),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jumlah: z.number().positive().max(1e12),
  metode_pembayaran: z.enum(['tunai', 'transfer']).default('tunai'),
  keterangan: z.string().trim().max(500).optional().or(z.literal('')),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const [list, stats] = await Promise.all([
      pool.query(
        `SELECT id, nama, no_telepon, jenis, tanggal, jumlah, metode_pembayaran, keterangan, sumber, kas_harian_id, created_at
         FROM infaq WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 300`,
        [user.userId]
      ),
      pool.query(
        `SELECT
           COALESCE(SUM(jumlah), 0) AS total,
           COALESCE(SUM(CASE WHEN date_trunc('month', tanggal) = date_trunc('month', CURRENT_DATE) THEN jumlah END), 0) AS bulan_ini,
           COALESCE(SUM(CASE WHEN jenis = 'infaq' THEN jumlah END), 0) AS total_infaq,
           COALESCE(SUM(CASE WHEN jenis = 'sedekah' THEN jumlah END), 0) AS total_sedekah,
           COUNT(*)::int AS jumlah_transaksi,
           COUNT(*) FILTER (WHERE sumber = 'online')::int AS dari_online
         FROM infaq WHERE user_id = $1`,
        [user.userId]
      ),
    ]);
    const s = stats.rows[0];
    return NextResponse.json({
      data: list.rows.map(r => ({ ...r, jumlah: parseFloat(r.jumlah) || 0 })),
      stats: {
        total: parseFloat(s.total) || 0,
        bulanIni: parseFloat(s.bulan_ini) || 0,
        totalInfaq: parseFloat(s.total_infaq) || 0,
        totalSedekah: parseFloat(s.total_sedekah) || 0,
        jumlahTransaksi: s.jumlah_transaksi,
        dariOnline: s.dari_online,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('Error fetching infaq:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Input manual admin (mis. infaq tunai di kotak amal)
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const user = await requireAuth();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data belum lengkap atau tidak valid' }, { status: 400 });
    }
    const d = parsed.data;
    await client.query('BEGIN');
    const saldoResult = await client.query(
      'SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 1',
      [user.userId]
    );
    const saldoSebelum = saldoResult.rows.length > 0 ? parseFloat(saldoResult.rows[0].saldo_sesudah) || 0 : 0;
    const kas = await client.query(
      `INSERT INTO kas_harian (tanggal, jenis_transaksi, kategori, deskripsi, jumlah, saldo_sebelum, saldo_sesudah, petugas, user_id, created_at, updated_at)
       VALUES ($1, 'masuk', $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
      [d.tanggal, d.jenis, `${d.jenis === 'sedekah' ? 'Sedekah' : 'Infaq'} dari ${d.nama}`, d.jumlah,
       saldoSebelum, saldoSebelum + d.jumlah, user.nama || 'Admin', user.userId]
    );
    const res = await client.query(
      `INSERT INTO infaq (nama, no_telepon, jenis, tanggal, jumlah, metode_pembayaran, keterangan, sumber, kas_harian_id, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'manual', $8, $9) RETURNING *`,
      [d.nama, d.no_telepon || null, d.jenis, d.tanggal, d.jumlah, d.metode_pembayaran, d.keterangan || null, kas.rows[0].id, user.userId]
    );
    await client.query('COMMIT');
    return NextResponse.json({ success: true, data: res.rows[0] }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('Error creating infaq:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
