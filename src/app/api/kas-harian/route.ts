import { NextRequest, NextResponse } from 'next/server';
import { getAllKasHarian, createKasHarian, getCurrentSaldo } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    // Query directly dengan filter user_id
    const result = await pool.query(
      'SELECT * FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC',
      [user.userId]
    );
    
    const currentSaldoResult = await pool.query(
      'SELECT saldo_sesudah FROM kas_harian WHERE user_id = $1 ORDER BY tanggal DESC, created_at DESC LIMIT 1',
      [user.userId]
    );
    const currentSaldo = currentSaldoResult.rows.length > 0 ? parseFloat(currentSaldoResult.rows[0].saldo_sesudah) : 0;
    
    return NextResponse.json({ data: result.rows, currentSaldo });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching kas harian:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const newKas = await createKasHarian(body, user.userId);
    return NextResponse.json(newKas, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating kas harian:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}