// Kategori sumbangan online dan field tambahan per kategori (dipakai form publik, API, dan admin)

export const KATEGORI_SUMBANGAN = {
  infaq: { label: 'Infaq / Sedekah', kasKategori: 'infaq', deskripsi: 'Sumbangan umum untuk operasional dan kemakmuran masjid' },
  zakat_fitrah: { label: 'Zakat Fitrah', kasKategori: 'zakat_fitrah', deskripsi: 'Zakat jiwa menjelang Idul Fitri' },
  zakat_mal: { label: 'Zakat Mal', kasKategori: 'zakat_mal', deskripsi: 'Zakat harta (emas, uang, perdagangan, dll.)' },
  donatur_bulanan: { label: 'Donatur Bulanan', kasKategori: 'donasi_bulanan', deskripsi: 'Setoran rutin donatur tetap bulanan' },
  tabungan_qurban: { label: 'Tabungan Qurban', kasKategori: 'tabungan_qurban', deskripsi: 'Cicilan tabungan hewan qurban' },
} as const;

export type KategoriSumbangan = keyof typeof KATEGORI_SUMBANGAN;
export const KATEGORI_LIST = Object.keys(KATEGORI_SUMBANGAN) as KategoriSumbangan[];

export const JENIS_HARTA = ['emas', 'perak', 'uang', 'perdagangan', 'pertanian', 'peternakan', 'lainnya'] as const;
export const JENIS_HEWAN = ['kambing', 'domba', 'sapi'] as const;
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export interface DetailSumbangan {
  jenis?: 'infaq' | 'sedekah';
  jumlah_jiwa?: number;
  jenis_harta?: (typeof JENIS_HARTA)[number];
  nilai_harta?: number;
  bulan?: number;
  tahun?: number;
  jenis_hewan?: (typeof JENIS_HEWAN)[number];
  target_tabungan?: number;
}

export function ringkasDetail(kategori: string, d: DetailSumbangan): string {
  switch (kategori) {
    case 'infaq': return d.jenis === 'sedekah' ? 'Sedekah' : 'Infaq';
    case 'zakat_fitrah': return `${d.jumlah_jiwa || 1} jiwa`;
    case 'zakat_mal': return `Harta: ${d.jenis_harta || '-'}${d.nilai_harta ? ` (Rp ${Math.round(d.nilai_harta).toLocaleString('id-ID')})` : ''}`;
    case 'donatur_bulanan': return d.bulan && d.tahun ? `${NAMA_BULAN[d.bulan - 1]} ${d.tahun}` : 'Bulan tidak diisi';
    case 'tabungan_qurban': return `Hewan: ${d.jenis_hewan || '-'}${d.target_tabungan ? ` · target Rp ${Math.round(d.target_tabungan).toLocaleString('id-ID')}` : ''}`;
    default: return '';
  }
}
