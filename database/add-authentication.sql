-- Drop trigger jika sudah ada
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Buat tabel users untuk authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tambah kolom user_id ke semua tabel yang ada
ALTER TABLE zakat_fitrah ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE zakat_mal ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE mustahiq ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE pengeluaran ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE kas_harian ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE donatur_bulanan ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE tabungan_qurban ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Buat index untuk performa query
CREATE INDEX IF NOT EXISTS idx_zakat_fitrah_user ON zakat_fitrah(user_id);
CREATE INDEX IF NOT EXISTS idx_zakat_mal_user ON zakat_mal(user_id);
CREATE INDEX IF NOT EXISTS idx_mustahiq_user ON mustahiq(user_id);
CREATE INDEX IF NOT EXISTS idx_pengeluaran_user ON pengeluaran(user_id);
CREATE INDEX IF NOT EXISTS idx_kas_harian_user ON kas_harian(user_id);
CREATE INDEX IF NOT EXISTS idx_donatur_bulanan_user ON donatur_bulanan(user_id);
CREATE INDEX IF NOT EXISTS idx_tabungan_qurban_user ON tabungan_qurban(user_id);

-- Buat trigger untuk users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
