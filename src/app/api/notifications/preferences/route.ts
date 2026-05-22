import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { authenticateRequest } from '@/lib/auth';
import { updatePreferencesSchema } from '@/lib/validators/notification-preferences';
import { NotificationPreferencesService } from '@/lib/services/notification-preferences';
import db from '@/lib/db';

const service = new NotificationPreferencesService(db);

/**
 * GET /api/notifications/preferences
 * Returns the authenticated user's notification preferences.
 * If no record exists, returns defaults (all true) without persisting.
 */
export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);

  if (auth.error) {
    return NextResponse.json(
      { error: { code: auth.error.code, message: auth.error.message } },
      { status: 401 }
    );
  }

  try {
    const preferences = await service.getPreferences(auth.user.userId);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Failed to retrieve notification preferences:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve notification preferences' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Updates one or more notification preferences for the authenticated user.
 * Uses UPSERT semantics — creates the record if it doesn't exist.
 */
export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request);

  if (auth.error) {
    return NextResponse.json(
      { error: { code: auth.error.code, message: auth.error.message } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid JSON in request body',
        },
      },
      { status: 400 }
    );
  }

  try {
    const validated = updatePreferencesSchema.parse(body);
    const preferences = await service.updatePreferences(auth.user.userId, validated);
    return NextResponse.json(preferences);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join('.') || undefined,
        message: e.message,
      }));

      // Check if it's the "at least one field" refinement error
      const isEmptyBody = error.errors.some(
        (e) => e.path.length === 0 && e.message.includes('at least one')
      );

      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: isEmptyBody
              ? 'Request body must contain at least one preference field'
              : 'Invalid request body',
            ...(isEmptyBody ? {} : { details }),
          },
        },
        { status: 400 }
      );
    }

    console.error('Failed to update notification preferences:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update notification preferences' } },
      { status: 500 }
    );
  }
}
