import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('Clearing authentication cookies...');
    
    const cookieStore = await cookies();
    
    // Clear all possible auth cookies
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/'
    });

    console.log('Cookies cleared successfully');

    return NextResponse.json({
      success: true,
      message: 'Authentication reset berhasil'
    });
  } catch (error: any) {
    console.error('Error clearing cookies:', error);
    return NextResponse.json({
      success: false,
      error: 'Reset gagal'
    }, { status: 500 });
  }
}