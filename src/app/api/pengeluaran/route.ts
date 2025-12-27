import { NextRequest, NextResponse } from 'next/server';
import { getAllPengeluaran, createPengeluaran, approvePengeluaran } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Use optimized function with user isolation
    const result = await getAllPengeluaran(user.userId);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching pengeluaran:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ULTRA-FAST parallel processing
    const [user, body] = await Promise.all([
      requireAuth(),
      request.json()
    ]);
    
    const newPengeluaran = await createPengeluaran(body, user.userId);
    
    return NextResponse.json(newPengeluaran, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating pengeluaran:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // ULTRA-FAST approval processing
    const [user, body] = await Promise.all([
      requireAuth(),
      request.json()
    ]);
    
    const { id, action, disetujui_oleh } = body;
    
    if (action === 'approve') {
      // INSTANT APPROVAL with user context
      await approvePengeluaran(id, disetujui_oleh || user.nama, user.userId);
      
      return NextResponse.json(
        { message: 'Approved', success: true },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache'
          }
        }
      );
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Approval error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}