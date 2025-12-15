-- SQL Migration untuk menambahkan fitur Donatur Bulanan dan Tabungan Qurban
-- Jalankan file ini untuk menambahkan tabel baru ke database

-- Tabel untuk Donatur Bulanan
CREATE TABLE IF NOT EXISTS donatur_bulanan (
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
CREATE TABLE IF NOT EXISTS pembayaran_donatur (
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
CREATE TABLE IF NOT EXISTS tabungan_qurban (
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
CREATE TABLE IF NOT EXISTS cicilan_qurban (
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
CREATE TABLE IF NOT EXISTS pengambilan_qurban (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donatur_status ON donatur_bulanan(status);
CREATE INDEX IF NOT EXISTS idx_pembayaran_donatur_tanggal ON pembayaran_donatur(tanggal_bayar);
CREATE INDEX IF NOT EXISTS idx_pembayaran_donatur_donatur_id ON pembayaran_donatur(donatur_id);
CREATE INDEX IF NOT EXISTS idx_tabungan_qurban_status ON tabungan_qurban(status);
CREATE INDEX IF NOT EXISTS idx_tabungan_qurban_tahun ON tabungan_qurban(target_qurban_tahun);
CREATE INDEX IF NOT EXISTS idx_cicilan_qurban_tanggal ON cicilan_qurban(tanggal_bayar);
CREATE INDEX IF NOT EXISTS idx_cicilan_qurban_tabungan_id ON cicilan_qurban(tabungan_id);

-- Create triggers untuk update timestamp
CREATE TRIGGER IF NOT EXISTS update_donatur_bulanan_updated_at 
    BEFORE UPDATE ON donatur_bulanan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_pembayaran_donatur_updated_at 
    BEFORE UPDATE ON pembayaran_donatur
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_tabungan_qurban_updated_at 
    BEFORE UPDATE ON tabungan_qurban
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_cicilan_qurban_updated_at 
    BEFORE UPDATE ON cicilan_qurban
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_pengambilan_qurban_updated_at 
    BEFORE UPDATE ON pengambilan_qurban
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data untuk testing (optional)
-- Uncomment jika ingin menambahkan data contoh

/*
-- Sample Donatur Bulanan
INSERT INTO donatur_bulanan (nama, alamat, no_telepon, email, jumlah_donasi, tanggal_mulai, tanggal_pembayaran) VALUES
('Ahmad Ibrahim', 'Jl. Masjid No. 10', '081234567890', 'ahmad@email.com', 500000, '2025-01-01', 5),
('Fatimah Zahra', 'Jl. Surga No. 15', '081234567891', 'fatimah@email.com', 300000, '2025-01-01', 10),
('Muhammad Ali', 'Jl. Bahagia No. 20', '081234567892', 'ali@email.com', 1000000, '2025-01-15', 15);

-- Sample Tabungan Qurban
INSERT INTO tabungan_qurban (nama_penabung, no_telepon, jenis_hewan, target_tabungan, sisa_kekurangan, tanggal_mulai, target_qurban_tahun) VALUES
('Budi Santoso', '081234567893', 'kambing', 3000000, 3000000, '2025-01-01', 1446),
('Siti Aminah', '081234567894', 'sapi', 15000000, 15000000, '2025-01-10', 1446),
('Hasan Basri', '081234567895', 'domba', 2500000, 2500000, '2025-02-01', 1446);
*/

COMMENT ON TABLE donatur_bulanan IS 'Tabel untuk menyimpan data donatur yang menyumbang rutin setiap bulan';
COMMENT ON TABLE pembayaran_donatur IS 'Tabel untuk mencatat histori pembayaran dari donatur bulanan';
COMMENT ON TABLE tabungan_qurban IS 'Tabel untuk menyimpan data tabungan qurban dengan sistem cicilan';
COMMENT ON TABLE cicilan_qurban IS 'Tabel untuk mencatat setiap pembayaran cicilan tabungan qurban';
COMMENT ON TABLE pengambilan_qurban IS 'Tabel untuk mencatat pengambilan hewan qurban';
