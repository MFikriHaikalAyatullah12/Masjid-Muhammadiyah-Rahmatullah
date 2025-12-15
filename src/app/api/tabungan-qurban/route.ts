import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Ambil semua tabungan qurban
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tahun = searchParams.get('tahun');
    
    let query = `
      SELECT 
        t.*,
        COUNT(c.id) as jumlah_cicilan,
        CASE 
          WHEN t.total_terkumpul >= t.target_tabungan THEN 'Terpenuhi'
          WHEN t.total_terkumpul > 0 THEN 'Menabung'
          ELSE 'Baru'
        END as status_progres,
        ROUND((t.total_terkumpul / t.target_tabungan * 100)::numeric, 2) as persentase_terkumpul
      FROM tabungan_qurban t
      LEFT JOIN cicilan_qurban c ON t.id = c.tabungan_id
      WHERE t.user_id = $1
    `;
    
    const params: any[] = [user.userId];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (tahun) {
      query += ` AND t.target_qurban_tahun = $${paramIndex}`;
      params.push(tahun);      paramIndex++;    }
    
    query += ' GROUP BY t.id ORDER BY t.created_at DESC';
    
    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching tabungan qurban:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Buat tabungan qurban baru
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const {
      nama_penabung,
      alamat,
      no_telepon,
      email,
      jenis_hewan,
      target_tabungan,
      tanggal_mulai,
      target_qurban_tahun,
      keterangan
    } = body;

    // Validasi input
    if (!nama_penabung || !jenis_hewan || !target_tabungan || !tanggal_mulai || !target_qurban_tahun) {
      return NextResponse.json({
        success: false,
        error: 'Data tidak lengkap'
      }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO tabungan_qurban (
        nama_penabung, alamat, no_telepon, email, jenis_hewan,
        target_tabungan, sisa_kekurangan, tanggal_mulai, 
        target_qurban_tahun, keterangan, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [nama_penabung, alamat, no_telepon, email, jenis_hewan,
       target_tabungan, target_tabungan, tanggal_mulai,
       target_qurban_tahun, keterangan, user.userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Tabungan qurban berhasil dibuat'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tabungan qurban:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
