import { NextRequest, NextResponse } from 'next/server';
import { getAllZakatMal, createZakatMal } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Use optimized function with user isolation
    const result = await getAllZakatMal(user.userId);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching zakat mal:', error);
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
    
    // Fast validation
    if (!body.nama_muzakki || !body.jenis_harta || !body.nilai_harta || !body.tanggal_bayar) {
      return NextResponse.json({ 
        error: 'Missing required fields'
      }, { status: 400, headers: { 'Cache-Control': 'no-cache' } });
    }

    // Quick calculations
    const nilaiHarta = parseFloat(body.nilai_harta) || 0;
    const nisab = parseFloat(body.nisab) || 0;
    const persentaseZakat = parseFloat(body.persentase_zakat) || 2.5;
    const haulTerpenuhi = body.haul_terpenuhi === true || body.haul_terpenuhi === 'true';
    
    const jumlah_zakat = (nilaiHarta >= nisab && haulTerpenuhi) 
      ? (nilaiHarta * persentaseZakat) / 100 
      : 0;
    
    // Use optimized createZakatMal function
    const zakatData = {
      nama_muzakki: body.nama_muzakki,
      alamat_muzakki: body.alamat_muzakki || '',
      no_telepon: body.no_telepon || '',
      jenis_harta: body.jenis_harta,
      nilai_harta: nilaiHarta,
      nisab,
      haul_terpenuhi: haulTerpenuhi,
      persentase_zakat: persentaseZakat,
      jumlah_zakat,
      tanggal_bayar: body.tanggal_bayar,
      tahun_hijriah: body.tahun_hijriah || new Date().getFullYear().toString(),
      status: 'diterima' as const,
      keterangan: body.keterangan || ''
    };
    
    const result = await createZakatMal(zakatData, user.userId);
    
    return NextResponse.json({
      success: true,
      data: result
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