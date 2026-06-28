import { Button } from "@/shared/components/ui/button";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrendingMovies, useDetails } from "@/shared/api/tmdb/hooks";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState, useCallback, useMemo } from "react";
import type { UIMediaItem } from "@/shared/api/tmdb/hooks";

const HeroSlide = ({ featured }: { featured: UIMediaItem }) => {
  const navigate = useNavigate();
  // Fetch extra details including images (logos) for this specific movie
  const { data } = useDetails("movie", featured.id);
  
  const backdropUrl = featured.backdropUrl || "/placeholder.svg";
  const year = featured.year || "";
  
  // Extract the english or generic logo
  const logoPath = useMemo(() => {
    if (!data?.details?.images?.logos) return null;
    const logos = data.details.images.logos;
    // Prefer English logo, fallback to any if not found
    const enLogo = logos.find(l => l.iso_639_1 === 'en');
    return enLogo?.file_path || logos[0]?.file_path || null;
  }, [data]);
  
  const logoUrl = logoPath ? `https://image.tmdb.org/t/p/w500${logoPath}` : null;

  return (
    <div className="relative flex-none w-full h-full flex items-center justify-start overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backdropUrl}
          alt={featured.title}
          className="w-full h-full object-cover object-top opacity-70"
        />
        {/* Heavy Gradients to match Cineby Reference (mostly left and bottom) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent w-full md:w-[80%]" />
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 md:px-12 relative z-20 mt-20 md:mt-32">
        <div className="max-w-3xl animate-fade-in">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={featured.title} 
              className="max-w-[300px] md:max-w-[450px] lg:max-w-[500px] h-auto object-contain mb-6 drop-shadow-2xl"
            />
          ) : (
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-3 leading-[1.1] text-white font-heading uppercase tracking-tight drop-shadow-2xl">
              {featured.title}
            </h1>
          )}
          
          {/* Meta Info Row */}
          <div className="flex items-center gap-3 mb-6 text-sm font-semibold tracking-wide text-white/70">
            <span className="flex items-center text-red-500 gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mb-[2px]"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {featured.rating?.toFixed(1)}
            </span>
            <span className="text-white/40">•</span>
            <span>{year}</span>
            <span className="text-white/40">•</span>
            <span>Action</span>
            <span className="text-white/40">•</span>
            <span>Thriller</span>
          </div>

          <p className="text-base md:text-lg text-white/60 mb-10 line-clamp-3 md:line-clamp-4 max-w-xl font-medium leading-relaxed drop-shadow-md">
            {featured.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate(`/title/movie/${featured.id}`)}
              className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 gap-2 shadow-xl hover:scale-105 transition-all text-sm font-bold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Play
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate(`/title/movie/${featured.id}`)}
              className="rounded-full px-8 h-12 gap-2 border-white/20 bg-black/40 text-white hover:bg-black/60 hover:border-white/30 backdrop-blur-md transition-all text-sm font-semibold"
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

const Hero = () => {
  const { data: trendingMovies } = useTrendingMovies();
  
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

  if (!trendingMovies || trendingMovies.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-background animate-pulse">
        <div className="absolute inset-0 bg-muted/20" />
      </section>
    );
  }

  return (
    <section className="relative h-screen w-full bg-black overflow-hidden" ref={emblaRef}>
      <div className="flex h-full touch-pan-y">
        {trendingMovies.slice(0, 10).map((featured) => (
          <HeroSlide key={featured.id} featured={featured} />
        ))}
      </div>
      
      {/* Subtle Carousel Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {trendingMovies?.slice(0, 10).map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === selectedIndex ? "bg-white/80 w-6" : "bg-white/30 hover:bg-white/50"
            }`}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
