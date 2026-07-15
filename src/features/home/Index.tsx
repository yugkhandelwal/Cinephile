import Hero from "./Hero";
import ContentSection from "./ContentSection";
import AvailableOnPlatform from "./AvailableOnPlatform";
import MediaCard from "@/shared/components/MediaCard";
import Footer from "@/shared/components/layout/Footer";
import { useTrendingMovies, useTrendingTV, useNowPlayingMovies, useUpcomingMovies, useOnTheAirTV, useRecommendationsFromWatchlist } from "@/shared/api/tmdb/hooks";
import { useAuth } from "@/context/AuthProvider";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useMemo } from "react";
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
    const sortedMovies = [...trendingMovies].sort((a, b) => ((b as any).popularity || 0) - ((a as any).popularity || 0));
    const sortedSeries = [...trendingSeries].sort((a, b) => ((b as any).popularity || 0) - ((a as any).popularity || 0));
    const mixed = [];
    for (let i = 0; i < 5; i++) {
      if (sortedMovies[i]) mixed.push(sortedMovies[i]);
      if (sortedSeries[i]) mixed.push(sortedSeries[i]);
    }
    return mixed;
  }, [trendingMovies, trendingSeries]);

  const hotContent = useMemo(() => {
    if (!trendingMovies || !trendingSeries) return [];
    const combined = [...trendingMovies.slice(0, 10), ...trendingSeries.slice(0, 10)];
    return combined.sort((a, b) => ((b as any).popularity || 0) - ((a as any).popularity || 0)).slice(0, 12);
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

        {/* Top 10 Today */}
        <SectionErrorBoundary>
          <ContentSection
            title="Top 10 Today"
            subtitle="The most popular movies and TV series right now"
            isLoading={isHotLoading}
            skeletonCount={10}
          >
            {top10Today.map((item, index) => (
              <div key={`top10-${item.mediaType}-${item.id}`} className="relative w-full h-full flex items-end justify-end pt-8 pr-2">
                <span
                  className="absolute left-[-5%] sm:-left-2 bottom-10 sm:bottom-8 text-[100px] sm:text-[130px] md:text-[160px] lg:text-[180px] font-black leading-none text-background z-0 select-none tracking-tighter drop-shadow-2xl"
                  style={{ WebkitTextStroke: "3px rgba(255,255,255,0.7)", textShadow: "4px 0 10px rgba(0,0,0,0.5)" }}
                >
                  {index + 1}
                </span>
                <div className="relative z-10 w-[80%] sm:w-[75%] md:w-[80%] ml-auto">
                  <MediaCard {...item} />
                </div>
              </div>
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        <ContinueWatchingCarousel filter="movies_tv" />

        {/* What's Hot Right Now */}
        <SectionErrorBoundary>
          {isHotError ? (
            <div className="container mx-auto px-4 py-12">
              <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
                <p className="text-destructive font-semibold mb-2">Failed to load trending content</p>
                <p className="text-sm text-muted-foreground">{String((moviesErr || tvErr)?.message || 'Please try again later')}</p>
              </div>
            </div>
          ) : (
            <ContentSection
              title="What's Hot Right Now"
              subtitle="The most popular movies and shows, updated daily."
              isLoading={isHotLoading}
              skeletonCount={12}
            >
              {hotContent.map((item) => (
                <MediaCard key={`hot-${item.mediaType}-${item.id}`} {...item} tag={item.rating >= 8 ? "HOT" : undefined} />
              ))}
            </ContentSection>
          )}
        </SectionErrorBoundary>

        {/* Recommended For You */}
        {user && (
          <SectionErrorBoundary>
            <ContentSection
              title="Recommended For You"
              subtitle="Based on your watchlist"
              isLoading={recsLoading}
              skeletonCount={8}
            >
              {(recs || []).slice(0, 12).map((item) => (
                <MediaCard key={`rec-${item.mediaType}-${item.id}`} {...item} />
              ))}
            </ContentSection>
          </SectionErrorBoundary>
        )}

        {/* Coming Soon */}
        <SectionErrorBoundary>
          <ContentSection
            title="Coming Soon"
            subtitle="Upcoming movies hitting theaters"
            isLoading={upcomingLoading}
            skeletonCount={8}
          >
            {(upcomingMovies || []).map((movie) => (
              <MediaCard key={`upcoming-${movie.mediaType}-${movie.id}`} {...movie} tag="SOON" />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        {/* On The Air TV */}
        <SectionErrorBoundary>
          <ContentSection
            title="On The Air"
            subtitle="TV series with new episodes"
            isLoading={onAirTvLoading}
            skeletonCount={8}
          >
            {(onAirTv || []).map((show) => (
              <MediaCard key={`onair-${show.mediaType}-${show.id}`} {...show} tag="NEW EP" />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        <AvailableOnPlatform />

        {/* New Releases */}
        <SectionErrorBoundary>
          <ContentSection
            title="New Releases"
            subtitle="In theaters and streaming now"
            isLoading={nowPlayingLoading}
            skeletonCount={8}
          >
            {(nowPlayingMovies || []).map((movie) => (
              <MediaCard key={`nowplaying-${movie.mediaType}-${movie.id}`} {...movie} tag="NEW" />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        {/* Trending Movies */}
        <SectionErrorBoundary>
          {moviesError && !isHotLoading && (
            <div className="container mx-auto px-4 py-12 text-destructive">{String((moviesErr as Error)?.message || 'Failed to load')}</div>
          )}
          <ContentSection
            title="Trending Movies"
            subtitle="Cinema Collection"
            isLoading={moviesLoading}
            skeletonCount={8}
            onViewAll={() => navigate("/movies")}
          >
            {(trendingMovies || []).map((movie) => (
              <MediaCard key={`${movie.mediaType}-${movie.id}`} {...movie} />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        {/* Trending TV Series */}
        <SectionErrorBoundary>
          {tvError && !isHotLoading && (
            <div className="container mx-auto px-4 py-12 text-destructive">{String((tvErr as Error)?.message || 'Failed to load')}</div>
          )}
          <ContentSection
            title="Trending TV Series"
            subtitle="Streaming Universe"
            isLoading={tvLoading}
            skeletonCount={8}
            onViewAll={() => navigate("/tv-shows")}
          >
            {(trendingSeries || []).map((show) => (
              <MediaCard key={`${show.mediaType}-${show.id}`} {...show} />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        <Footer />
      </div>
    </>
  );
};

export default Index;
