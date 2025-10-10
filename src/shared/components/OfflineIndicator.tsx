/**
 * Offline Indicator Component
 * 
 * Displays a banner when the user loses internet connection.
 * Automatically shows/hides based on network status.
 */

import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { useEffect, useState } from 'react';

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Track when we go offline
    if (!isOnline) {
      setWasOffline(true);
    }

    // Show "reconnected" message briefly when coming back online
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Show offline banner
  if (!isOnline) {
    return (
      <div 
        className="fixed bottom-0 left-0 right-0 bg-destructive text-destructive-foreground p-3 text-center z-50 shadow-lg animate-in slide-in-from-bottom duration-300"
        role="alert"
        aria-live="assertive"
      >
        <div className="container mx-auto flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">
            You are offline. Some features may not work.
          </span>
        </div>
      </div>
    );
  }

  // Show reconnected banner briefly
  if (showReconnected) {
    return (
      <div 
        className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-3 text-center z-50 shadow-lg animate-in slide-in-from-bottom duration-300"
        role="status"
        aria-live="polite"
      >
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Wifi className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">
            Back online!
          </span>
        </div>
      </div>
    );
  }

  return null;
};
