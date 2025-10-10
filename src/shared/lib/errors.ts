/**
 * Centralized Error Handling Library
 * 
 * Provides standardized error classes and handling for the Cinephile application.
 * All errors should extend AppError for consistent error handling.
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
    };
  }
}

/**
 * Network-related errors (connection issues, timeouts, etc.)
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed. Please check your connection.') {
    super(message, 'NETWORK_ERROR', 503);
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed. Please sign in again.') {
    super(message, 'AUTH_ERROR', 401);
  }
}

/**
 * Input validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Invalid input. Please check your data.', public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

/**
 * API-specific errors (rate limiting, invalid responses, etc.)
 */
export class ApiError extends AppError {
  constructor(
    message: string = 'API request failed',
    statusCode: number = 500,
    public endpoint?: string
  ) {
    super(message, 'API_ERROR', statusCode);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'The requested resource was not found', public resource?: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.', public retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429);
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends AppError {
  constructor(message: string = 'Request timed out. Please try again.') {
    super(message, 'TIMEOUT', 408);
  }
}

/**
 * User-friendly error messages mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  AUTH_ERROR: 'Authentication failed. Please sign in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  API_ERROR: 'Something went wrong with our service. Please try again.',
  NOT_FOUND: 'The content you\'re looking for doesn\'t exist.',
  RATE_LIMIT: 'You\'re doing that too quickly. Please wait a moment.',
  TIMEOUT: 'Request took too long. Please try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Check if it's a known error pattern
    const errorStr = error.message.toLowerCase();
    if (errorStr.includes('network') || errorStr.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (errorStr.includes('auth') || errorStr.includes('unauthorized')) {
      return ERROR_MESSAGES.AUTH_ERROR;
    }
    if (errorStr.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
    
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN;
};

/**
 * Log error for debugging and monitoring
 */
export const logError = (error: unknown, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error Log');
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }

  // In production, send to error tracking service (e.g., Sentry)
  // Example:
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
};

/**
 * Check if error is operational (expected) vs programming error
 */
export const isOperationalError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Convert fetch errors to AppError
 */
export const handleFetchError = async (response: Response, endpoint?: string): Promise<never> => {
  const { status, statusText } = response;

  try {
    const data = await response.json();
    const message = data.message || data.error || statusText;

    switch (status) {
      case 401:
      case 403:
        throw new AuthError(message);
      case 404:
        throw new NotFoundError(message, endpoint);
      case 429:
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        throw new RateLimitError(message, retryAfter);
      case 408:
        throw new TimeoutError(message);
      default:
        if (status >= 500) {
          throw new ApiError(`Server error: ${message}`, status, endpoint);
        }
        throw new ApiError(message, status, endpoint);
    }
  } catch (error) {
    // If we can't parse the response, throw a generic API error
    if (error instanceof AppError) {
      throw error;
    }
    throw new ApiError(`Request failed: ${statusText}`, status, endpoint);
  }
};

/**
 * Wrap async functions with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { context, args });
      throw error;
    }
  }) as T;
};

/**
 * Retry logic for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    shouldRetry = (error) => !(error instanceof ValidationError),
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || attempt === maxAttempts) {
        throw error;
      }

      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
