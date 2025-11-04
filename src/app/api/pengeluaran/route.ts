import { NextRequest, NextResponse } from 'next/server';
import { getAllPengeluaran, createPengeluaran, approvePengeluaran } from '@/lib/database';

export async function GET() {
  try {
    const pengeluaran = await getAllPengeluaran();
    return NextResponse.json(pengeluaran);
  } catch (error) {
    console.error('Error fetching pengeluaran:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPengeluaran = await createPengeluaran(body);
    return NextResponse.json(newPengeluaran, { status: 201 });
  } catch (error) {
    console.error('Error creating pengeluaran:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, disetujui_oleh } = body;
    
    if (action === 'approve') {
      await approvePengeluaran(id, disetujui_oleh);
      return NextResponse.json({ message: 'Pengeluaran approved successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating pengeluaran:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}