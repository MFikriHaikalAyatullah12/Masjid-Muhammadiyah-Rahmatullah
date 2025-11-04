import { NextRequest, NextResponse } from 'next/server';
import { getAllZakatFitrah, createZakatFitrah } from '@/lib/database';

export async function GET() {
  try {
    const zakatFitrah = await getAllZakatFitrah();
    return NextResponse.json(zakatFitrah);
  } catch (error) {
    console.error('Error fetching zakat fitrah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Calculate total rupiah based on jenis_bayar
    let total_rupiah = 0;
    if (body.jenis_bayar === 'uang') {
      total_rupiah = body.jumlah_bayar;
    } else {
      // For beras or gandum, multiply by harga_per_kg
      total_rupiah = body.jumlah_bayar * body.harga_per_kg;
    }
    
    const zakatData = {
      ...body,
      total_rupiah: total_rupiah
    };
    
    const newZakat = await createZakatFitrah(zakatData);
    return NextResponse.json(newZakat, { status: 201 });
  } catch (error) {
    console.error('Error creating zakat fitrah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}