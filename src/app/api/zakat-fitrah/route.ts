import { NextRequest, NextResponse } from 'next/server';
import { getAllZakatFitrah, createZakatFitrah } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    
    // ULTRA-OPTIMIZED query with LIMIT for speed
    const result = await pool.query(
      'SELECT * FROM zakat_fitrah WHERE user_id = $1 ORDER BY tanggal_bayar DESC LIMIT 200',
      [user.userId]
    );
    
    return NextResponse.json(result.rows, {
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching zakat fitrah:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ULTRA-FAST validation and processing in parallel
    const [user, body] = await Promise.all([
      requireAuth(),
      request.json()
    ]);
    
    // Fast validation - minimal checks
    if (!body.nama_muzakki || !body.jumlah_jiwa || !body.jenis_bayar || !body.tanggal_bayar) {
      return NextResponse.json({ 
        error: 'Missing fields'
      }, { status: 400, headers: { 'Cache-Control': 'no-cache' } });
    }
    
    // INSTANT calculation
    const total_rupiah = body.jenis_bayar === 'uang' 
      ? parseFloat(body.jumlah_bayar) * parseInt(body.jumlah_jiwa)
      : (parseFloat(body.jumlah_bayar) || 0) * (parseFloat(body.harga_per_kg) || 0) * parseInt(body.jumlah_jiwa);
    
    // DIRECT INSERT for speed
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
      data: result.rows[0]
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}