import { useState, useEffect, useCallback } from 'react';

export interface ContinueWatchingItem {
  id: string; // e.g., "movie-123", "tv-456", "anime-789"
  mediaType: "movie" | "tv" | "anime";
  contentId: number;
  seasonNumber?: number;
  episodeNumber?: number;
  serverId?: string;
  audioLanguage?: string;
  subtitleLanguage?: string;
  currentTime: number;
  duration: number; // 0 if unknown
  progressPercentage: number;
  title: string;
  posterUrl?: string;
  backdropUrl?: string;
  lastWatchedAt: number;
}

const STORAGE_KEY = 'cinephile_continue_watching';
const MAX_ITEMS = 30; // Max items to keep in history

export function useContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  const loadItems = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Failed to load continue watching data", e);
    }
  }, []);

  // Load from local storage and listen for changes
  useEffect(() => {
    loadItems();

    // Listen for cross-tab updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadItems();
      }
    };

    // Listen for same-tab updates (via custom event)
    const handleCustomEvent = () => {
      loadItems();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('continue-watching-sync', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('continue-watching-sync', handleCustomEvent);
    };
  }, [loadItems]);

  const saveProgress = useCallback((item: Omit<ContinueWatchingItem, 'lastWatchedAt' | 'id'>) => {
    setItems((prev) => {
      const id = `${item.mediaType}-${item.contentId}`;
      const existingIdx = prev.findIndex(i => i.id === id);
      
      const newItem: ContinueWatchingItem = {
        ...item,
        id,
        lastWatchedAt: Date.now(),
      };

      let newItems = [...prev];
      if (existingIdx >= 0) {
        newItems[existingIdx] = newItem;
      } else {
        newItems.unshift(newItem);
      }

      // Sort by most recently watched
      newItems.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
      
      // Keep only top MAX_ITEMS
      newItems = newItems.slice(0, MAX_ITEMS);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        window.dispatchEvent(new Event('continue-watching-sync'));
      } catch (e) {
        console.error("Failed to save continue watching data", e);
      }

      return newItems;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const newItems = prev.filter(i => i.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        window.dispatchEvent(new Event('continue-watching-sync'));
      } catch (e) {
        console.error("Failed to save continue watching data", e);
      }
      return newItems;
    });
  }, []);

  const getItem = useCallback((id: string) => {
    return items.find(i => i.id === id);
  }, [items]);

  return {
    items,
    saveProgress,
    removeItem,
    getItem
  };
}
