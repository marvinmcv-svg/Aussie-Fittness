import { z } from 'zod';

/** Signup request body */
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72, 'Password too long'),
  name: z.string().max(100, 'Name too long').optional(),
});

/** Admin create user request body */
export const adminCreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72, 'Password too long'),
  name: z.string().max(100, 'Name too long').optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isPremium: z.boolean().optional(),
});

/** Admin update user request body */
export const adminUpdateUserSchema = z.object({
  name: z.string().max(100, 'Name too long').optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isPremium: z.boolean().optional(),
});

/** Helper to parse and return a 400 on failure */
export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message ?? 'Invalid input' };
}
