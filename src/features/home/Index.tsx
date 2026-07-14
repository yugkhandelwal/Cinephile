import Navbar from "@/shared/components/layout/Navbar";
import Hero from "./Hero";
import ContentSection from "./ContentSection";
import AvailableOnPlatform from "./AvailableOnPlatform";
import MediaCard from "@/shared/components/MediaCard";
import Footer from "@/shared/components/layout/Footer";
import { useTrendingMovies, useTrendingTV, useNowPlayingMovies, useUpcomingMovies, useOnTheAirTV, useRecommendationsFromWatchlist } from "@/shared/api/tmdb/hooks";
import { useAuth } from "@/context/AuthProvider";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useMemo } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SectionErrorBoundary } from "@/shared/components/ErrorBoundary";
import { SEO } from "@/shared/components/SEO";
import { useNavigate } from "react-router-dom";
import ContinueWatchingCarousel from "@/shared/components/ContinueWatchingCarousel";

const Index = () => {
  const navigate = useNavigate();
  useDocumentTitle("Home");

  const { data: trendingMovies, isLoading: moviesLoading, isError: moviesError, error: moviesErr } = useTrendingMovies();
  const { data: trendingSeries, isLoading: tvLoading, isError: tvError, error: tvErr } = useTrendingTV();
  
  const { data: nowPlayingMovies, isLoading: nowPlayingLoading } = useNowPlayingMovies();
  const { data: upcomingMovies, isLoading: upcomingLoading } = useUpcomingMovies();
  const { data: onAirTv, isLoading: onAirTvLoading } = useOnTheAirTV();
  
  const { user } = useAuth();
  const { data: recs, isLoading: recsLoading } = useRecommendationsFromWatchlist();

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

  // Combine trending movies and TV shows for "What's Hot Right Now" — deterministic sort by popularity
  const hotContent = useMemo(() => {
    if (!trendingMovies || !trendingSeries) return [];
    
    const combined = [
      ...trendingMovies.slice(0, 10),
      ...trendingSeries.slice(0, 10)
    ];
    
    // Deterministic sort by popularity — no random shuffling
    return combined
      .sort((a, b) => ((b as any).popularity || 0) - ((a as any).popularity || 0))
      .slice(0, 12);
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
    <div id="main" className="min-h-screen bg-background animate-fade-in pb-tabbar">

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
              <div key={`top10-${item.mediaType}-${item.id}`} className="relative w-full h-full flex items-end justify-end pt-8 pr-2">
                <span 
                  className="absolute left-[-5%] sm:-left-2 bottom-10 sm:bottom-8 text-[100px] sm:text-[130px] md:text-[160px] lg:text-[180px] font-black leading-none text-background z-0 select-none tracking-tighter drop-shadow-2xl"
                  style={{
                    WebkitTextStroke: "3px rgba(255,255,255,0.7)",
                    textShadow: "4px 0 10px rgba(0,0,0,0.5)"
                  }}
                >
                  {index + 1}
                </span>
                <div className="relative z-10 w-[80%] sm:w-[75%] md:w-[80%] ml-auto shadow-[[-10px_0_20px_rgba(0,0,0,0.5)]]">
                  <MediaCard 
                    {...item}
                  />
                </div>
              </div>
            ))}
          </ContentSection>
        ) : null}
      </SectionErrorBoundary>

      <ContinueWatchingCarousel filter="movies_tv" />

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
              <MediaCard 
                key={`hot-${item.mediaType}-${item.id}`} 
                {...item}
                tag={item.rating >= 8 ? "HOT" : undefined}
              />
            ))}
          </ContentSection>
        ) : null}
      </SectionErrorBoundary>

      {/* Recommended For You */}
      {user && (
        <SectionErrorBoundary>
          {recsLoading ? (
            <ContentSection title="Recommended For You" subtitle="Based on your watchlist">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full">
                  <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                </div>
              ))}
            </ContentSection>
          ) : recs && recs.length > 0 ? (
            <ContentSection title="Recommended For You" subtitle="Based on your watchlist">
              {recs.slice(0, 12).map((item) => (
                <MediaCard key={`rec-${item.mediaType}-${item.id}`} {...item} />
              ))}
            </ContentSection>
          ) : null}
        </SectionErrorBoundary>
      )}

      {/* Upcoming Movies Section */}
      <SectionErrorBoundary>
        {upcomingLoading ? (
          <ContentSection title="Coming Soon" subtitle="Upcoming movies hitting theaters">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
            ))}
          </ContentSection>
        ) : upcomingMovies && upcomingMovies.length > 0 ? (
          <ContentSection title="Coming Soon" subtitle="Upcoming movies hitting theaters">
            {upcomingMovies.map((movie) => (
              <MediaCard key={`upcoming-${movie.mediaType}-${movie.id}`} {...movie} tag="SOON" />
            ))}
          </ContentSection>
        ) : null}
      </SectionErrorBoundary>

      {/* On The Air TV Section */}
      <SectionErrorBoundary>
        {onAirTvLoading ? (
          <ContentSection title="On The Air" subtitle="TV series with new episodes">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
            ))}
          </ContentSection>
        ) : onAirTv && onAirTv.length > 0 ? (
          <ContentSection title="On The Air" subtitle="TV series with new episodes">
            {onAirTv.map((show) => (
              <MediaCard key={`onair-${show.mediaType}-${show.id}`} {...show} tag="NEW EP" />
            ))}
          </ContentSection>
        ) : null}
      </SectionErrorBoundary>

      <AvailableOnPlatform />

      {/* New Releases Section */}
      <SectionErrorBoundary>
        {nowPlayingLoading ? (
          <ContentSection title="New Releases" subtitle="In theaters and streaming now">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
            ))}
          </ContentSection>
        ) : nowPlayingMovies && nowPlayingMovies.length > 0 ? (
          <ContentSection title="New Releases" subtitle="In theaters and streaming now">
            {nowPlayingMovies.map((movie) => (
              <MediaCard key={`nowplaying-${movie.mediaType}-${movie.id}`} {...movie} tag="NEW" />
            ))}
          </ContentSection>
        ) : null}
      </SectionErrorBoundary>


      {/* Trending Movies Section */}
      <SectionErrorBoundary>
        {moviesLoading && (
          <ContentSection
            title="Trending Movies"
            subtitle="Cinema Collection"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
            ))}
          </ContentSection>
        )}
        {moviesError && !isHotLoading && (
          <div className="container mx-auto px-4 py-12 text-destructive">{String((moviesErr as Error)?.message || 'Failed to load')}</div>
        )}
        {trendingMovies && (
          <ContentSection
          title="Trending Movies"
          subtitle="Cinema Collection"
          onViewAll={() => navigate("/movies")}
        >
          {trendingMovies.map((movie) => (
            <MediaCard key={`${movie.mediaType}-${movie.id}`} {...movie} />
          ))}
        </ContentSection>
        )}
      </SectionErrorBoundary>

      {/* Trending TV Series Section */}
      <SectionErrorBoundary>
        {tvLoading && (
          <ContentSection
            title="Trending TV Series"
            subtitle="Streaming Universe"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
            ))}
          </ContentSection>
        )}
        {tvError && !isHotLoading && (
          <div className="container mx-auto px-4 py-12 text-destructive">{String((tvErr as Error)?.message || 'Failed to load')}</div>
        )}
        {trendingSeries && (
          <ContentSection
          title="Trending TV Series"
          subtitle="Streaming Universe"
          onViewAll={() => navigate("/tv-shows")}
        >
          {trendingSeries.map((show) => (
            <MediaCard key={`${show.mediaType}-${show.id}`} {...show} />
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
