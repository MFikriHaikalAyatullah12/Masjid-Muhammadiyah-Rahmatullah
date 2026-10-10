import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import pool from '@/lib/db';
import { KATEGORI_LIST, JENIS_HARTA, JENIS_HEWAN } from '@/lib/sumbangan';

// Batas setelah kompresi di browser (~300 KB biner => ~400 KB base64)
const MAX_BUKTI_BASE64 = 420_000;
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/;

const detailSchema = z.object({
  jenis: z.enum(['infaq', 'sedekah']).optional(),
  jumlah_jiwa: z.number().int().min(1).max(100).optional(),
  jenis_harta: z.enum(JENIS_HARTA).optional(),
  nilai_harta: z.number().nonnegative().max(1e12).optional(),
  bulan: z.number().int().min(1).max(12).optional(),
  tahun: z.number().int().min(2000).max(2100).optional(),
  jenis_hewan: z.enum(JENIS_HEWAN).optional(),
  target_tabungan: z.number().nonnegative().max(1e10).optional(),
});

const schema = z.object({
  nama: z.string().trim().min(2).max(100),
  no_telepon: z.string().trim().max(20).optional().or(z.literal('')),
  kategori: z.enum(KATEGORI_LIST as [string, ...string[]]).default('infaq'),
  jenis: z.enum(['infaq', 'sedekah']).default('infaq'),
  detail: detailSchema.default({}),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nominal: z.number().int().positive().max(1_000_000_000),
  catatan: z.string().trim().max(500).optional().or(z.literal('')),
  bukti: z.string().max(MAX_BUKTI_BASE64 + 40),
});

// Rate limit sederhana per IP (best-effort pada serverless)
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Terlalu banyak kiriman. Coba lagi beberapa menit lagi.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data belum lengkap atau tidak valid' }, { status: 400 });
  }
  const data = parsed.data;
  if (data.kategori === 'zakat_fitrah' && !data.detail.jumlah_jiwa) {
    return NextResponse.json({ error: 'Jumlah jiwa wajib diisi untuk zakat fitrah' }, { status: 400 });
  }
  if (data.kategori === 'zakat_mal' && !data.detail.jenis_harta) {
    return NextResponse.json({ error: 'Jenis harta wajib diisi untuk zakat mal' }, { status: 400 });
  }
  if (data.kategori === 'donatur_bulanan' && (!data.detail.bulan || !data.detail.tahun)) {
    return NextResponse.json({ error: 'Bulan dan tahun donasi wajib diisi' }, { status: 400 });
  }
  if (data.kategori === 'tabungan_qurban' && !data.detail.jenis_hewan) {
    return NextResponse.json({ error: 'Jenis hewan qurban wajib diisi' }, { status: 400 });
  }
  const detail = data.kategori === 'infaq' ? { jenis: data.jenis } : data.detail;

  const match = DATA_URL.exec(data.bukti);
  if (!match) {
    return NextResponse.json({ error: 'Bukti transfer harus berupa gambar JPG/PNG/WebP' }, { status: 400 });
  }
  const [, mime, base64] = match;
  if (base64.length > MAX_BUKTI_BASE64) {
    return NextResponse.json({ error: 'Ukuran bukti terlalu besar. Silakan pilih ulang gambar.' }, { status: 413 });
  }
  const size = Math.floor((base64.length * 3) / 4);

  try {
    const { rows } = await pool.query(
      `INSERT INTO infaq_online
         (nama, no_telepon, kategori, jenis, detail, tanggal, nominal, catatan, bukti_mime, bukti_base64, bukti_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, created_at`,
      [data.nama, data.no_telepon || null, data.kategori, data.jenis, JSON.stringify(detail), data.tanggal, data.nominal,
       data.catatan || null, mime, base64, size]
    );
    return NextResponse.json({ success: true, id: rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('Error saving infaq online:', error);
    return NextResponse.json({ error: 'Gagal menyimpan. Silakan coba lagi.' }, { status: 500 });
  }
}
