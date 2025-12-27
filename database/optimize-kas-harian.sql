-- Optimization Script untuk Kas Harian Performance
-- Jalankan script ini di database production untuk memperbaiki performa

-- 1. Tambahkan index untuk mempercepat query kas_harian
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kas_harian_user_id_tanggal_created 
ON kas_harian (user_id, tanggal DESC, created_at DESC);

-- 2. Index untuk current saldo query
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kas_harian_user_saldo 
ON kas_harian (user_id, tanggal DESC, created_at DESC, saldo_sesudah);

-- 3. Index untuk ID dengan user_id (untuk delete operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kas_harian_id_user 
ON kas_harian (id, user_id);

-- 4. Pastikan constraint foreign key untuk user_id ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_kas_harian_user_id'
        AND table_name = 'kas_harian'
    ) THEN
        ALTER TABLE kas_harian 
        ADD CONSTRAINT fk_kas_harian_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Update existing records yang mungkin tidak memiliki user_id (jika ada)
-- Hati-hati: ini akan mengassign semua records tanpa user_id ke user pertama
-- UPDATE kas_harian 
-- SET user_id = (SELECT MIN(id) FROM users LIMIT 1) 
-- WHERE user_id IS NULL;

-- 6. Analyze table untuk update statistics
ANALYZE kas_harian;

-- 7. Vacuum untuk membersihkan dead rows (opsional, bisa lama di production)
-- VACUUM ANALYZE kas_harian;

-- Optional: Check existing indexes
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'kas_harian';