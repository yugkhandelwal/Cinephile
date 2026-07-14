import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import ContentSection from "@/features/home/ContentSection";
import MediaCard from "@/shared/components/MediaCard";
import Footer from "@/shared/components/layout/Footer";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SectionErrorBoundary } from "@/shared/components/ErrorBoundary";
import { SEO } from "@/shared/components/SEO";
import { useMalTopAnime, useMalSeasonalAnime } from "@/shared/api/mal/hooks";
import { useNavigate } from "react-router-dom";
import ContinueWatchingCarousel from "@/shared/components/ContinueWatchingCarousel";

import AnimeHero from "./AnimeHero";

const AnimeHome = () => {
  useDocumentTitle("Anime Home");
  const navigate = useNavigate();

  const { data: topAnimeData, isLoading: loadingTop } = useMalTopAnime();
  const { data: topAiringData, isLoading: loadingAiring } = useMalTopAnime("airing");
  const { data: topUpcomingData, isLoading: loadingUpcoming } = useMalTopAnime("upcoming");
  
  const currentYear = new Date().getFullYear();
  // Simple heuristic for current season
  const month = new Date().getMonth();
  const season = month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall';
  
  const { data: seasonalAnimeData, isLoading: loadingSeasonal } = useMalSeasonalAnime(currentYear, season);

  const topAnime = topAnimeData?.pages.flatMap(p => p.data) || [];
  const topAiring = topAiringData?.pages.flatMap(p => p.data) || [];
  const topUpcoming = topUpcomingData?.pages.flatMap(p => p.data) || [];
  const seasonalAnime = seasonalAnimeData?.pages.flatMap(p => p.data) || [];

  // The hooks already return UIMediaItem, but we ensure mediaType is "anime"
  const normalizeToCard = (item: any) => ({
    ...item,
    mediaType: "anime" as const,
  });

  return (
    <>
      <SEO 
        title="Anime Home"
        description="Discover trending anime, seasonal releases, and build your anime watchlist. Powered by MyAnimeList."
        keywords={['anime', 'manga', 'trending anime', 'myanimelist', 'mal']}
        url="https://cinephile.app/anime"
      />
      <div id="main" className="min-h-screen bg-background animate-fade-in pb-tabbar">
        
        <AnimeHero />
        <ContinueWatchingCarousel filter="anime" />

        {/* Seasonal Anime Section */}
        <SectionErrorBoundary>
          {loadingSeasonal ? (
            <ContentSection
              title={`${season.charAt(0).toUpperCase() + season.slice(1)} ${currentYear} Anime`}
              subtitle="Currently airing this season"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-full">
                  <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                </div>
              ))}
            </ContentSection>
          ) : seasonalAnime.length > 0 ? (
            <ContentSection
              title={`${season.charAt(0).toUpperCase() + season.slice(1)} ${currentYear} Anime`}
              subtitle="Currently airing this season"
            >
              {seasonalAnime.slice(0, 12).map((item) => (
                <MediaCard 
                  key={`seasonal-${item.id}`} 
                  {...normalizeToCard(item)}
                  tag="NEW"
                />
              ))}
            </ContentSection>
          ) : null}
        </SectionErrorBoundary>

        {/* Top Airing Anime Section */}
        <SectionErrorBoundary>
          {loadingAiring ? (
            <ContentSection title="Top Airing Anime" subtitle="The most popular anime airing right now">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-full">
                  <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                </div>
              ))}
            </ContentSection>
          ) : topAiring.length > 0 ? (
            <ContentSection title="Top Airing Anime" subtitle="The most popular anime airing right now">
              {topAiring.slice(0, 12).map((item) => (
                <MediaCard key={`airing-${item.id}`} {...normalizeToCard(item)} tag="HOT" />
              ))}
            </ContentSection>
          ) : null}
        </SectionErrorBoundary>

        {/* Top Upcoming Anime Section */}
        <SectionErrorBoundary>
          {loadingUpcoming ? (
            <ContentSection title="Highly Anticipated" subtitle="Top upcoming anime releases">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-full">
                  <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                </div>
              ))}
            </ContentSection>
          ) : topUpcoming.length > 0 ? (
            <ContentSection title="Highly Anticipated" subtitle="Top upcoming anime releases">
              {topUpcoming.slice(0, 12).map((item) => (
                <MediaCard key={`upcoming-${item.id}`} {...normalizeToCard(item)} tag="SOON" />
              ))}
            </ContentSection>
          ) : null}
        </SectionErrorBoundary>

        {/* Top Rated Anime Section */}
        <SectionErrorBoundary>
          {loadingTop ? (
            <ContentSection
              title="Top Rated Anime"
              subtitle="Highest rated anime of all time"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-full">
                  <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                </div>
              ))}
            </ContentSection>
          ) : topAnime.length > 0 ? (
            <ContentSection
              title="Top Rated Anime"
              subtitle="Highest rated anime of all time"
            >
              {topAnime.slice(0, 12).map((item) => (
                <MediaCard 
                  key={`top-${item.id}`} 
                  {...normalizeToCard(item)}
                  tag="TOP"
                />
              ))}
            </ContentSection>
          ) : null}
        </SectionErrorBoundary>

        <Footer />
      </div>
    </>
  );
};

export default AnimeHome;
