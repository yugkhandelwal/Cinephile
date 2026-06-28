import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect } from "react";
const Index = lazy(() => import("./features/home/Index"));
const Movies = lazy(() => import("./features/movies/Movies"));
const TVShows = lazy(() => import("./features/tv-shows/TVShows"));
const Watchlist = lazy(() => import("./features/watchlist/Watchlist"));
const NotFound = lazy(() => import("./shared/components/NotFound"));
const Search = lazy(() => import("./features/search/Search"));
const Title = lazy(() => import("./features/movies/Title"));
const AccountSettings = lazy(() => import("./features/account/AccountSettings"));
import { AuthProvider } from "./context/AuthProvider";
import Auth from "./features/auth/Auth";
import Recommendations from "./features/movies/Recommendations";
import { RatingsProvider } from "./context/RatingsProvider";
import Analytics from "./shared/components/Analytics";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { RouteErrorBoundary } from "./shared/components/RouteErrorBoundary";
import { measureAllMetrics } from "./shared/lib/performance";
import { OfflineIndicator } from "./shared/components/OfflineIndicator";
import { setupPersistentCache } from "./shared/lib/persistentCache";

// Configure React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      gcTime: 300_000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => {
  // Initialize performance monitoring and persistent cache on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set up persistent caching
      setupPersistentCache(queryClient);
      
      // Initialize performance monitoring
      measureAllMetrics((metric) => {
        // In production, send metrics to your analytics service
        // Example: analytics.track('performance', metric);
        console.log('Performance metric:', metric);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <RatingsProvider>
              <BrowserRouter>
              <ErrorBoundary
                onError={(error, errorInfo) => {
                  // Log errors in production to monitoring service
                  console.error('App Error:', error, errorInfo);
                }}
              >
                <Suspense fallback={<div className="pt-24 container mx-auto px-4">Loading…</div>}>
                  <Analytics />
                  <OfflineIndicator />
                  <Routes>
                    <Route path="/" element={<RouteErrorBoundary routeName="Home"><Index /></RouteErrorBoundary>} />
                    <Route path="/movies" element={<RouteErrorBoundary routeName="Movies"><Movies /></RouteErrorBoundary>} />
                    <Route path="/tv-shows" element={<RouteErrorBoundary routeName="TV Shows"><TVShows /></RouteErrorBoundary>} />
                    <Route path="/watchlist" element={<RouteErrorBoundary routeName="Watchlist"><Watchlist /></RouteErrorBoundary>} />
                    <Route path="/search" element={<RouteErrorBoundary routeName="Search"><Search /></RouteErrorBoundary>} />
                    <Route path="/title/:type/:id" element={<RouteErrorBoundary routeName="Title"><Title /></RouteErrorBoundary>} />
                    <Route path="/auth" element={<RouteErrorBoundary routeName="Auth"><Auth /></RouteErrorBoundary>} />
                    <Route path="/recommendations" element={<RouteErrorBoundary routeName="Recommendations"><Recommendations /></RouteErrorBoundary>} />
                    <Route path="/account" element={<RouteErrorBoundary routeName="Account Settings"><AccountSettings /></RouteErrorBoundary>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<RouteErrorBoundary routeName="Not Found"><NotFound /></RouteErrorBoundary>} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </RatingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
