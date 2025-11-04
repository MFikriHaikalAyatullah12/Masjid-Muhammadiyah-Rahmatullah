-- Setup Database Schema untuk Sistem Manajemen Zakat Masjid
-- Jalankan script ini di PostgreSQL Neon Console atau psql

-- Drop tables jika sudah ada (optional - hati-hati dengan data)
-- DROP TABLE IF EXISTS distribusi_zakat CASCADE;
-- DROP TABLE IF EXISTS pengeluaran CASCADE;
-- DROP TABLE IF EXISTS kas_harian CASCADE;
-- DROP TABLE IF EXISTS zakat_mal CASCADE;
-- DROP TABLE IF EXISTS zakat_fitrah CASCADE;
-- DROP TABLE IF EXISTS mustahiq CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Tabel Users untuk Admin
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk data mustahiq (penerima zakat)
CREATE TABLE IF NOT EXISTS mustahiq (
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
CREATE TABLE IF NOT EXISTS zakat_fitrah (
    id SERIAL PRIMARY KEY,
    nama_muzakki VARCHAR(100) NOT NULL,
    alamat_muzakki TEXT,
    no_telepon VARCHAR(15),
    jumlah_jiwa INTEGER NOT NULL DEFAULT 1,
    jenis_bayar VARCHAR(20) NOT NULL DEFAULT 'beras', -- beras, gandum, uang
    jumlah_bayar DECIMAL(10,2) NOT NULL,
    harga_per_kg DECIMAL(10,2) DEFAULT 0,
    total_rupiah DECIMAL(15,2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    tahun_hijriah VARCHAR(10) DEFAULT '1446',
    status VARCHAR(20) DEFAULT 'diterima',
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Zakat Mal
CREATE TABLE IF NOT EXISTS zakat_mal (
    id SERIAL PRIMARY KEY,
    nama_muzakki VARCHAR(100) NOT NULL,
    alamat_muzakki TEXT,
    no_telepon VARCHAR(15),
    jenis_harta VARCHAR(50) NOT NULL, -- emas, perak, uang, perdagangan
    nilai_harta DECIMAL(15,2) NOT NULL,
    nisab DECIMAL(15,2) NOT NULL,
    haul_terpenuhi BOOLEAN DEFAULT true,
    persentase_zakat DECIMAL(5,2) DEFAULT 2.5,
    jumlah_zakat DECIMAL(15,2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    tahun_hijriah VARCHAR(10) DEFAULT '1446',
    status VARCHAR(20) DEFAULT 'diterima',
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Kas Harian
CREATE TABLE IF NOT EXISTS kas_harian (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    jenis_transaksi VARCHAR(20) NOT NULL, -- masuk, keluar
    kategori VARCHAR(50) NOT NULL, -- infaq, sedekah, zakat_fitrah, zakat_mal, dll
    deskripsi TEXT NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    saldo_sebelum DECIMAL(15,2) NOT NULL DEFAULT 0,
    saldo_sesudah DECIMAL(15,2) NOT NULL DEFAULT 0,
    petugas VARCHAR(100) NOT NULL,
    bukti_transaksi VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Pengeluaran
CREATE TABLE IF NOT EXISTS pengeluaran (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    kategori VARCHAR(50) NOT NULL, -- distribusi_zakat, operasional, pembangunan, dll
    sub_kategori VARCHAR(100),
    deskripsi TEXT NOT NULL,
    penerima VARCHAR(100),
    jumlah DECIMAL(15,2) NOT NULL,
    metode_pembayaran VARCHAR(50) DEFAULT 'tunai',
    bukti_pembayaran VARCHAR(255),
    disetujui_oleh VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Distribusi Zakat
CREATE TABLE IF NOT EXISTS distribusi_zakat (
    id SERIAL PRIMARY KEY,
    mustahiq_id INTEGER REFERENCES mustahiq(id) ON DELETE CASCADE,
    tanggal_distribusi DATE NOT NULL,
    jenis_zakat VARCHAR(50) NOT NULL, -- fitrah, mal
    jumlah_distribusi DECIMAL(15,2) NOT NULL,
    keterangan TEXT,
    status VARCHAR(20) DEFAULT 'selesai',
    petugas VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Settings
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('harga_beras', '15000', 'Harga beras per kilogram dalam rupiah'),
('nisab_emas', '85', 'Nisab emas dalam gram'),
('nisab_uang', '85000000', 'Nisab uang dalam rupiah'),
('nama_masjid', 'Masjid Al-Hikmah', 'Nama masjid'),
('alamat_masjid', 'Jl. Contoh No. 123', 'Alamat masjid')
ON CONFLICT (key) DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@masjid.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_zakat_fitrah_tanggal ON zakat_fitrah(tanggal_bayar);
CREATE INDEX IF NOT EXISTS idx_zakat_mal_tanggal ON zakat_mal(tanggal_bayar);
CREATE INDEX IF NOT EXISTS idx_kas_harian_tanggal ON kas_harian(tanggal);
CREATE INDEX IF NOT EXISTS idx_pengeluaran_tanggal ON pengeluaran(tanggal);
CREATE INDEX IF NOT EXISTS idx_mustahiq_status ON mustahiq(status);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema berhasil dibuat!';
    RAISE NOTICE '📊 8 tabel utama sudah siap';
    RAISE NOTICE '🔑 Default admin user: admin@masjid.com / admin123';
    RAISE NOTICE '⚙️ Default settings sudah diload';
    RAISE NOTICE '🚀 Aplikasi siap untuk digunakan!';
END
$$;