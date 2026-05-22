import { z } from 'zod';

/**
 * Zod schema for validating PUT /api/notifications/preferences request body.
 * - All fields are optional booleans
 * - At least one field must be present
 * - No unknown fields allowed (strict mode)
 */
export const updatePreferencesSchema = z
  .object({
    matches: z.boolean({ invalid_type_error: 'Must be a boolean value (true or false)' }).optional(),
    messages: z.boolean({ invalid_type_error: 'Must be a boolean value (true or false)' }).optional(),
    promotions: z.boolean({ invalid_type_error: 'Must be a boolean value (true or false)' }).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Request body must contain at least one preference field',
  });

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
