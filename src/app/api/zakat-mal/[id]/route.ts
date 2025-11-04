import { NextRequest, NextResponse } from 'next/server';
import { deleteZakatMal } from '@/lib/database';

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

    const result = await deleteZakatMal(id);
    
    if (result) {
      return NextResponse.json(
        { message: 'Zakat mal deleted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete zakat mal' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting zakat mal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}