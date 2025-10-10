/**
 * Input sanitization and validation utilities
 * Helps prevent XSS attacks and ensures clean user input
 */

/**
 * Sanitizes a string by removing potentially dangerous characters
 * while preserving common punctuation and international characters
 */
export function sanitizeInput(input: string, options: { preserveSpaces?: boolean } = {}): string {
  if (!input || typeof input !== 'string') return '';
  
  const sanitized = input
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '');
  
  // Only trim if not preserving spaces (for real-time input)
  return options.preserveSpaces ? sanitized : sanitized.trim();
}

/**
 * Validates search query input
 * Returns an object with validation result and sanitized value
 */
export function validateSearchQuery(input: string, options: { preserveSpaces?: boolean } = {}): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  // First sanitize the input, preserving spaces during typing
  const sanitized = sanitizeInput(input, { preserveSpaces: options.preserveSpaces });
  
  // Trim for length checks but keep original sanitized value
  const trimmed = sanitized.trim();
  
  // Check minimum length (if not empty)
  if (trimmed.length > 0 && trimmed.length < 2) {
    return {
      isValid: false,
      sanitized,
      error: 'Search query must be at least 2 characters long'
    };
  }
  
  // Check maximum length
  if (sanitized.length > 100) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, 100),
      error: 'Search query is too long (max 100 characters)'
    };
  }
  
  // Check for suspicious patterns (potential injection attempts)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /data:text\/html/i,
    /vbscript:/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        sanitized,
        error: 'Invalid characters detected in search query'
      };
    }
  }
  
  return {
    isValid: true,
    sanitized
  };
}

/**
 * Escapes HTML special characters to prevent XSS
 * Use this when displaying user input in HTML
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}
