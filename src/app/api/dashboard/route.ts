import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    console.log('Fetching dashboard stats for user:', user.userId);
    const stats = await getDashboardStats(user.userId);
    console.log('Dashboard stats fetched successfully:', stats);
    
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return error details for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}