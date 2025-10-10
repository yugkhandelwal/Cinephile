import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

/**
 * Create a persister that uses localStorage
 */
export const createPersister = () => {
  if (typeof window === 'undefined') {
    return null; // Don't persist on server-side
  }

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: 'CINEPHILE_QUERY_CACHE',
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    // Throttle writes to prevent performance issues
    throttleTime: 1000,
  });
};

/**
 * Set up persistent caching for a QueryClient
 */
export const setupPersistentCache = (queryClient: QueryClient) => {
  const persister = createPersister();

  if (!persister) return;

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    buster: 'v1', // Increment to invalidate all cached data
    // Only persist successful queries
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        const queryState = query.state;
        return queryState.status === 'success';
      },
    },
  });
};

/**
 * Clear all persistent cache
 */
export const clearPersistentCache = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('CINEPHILE_QUERY_CACHE');
    console.log('Persistent cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

/**
 * Get cache size in MB
 */
export const getCacheSize = (): number => {
  if (typeof window === 'undefined') return 0;
  
  try {
    const cache = localStorage.getItem('CINEPHILE_QUERY_CACHE');
    if (!cache) return 0;
    return new Blob([cache]).size / (1024 * 1024); // Convert to MB
  } catch {
    return 0;
  }
};

/**
 * Check if cache is approaching storage limit
 */
export const isCacheNearLimit = (): boolean => {
  const sizeInMB = getCacheSize();
  return sizeInMB > 4; // Warn if > 4MB (localStorage typically 5-10MB)
};
