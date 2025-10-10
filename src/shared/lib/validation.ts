import { z } from 'zod';

/**
 * Email validation schema
 * - Must be valid email format
 * - Min 5 characters (shortest valid email: a@b.c)
 * - Max 255 characters (RFC 5321 limit)
 */
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email is too long')
  .email('Invalid email address')
  .trim()
  .toLowerCase();

/**
 * Password validation schema
 * Industry-standard password requirements:
 * - Min 8 characters
 * - Max 128 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*...)');

/**
 * Relaxed password schema for sign-in
 * Only enforces basic length requirements
 */
export const passwordSignInSchema = z.string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters');

/**
 * Search query validation schema
 * - Min 1 character
 * - Max 100 characters
 * - Sanitizes HTML tags to prevent XSS
 * - Trims whitespace
 */
export const searchQuerySchema = z.string()
  .min(1, 'Search query cannot be empty')
  .max(100, 'Search query is too long (max 100 characters)')
  .trim()
  .transform(str => {
    // Remove potentially dangerous HTML tags and entities
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/&lt;/g, '')
      .replace(/&gt;/g, '')
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
  });

/**
 * Username validation schema (for future use)
 */
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must not exceed 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .trim();

/**
 * Generic text input validation (for comments, reviews, etc.)
 */
export const textInputSchema = z.string()
  .max(1000, 'Text is too long (max 1000 characters)')
  .trim()
  .transform(str => {
    // Basic XSS prevention
    return str
      .replace(/[<>]/g, '')
      .replace(/&lt;/g, '')
      .replace(/&gt;/g, '');
  });

/**
 * URL validation schema
 */
export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL is too long');

/**
 * Number validation schemas
 */
export const positiveIntegerSchema = z.number()
  .int('Must be an integer')
  .positive('Must be positive');

export const ratingSchema = z.number()
  .min(0, 'Rating must be at least 0')
  .max(10, 'Rating must not exceed 10');

/**
 * Combined auth schemas
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSignInSchema,
});

/**
 * Helper function to validate and return errors
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => e.message),
      };
    }
    return {
      success: false,
      errors: ['Validation failed'],
    };
  }
}

/**
 * Helper function to safely parse with default
 */
export function safeParseWithDefault<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}

/**
 * Sanitize string for safe display (XSS prevention)
 */
export function sanitizeForDisplay(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate multiple fields at once
 */
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export function validateFields(
  fields: Record<string, { schema: z.ZodSchema; value: unknown }>
): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, { schema, value }] of Object.entries(fields)) {
    const result = schema.safeParse(value);
    if (!result.success) {
      isValid = false;
      errors[fieldName] = result.error.errors[0]?.message || 'Invalid input';
    }
  }

  return { isValid, errors };
}
