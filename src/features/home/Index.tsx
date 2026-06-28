import Navbar from "@/shared/components/layout/Navbar";
import Hero from "./Hero";
import ContentSection from "./ContentSection";
import MovieCard from "@/shared/components/MovieCard";
import Footer from "@/shared/components/layout/Footer";
import { useTrendingMovies, useTrendingTV } from "@/shared/api/tmdb/hooks";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useWatchHistory } from "@/shared/hooks/useWatchHistory";
import { useMemo } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SectionErrorBoundary } from "@/shared/components/ErrorBoundary";
import { SEO } from "@/shared/components/SEO";

const Index = () => {
  useDocumentTitle("Home");
  const { history } = useWatchHistory();

  const { data: trendingMovies, isLoading: moviesLoading, isError: moviesError, error: moviesErr } = useTrendingMovies();
  const { data: trendingSeries, isLoading: tvLoading, isError: tvError, error: tvErr } = useTrendingTV();

  const top10Today = useMemo(() => {
    if (!trendingMovies || !trendingSeries) return [];
    
    // Sort both by popularity to ensure we get the absolute top items
    // (TMDB typically sorts by popularity by default, but this ensures it)
    const sortedMovies = [...trendingMovies].sort((a, b) => ((b as any).popularity || 0) - ((a as any).popularity || 0));
    const sortedSeries = [...trendingSeries].sort((a, b) => ((b as any).popularity || 0) - ((a as any).popularity || 0));
    
    // Interleave top 5 movies and top 5 series for a balanced list
    const mixed = [];
    for (let i = 0; i < 5; i++) {
      if (sortedMovies[i]) mixed.push(sortedMovies[i]);
      if (sortedSeries[i]) mixed.push(sortedSeries[i]);
    }
    return mixed;
  }, [trendingMovies, trendingSeries]);

  // Combine and shuffle trending movies and TV shows for "What's Hot Right Now"
  const hotContent = useMemo(() => {
    if (!trendingMovies || !trendingSeries) return [];
    
    // Take top items from both lists
    const combinedContent = [
      ...trendingMovies.slice(0, 10),
      ...trendingSeries.slice(0, 10)
    ];
    
    // Shuffle the array for variety
    const shuffled = [...combinedContent].sort(() => Math.random() - 0.5);
    
    // Return top 12 items
    return shuffled.slice(0, 12);
  }, [trendingMovies, trendingSeries]);

  const isHotLoading = moviesLoading || tvLoading;
  const isHotError = moviesError || tvError;

  return (
  <>
    <SEO 
      title="Home"
      description="Discover trending movies and TV shows, build your watchlist, and explore detailed information about your favorite content. Powered by TMDB."
      keywords={['movies', 'tv shows', 'trending', 'watchlist', 'tmdb', 'cinema']}
      url="https://cinephile.app"
    />
    <div id="main" className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Top 10 Trending Section */}
      <SectionErrorBoundary>
        {isHotLoading ? (
          <ContentSection
            title="Top 10 Today"
            subtitle="The most popular movies and TV series right now"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`top10-skel-${i}`} className="w-full">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
            ))}
          </ContentSection>
        ) : top10Today.length > 0 ? (
          <ContentSection
            title="Top 10 Today"
            subtitle="The most popular movies and TV series right now"
          >
            {top10Today.map((item, index) => (
              <MovieCard 
                key={`top10-${item.mediaType}-${item.id}`} 
                {...item}
                tag={`TOP ${String(index + 1).padStart(2, '0')}`}
              />
            ))}
          </ContentSection>
        ) : null}
      </SectionErrorBoundary>

      {/* Continue Watching / History */}
      {history.length > 0 && (
        <SectionErrorBoundary>
          <ContentSection
            title="Continue Watching"
            subtitle="Pick up where you left off"
          >
            {history.map((item) => (
              <MovieCard 
                key={`history-${item.mediaType}-${item.id}`} 
                id={item.id}
                title={item.title}
                mediaType={item.mediaType}
                imageUrl={item.imageUrl || ''}
                rating={item.rating || 0}
                year={item.year}
              />
            ))}
          </ContentSection>
        </SectionErrorBoundary>
      )}

      {/* What's Hot Right Now - Dynamic Trending Content */}
      <SectionErrorBoundary>
        {isHotLoading ? (
          <ContentSection
            title="What's Hot Right Now"
            subtitle="The most popular movies and shows, updated daily."
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
            ))}
          </ContentSection>
        ) : isHotError ? (
          <div className="container mx-auto px-4 py-12">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
              <p className="text-destructive font-semibold mb-2">Failed to load trending content</p>
              <p className="text-sm text-muted-foreground">
                {String((moviesErr || tvErr)?.message || 'Please try again later')}
              </p>
            </div>
          </div>
        ) : hotContent.length > 0 ? (
          <ContentSection
            title="What's Hot Right Now"
            subtitle="The most popular movies and shows, updated daily."
          >
            {hotContent.map((item) => (
              <MovieCard 
                key={`hot-${item.mediaType}-${item.id}`} 
                {...item}
                tag={item.rating >= 8 ? "HOT" : undefined}
              />
            ))}
          </ContentSection>
        ) : null}
      </SectionErrorBoundary>

      {/* Trending Movies Section */}
      <SectionErrorBoundary>
        {moviesLoading && (
          <div className="container mx-auto px-4 py-12 text-muted-foreground">Loading trending movies…</div>
        )}
        {moviesError && !isHotLoading && (
          <div className="container mx-auto px-4 py-12 text-destructive">{String((moviesErr as Error)?.message || 'Failed to load')}</div>
        )}
        {trendingMovies && (
          <ContentSection
          title="Trending Movies"
          subtitle="Cinema Collection"
          onViewAll={() => {}}
        >
          {trendingMovies.map((movie) => (
            <MovieCard key={`${movie.mediaType}-${movie.id}`} {...movie} />
          ))}
        </ContentSection>
        )}
      </SectionErrorBoundary>

      {/* Trending TV Series Section */}
      <SectionErrorBoundary>
        {tvLoading && (
          <div className="container mx-auto px-4 py-12 text-muted-foreground">Loading trending TV…</div>
        )}
        {tvError && !isHotLoading && (
          <div className="container mx-auto px-4 py-12 text-destructive">{String((tvErr as Error)?.message || 'Failed to load')}</div>
        )}
        {trendingSeries && (
          <ContentSection
          title="Trending TV Series"
          subtitle="Streaming Universe"
          onViewAll={() => {}}
        >
          {trendingSeries.map((show) => (
            <MovieCard key={`${show.mediaType}-${show.id}`} {...show} />
          ))}
        </ContentSection>
        )}
      </SectionErrorBoundary>

      <Footer />
    </div>
  </>
  );
};

export default Index;
