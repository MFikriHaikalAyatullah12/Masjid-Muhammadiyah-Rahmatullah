import { NextResponse } from 'next/server';
import { pool } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    const result = await pool.query(
      'SELECT * FROM mustahiq WHERE user_id = $1 ORDER BY nama ASC',
      [user.userId]
    );
    
    const mustahiq = result.rows.map((row: any) => ({
      ...row,
      created_at: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));
    
    return NextResponse.json(mustahiq);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching mustahiq:', error);
    return NextResponse.json({ error: 'Failed to fetch mustahiq' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const data = await request.json();
    
    const result = await pool.query(
      'INSERT INTO mustahiq (nama, alamat, no_telepon, kategori, status, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [data.nama, data.alamat, data.no_telepon || data.no_hp, data.kategori, data.status || 'aktif', user.userId]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating mustahiq:', error);
    return NextResponse.json({ error: 'Failed to create mustahiq' }, { status: 500 });
  }
}