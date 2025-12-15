import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Ambil detail tabungan qurban by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    
    const tabunganResult = await pool.query(
      `SELECT 
        t.*,
        COUNT(c.id) as jumlah_cicilan,
        ROUND((t.total_terkumpul / t.target_tabungan * 100)::numeric, 2) as persentase_terkumpul
      FROM tabungan_qurban t
      LEFT JOIN cicilan_qurban c ON t.id = c.tabungan_id
      WHERE t.id = $1 AND t.user_id = $2
      GROUP BY t.id`,
      [id, user.userId]
    );

    if (tabunganResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tabungan tidak ditemukan'
      }, { status: 404 });
    }

    // Ambil histori cicilan
    const cicilanResult = await pool.query(
      `SELECT * FROM cicilan_qurban 
       WHERE tabungan_id = $1 
       ORDER BY tanggal_bayar DESC`,
      [id]
    );

    // Ambil data pengambilan jika ada
    const pengambilanResult = await pool.query(
      `SELECT * FROM pengambilan_qurban 
       WHERE tabungan_id = $1 
       ORDER BY tanggal_pengambilan DESC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...tabunganResult.rows[0],
        histori_cicilan: cicilanResult.rows,
        histori_pengambilan: pengambilanResult.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching tabungan detail:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update tabungan qurban
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const {
      nama_penabung,
      alamat,
      no_telepon,
      email,
      jenis_hewan,
      target_tabungan,
      status,
      keterangan
    } = body;

    const result = await pool.query(
      `UPDATE tabungan_qurban SET
        nama_penabung = COALESCE($1, nama_penabung),
        alamat = COALESCE($2, alamat),
        no_telepon = COALESCE($3, no_telepon),
        email = COALESCE($4, email),
        jenis_hewan = COALESCE($5, jenis_hewan),
        target_tabungan = COALESCE($6, target_tabungan),
        status = COALESCE($7, status),
        keterangan = COALESCE($8, keterangan),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10
      RETURNING *`,
      [nama_penabung, alamat, no_telepon, email, jenis_hewan,
       target_tabungan, status, keterangan, id, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tabungan tidak ditemukan'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Tabungan berhasil diupdate'
    });
  } catch (error: any) {
    console.error('Error updating tabungan:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Hapus tabungan qurban
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
      'SELECT id FROM tabungan_qurban WHERE id = $1 AND user_id = $2',
      [id, user.userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        error: 'Tabungan tidak ditemukan atau akses ditolak'
      }, { status: 404 });
    }

    // Hapus semua pengambilan terlebih dahulu
    await client.query(
      'DELETE FROM pengambilan_qurban WHERE tabungan_id = $1',
      [id]
    );

    // Hapus semua cicilan
    await client.query(
      'DELETE FROM cicilan_qurban WHERE tabungan_id = $1',
      [id]
    );

    // Kemudian hapus tabungan
    const result = await client.query(
      'DELETE FROM tabungan_qurban WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');
    
    return NextResponse.json({
      success: true,
      message: 'Tabungan berhasil dihapus'
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error deleting tabungan:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    client.release();
  }
}
