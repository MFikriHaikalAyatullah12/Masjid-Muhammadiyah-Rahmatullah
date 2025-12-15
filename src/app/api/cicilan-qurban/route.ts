import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST - Bayar cicilan tabungan qurban
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const user = await requireAuth();
    await client.query('BEGIN');
    
    const body = await request.json();
    const {
      tabungan_id,
      tanggal_bayar,
      jumlah,
      metode_pembayaran,
      bukti_pembayaran,
      petugas,
      keterangan
    } = body;

    // Validasi input
    if (!tabungan_id || !tanggal_bayar || !jumlah) {
      return NextResponse.json({
        success: false,
        error: 'Data cicilan tidak lengkap'
      }, { status: 400 });
    }

    // Ambil data tabungan dan cek ownership
    const tabunganResult = await client.query(
      'SELECT * FROM tabungan_qurban WHERE id = $1 AND user_id = $2',
      [tabungan_id, user.userId]
    );

    if (tabunganResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        error: 'Tabungan tidak ditemukan atau akses ditolak'
      }, { status: 404 });
    }

    const tabungan = tabunganResult.rows[0];

    // Cek status tabungan
    if (tabungan.status === 'terpenuhi' || tabungan.status === 'diambil') {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        error: 'Tabungan sudah terpenuhi atau diambil'
      }, { status: 400 });
    }

    // Insert cicilan
    const cicilanResult = await client.query(
      `INSERT INTO cicilan_qurban (
        tabungan_id, tanggal_bayar, jumlah,
        metode_pembayaran, bukti_pembayaran, petugas, keterangan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [tabungan_id, tanggal_bayar, jumlah,
       metode_pembayaran || 'tunai', bukti_pembayaran, 
       petugas || 'sistem', keterangan]
    );

    // Update total terkumpul dan sisa kekurangan
    const totalTerkumpul = parseFloat(tabungan.total_terkumpul) + parseFloat(jumlah);
    const sisaKekurangan = parseFloat(tabungan.target_tabungan) - totalTerkumpul;
    const status = sisaKekurangan <= 0 ? 'terpenuhi' : 'menabung';

    await client.query(
      `UPDATE tabungan_qurban SET
        total_terkumpul = $1,
        sisa_kekurangan = $2,
        status = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4`,
      [totalTerkumpul, Math.max(0, sisaKekurangan), status, tabungan_id]
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
      [tanggal_bayar, 'masuk', 'tabungan_qurban',
       `Cicilan tabungan qurban - ${tabungan.nama_penabung}`,
       jumlah, saldoSebelum, saldoSesudah, petugas || 'sistem']
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: {
        cicilan: cicilanResult.rows[0],
        total_terkumpul: totalTerkumpul,
        sisa_kekurangan: Math.max(0, sisaKekurangan),
        status: status
      },
      message: 'Cicilan berhasil dibayar'
    }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating cicilan:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    client.release();
  }
}

// GET - Ambil histori cicilan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tabungan_id = searchParams.get('tabungan_id');
    
    let query = `
      SELECT 
        c.*,
        t.nama_penabung,
        t.jenis_hewan
      FROM cicilan_qurban c
      JOIN tabungan_qurban t ON c.tabungan_id = t.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (tabungan_id) {
      query += ' AND c.tabungan_id = $1';
      params.push(tabungan_id);
    }
    
    query += ' ORDER BY c.tanggal_bayar DESC';
    
    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching cicilan:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
