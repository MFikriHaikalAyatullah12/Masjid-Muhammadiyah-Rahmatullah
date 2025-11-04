import { NextRequest, NextResponse } from 'next/server';
import { getAllZakatMal, createZakatMal } from '@/lib/database';

export async function GET() {
  try {
    const zakatMal = await getAllZakatMal();
    return NextResponse.json(zakatMal);
  } catch (error) {
    console.error('Error fetching zakat mal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Calculate zakat amount (2.5% of nilai_harta if above nisab and haul fulfilled)
    let jumlah_zakat = 0;
    if (body.nilai_harta >= body.nisab && body.haul_terpenuhi) {
      jumlah_zakat = (body.nilai_harta * body.persentase_zakat) / 100;
    }
    
    const zakatData = {
      ...body,
      jumlah_zakat: jumlah_zakat
    };
    
    const newZakat = await createZakatMal(zakatData);
    return NextResponse.json(newZakat, { status: 201 });
  } catch (error) {
    console.error('Error creating zakat mal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}