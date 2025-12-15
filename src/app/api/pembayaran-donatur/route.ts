import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST - Catat pembayaran donatur bulanan
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const user = await requireAuth();
    await client.query('BEGIN');
    
    const body = await request.json();
    const {
      donatur_id,
      tanggal_bayar,
      bulan,
      tahun,
      jumlah,
      metode_pembayaran,
      bukti_pembayaran,
      keterangan
    } = body;

    // Validasi input
    if (!donatur_id || !tanggal_bayar || !bulan || !tahun || !jumlah) {
      return NextResponse.json({
        success: false,
        error: 'Data pembayaran tidak lengkap'
      }, { status: 400 });
    }

    // Cek ownership donatur
    const donaturCheck = await client.query(
      'SELECT id FROM donatur_bulanan WHERE id = $1 AND user_id = $2',
      [donatur_id, user.userId]
    );

    if (donaturCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        error: 'Donatur tidak ditemukan atau akses ditolak'
      }, { status: 404 });
    }

    // Cek apakah sudah ada pembayaran untuk bulan/tahun yang sama
    const existingPayment = await client.query(
      `SELECT id FROM pembayaran_donatur 
       WHERE donatur_id = $1 AND bulan = $2 AND tahun = $3`,
      [donatur_id, bulan, tahun]
    );

    if (existingPayment.rows.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        error: 'Pembayaran untuk bulan ini sudah tercatat'
      }, { status: 400 });
    }

    // Insert pembayaran
    const result = await client.query(
      `INSERT INTO pembayaran_donatur (
        donatur_id, tanggal_bayar, bulan, tahun, jumlah,
        metode_pembayaran, bukti_pembayaran, keterangan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [donatur_id, tanggal_bayar, bulan, tahun, jumlah,
       metode_pembayaran || 'transfer', bukti_pembayaran, keterangan]
    );

    // Update kas harian
    const saldoResult = await client.query(
      'SELECT saldo_sesudah FROM kas_harian ORDER BY created_at DESC LIMIT 1'
    );
    const saldoSebelum = saldoResult.rows.length > 0 ? parseFloat(saldoResult.rows[0].saldo_sesudah) : 0;
    const saldoSesudah = saldoSebelum + parseFloat(jumlah);

    await client.query(
      `INSERT INTO kas_harian (
        tanggal, jenis_transaksi, kategori, deskripsi,
        jumlah, saldo_sebelum, saldo_sesudah, petugas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [tanggal_bayar, 'masuk', 'donasi_bulanan',
       `Pembayaran donasi bulanan - Donatur ID: ${donatur_id}`,
       jumlah, saldoSebelum, saldoSesudah, 'sistem']
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Pembayaran berhasil dicatat'
    }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating pembayaran:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    client.release();
  }
}

// GET - Ambil histori pembayaran
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donatur_id = searchParams.get('donatur_id');
    const tahun = searchParams.get('tahun');
    
    let query = `
      SELECT 
        p.*,
        d.nama as nama_donatur
      FROM pembayaran_donatur p
      JOIN donatur_bulanan d ON p.donatur_id = d.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (donatur_id) {
      query += ` AND p.donatur_id = $${paramIndex}`;
      params.push(donatur_id);
      paramIndex++;
    }
    
    if (tahun) {
      query += ` AND p.tahun = $${paramIndex}`;
      params.push(tahun);
    }
    
    query += ' ORDER BY p.tahun DESC, p.bulan DESC';
    
    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching pembayaran:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
