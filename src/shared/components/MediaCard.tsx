import { Star, Heart, BookmarkPlus, Loader2, Check, X } from "lucide-react";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/shared/api/supabase/watchlist";
import { setLike } from "@/shared/api/supabase/ratings";
import { useAuth } from "@/context/AuthProvider";
import { useState, useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/shared/hooks/use-toast";
import { getPosterImageProps, ASPECT_RATIOS, getAspectRatioPadding } from "@/shared/lib/imageOptimizer";
import { usePrefetchDetails } from "@/shared/api/tmdb/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MediaCardProps {
  id?: number;
  mediaType?: "movie" | "tv" | "anime";
  title: string;
  year: string;
  rating: number;
  imageUrl: string;
  tag?: string;
  onRemove?: () => void;
  enableParallax?: boolean;
}

const MediaCard = ({ id, mediaType = "movie", title, year, rating, imageUrl, tag, onRemove, enableParallax = false }: MediaCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const prefetchDetails = usePrefetchDetails();
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const likeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  
  const { data: watchlist } = useQuery({ 
    queryKey: ["watchlist"], 
    queryFn: getWatchlist,
    staleTime: 60000 
  });
  
  const isSaved = watchlist?.some(w => w.media_id === id) || false;
  
  const [imageLoaded, setImageLoaded] = useState(false);

  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
      if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    };
  }, []);
  
  // Prefetch details on hover for faster navigation
  const handlePrefetch = () => {
    if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    prefetchTimerRef.current = setTimeout(() => {
      if (id) {
        if (mediaType === "anime") {
          queryClient.prefetchQuery({
            queryKey: ["mal", "details", id.toString()],
            queryFn: () => import("@/shared/api/mal/client").then(m => m.malClient.getAnimeDetails(id))
          });
        } else {
          prefetchDetails(mediaType, id);
        }
      }
    }, 150);
  };
  
  const handleMouseLeave = () => {
    if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    if (!enableParallax) return;
    x.set(0);
    y.set(0);
  };

  // Parallax Tilt Physics
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableParallax || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const onAddWatchlist = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!id || saving) return;
    
    setSaving(true);
    try {
      if (isSaved) {
        await removeFromWatchlist(id);
        toast({
          title: "Removed",
          description: `${title} has been removed from your watchlist.`,
        });
      } else {
        await addToWatchlist({ media_id: id, media_type: mediaType, title, year, rating, image_url: imageUrl });
        toast({
          title: "Added",
          description: `${title} has been added to your watchlist.`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const onLike = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!id || liking) return;
    
    setLiking(true);
    try {
      await setLike(id, mediaType, true, title);
      setLiked(true);
      toast({
        title: "Liked",
        description: `You liked ${title}.`,
      });
      
      // Clear previous timer if it exists
      if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
      // Reset success state after animation
      likeTimerRef.current = setTimeout(() => setLiked(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLiking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: (e: React.KeyboardEvent) => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action(e);
    }
  };

  const handleClick = () => {
    if (id) {
      if (mediaType === "anime") {
        navigate(`/anime/${id}`);
      } else {
        import('@/shared/lib/utils').then(({ generateSeoUrl }) => {
          navigate(generateSeoUrl(mediaType, id, title));
        });
      }
    }
  };

  // Get optimized image props
  const imageProps = getPosterImageProps(
    imageUrl.includes('image.tmdb.org') ? imageUrl.split('/t/p/')[1]?.replace(/^w\d+/, '') : null,
    `${title} poster`,
    false // Not priority (lazy load)
  );

  return (
    <motion.div 
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={handlePrefetch}
      tabIndex={0}
      role="article"
      aria-label={`${title} (${year}), rated ${rating}`}
      className="group relative w-full flex flex-col cursor-pointer"
      style={enableParallax ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
      whileHover={enableParallax ? { z: 20 } : {}}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 shadow-md md:group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] transition-all duration-500 ease-out">
        
        {/* Inner Glassy Border */}
        <div className="absolute inset-0 rounded-2xl border border-white/5 md:group-hover:border-white/20 z-20 pointer-events-none transition-colors duration-500" />
        
        {/* Proper gradient shimmer sweep — translates from -100% to +100% */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-skeleton overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          </div>
        )}

        {/* Low-res placeholder for progressive blur-up */}
        {imageUrl.includes('image.tmdb.org') && (
          <img
            src={imageUrl.replace(/\/w\d+\//, '/w92/')}
            alt=""
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-700 ease-out z-0 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        <img
          {...imageProps}
          src={imageUrl.includes('image.tmdb.org') ? imageUrl.replace(/\/w\d+\//, '/w342/') : imageUrl}
          alt={`${title} poster`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            imageLoaded
              ? "scale-100 blur-0 hoverable:group-hover:scale-105 opacity-100"
              : "scale-110 blur-xl opacity-0"
          }`}
        />
        
        {/* Subtle bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 hoverable:group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {/* Remove Button (Always Visible if provided, Outside of Hover Overlay) */}
        {onRemove && (
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }} 
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-destructive hover:text-white transition-all duration-300 border border-white/20 shadow-lg z-30 pointer-events-auto"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}

        {/* Hover Overlay — scoped to hoverable: (fine pointer only, never touch) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hoverable:group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none hoverable:pointer-events-auto z-10">
          {/* Play Icon */}
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white transform scale-90 hoverable:group-hover:scale-100 transition-all duration-500 shadow-2xl border border-white/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          
          {/* Action Buttons (Top Right, Desktop Only) */}
          <div className="absolute top-3 right-3 hidden md:flex flex-col gap-2 transform translate-x-4 opacity-0 hoverable:group-hover:translate-x-0 hoverable:group-hover:opacity-100 transition-all duration-500 delay-100 pointer-events-auto z-30">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onLike}
              onKeyDown={(e) => handleKeyDown(e, onLike)}
              disabled={liking || liked}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 border border-white/20 shadow-lg"
              title={liking ? "Liking..." : liked ? "Liked!" : "Like"}
            >
              <AnimatePresence mode="wait">
                {liking ? (
                  <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </motion.div>
                ) : liked ? (
                  <motion.div key="liked" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </motion.div>
                ) : (
                  <motion.div key="like" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                    <Heart className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onAddWatchlist}
              onKeyDown={(e) => handleKeyDown(e, onAddWatchlist)}
              disabled={saving}
              className={`w-9 h-9 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 border border-white/20 shadow-lg ${
                isSaved ? "bg-primary text-white hover:bg-primary/80" : "bg-black/40 text-white hover:bg-primary"
              }`}
              title={saving ? "Updating..." : isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <AnimatePresence mode="wait">
                {saving ? (
                  <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </motion.div>
                ) : isSaved ? (
                  <motion.div key="saved" initial={{ scale: 0.5, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <Check className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div key="save" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                    <BookmarkPlus className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
        
        {/* Top Left Apple-style Glass Badge */}
        {tag && (
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-black/40 backdrop-blur-md text-white/95 px-2.5 py-1 rounded-md border border-white/10 shadow-lg flex items-center gap-1.5">
              {tag.includes('TOP') && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
              {tag.includes('HOT') && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              <span className="text-[10px] font-bold tracking-widest uppercase">{tag}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Metadata */}
      <div className="pt-3.5 flex flex-col gap-1 px-0.5">
        <h3 className="font-semibold text-white/90 text-[0.875rem] line-clamp-1 hoverable:group-hover:text-primary transition-colors duration-200 tracking-tight leading-snug">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-[0.75rem] text-white/40 font-medium">
          {rating > 0 && (
            <>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-white/60 font-semibold">{rating.toFixed(1)}</span>
              <span className="text-white/20">·</span>
            </>
          )}
          <span>{year || 'N/A'}</span>
          <span className="text-white/20">·</span>
          <span>{mediaType === 'tv' ? 'Series' : mediaType === 'anime' ? 'Anime' : 'Film'}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Memoize component to prevent unnecessary re-renders
// Only re-render if props actually change
export default memo(MediaCard, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.mediaType === nextProps.mediaType &&
    prevProps.title === nextProps.title &&
    prevProps.year === nextProps.year &&
    prevProps.rating === nextProps.rating &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.tag === nextProps.tag
  );
});
