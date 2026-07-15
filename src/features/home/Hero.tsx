import { Button } from "@/shared/components/ui/button";
import { Info, Play, Star, Clock, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateSeoUrl } from "@/shared/lib/utils";
import { useTrendingMovies, useDetails } from "@/shared/api/tmdb/hooks";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import type { UIMediaItem } from "@/shared/api/tmdb/hooks";
import { motion, AnimatePresence } from "framer-motion";

// ─── Hero skeleton shown while trending data loads ───
const HeroSkeleton = () => (
  <section className="relative h-[75vh] md:h-[95vh] w-full bg-black overflow-hidden">
    <div className="absolute inset-0 bg-skeleton animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent w-full md:w-[80%]" />
    <div className="absolute bottom-24 left-6 md:left-16 lg:left-24 flex flex-col gap-4 max-w-lg">
      <div className="h-10 w-64 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-4 w-40 rounded-full bg-white/5 animate-pulse" />
      <div className="h-16 w-96 rounded-xl bg-white/5 animate-pulse" />
      <div className="flex gap-3">
        <div className="h-12 w-32 rounded-full bg-white/5 animate-pulse" />
        <div className="h-12 w-32 rounded-full bg-white/5 animate-pulse" />
      </div>
    </div>
  </section>
);

// ─── Individual hero slide ───
const HeroSlide = ({
  featured,
  isActive,
  slideIndex,
}: {
  featured: UIMediaItem;
  isActive: boolean;
  slideIndex: number;
}) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);

  const { data } = useDetails("movie", featured.id);

  const backdropUrl = featured.backdropUrl || "";
  const year = featured.year || "";

  const logoPath = useMemo(() => {
    if (!data?.details?.images?.logos) return null;
    const logos = data.details.images.logos;
    const enLogo = logos.find((l: any) => l.iso_639_1 === "en");
    return enLogo?.file_path || logos[0]?.file_path || null;
  }, [data]);

  const logoUrl = logoPath
    ? `https://image.tmdb.org/t/p/w500${logoPath}`
    : null;

  const genres = useMemo(() => {
    if (data?.details?.genres)
      return data.details.genres.slice(0, 3).map((g: any) => g.name);
    return [];
  }, [data]);

  const runtime = data?.details?.runtime;
  const runtimeStr = runtime
    ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
    : null;
  const voteCount = data?.details?.vote_count;
  const contentType =
    featured.mediaType === "tv" ? "SERIES" : "FILM";

  const contentStagger = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <div className="relative flex-none w-full h-full overflow-hidden">
      {/* Background Image with Ken Burns */}
      <div className="absolute inset-0 z-0">
        <motion.img
          key={backdropUrl}
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: imgLoaded ? 1.08 : 1, opacity: imgLoaded ? 1 : 0 }}
          transition={{ scale: { duration: 14, ease: "linear" }, opacity: { duration: 0.8 } }}
          src={backdropUrl}
          alt=""
          aria-hidden="true"
          loading={slideIndex === 0 ? "eager" : "lazy"}
          decoding="async"
          {...(slideIndex === 0 ? { fetchPriority: "high" as const } : {})}
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover object-top"
        />

        {/* 3-layer gradient system */}
        {/* Layer 1: Full bottom-to-top dark fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        {/* Layer 2: Left panel gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent md:w-[75%]" />
        {/* Layer 3: Subtle radial vignette at center-bottom for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 60% at 50% 100%, hsl(var(--background)) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Hero Content */}
      <AnimatePresence>
        {isActive && (
          <div className="absolute inset-0 z-20 flex items-end pb-20 md:pb-24 lg:pb-28">
            <div className="px-6 md:px-16 lg:px-24 max-w-3xl">



              {/* Title / Logo */}
              <motion.div
                custom={1}
                variants={contentStagger}
                initial="hidden"
                animate="visible"
                className="mb-5"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={featured.title}
                    decoding="async"
                    className="max-w-[280px] sm:max-w-[360px] md:max-w-[460px] lg:max-w-[520px] max-h-[130px] h-auto object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
                  />
                ) : (
                  <h1
                    className="font-heading font-black text-white leading-[1.05] tracking-tight drop-shadow-2xl"
                    style={{ fontSize: "clamp(2rem, 7vw, 4rem)" }}
                  >
                    {featured.title}
                  </h1>
                )}
              </motion.div>

              {/* Metadata row */}
              <motion.div
                custom={2}
                variants={contentStagger}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap items-center gap-2.5 mb-5 text-xs sm:text-sm"
              >
                {/* Rating */}
                {featured.rating > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/20 text-amber-300 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {featured.rating.toFixed(1)}
                    {voteCount && (
                      <span className="text-amber-300/50 font-normal text-[10px]">
                        ({voteCount >= 1000 ? `${(voteCount / 1000).toFixed(0)}k` : voteCount})
                      </span>
                    )}
                  </span>
                )}

                {/* Year */}
                {year && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/8 border border-white/10 text-white/70 font-medium">
                    {year}
                  </span>
                )}

                {/* Runtime */}
                {runtimeStr && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/8 border border-white/10 text-white/70 font-medium">
                    <Clock className="w-3 h-3 text-white/40" />
                    {runtimeStr}
                  </span>
                )}

                {/* Genres */}
                {genres.length > 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    {genres.map((g: string) => (
                      <span
                        key={g}
                        className="px-2.5 py-1 rounded-lg bg-white/8 border border-white/10 text-white/60 font-medium"
                      >
                        {g}
                      </span>
                    ))}
                  </>
                )}
              </motion.div>

              {/* Description */}
              <motion.p
                custom={3}
                variants={contentStagger}
                initial="hidden"
                animate="visible"
                className="hidden md:block text-sm md:text-base text-white/55 mb-8 line-clamp-3 max-w-lg font-medium leading-relaxed"
              >
                {featured.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                custom={4}
                variants={contentStagger}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3"
              >
                <button
                  onClick={() =>
                    navigate(`/play/${featured.mediaType}/${featured.id}`)
                  }
                  className="flex items-center gap-2.5 bg-white text-black px-7 py-3 rounded-full font-bold text-sm hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-[1.03] elevation-lg"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Play Now
                </button>

                <button
                  onClick={() =>
                    navigate(
                      generateSeoUrl(
                        featured.mediaType as "movie" | "tv",
                        featured.id,
                        featured.title
                      )
                    )
                  }
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm glass text-white hover:bg-white/15 active:scale-95 transition-all duration-200"
                >
                  <Info className="w-4 h-4" />
                  Details
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Hero container with Embla carousel ───
const Hero = () => {
  const { data: trendingMovies } = useTrendingMovies();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 35 },
    [Autoplay({ delay: 7000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!emblaApi) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        emblaApi.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        emblaApi.scrollNext();
      }
    },
    [emblaApi]
  );

  if (!trendingMovies || trendingMovies.length === 0) {
    return <HeroSkeleton />;
  }

  const slides = trendingMovies.slice(0, 8);

  return (
    <section
      className="relative h-[75vh] md:h-[95vh] w-full bg-black overflow-hidden focus-visible:outline-none"
      ref={emblaRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Featured content carousel"
      aria-roledescription="carousel"
    >
      <div className="flex h-full touch-pan-y">
        {slides.map((featured, i) => (
          <HeroSlide
            key={featured.id}
            featured={featured}
            isActive={i === selectedIndex}
            slideIndex={i}
          />
        ))}
      </div>

      {/* Slide progress indicators */}
      <div
        className="absolute bottom-5 left-6 md:left-16 lg:left-24 z-30 flex items-center gap-1.5"
        role="tablist"
        aria-label="Hero slides"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === selectedIndex}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`relative overflow-hidden p-0 m-0 border-none outline-none appearance-none rounded-full transition-all duration-500 ${
              i === selectedIndex
                ? "w-8 md:w-12 h-1 bg-white/25"
                : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
            }`}
          >
            {i === selectedIndex && (
              <motion.div
                key={`progress-${i}`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 7, ease: "linear" }}
                className="absolute inset-0 bg-white rounded-full"
              />
            )}
          </button>
        ))}
      </div>

    </section>
  );
};

export default Hero;
