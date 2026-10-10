import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Dicek saat dipakai, bukan saat import, agar `next build` tidak gagal tanpa env.
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET (atau NEXTAUTH_SECRET) wajib diset di production');
    }
    return new TextEncoder().encode('dev-only-secret-change-me');
  }
  return new TextEncoder().encode(secret);
}

export interface UserPayload {
  userId: number;
  username?: string;
  email?: string;
  nama: string;
  role: string;
}

export async function getUserFromToken(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token.value, getSecretKey());
    
    return {
      userId: payload.userId as number,
      username: payload.username as string | undefined,
      email: payload.email as string | undefined,
      nama: payload.nama as string,
      role: payload.role as string
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function requireAuth(): Promise<UserPayload> {
  const user = await getUserFromToken();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
