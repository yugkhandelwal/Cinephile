import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing async operations with automatic cleanup
 * Prevents state updates on unmounted components
 * 
 * @example
 * const safeFetch = useSafeAsync();
 * 
 * useEffect(() => {
 *   safeFetch(async () => {
 *     const data = await fetchData();
 *     setState(data);
 *   });
 * }, []);
 */
export function useSafeAsync() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeFetch = useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T | undefined> => {
    try {
      const result = await asyncFn();
      if (isMountedRef.current) {
        return result;
      }
    } catch (error) {
      if (isMountedRef.current) {
        throw error;
      }
    }
    return undefined;
  }, []);

  return safeFetch;
}

/**
 * Custom hook for managing timeouts with automatic cleanup
 * 
 * @example
 * const setTimeout = useSafeTimeout();
 * setTimeout(() => console.log('Hello'), 1000);
 */
export function useSafeTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
    return timeoutRef.current;
  }, []);

  const clearSafeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { setTimeout: setSafeTimeout, clearTimeout: clearSafeTimeout };
}

/**
 * Custom hook for managing intervals with automatic cleanup
 * 
 * @example
 * const { setInterval, clearInterval } = useSafeInterval();
 * setInterval(() => console.log('Tick'), 1000);
 */
export function useSafeInterval() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const setSafeInterval = useCallback((callback: () => void, delay: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(callback, delay);
    return intervalRef.current;
  }, []);

  const clearSafeInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { setInterval: setSafeInterval, clearInterval: clearSafeInterval };
}

/**
 * Custom hook for managing event listeners with automatic cleanup
 * 
 * @example
 * useEventListener('resize', () => console.log('Resized'), window);
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement = window,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
    element.addEventListener(eventName, eventListener, options);

    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Custom hook for managing fetch requests with AbortController
 * Automatically aborts pending requests on unmount or when dependencies change
 * 
 * @example
 * const { data, loading, error } = useFetchWithAbort(
 *   async (signal) => {
 *     const response = await fetch(url, { signal });
 *     return response.json();
 *   },
 *   [url]
 * );
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getSignal = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    return abortControllerRef.current.signal;
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
    }
  }, []);

  return { getSignal, abort };
}

/**
 * Hook to track if component is mounted
 * Useful for preventing state updates on unmounted components
 */
export function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}
