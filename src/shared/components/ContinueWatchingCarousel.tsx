import { useContinueWatching, ContinueWatchingItem } from "@/shared/hooks/useContinueWatching";
import { Link } from "react-router-dom";
import { Play, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ContinueWatchingCarouselProps {
  filter?: "movies_tv" | "anime";
}

export default function ContinueWatchingCarousel({ filter }: ContinueWatchingCarouselProps) {
  const { items, removeItem } = useContinueWatching();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    if (filter === "movies_tv") return item.mediaType === "movie" || item.mediaType === "tv";
    if (filter === "anime") return item.mediaType === "anime";
    return true;
  });

  if (!filteredItems || filteredItems.length === 0) return null;

  const getUrl = (item: ContinueWatchingItem) => {
    const params = new URLSearchParams();
    if (item.serverId) params.set('server', item.serverId);
    if (item.currentTime > 0) params.set('t', Math.floor(item.currentTime).toString());

    if (item.mediaType === 'movie') {
      return `/play/movie/${item.contentId}?${params.toString()}`;
    } else if (item.mediaType === 'tv') {
      if (item.seasonNumber) params.set('season', item.seasonNumber.toString());
      if (item.episodeNumber) params.set('ep', item.episodeNumber.toString());
      return `/play/tv/${item.contentId}?${params.toString()}`;
    } else if (item.mediaType === 'anime') {
      if (item.episodeNumber) params.set('ep', item.episodeNumber.toString());
      if (item.audioLanguage) params.set('audio', item.audioLanguage);
      return `/anime/watch/${item.contentId}?${params.toString()}`;
    }
    return "/";
  };

  const getSubtitle = (item: ContinueWatchingItem) => {
    if (item.mediaType === 'movie') {
      return 'Movie';
    } else if (item.mediaType === 'tv') {
      return `S${item.seasonNumber} E${item.episodeNumber}`;
    } else {
      return `Episode ${item.episodeNumber}`;
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full py-12 md:py-16"
    >
      <div className="pl-6 md:pl-12 lg:pl-16 pr-6">
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground font-heading tracking-tight">Continue Watching</h2>
            <p className="text-base text-muted-foreground mt-1">Pick up where you left off</p>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div className="flex overflow-x-auto gap-6 pl-6 md:pl-12 lg:pl-16 scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 pr-6 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="flex-none snap-start relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-video w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px]"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link to={getUrl(item)} className="block relative w-full h-full overflow-hidden bg-black/50">
                <img 
                  src={item.backdropUrl || item.posterUrl || "https://via.placeholder.com/640x360?text=No+Image"} 
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/640x360?text=No+Image";
                  }}
                />
                {/* Gradient overlay to make text readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:bg-black/40 transition-colors" />
                
                {/* Play Button Overlay (Center) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_20px_rgba(145,70,255,0.5)]">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </div>

                {/* Text Content Overlay (Bottom) */}
                <div className="absolute bottom-5 left-5 right-5 pointer-events-none text-left z-10">
                  <h3 className="font-bold text-white text-lg md:text-2xl leading-tight truncate drop-shadow-md">{item.title}</h3>
                  <p className="text-sm md:text-base text-primary font-bold mt-1.5 drop-shadow-md">{getSubtitle(item)}</p>
                </div>

                {/* Progress Bar Background Track (Always visible) */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/30 backdrop-blur z-50">
                  {/* Actual Progress Fill */}
                  <div 
                    className="h-full bg-primary shadow-[0_0_15px_rgba(145,70,255,0.9)]"
                    style={{ width: `${Math.min(100, Number(item.progressPercentage) || 0)}%` }}
                  />
                </div>
              </Link>

              {/* Remove Button (Top Right) */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className={`absolute top-4 right-4 p-2.5 rounded-full bg-black/40 hover:bg-black/60 hover:text-white transition-all backdrop-blur-sm z-50
                  ${hoveredId === item.id ? 'opacity-100 text-white/90 scale-100' : 'opacity-0 text-transparent scale-90 pointer-events-none'}`}
                title="Remove from list"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Fade gradients for the edges */}
        <div className="absolute top-0 bottom-8 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-8 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </motion.section>
  );
}
