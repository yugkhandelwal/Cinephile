import { Button } from "@/shared/components/ui/button";
import { Info, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateSeoUrl } from "@/shared/lib/utils";
import { useMalTopAnime, useMalDetails } from "@/shared/api/mal/hooks";
import { useTmdbLogoByTitle } from "@/shared/api/tmdb/hooks";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

const AnimeHeroSlide = ({ featured }: { featured: any }) => {
  const navigate = useNavigate();
  
  const backdropUrl = featured.imageUrl || "/placeholder.svg";
  const year = featured.year || "";
  
  const { data: logoUrl } = useTmdbLogoByTitle(featured.title);

  return (
    <div className="relative flex-none w-full h-full flex items-end md:items-center justify-start overflow-hidden pb-16 md:pb-0">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 12, ease: "linear" }}
          src={backdropUrl}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-top opacity-70"
          style={{ filter: 'blur(8px)' }}
        />
        {/* Heavy Gradients to match Cineby Reference (mostly left and bottom) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent w-full md:w-[80%]" />
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 md:px-12 relative z-20 mt-0 md:mt-32">
        <div className="max-w-3xl animate-fade-in">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={featured.title} 
              className="max-w-[55vw] sm:max-w-[300px] md:max-w-[450px] lg:max-w-[500px] max-h-[140px] sm:max-h-none h-auto object-contain mb-6 drop-shadow-2xl"
            />
          ) : (
            <h1 
              className="font-bold mb-4 leading-[1.1] text-white font-heading uppercase tracking-tight drop-shadow-2xl"
              style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}
            >
              {featured.title}
            </h1>
          )}
          
          {/* Meta Info Row */}
          <div className="hidden md:flex items-center gap-3 mb-6 text-sm font-semibold tracking-wide text-white/70">
            <span className="flex items-center text-amber-400 gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mb-[2px]"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {featured.rating?.toFixed(1)}
            </span>
            {year && (
              <>
                <span className="text-white/40">•</span>
                <span>{year}</span>
              </>
            )}
          </div>

          <div className="flex flex-row gap-3 w-full sm:w-auto mt-2">
            <Button 
              size="lg" 
              onClick={() => navigate(generateSeoUrl('anime', featured.id, featured.title))}
              className="flex-1 sm:flex-none bg-rose-500 text-white hover:bg-rose-600 rounded-full px-4 sm:px-8 h-12 gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all text-sm font-bold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Play
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate(generateSeoUrl('anime', featured.id, featured.title))}
              className="flex-1 sm:flex-none rounded-full px-4 sm:px-8 h-12 gap-2 border-white/20 bg-black/40 text-white hover:bg-black/60 hover:border-white/30 backdrop-blur-md active:scale-95 transition-all text-sm font-semibold"
            >
              <Info className="w-5 h-5" />
              See More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnimeHero = () => {
  const { data: topAnimeData } = useMalTopAnime("airing");
  const trendingAnime = topAnimeData?.pages[0]?.data || [];
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

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

  if (!trendingAnime || trendingAnime.length === 0) {
    return (
      <section className="relative h-[65vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-background animate-pulse">
        <div className="absolute inset-0 bg-muted/20" />
      </section>
    );
  }

  return (
    <section 
      className="relative h-[65vh] md:h-[85vh] w-full bg-black overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 pt-16 md:pt-0" 
      ref={emblaRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Featured anime carousel"
      aria-roledescription="carousel"
    >
      <div className="flex h-full touch-pan-y">
        {trendingAnime.slice(0, 10).map((featured) => (
          <AnimeHeroSlide key={featured.id} featured={featured} />
        ))}
      </div>
      
      {/* Subtle Carousel Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {trendingAnime.slice(0, 10).map((_, i) => (
          <button
            key={i}
            className={`relative overflow-hidden p-0 m-0 border-none outline-none appearance-none rounded-full transition-all duration-300 ${
              i === selectedIndex ? "bg-white/60 w-6 h-1 md:w-10 md:h-1.5" : "bg-white/30 w-1.5 h-1.5 md:w-2 md:h-2 hover:bg-white/50"
            }`}
            style={{ minWidth: 0, minHeight: 0, WebkitAppearance: 'none' }}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          >
            {i === selectedIndex && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                className="absolute inset-0 bg-white"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default AnimeHero;
