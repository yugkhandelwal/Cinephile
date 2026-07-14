import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

const Landing = lazy(() => import("./features/landing/Landing"));
const Index = lazy(() => import("./features/home/Index"));
const Movies = lazy(() => import("./features/movies/Movies"));
const TVShows = lazy(() => import("./features/tv-shows/TVShows"));
const Watchlist = lazy(() => import("./features/watchlist/Watchlist"));
const NotFound = lazy(() => import("./shared/components/NotFound"));
const Search = lazy(() => import("./features/search/Search"));
const Title = lazy(() => import("./features/movies/Title"));
const Player = lazy(() => import("./features/player/Player"));
const AccountSettings = lazy(() => import("./features/account/AccountSettings"));

// Anime Routes
const AnimeHome = lazy(() => import("./features/anime/home/AnimeHome"));
const AnimeSearch = lazy(() => import("./features/anime/AnimeSearch"));
const AnimeBrowse = lazy(() => import("./features/anime/AnimeBrowse"));
const AnimeSeasonal = lazy(() => import("./features/anime/AnimeSeasonal"));
const AnimeDetails = lazy(() => import("./features/anime/AnimeDetails"));
const AnimePlayer = lazy(() => import("./features/anime/AnimePlayer"));

import { AuthProvider } from "./context/AuthProvider";
import { RatingsProvider } from "./context/RatingsProvider";
import { SearchProvider } from "./context/SearchProvider";
import { ContentModeProvider } from "./context/ContentModeProvider";
import Auth from "./features/auth/Auth";
import Recommendations from "./features/movies/Recommendations";
import Analytics from "./shared/components/Analytics";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { RouteErrorBoundary } from "./shared/components/RouteErrorBoundary";
import { measureAllMetrics } from "./shared/lib/performance";
import { OfflineIndicator } from "./shared/components/OfflineIndicator";
import { setupPersistentCache } from "./shared/lib/persistentCache";
import { ScrollToTop } from "./shared/components/ScrollToTop";
import Navbar from "@/shared/components/layout/Navbar";
import { PageTransition } from "./shared/components/PageTransition";
import { PullToRefresh } from "./shared/components/PullToRefresh";

// Configure React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours (reset daily)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Activate persistent caching for instant loads across reloads
setupPersistentCache(queryClient);

const GlobalLoader = () => (
  <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999] animate-fade-in">
    <div className="relative w-20 h-20 flex items-center justify-center mb-8">
      <div className="absolute inset-0 border-t-2 border-primary border-solid rounded-full animate-spin" />
      <div className="absolute inset-2 border-r-2 border-primary/60 border-solid rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
      <div className="absolute inset-4 border-b-2 border-primary/30 border-solid rounded-full animate-spin" />
    </div>
    <div className="text-primary font-bold tracking-widest text-sm animate-pulse">CINEPHILE</div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><RouteErrorBoundary routeName="Landing"><Landing /></RouteErrorBoundary></PageTransition>} />
        <Route path="/home" element={<PageTransition><RouteErrorBoundary routeName="Home"><Index /></RouteErrorBoundary></PageTransition>} />
        
        {/* Flattened Anime Routes */}
        <Route path="/anime" element={<PageTransition><RouteErrorBoundary routeName="Anime Home"><AnimeHome /></RouteErrorBoundary></PageTransition>} />
        <Route path="/anime/seasonal" element={<PageTransition><RouteErrorBoundary routeName="Anime Seasonal"><AnimeSeasonal /></RouteErrorBoundary></PageTransition>} />
        <Route path="/anime/search" element={<PageTransition><RouteErrorBoundary routeName="Anime Search"><AnimeSearch /></RouteErrorBoundary></PageTransition>} />
        <Route path="/anime/browse" element={<PageTransition><RouteErrorBoundary routeName="Anime Browse"><AnimeBrowse /></RouteErrorBoundary></PageTransition>} />
        <Route path="/anime/watch/:id" element={<PageTransition><RouteErrorBoundary routeName="Anime Player"><AnimePlayer /></RouteErrorBoundary></PageTransition>} />
        <Route path="/anime/:id" element={<PageTransition><RouteErrorBoundary routeName="Anime Details"><AnimeDetails /></RouteErrorBoundary></PageTransition>} />
        
        <Route path="/movies" element={<PageTransition><RouteErrorBoundary routeName="Movies"><Movies /></RouteErrorBoundary></PageTransition>} />
        <Route path="/tv-shows" element={<PageTransition><RouteErrorBoundary routeName="TV Shows"><TVShows /></RouteErrorBoundary></PageTransition>} />
        <Route path="/watchlist" element={<PageTransition><RouteErrorBoundary routeName="Watchlist"><Watchlist /></RouteErrorBoundary></PageTransition>} />
        <Route path="/search" element={<PageTransition><RouteErrorBoundary routeName="Search"><Search /></RouteErrorBoundary></PageTransition>} />
        {/* Semantic SEO Routes for Media */}
        <Route path="/movie/:id" element={<PageTransition><RouteErrorBoundary routeName="Movie"><Title typeOverride="movie" /></RouteErrorBoundary></PageTransition>} />
        <Route path="/tv/:id" element={<PageTransition><RouteErrorBoundary routeName="TV Show"><Title typeOverride="tv" /></RouteErrorBoundary></PageTransition>} />
        {/* Legacy Route */}
        <Route path="/title/:type/:id" element={<PageTransition><RouteErrorBoundary routeName="Title"><Title /></RouteErrorBoundary></PageTransition>} />
        <Route path="/play/:type/:id" element={<PageTransition><RouteErrorBoundary routeName="Player"><Player /></RouteErrorBoundary></PageTransition>} />
        <Route path="/auth" element={<PageTransition><RouteErrorBoundary routeName="Auth"><Auth /></RouteErrorBoundary></PageTransition>} />
        <Route path="/recommendations" element={<PageTransition><RouteErrorBoundary routeName="Recommendations"><Recommendations /></RouteErrorBoundary></PageTransition>} />
        <Route path="/account" element={<PageTransition><RouteErrorBoundary routeName="Account Settings"><AccountSettings /></RouteErrorBoundary></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><RouteErrorBoundary routeName="Not Found"><NotFound /></RouteErrorBoundary></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

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
              <ContentModeProvider>
              <BrowserRouter>
              <ErrorBoundary
                onError={(error, errorInfo) => {
                  // Log errors in production to monitoring service
                  console.error('App Error:', error, errorInfo);
                }}
              >
                <ScrollToTop />
                <Suspense fallback={<GlobalLoader />}>
                  <Analytics />
                  <OfflineIndicator />
                  <Navbar />
                  <PullToRefresh>
                    <AnimatedRoutes />
                  </PullToRefresh>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
            </ContentModeProvider>
            </RatingsProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
