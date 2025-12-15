import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface UserPayload {
  userId: number;
  email: string;
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

    const { payload } = await jwtVerify(token.value, SECRET_KEY);
    
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      nama: payload.nama as string,
      role: payload.role as string
    };
  } catch (error) {
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
