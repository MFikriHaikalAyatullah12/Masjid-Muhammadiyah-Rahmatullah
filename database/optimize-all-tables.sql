-- Additional optimization for other API endpoints
-- Tambahan indeks untuk semua tabel utama

-- Index untuk Zakat Fitrah
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zakat_fitrah_user_id_tanggal 
ON zakat_fitrah (user_id, tanggal_bayar DESC);

-- Index untuk Zakat Mal  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zakat_mal_user_id_tanggal 
ON zakat_mal (user_id, tanggal_bayar DESC);

-- Index untuk Pengeluaran
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pengeluaran_user_id_tanggal 
ON pengeluaran (user_id, tanggal DESC);

-- Index untuk Mustahiq
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mustahiq_user_id_status 
ON mustahiq (user_id, status);

-- Index untuk Donatur Bulanan
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donatur_bulanan_user_id_status 
ON donatur_bulanan (user_id, status);

-- Index untuk Tabungan Qurban
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tabungan_qurban_user_id_status 
ON tabungan_qurban (user_id, status);

-- Pastikan semua foreign key constraints ada
DO $$
BEGIN
    -- Zakat Fitrah
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_zakat_fitrah_user_id'
        AND table_name = 'zakat_fitrah'
    ) THEN
        ALTER TABLE zakat_fitrah 
        ADD CONSTRAINT fk_zakat_fitrah_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Zakat Mal
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_zakat_mal_user_id'
        AND table_name = 'zakat_mal'
    ) THEN
        ALTER TABLE zakat_mal 
        ADD CONSTRAINT fk_zakat_mal_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Pengeluaran
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pengeluaran_user_id'
        AND table_name = 'pengeluaran'
    ) THEN
        ALTER TABLE pengeluaran 
        ADD CONSTRAINT fk_pengeluaran_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Mustahiq
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_mustahiq_user_id'
        AND table_name = 'mustahiq'
    ) THEN
        ALTER TABLE mustahiq 
        ADD CONSTRAINT fk_mustahiq_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Donatur Bulanan
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_donatur_bulanan_user_id'
        AND table_name = 'donatur_bulanan'
    ) THEN
        ALTER TABLE donatur_bulanan 
        ADD CONSTRAINT fk_donatur_bulanan_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Tabungan Qurban
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_tabungan_qurban_user_id'
        AND table_name = 'tabungan_qurban'
    ) THEN
        ALTER TABLE tabungan_qurban 
        ADD CONSTRAINT fk_tabungan_qurban_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Analyze semua tabel untuk update statistics
ANALYZE zakat_fitrah;
ANALYZE zakat_mal;
ANALYZE pengeluaran;
ANALYZE mustahiq;
ANALYZE donatur_bulanan;
ANALYZE tabungan_qurban;