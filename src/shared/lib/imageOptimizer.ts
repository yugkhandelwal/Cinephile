/**
 * Image Optimization Library
 * 
 * Provides utilities for optimizing image loading and display performance.
 * Includes responsive image sizing, lazy loading, and TMDb-specific optimizations.
 */

/**
 * TMDb image size options
 * https://developers.themoviedb.org/3/getting-started/images
 */
export const TMDB_IMAGE_SIZES = {
  backdrop: ['w300', 'w780', 'w1280', 'original'] as const,
  poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'] as const,
  profile: ['w45', 'w185', 'h632', 'original'] as const,
  still: ['w92', 'w185', 'w300', 'original'] as const,
  logo: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'] as const,
} as const;

type ImageType = keyof typeof TMDB_IMAGE_SIZES;
type ImageSize<T extends ImageType> = typeof TMDB_IMAGE_SIZES[T][number];

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Get optimized TMDb image URL for specific size
 */
export const getTmdbImageUrl = <T extends ImageType>(
  path: string | null,
  type: T,
  size: ImageSize<T> = 'w500' as ImageSize<T>
): string => {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

/**
 * Get responsive srcSet for TMDb images
 * Automatically generates multiple sizes for responsive loading
 */
export const getTmdbImageSrcSet = (
  path: string | null,
  type: ImageType
): string => {
  if (!path) return '';

  const sizes = TMDB_IMAGE_SIZES[type];
  
  // Generate srcSet with appropriate sizes and widths
  return sizes
    .filter(size => size !== 'original') // Exclude original for performance
    .map(size => {
      const width = parseInt(size.slice(1)) || 500;
      return `${TMDB_IMAGE_BASE}/${size}${path} ${width}w`;
    })
    .join(', ');
};

/**
 * Get optimal image size based on container width
 * Helps select the best TMDb image size for a given display width
 */
export const getOptimalTmdbSize = <T extends ImageType>(
  containerWidth: number,
  type: T,
  devicePixelRatio: number = window.devicePixelRatio || 1
): ImageSize<T> => {
  const targetWidth = containerWidth * devicePixelRatio;
  const sizes = TMDB_IMAGE_SIZES[type];

  // Find the smallest size that's larger than the target
  for (const size of sizes) {
    if (size === 'original') continue;
    const width = parseInt(size.slice(1));
    if (width >= targetWidth) {
      return size as ImageSize<T>;
    }
  }

  // If all sizes are smaller, return the largest (but not original)
  return sizes[sizes.length - 2] as ImageSize<T>;
};

/**
 * Generate sizes attribute for responsive images
 * Provides hints to browser about image display size
 */
export const getImageSizes = (
  breakpoints: { maxWidth: number; size: string }[]
): string => {
  return breakpoints
    .map(({ maxWidth, size }) => `(max-width: ${maxWidth}px) ${size}`)
    .join(', ');
};

/**
 * Common responsive sizes for movie cards
 */
export const MOVIE_CARD_SIZES = getImageSizes([
  { maxWidth: 640, size: '50vw' },     // Mobile: half width
  { maxWidth: 768, size: '33vw' },     // Tablet: third width
  { maxWidth: 1024, size: '25vw' },    // Desktop: quarter width
  { maxWidth: 1536, size: '20vw' },    // Large: fifth width
]);

/**
 * Common responsive sizes for hero/backdrop images
 */
export const HERO_IMAGE_SIZES = getImageSizes([
  { maxWidth: 640, size: '100vw' },    // Mobile: full width
  { maxWidth: 1024, size: '100vw' },   // Tablet: full width
  { maxWidth: 1920, size: '100vw' },   // Desktop: full width
]);

/**
 * Common responsive sizes for detail page posters
 */
export const DETAIL_POSTER_SIZES = getImageSizes([
  { maxWidth: 640, size: '100vw' },    // Mobile: full width
  { maxWidth: 768, size: '40vw' },     // Tablet: 40%
  { maxWidth: 1024, size: '30vw' },    // Desktop: 30%
]);

/**
 * Preload critical images
 * Use for above-the-fold images that should load immediately
 */
export const preloadImage = (url: string, priority: 'high' | 'low' = 'high'): void => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
};

/**
 * Create a blur placeholder data URL
 * Generates a tiny blurred version for progressive loading
 */
export const createBlurPlaceholder = (width: number = 10, height: number = 15): string => {
  // Simple SVG blur placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="blur">
        <feGaussianBlur stdDeviation="2"/>
      </filter>
      <rect width="100%" height="100%" fill="#1a1a2e" filter="url(#blur)"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Image loading states for progressive enhancement
 */
export type ImageLoadingState = 'loading' | 'loaded' | 'error';

/**
 * Get image with fallback
 * Returns the image URL or fallback if the image fails to load
 */
export const getImageWithFallback = (
  url: string | null,
  fallback: string = '/placeholder.svg'
): string => {
  return url || fallback;
};

/**
 * Check if browser supports WebP format
 * Can be used to serve WebP images to supporting browsers
 */
export const supportsWebP = (): Promise<boolean> => {
  if (typeof window === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
};

/**
 * Calculate aspect ratio padding for responsive images
 * Prevents layout shift by reserving space before image loads
 */
export const getAspectRatioPadding = (width: number, height: number): string => {
  return `${(height / width) * 100}%`;
};

/**
 * Standard aspect ratios for movie posters and backdrops
 */
export const ASPECT_RATIOS = {
  poster: { width: 2, height: 3 },      // 2:3 (common movie poster)
  backdrop: { width: 16, height: 9 },   // 16:9 (widescreen)
  square: { width: 1, height: 1 },      // 1:1 (square)
  profile: { width: 3, height: 4 },     // 3:4 (portrait)
} as const;

/**
 * Get padding for specific aspect ratio
 */
export const getAspectRatioPaddingByType = (type: keyof typeof ASPECT_RATIOS): string => {
  const { width, height } = ASPECT_RATIOS[type];
  return getAspectRatioPadding(width, height);
};

/**
 * Optimized image component props
 * Use these props for consistent image optimization across the app
 */
export interface OptimizedImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Get optimized image props for TMDb poster
 */
export const getPosterImageProps = (
  path: string | null,
  alt: string,
  priority: boolean = false
): OptimizedImageProps => {
  return {
    src: getTmdbImageUrl(path, 'poster', 'w500'),
    srcSet: getTmdbImageSrcSet(path, 'poster'),
    sizes: MOVIE_CARD_SIZES,
    alt,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    fetchPriority: priority ? 'high' : 'auto',
  };
};

/**
 * Get optimized image props for TMDb backdrop
 */
export const getBackdropImageProps = (
  path: string | null,
  alt: string,
  priority: boolean = false
): OptimizedImageProps => {
  return {
    src: getTmdbImageUrl(path, 'backdrop', 'w1280'),
    srcSet: getTmdbImageSrcSet(path, 'backdrop'),
    sizes: HERO_IMAGE_SIZES,
    alt,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    fetchPriority: priority ? 'high' : 'auto',
  };
};
