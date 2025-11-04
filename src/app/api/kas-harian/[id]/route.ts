import { NextRequest, NextResponse } from 'next/server';
import { deleteKasHarian } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const result = await deleteKasHarian(id);
    
    if (result) {
      return NextResponse.json(
        { message: 'Kas harian deleted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete kas harian' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting kas harian:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}