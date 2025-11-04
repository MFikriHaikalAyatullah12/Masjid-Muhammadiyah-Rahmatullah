import { z } from 'zod';

// Schema untuk User
export const UserSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().default('admin'),
});

// Interface untuk User dari database (dengan password_hash)
export interface UserFromDB {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

// Schema untuk Mustahiq
export const MustahiqSchema = z.object({
  id: z.number().optional(),
  nama: z.string().min(1).max(100),
  alamat: z.string().optional(),
  no_telepon: z.string().max(15).optional(),
  kategori: z.enum(['fakir', 'miskin', 'amil', 'muallaf', 'riqab', 'gharim', 'fisabilillah', 'ibnu_sabil']),
  status: z.enum(['aktif', 'non-aktif']).default('aktif'),
});

// Schema untuk Zakat Fitrah
export const ZakatFitrahSchema = z.object({
  id: z.number().optional(),
  nama_muzakki: z.string().min(1).max(100),
  alamat_muzakki: z.string().optional(),
  no_telepon: z.string().max(15).optional(),
  jumlah_jiwa: z.number().positive(),
  jenis_bayar: z.enum(['beras', 'gandum', 'uang']),
  jumlah_bayar: z.number().positive(),
  harga_per_kg: z.number().positive().optional(),
  total_rupiah: z.number().positive(),
  tanggal_bayar: z.string(),
  tahun_hijriah: z.string().max(10),
  status: z.enum(['diterima', 'pending', 'ditolak']).default('diterima'),
  keterangan: z.string().optional(),
});

// Schema untuk Zakat Mal
export const ZakatMalSchema = z.object({
  id: z.number().optional(),
  nama_muzakki: z.string().min(1).max(100),
  alamat_muzakki: z.string().optional(),
  no_telepon: z.string().max(15).optional(),
  jenis_harta: z.enum(['emas', 'perak', 'uang', 'perdagangan', 'pertanian', 'peternakan']),
  nilai_harta: z.number().positive(),
  nisab: z.number().positive(),
  haul_terpenuhi: z.boolean().default(false),
  persentase_zakat: z.number().default(2.5),
  jumlah_zakat: z.number().positive(),
  tanggal_bayar: z.string(),
  tahun_hijriah: z.string().max(10),
  status: z.enum(['diterima', 'pending', 'ditolak']).default('diterima'),
  keterangan: z.string().optional(),
});

// Schema untuk Kas Harian
export const KasHarianSchema = z.object({
  id: z.number().optional(),
  tanggal: z.string(),
  jenis_transaksi: z.enum(['masuk', 'keluar']),
  kategori: z.string().min(1).max(50),
  deskripsi: z.string().min(1),
  jumlah: z.number().positive(),
  saldo_sebelum: z.number(),
  saldo_sesudah: z.number(),
  petugas: z.string().min(1).max(100),
  bukti_transaksi: z.string().optional(),
});

// Schema untuk Pengeluaran
export const PengeluaranSchema = z.object({
  id: z.number().optional(),
  tanggal: z.string(),
  kategori: z.string().min(1).max(50),
  sub_kategori: z.string().max(50).optional(),
  deskripsi: z.string().min(1),
  penerima: z.string().max(100).optional(),
  jumlah: z.number().positive(),
  metode_pembayaran: z.string().default('tunai'),
  bukti_pembayaran: z.string().optional(),
  disetujui_oleh: z.string().max(100).optional(),
  status: z.enum(['pending', 'disetujui', 'ditolak', 'dibayar']).default('pending'),
  keterangan: z.string().optional(),
});

// Schema untuk Distribusi Zakat
export const DistribusiZakatSchema = z.object({
  id: z.number().optional(),
  mustahiq_id: z.number().positive(),
  tanggal_distribusi: z.string(),
  jenis_zakat: z.enum(['fitrah', 'mal']),
  jumlah: z.number().positive(),
  keterangan: z.string().optional(),
  petugas: z.string().min(1).max(100),
  bukti_distribusi: z.string().optional(),
});

// Types
export type User = z.infer<typeof UserSchema>;
export type Mustahiq = z.infer<typeof MustahiqSchema>;
export type ZakatFitrah = z.infer<typeof ZakatFitrahSchema>;
export type ZakatMal = z.infer<typeof ZakatMalSchema>;
export type KasHarian = z.infer<typeof KasHarianSchema>;
export type Pengeluaran = z.infer<typeof PengeluaranSchema>;
export type DistribusiZakat = z.infer<typeof DistribusiZakatSchema>;