import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { confirm } = await request.json();
    
    if (confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json(
        { error: 'Konfirmasi tidak valid' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Delete all data from all tables in the correct order (respecting foreign keys)
      const deleteQueries = [
        'DELETE FROM kas_harian',
        'DELETE FROM zakat_fitrah', 
        'DELETE FROM zakat_mal',
        'DELETE FROM mustahiq',
        'DELETE FROM pengeluaran'
      ];

      for (const query of deleteQueries) {
        await client.query(query);
      }

      // Reset sequences (auto-increment counters)
      const resetSequences = [
        'ALTER SEQUENCE kas_harian_id_seq RESTART WITH 1',
        'ALTER SEQUENCE zakat_fitrah_id_seq RESTART WITH 1',
        'ALTER SEQUENCE zakat_mal_id_seq RESTART WITH 1', 
        'ALTER SEQUENCE mustahiq_id_seq RESTART WITH 1',
        'ALTER SEQUENCE pengeluaran_id_seq RESTART WITH 1'
      ];

      for (const query of resetSequences) {
        await client.query(query);
      }

      // Commit transaction
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Semua data berhasil dihapus dan database direset'
      });

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { error: 'Gagal mereset database' },
      { status: 500 }
    );
  }
}