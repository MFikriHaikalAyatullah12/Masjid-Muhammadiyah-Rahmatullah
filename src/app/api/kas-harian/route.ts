import { NextRequest, NextResponse } from 'next/server';
import { getAllKasHarian, createKasHarian, getCurrentSaldo } from '@/lib/database';

export async function GET() {
  try {
    const kasHarian = await getAllKasHarian();
    const currentSaldo = await getCurrentSaldo();
    return NextResponse.json({ data: kasHarian, currentSaldo });
  } catch (error) {
    console.error('Error fetching kas harian:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newKas = await createKasHarian(body);
    return NextResponse.json(newKas, { status: 201 });
  } catch (error) {
    console.error('Error creating kas harian:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}