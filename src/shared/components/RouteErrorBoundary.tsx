import { ErrorBoundary } from './ErrorBoundary';
import { ReactNode } from 'react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
}

/**
 * Wrapper component for individual route error boundaries
 * Provides route-specific error handling without crashing the entire app
 */
export const RouteErrorBoundary = ({ children, routeName }: RouteErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log route-specific errors for better debugging
        console.error(`Error in ${routeName} route:`, error, errorInfo);
        
        // In production, send to analytics with route context
        if (import.meta.env.PROD) {
          // Example: Send to monitoring service
          // analytics.trackError({ route: routeName, error, errorInfo });
        }
      }}
      showDetails={import.meta.env.DEV} // Show error details only in development
    >
      {children}
    </ErrorBoundary>
  );
};
