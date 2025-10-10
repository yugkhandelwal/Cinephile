import Navbar from "@/shared/components/layout/Navbar";
import Hero from "./Hero";
import FeatureCard from "./FeatureCard";
import ContentSection from "./ContentSection";
import MovieCard from "@/shared/components/MovieCard";
import Footer from "@/shared/components/layout/Footer";
import { Compass, BookmarkPlus, Users } from "lucide-react";
import { useTrendingMovies, useTrendingTV } from "@/shared/api/tmdb/hooks";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useMemo } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SectionErrorBoundary } from "@/shared/components/ErrorBoundary";
import { SEO } from "@/shared/components/SEO";

const Index = () => {
  useDocumentTitle("Home");

  const { data: trendingMovies, isLoading: moviesLoading, isError: moviesError, error: moviesErr } = useTrendingMovies();
  const { data: trendingSeries, isLoading: tvLoading, isError: tvError, error: tvErr } = useTrendingTV();

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
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Compass}
            title="Discover"
            description="Find your next favorite movie or show with our powerful recommendations engine."
          />
          <FeatureCard
            icon={BookmarkPlus}
            title="Organize"
            description="Effortlessly manage your watchlist and keep track of everything you've seen."
          />
          <FeatureCard
            icon={Users}
            title="Connect"
            description="Share your taste, read reviews, and connect with a community of cinephiles."
          />
        </div>
      </section>

      {/* What's Hot Right Now - Dynamic Trending Content */}
      <SectionErrorBoundary>
        <div className="container mx-auto px-4">
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
            <div className="py-12">
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
        </div>
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
