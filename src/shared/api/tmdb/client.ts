import type { TmdbMovie, TmdbResponse, TmdbSearchResult, WatchProviderResponse, WatchProviderRegion } from "./types";
import { ApiError, RateLimitError, TimeoutError, NetworkError } from "@/shared/lib/errors";

const TMDB_READ_TOKEN = (import.meta.env as any).VITE_TMDB_READ_TOKEN as string | undefined;
const TMDB_API_KEY = (import.meta.env as any).VITE_TMDB_API_KEY as string | undefined; // v3 key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";

// Configuration for retry logic and rate limiting
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const RATE_LIMIT_DELAY = 2000; // 2 seconds between rate limit retries

if (!TMDB_READ_TOKEN && !TMDB_API_KEY) {
  console.warn("TMDb credentials missing. Set VITE_TMDB_READ_TOKEN (v4) or VITE_TMDB_API_KEY (v3). Requests will fail.");
}

/**
 * Custom error class for TMDb API errors
 * @deprecated Use ApiError from @/lib/errors instead
 */
class TmdbApiError extends ApiError {
  constructor(
    message: string,
    statusCode: number,
    endpoint: string
  ) {
    super(message, statusCode, endpoint);
    this.name = 'TmdbApiError';
  }
}

/**
 * Sleep utility for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number, isRateLimit: boolean): number {
  if (isRateLimit) {
    return RATE_LIMIT_DELAY * (attempt + 1);
  }
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY);
}

function buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  const search = new URLSearchParams({ language: "en-US", ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) });
  // If using v3 key, append it as api_key
  if (!TMDB_READ_TOKEN && TMDB_API_KEY) {
    search.set("api_key", TMDB_API_KEY);
  }
  url.search = search.toString();
  return url;
}

/**
 * Enhanced fetch with retry logic, exponential backoff, and rate limiting
 */
async function tmdbFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = buildUrl(path, params);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json;charset=utf-8",
        Accept: "application/json",
      };
      if (TMDB_READ_TOKEN) headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(url.toString(), { 
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle successful response
      if (res.ok) {
        return res.json() as Promise<T>;
      }

      // Handle rate limiting (429)
      if (res.status === 429) {
        if (attempt < MAX_RETRIES - 1) {
          const delay = getRetryDelay(attempt, true);
          console.warn(`TMDb rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }
        // Last attempt - throw rate limit error
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60');
        throw new RateLimitError('TMDb API rate limit exceeded. Please try again later.', retryAfter);
      }

      // Handle server errors (500-599) - retry these
      if (res.status >= 500) {
        if (attempt < MAX_RETRIES - 1) {
          const delay = getRetryDelay(attempt, false);
          console.warn(`TMDb server error ${res.status}. Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }
        // Last attempt - throw API error
        const text = await res.text();
        throw new ApiError(`TMDb server error: ${text || res.statusText}`, res.status, path);
      }

      // Handle client errors (400-499) - don't retry these (except 429)
      const text = await res.text();
      throw new ApiError(`TMDb API error: ${text || res.statusText}`, res.status, path);

    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort or network errors on last attempt
      if (attempt === MAX_RETRIES - 1) {
        break;
      }

      // Handle timeout errors with retry
      if (error instanceof Error && error.name === 'AbortError') {
        const delay = getRetryDelay(attempt, false);
        console.warn(`Request timeout. Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        continue;
      }

      // Handle network errors with retry
      if (error instanceof Error && error.message.includes('fetch')) {
        const delay = getRetryDelay(attempt, false);
        console.warn(`Network error: ${error.message}. Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        continue;
      }

      // Don't retry ApiError (client errors)
      if (error instanceof ApiError && error.statusCode < 500) {
        throw error;
      }

      // Retry for other errors
      if (attempt < MAX_RETRIES - 1) {
        const delay = getRetryDelay(attempt, false);
        await sleep(delay);
        continue;
      }
    }
  }

  // If we've exhausted all retries, throw appropriate error
  if (lastError) {
    // Convert generic errors to our error types
    if (lastError instanceof Error) {
      if (lastError.name === 'AbortError') {
        throw new TimeoutError('TMDb request timed out after multiple attempts');
      }
      if (lastError.message.includes('fetch') || lastError.message.includes('network')) {
        throw new NetworkError('Unable to reach TMDb servers. Please check your connection.');
      }
    }
    throw lastError;
  }

  throw new ApiError('TMDb request failed after all retries', 500, path);
}

export function toPoster(urlPart: string | null): string {
  if (!urlPart) return "/placeholder.svg";
  if (urlPart.startsWith("http")) return urlPart;
  return `${TMDB_IMAGE_BASE}${urlPart}`;
}

export function toBackdrop(urlPart: string | null): string {
  if (!urlPart) return "/placeholder.svg";
  if (urlPart.startsWith("http")) return urlPart;
  return `${TMDB_BACKDROP_BASE}${urlPart}`;
}

export function toTitle(item: TmdbMovie | TmdbSearchResult): string {
  return item.title || item.name || item.original_title || item.original_name || "Untitled";
}

export function toYear(item: TmdbMovie | TmdbSearchResult): string {
  const date = item.release_date || item.first_air_date || "";
  return date ? new Date(date).getFullYear().toString() : "";
}

export const tmdb = {
  movies: {
    popular: (page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/movie/popular", { page }),
    trending: (page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/trending/movie/week", { page }),
    nowPlaying: (page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/movie/now_playing", { page }),
    upcoming: (page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/movie/upcoming", { page }),
    search: (query: string, page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/search/movie", { query, page, include_adult: 0 }),
    details: (id: number) => tmdbFetch<TmdbMovie>(`/movie/${id}`),
    detailsWithExtras: (id: number) =>
      tmdbFetch<TmdbMovie>(`/movie/${id}`, {
        append_to_response: "videos,credits,images,recommendations,watch/providers",
        include_image_language: "en,null",
      }),
    recommendations: (id: number, page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>(`/movie/${id}/recommendations`, { page }),
    providers: (id: number) => tmdbFetch<any>(`/movie/${id}/watch/providers`),
  },
  tv: {
    popular: (page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/tv/popular", { page }),
    trending: (page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/trending/tv/week", { page }),
    onTheAir: (page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/tv/on_the_air", { page }),
    search: (query: string, page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/search/tv", { query, page, include_adult: 0 }),
    details: (id: number) => tmdbFetch<TmdbMovie>(`/tv/${id}`),
    detailsWithExtras: (id: number) =>
      tmdbFetch<TmdbMovie>(`/tv/${id}`, {
        append_to_response: "videos,credits,images,recommendations,watch/providers",
        include_image_language: "en,null",
      }),
    season: (id: number, seasonNumber: number) => tmdbFetch<any>(`/tv/${id}/season/${seasonNumber}`),
    recommendations: (id: number, page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>(`/tv/${id}/recommendations`, { page }),
    providers: (id: number) => tmdbFetch<any>(`/tv/${id}/watch/providers`),
  },
  multi: {
    search: (query: string, page = 1) => tmdbFetch<TmdbResponse<TmdbMovie>>("/search/multi", { query, page, include_adult: 0 }),
  },
  genres: {
    movie: () => tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/movie/list"),
    tv: () => tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/tv/list"),
  },
  discover: {
    movie: (params: { page?: number; sort_by?: string; with_genres?: string }) =>
      tmdbFetch<TmdbResponse<TmdbMovie>>("/discover/movie", params as any),
    tv: (params: { page?: number; sort_by?: string; with_genres?: string }) =>
      tmdbFetch<TmdbResponse<TmdbMovie>>("/discover/tv", params as any),
  },
};

export function pickRegionProvider(providers: WatchProviderResponse | undefined, region: string): WatchProviderRegion | null {
  try {
    return providers?.results?.[region] ?? null;
  } catch {
    return null;
  }
}
