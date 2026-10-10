-- Fitur laman publik: pengaturan website + infaq online
-- Idempotent: aman dijalankan berulang

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value, description) VALUES
('nama_masjid', 'Masjid Muhammadiyah Rahmatullah', 'Nama masjid yang tampil di laman publik'),
('tagline_masjid', 'Memakmurkan masjid, menebar rahmat bagi umat', 'Tagline singkat di beranda'),
('deskripsi_masjid', 'Masjid Muhammadiyah Rahmatullah adalah pusat ibadah dan kegiatan keumatan yang dikelola secara amanah dan transparan oleh panitia masjid.', 'Deskripsi masjid'),
('alamat_masjid', 'Jl. Contoh No. 123, Kelurahan Contoh, Kecamatan Contoh', 'Alamat lengkap masjid'),
('link_maps', '', 'Tautan Google Maps (opsional)'),
('kegiatan_rutin', '[{"nama":"Kajian Ahad Pagi","jadwal":"Setiap Ahad, 06.00 WIB","deskripsi":"Kajian rutin bersama ustadz pembina."},{"nama":"TPA Anak","jadwal":"Senin - Jumat, 16.00 WIB","deskripsi":"Taman Pendidikan Al-Quran untuk anak-anak."},{"nama":"Pengajian Ibu-Ibu","jadwal":"Setiap Jumat, 13.00 WIB","deskripsi":"Majelis taklim ibu-ibu jamaah masjid."}]', 'Daftar kegiatan rutin (JSON array)'),
('wa_admin', '6281234567890', 'Nomor WhatsApp admin (format 62xxx)'),
('nama_admin', 'Admin Masjid', 'Nama kontak admin'),
('rekening_infaq', 'BSI 1234567890 a.n. Masjid Muhammadiyah Rahmatullah', 'Rekening tujuan infaq & sedekah')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS infaq_online (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    no_telepon VARCHAR(20),
    jenis VARCHAR(20) NOT NULL DEFAULT 'infaq', -- infaq, sedekah
    tanggal DATE NOT NULL,
    nominal DECIMAL(15,2) NOT NULL CHECK (nominal > 0),
    catatan TEXT,
    bukti_mime VARCHAR(30) NOT NULL,
    bukti_base64 TEXT NOT NULL,
    bukti_size INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, diterima, ditolak
    kas_harian_id INTEGER REFERENCES kas_harian(id) ON DELETE SET NULL,
    diproses_oleh INTEGER REFERENCES users(id) ON DELETE SET NULL,
    diproses_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_infaq_online_status ON infaq_online(status, created_at DESC);
