import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body.username ?? body.email ?? '').trim();
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username dan password harus diisi'
      }, { status: 400 });
    }

    // Cari user berdasarkan username (email lama tetap diterima)
    const result = await pool.query(
      'SELECT id, username, email, password, nama, role FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Username atau password salah'
      }, { status: 401 });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Username atau password salah'
      }, { status: 401 });
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      email: user.email,
      nama: user.nama,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(SECRET_KEY);

    // Set cookie with enhanced configuration
    const cookieStore = await cookies();
    
    // Debug logging for production
    console.log('Setting auth cookie for NODE_ENV:', process.env.NODE_ENV);
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    };
    
    cookieStore.set('auth_token', token, cookieOptions);
    
    console.log('Auth cookie set with options:', {
      ...cookieOptions,
      tokenLength: token.length
    });

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nama: user.nama,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Error logging in:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
