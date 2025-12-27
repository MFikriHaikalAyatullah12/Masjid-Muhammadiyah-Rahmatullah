import { NextRequest, NextResponse } from 'next/server';
import { deleteKasHarian } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const result = await deleteKasHarian(id, user.userId);
    
    if (result) {
      return NextResponse.json(
        { message: 'Kas harian deleted successfully' },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
          }
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete kas harian or data not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.error('Error deleting kas harian:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}