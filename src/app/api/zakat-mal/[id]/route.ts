import { NextRequest, NextResponse } from 'next/server';
import { deleteZakatMal } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ULTRA-FAST authentication and validation in parallel
    const [user, { id: idParam }] = await Promise.all([
      requireAuth(),
      params
    ]);
    
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400, headers: { 'Cache-Control': 'no-cache' } }
      );
    }

    // INSTANT DELETE with user isolation
    const result = await deleteZakatMal(id, user.userId);
    
    if (result) {
      return NextResponse.json(
        { message: 'Deleted' },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache'
          }
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: { 'Cache-Control': 'no-cache' } }
      );
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-cache' } }
      );
    }
    
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: { 'Cache-Control': 'no-cache' } }
    );
  }
}