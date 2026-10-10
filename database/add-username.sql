-- Tambah kolom username untuk login tanpa email
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);

-- Isi username dari bagian sebelum '@' pada email untuk akun lama
UPDATE users
SET username = LOWER(split_part(email, '@', 1))
WHERE username IS NULL OR username = '';

ALTER TABLE users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (LOWER(username));

-- Email tidak lagi wajib
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
