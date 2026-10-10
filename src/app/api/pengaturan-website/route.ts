import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getSiteSettings, normalizeWa } from '@/lib/public-site';

const schema = z.object({
  nama_masjid: z.string().trim().min(3).max(120),
  tagline_masjid: z.string().trim().max(160),
  deskripsi_masjid: z.string().trim().max(3000),
  alamat_masjid: z.string().trim().max(500),
  link_maps: z.string().trim().max(500).refine(v => v === '' || /^https:\/\//.test(v), 'Tautan harus diawali https://'),
  kegiatan_rutin: z.array(z.object({
    nama: z.string().trim().min(1).max(120),
    jadwal: z.string().trim().max(120),
    deskripsi: z.string().trim().max(500),
  })).max(30),
  wa_admin: z.string().trim().max(20).refine(v => /^\d{9,15}$/.test(normalizeWa(v)), 'Nomor WhatsApp tidak valid'),
  nama_admin: z.string().trim().max(100),
  rekening_infaq: z.string().trim().max(300),
});

export async function GET() {
  try {
    await requireAuth();
    return NextResponse.json(await getSiteSettings(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const client = await pool.connect();
  try {
    const user = await requireAuth();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json({ error: `${first.path.join('.')}: ${first.message}` }, { status: 400 });
    }
    // Akun yang menyimpan pengaturan menjadi sumber kas di laman publik
    const data = { ...parsed.data, wa_admin: normalizeWa(parsed.data.wa_admin), akun_publik_user_id: String(user.userId) };

    await client.query('BEGIN');
    for (const [key, value] of Object.entries(data)) {
      const stored = key === 'kegiatan_rutin' ? JSON.stringify(value) : String(value);
      await client.query(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, stored]
      );
    }
    await client.query('COMMIT');
    return NextResponse.json({ success: true, data: await getSiteSettings() });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error saving site settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
