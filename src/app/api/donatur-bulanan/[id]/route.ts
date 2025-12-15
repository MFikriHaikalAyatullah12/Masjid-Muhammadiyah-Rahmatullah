import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Ambil detail donatur bulanan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    
    const donaturResult = await pool.query(
      'SELECT * FROM donatur_bulanan WHERE id = $1 AND user_id = $2',
      [id, user.userId]
    );

    if (donaturResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Donatur tidak ditemukan'
      }, { status: 404 });
    }

    // Ambil histori pembayaran
    const pembayaranResult = await pool.query(
      `SELECT * FROM pembayaran_donatur 
       WHERE donatur_id = $1 
       ORDER BY tahun DESC, bulan DESC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...donaturResult.rows[0],
        histori_pembayaran: pembayaranResult.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching donatur detail:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update donatur bulanan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const {
      nama,
      alamat,
      no_telepon,
      email,
      jumlah_donasi,
      status,
      metode_pembayaran,
      tanggal_pembayaran,
      keterangan
    } = body;

    const result = await pool.query(
      `UPDATE donatur_bulanan SET
        nama = COALESCE($1, nama),
        alamat = COALESCE($2, alamat),
        no_telepon = COALESCE($3, no_telepon),
        email = COALESCE($4, email),
        jumlah_donasi = COALESCE($5, jumlah_donasi),
        status = COALESCE($6, status),
        metode_pembayaran = COALESCE($7, metode_pembayaran),
        tanggal_pembayaran = COALESCE($8, tanggal_pembayaran),
        keterangan = COALESCE($9, keterangan),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND user_id = $11
      RETURNING *`,
      [nama, alamat, no_telepon, email, jumlah_donasi, 
       status, metode_pembayaran, tanggal_pembayaran, keterangan, id, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Donatur tidak ditemukan'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Donatur berhasil diupdate'
    });
  } catch (error: any) {
    console.error('Error updating donatur:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Hapus donatur bulanan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const user = await requireAuth();
    const { id } = await params;
    
    await client.query('BEGIN');

    // Cek ownership
    const checkResult = await client.query(
      'SELECT id FROM donatur_bulanan WHERE id = $1 AND user_id = $2',
      [id, user.userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        error: 'Donatur tidak ditemukan atau akses ditolak'
      }, { status: 404 });
    }

    // Hapus semua pembayaran donatur terlebih dahulu
    await client.query(
      'DELETE FROM pembayaran_donatur WHERE donatur_id = $1',
      [id]
    );

    // Kemudian hapus donatur
    const result = await client.query(
      'DELETE FROM donatur_bulanan WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');
    
    return NextResponse.json({
      success: true,
      message: 'Donatur berhasil dihapus'
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error deleting donatur:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    client.release();
  }
}
