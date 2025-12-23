import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Validate JWT_SECRET exists in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'
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
      console.log('No auth_token cookie found');
      return null;
    }

    console.log('Found auth_token, attempting to verify...');
    const { payload } = await jwtVerify(token.value, SECRET_KEY);
    
    const user = {
      userId: payload.userId as number,
      email: payload.email as string,
      nama: payload.nama as string,
      role: payload.role as string
    };
    
    console.log('Token verified successfully for user:', user.email);
    return user;
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
