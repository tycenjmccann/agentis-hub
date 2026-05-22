import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

export interface AuthUser {
  userId: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export function authenticateRequest(
  request: NextRequest
): { user: AuthUser; error?: never } | { user?: never; error: AuthError } {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      },
    };
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.sub) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token missing subject claim',
        },
      };
    }

    return { user: { userId: decoded.sub } };
  } catch {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    };
  }
}
