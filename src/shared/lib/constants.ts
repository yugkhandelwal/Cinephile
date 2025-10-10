/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values for better maintainability
 */

// ===== API & Network =====
export const API_CONSTANTS = {
  // TMDB API
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
  TMDB_BACKDROP_BASE: 'https://image.tmdb.org/t/p/w780',
  TMDB_ORIGINAL_IMAGE: 'https://image.tmdb.org/t/p/original',
  
  // Request Configuration
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY_MS: 1000, // 1 second
  MAX_RETRY_DELAY_MS: 30000, // 30 seconds
  RATE_LIMIT_DELAY_MS: 2000, // 2 seconds
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
  
  // Search
  SEARCH_MIN_LENGTH: 2,
  SEARCH_MAX_LENGTH: 100,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

// ===== UI & Animation Timings =====
export const UI_CONSTANTS = {
  // Animation Durations (ms)
  ANIMATION_FAST: 200,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
  ANIMATION_EXTRA_SLOW: 1000,
  
  // Toasts & Notifications
  TOAST_SUCCESS_DURATION_MS: 2000,
  TOAST_ERROR_DURATION_MS: 4000,
  
  // Loading States
  SKELETON_ANIMATION_DURATION_MS: 1500,
  
  // Hover Delays
  PREFETCH_DELAY_MS: 100,
  TOOLTIP_DELAY_MS: 500,
  
  // Focus & Transitions
  FOCUS_VISIBLE_OUTLINE_WIDTH: 2,
  THEME_TRANSITION_DURATION_MS: 200,
} as const;

// ===== React Query Configuration =====
export const QUERY_CONSTANTS = {
  STALE_TIME_MS: 60_000, // 1 minute
  CACHE_TIME_MS: 300_000, // 5 minutes
  RETRY_COUNT: 3,
  RETRY_DELAY_BASE_MS: 1000,
  RETRY_DELAY_MAX_MS: 30000,
} as const;

// ===== Authentication =====
export const AUTH_CONSTANTS = {
  SESSION_REFRESH_INTERVAL_MS: 50 * 60 * 1000, // 50 minutes
  TOKEN_EXPIRY_BUFFER_MS: 10 * 60 * 1000, // 10 minutes before expiry
} as const;

// ===== Layout & Responsive =====
export const LAYOUT_CONSTANTS = {
  // Grid & Card Layouts
  GRID_GAP: 6,
  CARD_BORDER_RADIUS: 12,
  MODAL_MAX_WIDTH: 768,
  
  // Navbar
  NAVBAR_HEIGHT: 64,
  NAVBAR_Z_INDEX: 50,
  
  // Breakpoints (matches Tailwind defaults)
  BREAKPOINT_SM: 640,
  BREAKPOINT_MD: 768,
  BREAKPOINT_LG: 1024,
  BREAKPOINT_XL: 1280,
  BREAKPOINT_2XL: 1536,
} as const;

// ===== Pagination & Lists =====
export const LIST_CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  MAX_VISIBLE_PAGES: 8,
  INFINITE_SCROLL_THRESHOLD: 0.8, // Load more when 80% scrolled
  MAX_SUGGESTIONS: 8,
  MAX_STREAMING_PROVIDERS: 8,
} as const;

// ===== Image Optimization =====
export const IMAGE_CONSTANTS = {
  POSTER_ASPECT_RATIO: 2 / 3, // 0.666...
  BACKDROP_ASPECT_RATIO: 16 / 9, // 1.777...
  THUMBNAIL_WIDTH: 92,
  POSTER_SMALL_WIDTH: 185,
  POSTER_MEDIUM_WIDTH: 342,
  POSTER_LARGE_WIDTH: 500,
  BACKDROP_SMALL_WIDTH: 300,
  BACKDROP_MEDIUM_WIDTH: 780,
  BACKDROP_LARGE_WIDTH: 1280,
  LAZY_LOAD_ROOT_MARGIN: '200px',
} as const;

// ===== Content Ratings =====
export const RATING_CONSTANTS = {
  MIN_RATING: 0,
  MAX_RATING: 10,
  RATING_DECIMALS: 1,
  HIGH_RATING_THRESHOLD: 7.5,
  MEDIUM_RATING_THRESHOLD: 6.0,
} as const;

// ===== Validation =====
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_EMAIL_LENGTH: 255,
  MAX_USERNAME_LENGTH: 50,
  MAX_SEARCH_QUERY_LENGTH: 100,
  MIN_SEARCH_QUERY_LENGTH: 2,
} as const;

// ===== Feature Flags =====
export const FEATURE_FLAGS = {
  ENABLE_RECOMMENDATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PREFETCH: true,
  ENABLE_IMAGE_OPTIMIZATION: true,
  ENABLE_PERFORMANCE_MONITORING: true,
} as const;

// ===== URLs & Paths =====
export const URL_CONSTANTS = {
  BASE_URL: 'https://cinephile.app',
  API_BASE_URL: 'https://api.themoviedb.org/3',
  
  // Routes
  ROUTE_HOME: '/',
  ROUTE_MOVIES: '/movies',
  ROUTE_TV_SHOWS: '/tv-shows',
  ROUTE_WATCHLIST: '/watchlist',
  ROUTE_SEARCH: '/search',
  ROUTE_AUTH: '/auth',
  ROUTE_RECOMMENDATIONS: '/recommendations',
  ROUTE_TITLE: '/title/:type/:id',
} as const;

// ===== Error Messages =====
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'Something went wrong. Please try again.',
  AUTH_ERROR: 'Authentication failed. Please sign in again.',
  NOT_FOUND: 'The requested content was not found.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  GENERIC: 'An unexpected error occurred.',
} as const;

// ===== Success Messages =====
export const SUCCESS_MESSAGES = {
  WATCHLIST_ADDED: 'Added to watchlist',
  WATCHLIST_REMOVED: 'Removed from watchlist',
  LIKED: 'Liked successfully',
  UNLIKED: 'Removed like',
  SHARE_COPIED: 'Link copied to clipboard',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// Export all constants as a single object for easier imports
export const CONSTANTS = {
  API: API_CONSTANTS,
  UI: UI_CONSTANTS,
  QUERY: QUERY_CONSTANTS,
  AUTH: AUTH_CONSTANTS,
  LAYOUT: LAYOUT_CONSTANTS,
  LIST: LIST_CONSTANTS,
  IMAGE: IMAGE_CONSTANTS,
  RATING: RATING_CONSTANTS,
  VALIDATION: VALIDATION_CONSTANTS,
  FEATURES: FEATURE_FLAGS,
  URL: URL_CONSTANTS,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
} as const;

// Type exports for better TypeScript support
export type ApiConstants = typeof API_CONSTANTS;
export type UiConstants = typeof UI_CONSTANTS;
export type QueryConstants = typeof QUERY_CONSTANTS;
export type Constants = typeof CONSTANTS;
