-- Script untuk menambahkan kolom user_id ke tabungan_qurban jika belum ada
DO $$ 
BEGIN
    -- Check if user_id column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tabungan_qurban' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE tabungan_qurban ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_tabungan_qurban_user ON tabungan_qurban(user_id);
        
        -- Set default user_id = 1 for existing records if users table exists and has records
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
           AND EXISTS (SELECT 1 FROM users LIMIT 1) THEN
            UPDATE tabungan_qurban SET user_id = 1 WHERE user_id IS NULL;
        END IF;
    END IF;
    
    -- Also check and add user_id to cicilan_qurban if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cicilan_qurban' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE cicilan_qurban ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_cicilan_qurban_user ON cicilan_qurban(user_id);
        
        -- Set user_id from related tabungan_qurban
        UPDATE cicilan_qurban 
        SET user_id = tq.user_id 
        FROM tabungan_qurban tq 
        WHERE cicilan_qurban.tabungan_id = tq.id 
        AND cicilan_qurban.user_id IS NULL;
    END IF;
END $$;