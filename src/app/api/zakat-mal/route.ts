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
    
    // Calculate zakat amount (2.5% of nilai_harta if above nisab and haul fulfilled)
    let jumlah_zakat = 0;
    if (body.nilai_harta >= body.nisab && body.haul_terpenuhi) {
      jumlah_zakat = (body.nilai_harta * body.persentase_zakat) / 100;
    }
    
    const result = await pool.query(
      `INSERT INTO zakat_mal (
        nama_muzakki, jenis_harta, nilai_harta, nisab, haul_terpenuhi,
        persentase_zakat, jumlah_zakat, tanggal_bayar, tahun_hijriah,
        keterangan, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        body.nama_muzakki, body.jenis_harta, body.nilai_harta, body.nisab,
        body.haul_terpenuhi, body.persentase_zakat, jumlah_zakat,
        body.tanggal_bayar, body.tahun_hijriah, body.keterangan, user.userId
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating zakat mal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}