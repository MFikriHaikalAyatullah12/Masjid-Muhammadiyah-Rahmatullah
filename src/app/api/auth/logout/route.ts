import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear the auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expire immediately
      path: '/'
    });

    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error: any) {
    console.error('Error during logout:', error);
    return NextResponse.json({
      success: false,
      error: 'Logout gagal'
    }, { status: 500 });
  }
}

// Also handle GET method for direct logout URL access
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expire immediately
      path: '/'
    });

    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error: any) {
    console.error('Error during logout:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
