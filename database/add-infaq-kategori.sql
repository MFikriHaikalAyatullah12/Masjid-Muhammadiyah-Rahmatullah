-- Kategori sumbangan online + tabel infaq untuk panel admin
-- Idempotent

ALTER TABLE infaq_online ADD COLUMN IF NOT EXISTS kategori VARCHAR(30) NOT NULL DEFAULT 'infaq';
ALTER TABLE infaq_online ADD COLUMN IF NOT EXISTS detail JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE infaq_online ADD COLUMN IF NOT EXISTS ref_table VARCHAR(40);
ALTER TABLE infaq_online ADD COLUMN IF NOT EXISTS ref_id INTEGER;
ALTER TABLE infaq_online ADD COLUMN IF NOT EXISTS catatan_admin TEXT;

CREATE INDEX IF NOT EXISTS idx_infaq_online_kategori ON infaq_online(kategori, status);

-- Riwayat infaq & sedekah (online yang disetujui + input manual admin)
CREATE TABLE IF NOT EXISTS infaq (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    no_telepon VARCHAR(20),
    jenis VARCHAR(20) NOT NULL DEFAULT 'infaq', -- infaq, sedekah
    tanggal DATE NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL CHECK (jumlah > 0),
    metode_pembayaran VARCHAR(30) NOT NULL DEFAULT 'tunai', -- tunai, transfer
    keterangan TEXT,
    sumber VARCHAR(20) NOT NULL DEFAULT 'manual', -- manual, online
    infaq_online_id INTEGER REFERENCES infaq_online(id) ON DELETE SET NULL,
    kas_harian_id INTEGER REFERENCES kas_harian(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_infaq_user_tanggal ON infaq(user_id, tanggal DESC);
