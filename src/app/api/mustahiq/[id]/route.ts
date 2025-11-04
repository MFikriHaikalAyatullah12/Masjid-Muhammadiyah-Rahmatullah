import { NextRequest, NextResponse } from 'next/server';
import { deleteMustahiq } from '@/lib/database';

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

    const result = await deleteMustahiq(id);
    
    if (result) {
      return NextResponse.json(
        { message: 'Mustahiq deleted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete mustahiq' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting mustahiq:', error);
    
    // Handle specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}