-- Fix Foreign Key Constraint untuk distribusi_zakat table
-- Script ini akan memperbaiki constraint agar support CASCADE DELETE

-- 1. Drop existing foreign key constraint jika ada
ALTER TABLE IF EXISTS distribusi_zakat 
DROP CONSTRAINT IF EXISTS distribusi_zakat_mustahiq_id_fkey;

-- 2. Add new foreign key constraint dengan ON DELETE CASCADE
ALTER TABLE distribusi_zakat 
ADD CONSTRAINT distribusi_zakat_mustahiq_id_fkey 
FOREIGN KEY (mustahiq_id) REFERENCES mustahiq(id) ON DELETE CASCADE;

-- 3. Verify constraint
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    LEFT JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
      AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'distribusi_zakat'
  AND kcu.column_name = 'mustahiq_id';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Foreign key constraint berhasil diperbaiki!';
    RAISE NOTICE '🔗 distribusi_zakat.mustahiq_id -> mustahiq.id (CASCADE)';
    RAISE NOTICE '🗑️ Sekarang bisa hapus mustahiq beserta distribusinya';
END
$$;