// Database column mapping for camelCase to snake_case
export interface ZakatFitrahDB {
  id: string;
  muzakkiId: string;
  jumlahJiwa: number;
  jenis: string;
  jumlah: number;
  tahun: number;
  tanggalBayar: Date;
  keterangan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZakatMalDB {
  id: string;
  muzakkiId: string;
  jenisHarta: string;
  jumlahHarta: number;
  nisab: number;
  jumlahZakat: number;
  tanggalBayar: Date;
  keterangan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistribusiDB {
  id: string;
  mustahikId: string;
  jenisZakat: string;
  jenis: string;
  jumlah: number;
  tanggalDistribusi: Date;
  petugas: string;
  keterangan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KasHarianDB {
  id: number;
  tanggal: Date;
  jenis_transaksi: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
  saldo_sebelum: number;
  saldo_sesudah: number;
  petugas: string;
  bukti_transaksi?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PengeluaranDB {
  id: number;
  tanggal: Date;
  kategori: string;
  sub_kategori?: string;
  deskripsi: string;
  penerima: string;
  jumlah: number;
  metode_pembayaran: string;
  bukti_pembayaran?: string;
  disetujui_oleh?: string;
  status: 'pending' | 'disetujui' | 'ditolak';
  keterangan?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DonaturBulananDB {
  id: number;
  nama: string;
  alamat?: string;
  no_telepon?: string;
  email?: string;
  jumlah_donasi: number;
  tanggal_mulai: Date;
  status: 'aktif' | 'non-aktif' | 'berhenti';
  metode_pembayaran: string;
  tanggal_pembayaran: number;
  keterangan?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PembayaranDonaturDB {
  id: number;
  donatur_id: number;
  tanggal_bayar: Date;
  bulan: number;
  tahun: number;
  jumlah: number;
  metode_pembayaran: string;
  status: 'lunas' | 'pending' | 'terlambat';
  bukti_pembayaran?: string;
  keterangan?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TabunganQurbanDB {
  id: number;
  nama_penabung: string;
  alamat?: string;
  no_telepon?: string;
  email?: string;
  jenis_hewan: string;
  target_tabungan: number;
  total_terkumpul: number;
  sisa_kekurangan: number;
  tanggal_mulai: Date;
  target_qurban_tahun: number;
  status: 'menabung' | 'terpenuhi' | 'diambil' | 'dibatalkan';
  keterangan?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CicilanQurbanDB {
  id: number;
  tabungan_id: number;
  tanggal_bayar: Date;
  jumlah: number;
  metode_pembayaran: string;
  bukti_pembayaran?: string;
  petugas: string;
  keterangan?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PengambilanQurbanDB {
  id: number;
  tabungan_id: number;
  tanggal_pengambilan: Date;
  jenis_hewan: string;
  jumlah_hewan: number;
  harga_hewan: number;
  supplier?: string;
  keterangan?: string;
  petugas: string;
  created_at: Date;
  updated_at: Date;
}