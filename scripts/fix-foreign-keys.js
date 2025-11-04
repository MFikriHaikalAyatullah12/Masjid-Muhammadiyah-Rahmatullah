const { Pool } = require('pg');
require('dotenv').config();

async function fixForeignKeys() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  
  try {
    console.log('🔧 Memperbaiki foreign key constraints...');
    
    // Drop existing constraint
    await client.query(`
      ALTER TABLE IF EXISTS distribusi_zakat 
      DROP CONSTRAINT IF EXISTS distribusi_zakat_mustahiq_id_fkey;
    `);
    
    console.log('✅ Old constraint dropped');
    
    // Add new constraint with CASCADE
    await client.query(`
      ALTER TABLE distribusi_zakat 
      ADD CONSTRAINT distribusi_zakat_mustahiq_id_fkey 
      FOREIGN KEY (mustahiq_id) REFERENCES mustahiq(id) ON DELETE CASCADE;
    `);
    
    console.log('✅ New CASCADE constraint added');
    
    // Verify the constraint
    const result = await client.query(`
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
    `);
    
    if (result.rows.length > 0) {
      const constraint = result.rows[0];
      console.log('✅ Constraint verified:');
      console.log(`   - Table: ${constraint.table_name}`);
      console.log(`   - Column: ${constraint.column_name}`);
      console.log(`   - References: ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      console.log(`   - Delete Rule: ${constraint.delete_rule}`);
    }
    
    console.log('🎉 Foreign key constraints berhasil diperbaiki!');
    console.log('🗑️ Sekarang bisa hapus mustahiq beserta distribusinya');
    
  } catch (error) {
    console.error('❌ Error fixing foreign keys:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  fixForeignKeys()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixForeignKeys };