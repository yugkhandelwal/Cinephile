/**
 * Performance Monitoring Library
 * 
 * Tracks Core Web Vitals and provides performance insights.
 * Measures: LCP, FID, CLS, FCP, TTFB, INP
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

type MetricCallback = (metric: PerformanceMetric) => void;

/**
 * Thresholds for Core Web Vitals
 * Based on Google's recommended values
 */
const THRESHOLDS = {
  // Largest Contentful Paint (milliseconds)
  LCP: { good: 2500, poor: 4000 },
  // First Input Delay (milliseconds)
  FID: { good: 100, poor: 300 },
  // Cumulative Layout Shift (score)
  CLS: { good: 0.1, poor: 0.25 },
  // First Contentful Paint (milliseconds)
  FCP: { good: 1800, poor: 3000 },
  // Time to First Byte (milliseconds)
  TTFB: { good: 800, poor: 1800 },
  // Interaction to Next Paint (milliseconds)
  INP: { good: 200, poor: 500 },
} as const;

/**
 * Get rating based on thresholds
 */
const getRating = (
  metricName: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metricName];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Create a standardized metric object
 */
const createMetric = (
  name: string,
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor'
): PerformanceMetric => {
  return {
    name,
    value,
    rating,
    timestamp: Date.now(),
  };
};

/**
 * Log metric to console (development) and external service (production)
 */
const reportMetric = (metric: PerformanceMetric, callback?: MetricCallback) => {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`
    );
  }

  // Send to analytics in production
  if (callback) {
    callback(metric);
  }

  // Example: Send to Google Analytics, Sentry, or custom backend
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.value),
  //     metric_rating: metric.rating,
  //   });
  // }
};

/**
 * Measure Largest Contentful Paint (LCP)
 * Measures loading performance - should occur within 2.5s
 */
export const measureLCP = (callback?: MetricCallback): void => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime;
        const metric = createMetric('LCP', value, getRating('LCP', value));
        reportMetric(metric, callback);
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    console.warn('LCP measurement failed:', error);
  }
};

/**
 * Measure First Input Delay (FID)
 * Measures interactivity - should occur within 100ms
 */
export const measureFID = (callback?: MetricCallback): void => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as any[];
      
      entries.forEach((entry) => {
        const value = entry.processingStart - entry.startTime;
        const metric = createMetric('FID', value, getRating('FID', value));
        reportMetric(metric, callback);
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  } catch (error) {
    console.warn('FID measurement failed:', error);
  }
};

/**
 * Measure Cumulative Layout Shift (CLS)
 * Measures visual stability - should be less than 0.1
 */
export const measureCLS = (callback?: MetricCallback): void => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    let clsValue = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as any[];
      
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      const metric = createMetric('CLS', clsValue, getRating('CLS', clsValue));
      reportMetric(metric, callback);
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    // Report final CLS when page is hidden
    const reportFinal = () => {
      const metric = createMetric('CLS', clsValue, getRating('CLS', clsValue));
      reportMetric(metric, callback);
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportFinal();
      }
    });

    window.addEventListener('pagehide', reportFinal);
  } catch (error) {
    console.warn('CLS measurement failed:', error);
  }
};

/**
 * Measure First Contentful Paint (FCP)
 * Measures perceived load speed - should occur within 1.8s
 */
export const measureFCP = (callback?: MetricCallback): void => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');

      if (fcpEntry) {
        const value = fcpEntry.startTime;
        const metric = createMetric('FCP', value, getRating('FCP', value));
        reportMetric(metric, callback);
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch (error) {
    console.warn('FCP measurement failed:', error);
  }
};

/**
 * Measure Time to First Byte (TTFB)
 * Measures server response time - should occur within 800ms
 */
export const measureTTFB = (callback?: MetricCallback): void => {
  if (typeof window === 'undefined') return;

  try {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const value = navigation.responseStart - navigation.requestStart;
        const metric = createMetric('TTFB', value, getRating('TTFB', value));
        reportMetric(metric, callback);
      }
    });
  } catch (error) {
    console.warn('TTFB measurement failed:', error);
  }
};

/**
 * Measure Interaction to Next Paint (INP)
 * Measures responsiveness - should occur within 200ms
 */
export const measureINP = (callback?: MetricCallback): void => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    let maxDuration = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as any[];
      
      entries.forEach((entry) => {
        const duration = entry.processingStart - entry.startTime + entry.duration;
        maxDuration = Math.max(maxDuration, duration);
      });

      if (maxDuration > 0) {
        const metric = createMetric('INP', maxDuration, getRating('INP', maxDuration));
        reportMetric(metric, callback);
      }
    });

    observer.observe({ type: 'event', buffered: true } as any);
  } catch (error) {
    // INP might not be supported in all browsers
    console.warn('INP measurement not supported');
  }
};

/**
 * Measure all Core Web Vitals
 */
export const measureAllMetrics = (callback?: MetricCallback): void => {
  measureLCP(callback);
  measureFID(callback);
  measureCLS(callback);
  measureFCP(callback);
  measureTTFB(callback);
  measureINP(callback);
};

/**
 * Get navigation timing information
 */
export const getNavigationTiming = (): Record<string, number> | null => {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;

  return {
    // DNS lookup
    dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    // TCP connection
    tcpConnection: navigation.connectEnd - navigation.connectStart,
    // SSL negotiation
    sslNegotiation: navigation.secureConnectionStart > 0 
      ? navigation.connectEnd - navigation.secureConnectionStart 
      : 0,
    // Server response
    serverResponse: navigation.responseEnd - navigation.requestStart,
    // DOM processing
    domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
    // Resource loading
    resourceLoading: navigation.loadEventStart - navigation.domContentLoadedEventEnd,
    // Total page load
    totalPageLoad: navigation.loadEventEnd - navigation.fetchStart,
  };
};

/**
 * Monitor resource loading performance
 */
export const monitorResources = (): void => {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach((entry) => {
      const resource = entry as PerformanceResourceTiming;
      
      // Log slow resources (> 1 second)
      if (resource.duration > 1000) {
        console.warn(`Slow resource: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
};

/**
 * Clear performance marks and measures
 */
export const clearPerformanceData = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    performance.clearMarks();
    performance.clearMeasures();
  } catch (error) {
    console.warn('Failed to clear performance data:', error);
  }
};

/**
 * Create a performance mark
 */
export const mark = (name: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    performance.mark(name);
  } catch (error) {
    console.warn(`Failed to create mark "${name}":`, error);
  }
};

/**
 * Measure between two marks
 */
export const measure = (name: string, startMark: string, endMark: string): number | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name, 'measure')[0];
    return measure?.duration || null;
  } catch (error) {
    console.warn(`Failed to measure "${name}":`, error);
    return null;
  }
};
