import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

// Pendaftaran publik ditutup; aktifkan dengan ALLOW_REGISTRATION=true bila perlu membuat akun admin baru.
export async function POST(request: NextRequest) {
  if (process.env.ALLOW_REGISTRATION !== 'true') {
    return NextResponse.json({
      success: false,
      error: 'Pendaftaran akun tidak dibuka untuk umum. Hubungi admin masjid.'
    }, { status: 403 });
  }
  try {
    const body = await request.json();
    const username = String(body.username ?? '').trim().toLowerCase();
    const { password, nama } = body;

    if (!username || !password || !nama) {
      return NextResponse.json({
        success: false,
        error: 'Username, password, dan nama harus diisi'
      }, { status: 400 });
    }

    if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
      return NextResponse.json({
        success: false,
        error: 'Username 3-50 karakter, hanya huruf, angka, titik, strip, atau underscore'
      }, { status: 400 });
    }

    // Cek apakah username sudah terdaftar
    const checkUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = $1',
      [username]
    );

    if (checkUser.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Username sudah terdaftar'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const result = await pool.query(
      `INSERT INTO users (username, password, nama, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, username, nama, role, created_at`,
      [username, hashedPassword, nama]
    );

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      data: result.rows[0]
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
