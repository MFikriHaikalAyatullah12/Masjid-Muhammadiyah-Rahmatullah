import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error: any) {
    console.error('Error logging out:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
