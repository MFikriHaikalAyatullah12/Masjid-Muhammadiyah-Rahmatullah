import pool from '@/lib/db';

export interface KegiatanRutin {
  nama: string;
  jadwal: string;
  deskripsi: string;
}

export interface SiteSettings {
  nama_masjid: string;
  tagline_masjid: string;
  deskripsi_masjid: string;
  alamat_masjid: string;
  link_maps: string;
  kegiatan_rutin: KegiatanRutin[];
  wa_admin: string;
  nama_admin: string;
  rekening_infaq: string;
}

export const SETTING_KEYS = [
  'nama_masjid', 'tagline_masjid', 'deskripsi_masjid', 'alamat_masjid',
  'link_maps', 'kegiatan_rutin', 'wa_admin', 'nama_admin', 'rekening_infaq',
] as const;

const DEFAULTS: SiteSettings = {
  nama_masjid: 'Masjid Muhammadiyah Rahmatullah',
  tagline_masjid: '',
  deskripsi_masjid: '',
  alamat_masjid: '',
  link_maps: '',
  kegiatan_rutin: [],
  wa_admin: '',
  nama_admin: 'Admin Masjid',
  rekening_infaq: '',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { rows } = await pool.query('SELECT key, value FROM settings');
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    let kegiatan: KegiatanRutin[] = [];
    try {
      const parsed = JSON.parse(map.kegiatan_rutin || '[]');
      if (Array.isArray(parsed)) kegiatan = parsed;
    } catch { /* biarkan kosong jika JSON rusak */ }
    return {
      ...DEFAULTS,
      ...Object.fromEntries(
        SETTING_KEYS.filter(k => k !== 'kegiatan_rutin' && map[k] !== undefined).map(k => [k, map[k]])
      ),
      kegiatan_rutin: kegiatan,
    };
  } catch (error) {
    console.error('Error loading site settings:', error);
    return DEFAULTS;
  }
}

// Akun yang datanya dipublikasikan: diset saat admin menyimpan Pengaturan Website;
// fallback: akun yang terakhir mencatat kas, lalu akun pertama.
export async function getPrimaryAdminId(): Promise<number | null> {
  const setting = await pool.query(`SELECT value FROM settings WHERE key = 'akun_publik_user_id'`);
  const configured = parseInt(setting.rows[0]?.value || '', 10);
  if (configured) {
    const exists = await pool.query('SELECT id FROM users WHERE id = $1', [configured]);
    if (exists.rows.length) return configured;
  }
  const { rows } = await pool.query(
    `SELECT u.id FROM users u
     LEFT JOIN LATERAL (SELECT MAX(created_at) AS last_kas FROM kas_harian k WHERE k.user_id = u.id) k ON true
     ORDER BY CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END, k.last_kas DESC NULLS LAST, u.id LIMIT 1`
  );
  return rows[0]?.id ?? null;
}

export interface RingkasanKas {
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
  bulanIni: { masuk: number; keluar: number };
  terakhirDiperbarui: string | null;
}

export async function getRingkasanKas(): Promise<RingkasanKas> {
  const empty: RingkasanKas = {
    totalMasuk: 0, totalKeluar: 0, saldo: 0,
    bulanIni: { masuk: 0, keluar: 0 }, terakhirDiperbarui: null,
  };
  try {
    const adminId = await getPrimaryAdminId();
    if (!adminId) return empty;
    const { rows } = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' THEN jumlah END), 0) AS total_masuk,
         COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar' THEN jumlah END), 0) AS total_keluar,
         COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk'
           AND date_trunc('month', tanggal) = date_trunc('month', CURRENT_DATE) THEN jumlah END), 0) AS bulan_masuk,
         COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar'
           AND date_trunc('month', tanggal) = date_trunc('month', CURRENT_DATE) THEN jumlah END), 0) AS bulan_keluar,
         (SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1
            ORDER BY tanggal DESC, created_at DESC LIMIT 1) AS saldo,
         MAX(GREATEST(created_at, updated_at)) AS terakhir
       FROM kas_harian WHERE user_id = $1`,
      [adminId]
    );
    const r = rows[0];
    return {
      totalMasuk: parseFloat(r.total_masuk) || 0,
      totalKeluar: parseFloat(r.total_keluar) || 0,
      saldo: parseFloat(r.saldo) || 0,
      bulanIni: { masuk: parseFloat(r.bulan_masuk) || 0, keluar: parseFloat(r.bulan_keluar) || 0 },
      terakhirDiperbarui: r.terakhir ? new Date(r.terakhir).toISOString() : null,
    };
  } catch (error) {
    console.error('Error loading ringkasan kas:', error);
    return empty;
  }
}

export function normalizeWa(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  return digits;
}
