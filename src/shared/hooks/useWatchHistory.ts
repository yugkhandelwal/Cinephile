import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  year?: string;
  rating?: number;
  imageUrl?: string | null;
  timestamp: number;
}

const HISTORY_KEY = 'cinephile_watch_history';
const MAX_HISTORY_ITEMS = 20;

export function useWatchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load watch history", e);
    }
  }, []);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'timestamp'>) => {
    setHistory((prev) => {
      // Remove the item if it already exists to avoid duplicates
      const filtered = prev.filter(
        (h) => !(h.id === item.id && h.mediaType === item.mediaType)
      );
      
      // Add the new item at the beginning with current timestamp
      const newHistory = [
        { ...item, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY_ITEMS); // Cap at max items
      
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save watch history", e);
      }
      
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const removeFromHistory = useCallback((id: number, mediaType: "movie" | "tv") => {
    setHistory((prev) => {
      const newHistory = prev.filter(
        (h) => !(h.id === id && h.mediaType === mediaType)
      );
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save watch history", e);
      }
      return newHistory;
    });
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
