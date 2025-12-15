import { NextRequest, NextResponse } from 'next/server';
import { getAllZakatFitrah, createZakatFitrah } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    // Query directly dengan filter user_id
    const result = await pool.query(
      'SELECT * FROM zakat_fitrah WHERE user_id = $1 ORDER BY tanggal_bayar DESC',
      [user.userId]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching zakat fitrah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    // Calculate total rupiah based on jenis_bayar
    let total_rupiah = 0;
    if (body.jenis_bayar === 'uang') {
      total_rupiah = body.jumlah_bayar;
    } else {
      // For beras or gandum, multiply by harga_per_kg
      total_rupiah = body.jumlah_bayar * body.harga_per_kg;
    }
    
    // Insert directly dengan user_id
    const result = await pool.query(
      `INSERT INTO zakat_fitrah (
        nama_muzakki, jumlah_jiwa, jenis_bayar, jumlah_bayar, 
        harga_per_kg, total_rupiah, tanggal_bayar, tahun_hijriah, 
        keterangan, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        body.nama_muzakki, body.jumlah_jiwa, body.jenis_bayar, 
        body.jumlah_bayar, body.harga_per_kg || 0, total_rupiah, 
        body.tanggal_bayar, body.tahun_hijriah, body.keterangan, 
        user.userId
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating zakat fitrah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}