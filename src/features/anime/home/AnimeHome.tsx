import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import ContentSection from "@/features/home/ContentSection";
import MediaCard from "@/shared/components/MediaCard";
import Footer from "@/shared/components/layout/Footer";
import { SectionErrorBoundary } from "@/shared/components/ErrorBoundary";
import { SEO } from "@/shared/components/SEO";
import { useMalTopAnime, useMalSeasonalAnime } from "@/shared/api/mal/hooks";
import { useNavigate } from "react-router-dom";
import ContinueWatchingCarousel from "@/shared/components/ContinueWatchingCarousel";
import AnimeHero from "./AnimeHero";
import { motion } from "framer-motion";
import { Sparkles, Flame, Clock, Trophy } from "lucide-react";

// Anime-specific section header with hot pink accent
const AnimeSectionBadge = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.6875rem] font-bold tracking-[0.12em] uppercase mb-2">
    <Icon className="w-3 h-3" />
    {label}
  </span>
);

const AnimeHome = () => {
  useDocumentTitle("Anime");
  const navigate = useNavigate();

  const { data: topAnimeData, isLoading: loadingTop } = useMalTopAnime();
  const { data: topAiringData, isLoading: loadingAiring } = useMalTopAnime("airing");
  const { data: topUpcomingData, isLoading: loadingUpcoming } = useMalTopAnime("upcoming");

  const currentYear = new Date().getFullYear();
  const month = new Date().getMonth();
  const season =
    month < 3 ? "winter" : month < 6 ? "spring" : month < 9 ? "summer" : "fall";
  const seasonLabel =
    season.charAt(0).toUpperCase() + season.slice(1);

  const { data: seasonalAnimeData, isLoading: loadingSeasonal } =
    useMalSeasonalAnime(currentYear, season);

  const topAnime = topAnimeData?.pages.flatMap((p) => p.data) || [];
  const topAiring = topAiringData?.pages.flatMap((p) => p.data) || [];
  const topUpcoming = topUpcomingData?.pages.flatMap((p) => p.data) || [];
  const seasonalAnime = seasonalAnimeData?.pages.flatMap((p) => p.data) || [];

  const normalizeToCard = (item: any) => ({
    ...item,
    mediaType: "anime" as const,
  });

  return (
    <>
      <SEO
        title="Anime"
        description="Discover trending anime, seasonal releases, and build your anime watchlist. Powered by MyAnimeList."
        keywords={["anime", "manga", "trending anime", "myanimelist", "mal"]}
        url="https://cinephile.app/anime"
      />
      <div id="main" className="min-h-screen bg-background animate-fade-in pb-tabbar">
        <AnimeHero />

        {/* Anime-specific intro banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-6 md:mx-12 lg:mx-16 my-8 rounded-2xl overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, hsl(330 90% 60% / 0.12) 0%, hsl(280 85% 60% / 0.08) 50%, transparent 100%)",
            border: "1px solid hsl(330 90% 60% / 0.15)",
          }}
        >
          <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-overline text-primary mb-1">🎌 Anime Mode Active</p>
              <p className="text-white/60 text-sm">
                Powered by MyAnimeList · Sub & Dub available · Auto-next episodes
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-full glass text-white/60 border-primary/10">
                {seasonLabel} {currentYear}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/20 font-semibold">
                Season Active
              </span>
            </div>
          </div>
        </motion.div>

        <ContinueWatchingCarousel filter="anime" />

        {/* Seasonal Anime — most prominent section */}
        <SectionErrorBoundary>
          <div className="pl-6 md:pl-12 lg:pl-16 pr-6 -mb-4">
            <AnimeSectionBadge icon={Sparkles} label={`${seasonLabel} ${currentYear}`} />
          </div>
          <ContentSection
            title={`Airing This Season`}
            subtitle={`Currently streaming — ${seasonLabel} ${currentYear}`}
            isLoading={loadingSeasonal}
            skeletonCount={12}
          >
            {seasonalAnime.slice(0, 12).map((item) => (
              <MediaCard
                key={`seasonal-${item.id}`}
                {...normalizeToCard(item)}
                tag="NEW"
              />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        {/* Top Airing */}
        <SectionErrorBoundary>
          <div className="pl-6 md:pl-12 lg:pl-16 pr-6 -mb-4">
            <AnimeSectionBadge icon={Flame} label="Most Popular" />
          </div>
          <ContentSection
            title="Top Airing Anime"
            subtitle="The most-watched anime right now"
            isLoading={loadingAiring}
            skeletonCount={12}
            onViewAll={() => navigate("/anime/browse?filter=airing")}
          >
            {topAiring.slice(0, 12).map((item) => (
              <MediaCard key={`airing-${item.id}`} {...normalizeToCard(item)} tag="HOT" />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        {/* Upcoming */}
        <SectionErrorBoundary>
          <div className="pl-6 md:pl-12 lg:pl-16 pr-6 -mb-4">
            <AnimeSectionBadge icon={Clock} label="Coming Soon" />
          </div>
          <ContentSection
            title="Highly Anticipated"
            subtitle="Top upcoming anime — save your spot"
            isLoading={loadingUpcoming}
            skeletonCount={12}
          >
            {topUpcoming.slice(0, 12).map((item) => (
              <MediaCard key={`upcoming-${item.id}`} {...normalizeToCard(item)} tag="SOON" />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        {/* Top Rated of All Time */}
        <SectionErrorBoundary>
          <div className="pl-6 md:pl-12 lg:pl-16 pr-6 -mb-4">
            <AnimeSectionBadge icon={Trophy} label="All Time Best" />
          </div>
          <ContentSection
            title="Top Rated Anime"
            subtitle="Highest rated anime of all time on MyAnimeList"
            isLoading={loadingTop}
            skeletonCount={12}
            onViewAll={() => navigate("/anime/browse?filter=top")}
          >
            {topAnime.slice(0, 12).map((item) => (
              <MediaCard
                key={`top-${item.id}`}
                {...normalizeToCard(item)}
                tag="TOP"
              />
            ))}
          </ContentSection>
        </SectionErrorBoundary>

        <Footer />
      </div>
    </>
  );
};

export default AnimeHome;
