import { NextRequest, NextResponse } from 'next/server';
import { getAllKasHarian, createKasHarian, getCurrentSaldo } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      const user = await requireAuth();
      
      // NEON DATABASE RETRY LOGIC - Single optimized query
      const dataResult = await pool.query(`
        SELECT 
          id, tanggal, jenis_transaksi, kategori, deskripsi, jumlah,
          saldo_sebelum, saldo_sesudah, petugas, bukti_transaksi, created_at,
          (SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 1) as current_saldo
        FROM kas_harian 
        WHERE user_id = $1 
        ORDER BY tanggal DESC, created_at DESC 
        LIMIT 200
      `, [user.userId]);
      
      const currentSaldo = dataResult.rows.length > 0 && dataResult.rows[0].current_saldo 
        ? parseFloat(dataResult.rows[0].current_saldo) || 0 
        : 0;
      
      return NextResponse.json({ 
        data: dataResult.rows, 
        currentSaldo 
      }, {
        headers: {
          'Cache-Control': 'private, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (error: any) {
      retryCount++;
      console.error(`Error fetching kas harian (attempt ${retryCount}/${maxRetries}):`, error);
      
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // If it's a timeout or connection error and we have retries left
      if (retryCount < maxRetries && (
        error.message?.includes('timeout') || 
        error.message?.includes('connect') ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT'
      )) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        continue;
      }
      
      return NextResponse.json({ 
        error: 'Database connection error. Please try again.' 
      }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    // Fast validation
    if (!body.tanggal || !body.jenis_transaksi || !body.kategori || !body.deskripsi || !body.jumlah) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Create with optimized function
    const newKas = await createKasHarian(body, user.userId);
    
    return NextResponse.json(newKas, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating kas harian:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}