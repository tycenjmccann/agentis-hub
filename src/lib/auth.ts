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

/**
 * Extracts and verifies the authenticated user from a request's Authorization header.
 * Returns the user ID from the JWT 'sub' claim.
 *
 * @returns AuthUser on success, AuthError on failure
 */
export function authenticateRequest(
  request: NextRequest
): { user: AuthUser; error?: never } | { user?: never; error: AuthError } {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    };
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  if (!token) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.sub) {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token: missing subject',
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
