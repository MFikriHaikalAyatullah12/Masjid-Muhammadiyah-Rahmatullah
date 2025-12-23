import { NextRequest, NextResponse } from 'next/server';
import { getAllZakatMal, createZakatMal } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    const result = await pool.query(
      'SELECT * FROM zakat_mal WHERE user_id = $1 ORDER BY tanggal_bayar DESC',
      [user.userId]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching zakat mal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    // Validate required fields
    if (!body.nama_muzakki || !body.jenis_harta || !body.nilai_harta || !body.tanggal_bayar) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'nama_muzakki, jenis_harta, nilai_harta, and tanggal_bayar are required'
      }, { status: 400 });
    }

    // Validate numeric values
    const nilaiHarta = parseFloat(body.nilai_harta) || 0;
    const nisab = parseFloat(body.nisab) || 0;
    const persentaseZakat = parseFloat(body.persentase_zakat) || 2.5;

    if (nilaiHarta <= 0) {
      return NextResponse.json({ 
        error: 'Invalid nilai_harta',
        details: 'Nilai harta must be greater than 0'
      }, { status: 400 });
    }
    
    // Calculate zakat amount (2.5% of nilai_harta if above nisab and haul fulfilled)
    let jumlah_zakat = 0;
    const haulTerpenuhi = body.haul_terpenuhi === true || body.haul_terpenuhi === 'true';
    
    if (nilaiHarta >= nisab && haulTerpenuhi) {
      jumlah_zakat = (nilaiHarta * persentaseZakat) / 100;
    }
    
    const result = await pool.query(
      `INSERT INTO zakat_mal (
        nama_muzakki, alamat_muzakki, no_telepon, jenis_harta, nilai_harta, nisab, 
        haul_terpenuhi, persentase_zakat, jumlah_zakat, tanggal_bayar, tahun_hijriah,
        keterangan, status, user_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()) RETURNING *`,
      [
        body.nama_muzakki, body.alamat_muzakki || '', body.no_telepon || '',
        body.jenis_harta, nilaiHarta, nisab, haulTerpenuhi,
        persentaseZakat, jumlah_zakat, body.tanggal_bayar, 
        body.tahun_hijriah || new Date().getFullYear().toString(), 
        body.keterangan || '', 'aktif', user.userId
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Zakat mal berhasil disimpan',
      data: result.rows[0]
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating zakat mal:', error);
    return NextResponse.json({ 
      error: 'Gagal menyimpan data zakat mal', 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}