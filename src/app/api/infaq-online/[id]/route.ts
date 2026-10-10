import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { applyApproval, ApprovalError } from '@/lib/sumbangan-approval';

type Params = { params: Promise<{ id: string }> };

// GET: bukti transfer (data URL) untuk pratinjau admin
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const { rows } = await pool.query(
      'SELECT bukti_mime, bukti_base64 FROM infaq_online WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ bukti: `data:${rows[0].bukti_mime};base64,${rows[0].bukti_base64}` }, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: { action: 'terima' | 'tolak' }
export async function PATCH(request: NextRequest, { params }: Params) {
  const client = await pool.connect();
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { action } = await request.json();
    if (action !== 'terima' && action !== 'tolak') {
      return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT * FROM infaq_online WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    }
    const infaq = rows[0];
    if (infaq.status !== 'pending') {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Kiriman ini sudah diproses' }, { status: 409 });
    }

    let kasId: number | null = null;
    let ref: { ref_table: string; ref_id: number } | null = null;
    if (action === 'terima') {
      const result = await applyApproval(client, { userId: user.userId, nama: user.nama }, infaq);
      kasId = result.kasId;
      ref = { ref_table: result.ref_table, ref_id: result.ref_id };
    }

    await client.query(
      `UPDATE infaq_online
         SET status = $1, kas_harian_id = $2, ref_table = $3, ref_id = $4, diproses_oleh = $5, diproses_at = NOW()
       WHERE id = $6`,
      [action === 'terima' ? 'diterima' : 'ditolak', kasId, ref?.ref_table || null, ref?.ref_id || null, user.userId, id]
    );
    await client.query('COMMIT');
    return NextResponse.json({ success: true, kas_harian_id: kasId, ...ref });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ApprovalError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error processing infaq online:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
