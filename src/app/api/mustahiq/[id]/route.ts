import { NextRequest, NextResponse } from 'next/server';
import { deleteMustahiq } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication first
    const user = await requireAuth();
    
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const result = await deleteMustahiq(id, user.userId);
    
    if (result) {
      return NextResponse.json(
        { message: 'Mustahiq deleted successfully' },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete mustahiq or data not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting mustahiq:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}