-- Database Schema untuk Sistem Manajemen Zakat Masjid

-- Tabel Users untuk Admin
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk data mustahiq (penerima zakat)
CREATE TABLE mustahiq (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    alamat TEXT,
    no_telepon VARCHAR(15),
    kategori VARCHAR(50) NOT NULL, -- fakir, miskin, amil, muallaf, riqab, gharim, fisabilillah, ibnu sabil
    status VARCHAR(20) DEFAULT 'aktif', -- aktif, non-aktif
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Zakat Fitrah
CREATE TABLE zakat_fitrah (
    id SERIAL PRIMARY KEY,
    nama_muzakki VARCHAR(100) NOT NULL,
    alamat_muzakki TEXT,
    no_telepon VARCHAR(15),
    jumlah_jiwa INTEGER NOT NULL,
    jenis_bayar VARCHAR(50) NOT NULL, -- beras, gandum, uang
    jumlah_bayar DECIMAL(15,2) NOT NULL, -- dalam kg atau rupiah
    harga_per_kg DECIMAL(15,2), -- untuk konversi ke uang jika bayar beras/gandum
    total_rupiah DECIMAL(15,2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    tahun_hijriah VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'diterima',
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Zakat Mal
CREATE TABLE zakat_mal (
    id SERIAL PRIMARY KEY,
    nama_muzakki VARCHAR(100) NOT NULL,
    alamat_muzakki TEXT,
    no_telepon VARCHAR(15),
    jenis_harta VARCHAR(50) NOT NULL, -- emas, perak, uang, perdagangan, pertanian, peternakan
    nilai_harta DECIMAL(15,2) NOT NULL,
    nisab DECIMAL(15,2) NOT NULL,
    haul_terpenuhi BOOLEAN DEFAULT false,
    persentase_zakat DECIMAL(5,2) DEFAULT 2.5, -- 2.5% untuk emas/perak/uang
    jumlah_zakat DECIMAL(15,2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    tahun_hijriah VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'diterima',
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Kas Harian
CREATE TABLE kas_harian (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    jenis_transaksi VARCHAR(20) NOT NULL, -- masuk, keluar
    kategori VARCHAR(50) NOT NULL, -- zakat_fitrah, zakat_mal, infaq, sedekah, operasional, dll
    deskripsi TEXT NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    saldo_sebelum DECIMAL(15,2) NOT NULL,
    saldo_sesudah DECIMAL(15,2) NOT NULL,
    petugas VARCHAR(100) NOT NULL,
    bukti_transaksi VARCHAR(255), -- path file bukti jika ada
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Pengeluaran
CREATE TABLE pengeluaran (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    kategori VARCHAR(50) NOT NULL, -- distribusi_zakat, operasional, program_masjid, dll
    sub_kategori VARCHAR(50), -- untuk klasifikasi lebih detail
    deskripsi TEXT NOT NULL,
    penerima VARCHAR(100), -- nama penerima jika ada
    jumlah DECIMAL(15,2) NOT NULL,
    metode_pembayaran VARCHAR(50) DEFAULT 'tunai', -- tunai, transfer, dll
    bukti_pembayaran VARCHAR(255), -- path file bukti
    disetujui_oleh VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, disetujui, ditolak, dibayar
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Distribusi Zakat
CREATE TABLE distribusi_zakat (
    id SERIAL PRIMARY KEY,
    mustahiq_id INTEGER REFERENCES mustahiq(id),
    tanggal_distribusi DATE NOT NULL,
    jenis_zakat VARCHAR(20) NOT NULL, -- fitrah, mal
    jumlah DECIMAL(15,2) NOT NULL,
    keterangan TEXT,
    petugas VARCHAR(100) NOT NULL,
    bukti_distribusi VARCHAR(255), -- path file bukti
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Settings dan Konfigurasi
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Donatur Bulanan
CREATE TABLE donatur_bulanan (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    alamat TEXT,
    no_telepon VARCHAR(15),
    email VARCHAR(100),
    jumlah_donasi DECIMAL(15,2) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'aktif', -- aktif, non-aktif, berhenti
    metode_pembayaran VARCHAR(50) DEFAULT 'transfer', -- transfer, tunai, auto-debit
    tanggal_pembayaran INTEGER DEFAULT 1, -- tanggal setiap bulan (1-31)
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Histori Pembayaran Donatur Bulanan
CREATE TABLE pembayaran_donatur (
    id SERIAL PRIMARY KEY,
    donatur_id INTEGER REFERENCES donatur_bulanan(id) ON DELETE CASCADE,
    tanggal_bayar DATE NOT NULL,
    bulan INTEGER NOT NULL, -- 1-12
    tahun INTEGER NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    metode_pembayaran VARCHAR(50),
    status VARCHAR(20) DEFAULT 'lunas', -- lunas, pending, terlambat
    bukti_pembayaran VARCHAR(255),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Tabungan Qurban
CREATE TABLE tabungan_qurban (
    id SERIAL PRIMARY KEY,
    nama_penabung VARCHAR(100) NOT NULL,
    alamat TEXT,
    no_telepon VARCHAR(15),
    email VARCHAR(100),
    jenis_hewan VARCHAR(50) NOT NULL, -- kambing, sapi, domba
    target_tabungan DECIMAL(15,2) NOT NULL,
    total_terkumpul DECIMAL(15,2) DEFAULT 0,
    sisa_kekurangan DECIMAL(15,2) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    target_qurban_tahun INTEGER NOT NULL, -- tahun hijriah target qurban
    status VARCHAR(20) DEFAULT 'menabung', -- menabung, terpenuhi, diambil, dibatalkan
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Cicilan Tabungan Qurban
CREATE TABLE cicilan_qurban (
    id SERIAL PRIMARY KEY,
    tabungan_id INTEGER REFERENCES tabungan_qurban(id) ON DELETE CASCADE,
    tanggal_bayar DATE NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    metode_pembayaran VARCHAR(50) DEFAULT 'tunai',
    bukti_pembayaran VARCHAR(255),
    petugas VARCHAR(100),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Pengambilan Hewan Qurban
CREATE TABLE pengambilan_qurban (
    id SERIAL PRIMARY KEY,
    tabungan_id INTEGER REFERENCES tabungan_qurban(id),
    tanggal_pengambilan DATE NOT NULL,
    jenis_hewan VARCHAR(50) NOT NULL,
    jumlah_hewan INTEGER DEFAULT 1,
    harga_hewan DECIMAL(15,2) NOT NULL,
    supplier VARCHAR(100),
    keterangan TEXT,
    petugas VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('nisab_emas', '85', 'Nisab emas dalam gram'),
('nisab_perak', '595', 'Nisab perak dalam gram'),
('harga_emas_per_gram', '1000000', 'Harga emas per gram dalam rupiah'),
('harga_perak_per_gram', '15000', 'Harga perak per gram dalam rupiah'),
('harga_beras_per_kg', '15000', 'Harga beras per kg untuk zakat fitrah'),
('harga_gandum_per_kg', '12000', 'Harga gandum per kg untuk zakat fitrah'),
('takaran_zakat_fitrah', '2.5', 'Takaran zakat fitrah dalam kg'),
('tahun_hijriah_aktif', '1446', 'Tahun hijriah yang sedang aktif'),
('nama_masjid', 'Masjid Al-Barokah', 'Nama masjid'),
('alamat_masjid', 'Jl. Raya No. 123', 'Alamat masjid');

-- Create indexes for better performance
CREATE INDEX idx_zakat_fitrah_tanggal ON zakat_fitrah(tanggal_bayar);
CREATE INDEX idx_zakat_mal_tanggal ON zakat_mal(tanggal_bayar);
CREATE INDEX idx_kas_harian_tanggal ON kas_harian(tanggal);
CREATE INDEX idx_pengeluaran_tanggal ON pengeluaran(tanggal);
CREATE INDEX idx_distribusi_tanggal ON distribusi_zakat(tanggal_distribusi);
CREATE INDEX idx_donatur_status ON donatur_bulanan(status);
CREATE INDEX idx_pembayaran_donatur_tanggal ON pembayaran_donatur(tanggal_bayar);
CREATE INDEX idx_tabungan_qurban_status ON tabungan_qurban(status);
CREATE INDEX idx_cicilan_qurban_tanggal ON cicilan_qurban(tanggal_bayar);

-- Create triggers untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mustahiq_updated_at BEFORE UPDATE ON mustahiq
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zakat_fitrah_updated_at BEFORE UPDATE ON zakat_fitrah
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zakat_mal_updated_at BEFORE UPDATE ON zakat_mal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kas_harian_updated_at BEFORE UPDATE ON kas_harian
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pengeluaran_updated_at BEFORE UPDATE ON pengeluaran
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distribusi_zakat_updated_at BEFORE UPDATE ON distribusi_zakat
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donatur_bulanan_updated_at BEFORE UPDATE ON donatur_bulanan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pembayaran_donatur_updated_at BEFORE UPDATE ON pembayaran_donatur
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tabungan_qurban_updated_at BEFORE UPDATE ON tabungan_qurban
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cicilan_qurban_updated_at BEFORE UPDATE ON cicilan_qurban
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pengambilan_qurban_updated_at BEFORE UPDATE ON pengambilan_qurban
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();