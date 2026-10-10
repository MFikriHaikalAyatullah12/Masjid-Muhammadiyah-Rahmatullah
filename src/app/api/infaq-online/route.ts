import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const status = request.nextUrl.searchParams.get('status') || 'pending';
    const allowed = ['pending', 'diterima', 'ditolak', 'semua'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }
    const where = status === 'semua' ? '' : 'WHERE status = $1';
    const params = status === 'semua' ? [] : [status];
    const { rows } = await pool.query(
      `SELECT id, nama, no_telepon, kategori, jenis, detail, tanggal, nominal, catatan, bukti_mime, bukti_size,
              status, kas_harian_id, ref_table, ref_id, diproses_at, created_at
       FROM infaq_online ${where}
       ORDER BY created_at DESC LIMIT 200`,
      params
    );
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS pending FROM infaq_online WHERE status = 'pending'`
    );
    return NextResponse.json({
      data: rows.map(r => ({ ...r, nominal: parseFloat(r.nominal) || 0 })),
      pendingCount: countRows[0].pending,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching infaq online:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
