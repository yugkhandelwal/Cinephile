/**
 * Online Status Hook
 * 
 * Tracks the user's network connection status and provides real-time updates.
 * Useful for showing offline indicators and handling offline scenarios.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Hook to track online/offline status
 * Uses the browser's navigator.onLine API with event listeners
 */
export const useOnlineStatus = (): boolean => {
  // Initialize with current online status
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') return;

    // Update state when connection status changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Alternative implementation using useSyncExternalStore (React 18+)
 * More performant for frequent updates
 */
export const useOnlineStatusSync = (): boolean => {
  if (typeof window === 'undefined') {
    return true; // Assume online during SSR
  }

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
};

// Subscribe to online/offline events
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

// Get current online status
function getSnapshot() {
  return navigator.onLine;
}

// Assume online during server-side rendering
function getServerSnapshot() {
  return true;
}

/**
 * Hook with additional connection quality detection
 * Returns both online status and connection type
 */
export interface ConnectionInfo {
  isOnline: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number; // Megabits per second
  rtt?: number; // Round-trip time in milliseconds
  saveData?: boolean; // User has data saver enabled
}

export const useConnectionInfo = (): ConnectionInfo => {
  const isOnline = useOnlineStatus();
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({ isOnline });

  useEffect(() => {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
      return;
    }

    // TypeScript doesn't have NetworkInformation types by default
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) return;

    const updateConnectionInfo = () => {
      setConnectionInfo({
        isOnline,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    };

    updateConnectionInfo();

    // Listen for connection changes
    connection.addEventListener('change', updateConnectionInfo);

    return () => {
      connection.removeEventListener('change', updateConnectionInfo);
    };
  }, [isOnline]);

  return connectionInfo;
};

/**
 * Hook to detect slow connections
 * Returns true if connection is slow (2g or slower)
 */
export const useIsSlowConnection = (): boolean => {
  const { effectiveType } = useConnectionInfo();
  return effectiveType === 'slow-2g' || effectiveType === '2g';
};

/**
 * Hook to detect if user has data saver enabled
 */
export const useDataSaverEnabled = (): boolean => {
  const { saveData } = useConnectionInfo();
  return saveData === true;
};
