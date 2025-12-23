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
    
    // Validate required fields
    if (!body.nama_muzakki || !body.jumlah_jiwa || !body.jenis_bayar || !body.tanggal_bayar) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'nama_muzakki, jumlah_jiwa, jenis_bayar, and tanggal_bayar are required'
      }, { status: 400 });
    }
    
    // Calculate total rupiah based on jenis_bayar
    let total_rupiah = 0;
    if (body.jenis_bayar === 'uang') {
      total_rupiah = parseFloat(body.jumlah_bayar) * parseInt(body.jumlah_jiwa);
    } else {
      // For beras or gandum, multiply by harga_per_kg and jumlah_jiwa
      const hargaPerKg = parseFloat(body.harga_per_kg) || 0;
      const jumlahBayar = parseFloat(body.jumlah_bayar) || 0;
      const jumlahJiwa = parseInt(body.jumlah_jiwa) || 1;
      total_rupiah = jumlahBayar * hargaPerKg * jumlahJiwa;
    }
    
    // Insert directly dengan user_id
    const result = await pool.query(
      `INSERT INTO zakat_fitrah (
        nama_muzakki, alamat_muzakki, no_telepon, jumlah_jiwa, jenis_bayar, jumlah_bayar, 
        harga_per_kg, total_rupiah, tanggal_bayar, tahun_hijriah, 
        keterangan, status, user_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) RETURNING *`,
      [
        body.nama_muzakki, body.alamat_muzakki || '', body.no_telepon || '',
        body.jumlah_jiwa, body.jenis_bayar, 
        body.jumlah_bayar, body.harga_per_kg || 0, total_rupiah, 
        body.tanggal_bayar, body.tahun_hijriah || new Date().getFullYear().toString(), 
        body.keterangan || '', 'aktif',
        user.userId
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Zakat fitrah berhasil disimpan',
      data: result.rows[0]
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating zakat fitrah:', error);
    return NextResponse.json({ 
      error: 'Gagal menyimpan data zakat fitrah', 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}