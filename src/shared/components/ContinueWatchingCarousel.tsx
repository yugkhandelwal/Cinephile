import { memo, useState, useEffect, useRef } from "react";
import { useContinueWatching, ContinueWatchingItem } from "@/shared/hooks/useContinueWatching";
import { Link } from "react-router-dom";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const STORAGE_KEY = "cinephile_continue_watching";

// ────────────────────────────────────────────────
// Isolated ProgressBar — reads localStorage directly at 1Hz
// so the parent card never re-renders during playback
// ────────────────────────────────────────────────
const ProgressBar = memo(({ itemId, initialPct }: { itemId: string; initialPct: number }) => {
  const [pct, setPct] = useState(initialPct);

  useEffect(() => {
    const tick = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const items: ContinueWatchingItem[] = JSON.parse(raw);
        const match = items.find((i) => i.id === itemId);
        if (match) setPct(Math.min(100, Number(match.progressPercentage) || 0));
      } catch { /* noop */ }
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [itemId]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-50">
      <div
        className="h-full bg-primary transition-[width] duration-700 ease-linear shadow-[0_0_10px_hsl(var(--primary)/0.8)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
});
ProgressBar.displayName = "ProgressBar";

// ────────────────────────────────────────────────
// Memoized card — only re-renders when item metadata
// (id, title, backdropUrl) changes; never during playback
// ────────────────────────────────────────────────
interface CardProps {
  item: ContinueWatchingItem;
  getUrl: (item: ContinueWatchingItem) => string;
  getSubtitle: (item: ContinueWatchingItem) => string;
  onRemove: (id: string) => void;
}

const ContinueWatchingCard = memo(({ item, getUrl, getSubtitle, onRemove }: CardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex-none snap-start relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-video w-[280px] sm:w-[320px] md:w-[400px] lg:w-[480px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={getUrl(item)} className="block relative w-full h-full overflow-hidden bg-black/50">
        <img
          src={item.backdropUrl || item.posterUrl || "https://placehold.co/640x360/1a1a2e/ffffff?text=No+Image"}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/640x360/1a1a2e/ffffff?text=No+Image";
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/80 transition-colors duration-300" />

        {/* Play button — center */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.5)] scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-7 h-7 text-white ml-1 fill-white" />
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-5 left-5 right-5 pointer-events-none text-left z-10">
          <h3 className="font-bold text-white text-lg md:text-2xl leading-tight truncate drop-shadow-md">{item.title}</h3>
          <p className="text-sm md:text-base text-primary font-bold mt-1.5 drop-shadow-md">{getSubtitle(item)}</p>
        </div>

        {/* Progress bar — isolated to prevent parent re-renders */}
        <ProgressBar itemId={item.id} initialPct={Math.min(100, Number(item.progressPercentage) || 0)} />
      </Link>

      {/* Remove button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(item.id); }}
        className={`absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-destructive hover:text-white transition-all backdrop-blur-sm z-50 border border-white/10
          ${hovered ? 'opacity-100 text-white/90 scale-100' : 'opacity-0 text-transparent scale-90 pointer-events-none'}`}
        title="Remove from list"
        aria-label={`Remove ${item.title} from continue watching`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}, (prev, next) =>
  prev.item.id === next.item.id &&
  prev.item.title === next.item.title &&
  prev.item.backdropUrl === next.item.backdropUrl &&
  prev.item.posterUrl === next.item.posterUrl &&
  prev.item.seasonNumber === next.item.seasonNumber &&
  prev.item.episodeNumber === next.item.episodeNumber
);
ContinueWatchingCard.displayName = "ContinueWatchingCard";

// ────────────────────────────────────────────────
// Main carousel
// ────────────────────────────────────────────────
interface ContinueWatchingCarouselProps {
  filter?: "movies_tv" | "anime";
}

export default function ContinueWatchingCarousel({ filter }: ContinueWatchingCarouselProps) {
  const { items, removeItem } = useContinueWatching();
  const railRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter((item) => {
    if (filter === "movies_tv") return item.mediaType === "movie" || item.mediaType === "tv";
    if (filter === "anime") return item.mediaType === "anime";
    return true;
  });

  if (!filteredItems || filteredItems.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? el.clientWidth * 0.75 : -el.clientWidth * 0.75, behavior: "smooth" });
  };

  const getUrl = (item: ContinueWatchingItem) => {
    const params = new URLSearchParams();
    if (item.serverId) params.set("server", item.serverId);
    if (item.currentTime > 0) params.set("t", Math.floor(item.currentTime).toString());

    if (item.mediaType === "movie") return `/play/movie/${item.contentId}?${params.toString()}`;
    if (item.mediaType === "tv") {
      if (item.seasonNumber) params.set("season", item.seasonNumber.toString());
      if (item.episodeNumber) params.set("ep", item.episodeNumber.toString());
      return `/play/tv/${item.contentId}?${params.toString()}`;
    }
    if (item.mediaType === "anime") {
      if (item.episodeNumber) params.set("ep", item.episodeNumber.toString());
      if (item.audioLanguage) params.set("audio", item.audioLanguage);
      return `/anime/watch/${item.contentId}?${params.toString()}`;
    }
    return "/";
  };

  const getSubtitle = (item: ContinueWatchingItem) => {
    if (item.mediaType === "movie") return "Movie";
    if (item.mediaType === "tv") return `S${item.seasonNumber} E${item.episodeNumber}`;
    return `Episode ${item.episodeNumber}`;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full py-12 md:py-16"
    >
      <div className="pl-6 md:pl-12 lg:pl-16 pr-6 mb-8">
        <h2 className="text-2xl md:text-4xl font-bold text-foreground font-heading tracking-tight">Continue Watching</h2>
        <p className="text-base text-muted-foreground mt-1">Pick up where you left off</p>
      </div>

      <div className="relative w-full group/rail">
        {/* Left chevron */}
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 rounded-full glass text-white/70 hover:text-white opacity-0 group-hover/rail:opacity-100 scale-90 group-hover/rail:scale-100 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right chevron */}
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 rounded-full glass text-white/70 hover:text-white opacity-0 group-hover/rail:opacity-100 scale-90 group-hover/rail:scale-100 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={railRef}
          className="flex overflow-x-auto gap-6 pl-6 md:pl-12 lg:pl-16 scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 pr-6 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar"
        >
          {filteredItems.map((item) => (
            <ContinueWatchingCard
              key={item.id}
              item={item}
              getUrl={getUrl}
              getSubtitle={getSubtitle}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Edge fade gradients */}
        <div className="absolute top-0 bottom-8 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-8 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </motion.section>
  );
}
