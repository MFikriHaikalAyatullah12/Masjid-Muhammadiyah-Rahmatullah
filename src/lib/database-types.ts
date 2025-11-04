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