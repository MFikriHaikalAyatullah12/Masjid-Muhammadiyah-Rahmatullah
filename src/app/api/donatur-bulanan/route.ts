import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Ambil semua donatur bulanan
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = `
      SELECT 
        d.*,
        COUNT(p.id) as total_pembayaran,
        SUM(p.jumlah) as total_terbayar
      FROM donatur_bulanan d
      LEFT JOIN pembayaran_donatur p ON d.id = p.donatur_id
      WHERE d.user_id = $1
    `;
    
    const params: any[] = [user.userId];
    if (status) {
      query += ' AND d.status = $2';
      params.push(status);
    }
    
    query += ' GROUP BY d.id ORDER BY d.created_at DESC';
    
    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching donatur bulanan:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Tambah donatur bulanan baru
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    console.log('Received donatur data:', body);
    
    const {
      nama,
      alamat,
      no_telepon,
      email,
      jumlah_donasi,
      tanggal_mulai,
      metode_pembayaran,
      tanggal_pembayaran,
      keterangan
    } = body;

    // Validasi input
    if (!nama || !jumlah_donasi || !tanggal_mulai) {
      console.log('Validation failed:', { nama, jumlah_donasi, tanggal_mulai });
      return NextResponse.json({
        success: false,
        error: 'Nama, jumlah donasi, dan tanggal mulai harus diisi'
      }, { status: 400 });
    }

    console.log('Inserting to database...');
    const result = await pool.query(
      `INSERT INTO donatur_bulanan (
        nama, alamat, no_telepon, email, jumlah_donasi,
        tanggal_mulai, metode_pembayaran, tanggal_pembayaran, keterangan, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [nama, alamat, no_telepon, email, jumlah_donasi, 
       tanggal_mulai, metode_pembayaran || 'transfer', 
       tanggal_pembayaran || 1, keterangan, user.userId]
    );

    console.log('Insert successful:', result.rows[0]);
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Donatur bulanan berhasil ditambahkan'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating donatur bulanan:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
