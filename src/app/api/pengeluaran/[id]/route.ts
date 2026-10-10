import { NextRequest, NextResponse } from 'next/server';
import { deletePengeluaran } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update status pengeluaran
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update status pengeluaran
      const result = await client.query(
        'UPDATE pengeluaran SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Pengeluaran not found' },
          { status: 404 }
        );
      }

      const pengeluaran = result.rows[0];

      // Jika status berubah menjadi 'disetujui', tambahkan ke kas_harian (sekali saja)
      const sudahDicatat = await client.query(
        `SELECT 1 FROM kas_harian WHERE bukti_transaksi = $1 LIMIT 1`,
        [`pengeluaran:${id}`]
      );
      if (status === 'disetujui' && sudahDicatat.rows.length === 0) {
        const saldoResult = await client.query(
          'SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 1',
          [user.userId]
        );
        
        const currentSaldo = saldoResult.rows.length ? parseFloat(saldoResult.rows[0].saldo_sesudah) || 0 : 0;
        const jumlahPengeluaran = parseFloat(pengeluaran.jumlah);
        const saldoBaru = currentSaldo - jumlahPengeluaran;

        // Insert ke kas_harian sebagai transaksi keluar
        await client.query(`
          INSERT INTO kas_harian (
            tanggal, 
            jenis_transaksi, 
            kategori, 
            deskripsi, 
            jumlah, 
            saldo_sebelum, 
            saldo_sesudah, 
            petugas,
            bukti_transaksi,
            user_id,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        `, [
          pengeluaran.tanggal,
          'keluar',
          pengeluaran.kategori,
          `${pengeluaran.deskripsi} - ${pengeluaran.penerima || 'Tidak disebutkan'}`,
          jumlahPengeluaran,
          currentSaldo,
          saldoBaru,
          pengeluaran.disetujui_oleh || user.nama || 'Admin',
          `pengeluaran:${id}`,
          user.userId
        ]);
      }

      await client.query('COMMIT');

      return NextResponse.json(
        { message: 'Pengeluaran status updated successfully', data: pengeluaran },
        { status: 200 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating pengeluaran status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication first
    const user = await requireAuth();
    
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const result = await deletePengeluaran(id, user.userId);
    
    if (result) {
      return NextResponse.json(
        { message: 'Pengeluaran deleted successfully' },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete pengeluaran or data not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting pengeluaran:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}