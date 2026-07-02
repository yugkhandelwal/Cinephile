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

interface MovieCardProps {
  id?: number;
  mediaType?: "movie" | "tv";
  title: string;
  year: string;
  rating: number;
  imageUrl: string;
  tag?: string;
  onRemove?: () => void;
}

const MovieCard = ({ id, mediaType = "movie", title, year, rating, imageUrl, tag, onRemove }: MovieCardProps) => {
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
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
    };
  }, []);
  
  // Prefetch movie/TV details on hover for faster navigation
  const handlePrefetch = () => {
    if (id) {
      prefetchDetails(mediaType, id);
    }
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
      navigate(`/title/${mediaType}/${id}`);
    }
  };

  // Get optimized image props
  const imageProps = getPosterImageProps(
    imageUrl.includes('image.tmdb.org') ? imageUrl.split('/t/p/')[1]?.replace(/^w\d+/, '') : null,
    `${title} poster`,
    false // Not priority (lazy load)
  );

  return (
    <div 
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      tabIndex={0}
      role="article"
      aria-label={`${title} (${year}), rated ${rating}`}
      className="group relative w-full flex flex-col cursor-pointer"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 shadow-md group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] transition-all duration-500 ease-out">
        {/* Inner Glassy Border */}
        <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/20 z-20 pointer-events-none transition-colors duration-500" />
        
        <img 
          {...imageProps}
          src={imageUrl}
          alt={`${title} poster`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Subtle bottom gradient to ensure overlay icons are visible */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none lg:pointer-events-auto z-10">
          {/* Play Icon */}
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-all duration-500 shadow-2xl border border-white/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          
          {/* Action Buttons (Top Right) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 transform lg:translate-x-4 opacity-100 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 transition-all duration-500 delay-100 pointer-events-auto z-30">
            {onRemove && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }} 
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-destructive hover:text-white transition-all duration-300 border border-white/20 shadow-lg active:scale-95"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onLike} 
              onKeyDown={(e) => handleKeyDown(e, onLike)}
              disabled={liking || liked} 
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 border border-white/20 shadow-lg active:scale-95"
              title={liking ? "Liking..." : liked ? "Liked!" : "Like"}
            >
              {liking ? <Loader2 className="w-4 h-4 animate-spin" /> : liked ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            </button>
            <button 
              onClick={onAddWatchlist} 
              onKeyDown={(e) => handleKeyDown(e, onAddWatchlist)}
              disabled={saving} 
              className={`w-9 h-9 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 border border-white/20 shadow-lg active:scale-95 ${
                isSaved ? "bg-primary text-white hover:bg-primary/80" : "bg-black/40 text-white hover:bg-primary"
              }`}
              title={saving ? "Updating..." : isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
            </button>
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
      <div className="pt-4 flex flex-col gap-1 px-1">
        <h3 className="font-semibold text-white text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 font-medium whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current text-primary" />
            <span className="text-gray-300 font-semibold">{rating?.toFixed(1) || rating || 'N/A'}</span>
          </div>
          <span className="text-gray-600 font-bold">·</span>
          <span>{year || 'N/A'}</span>
          <span className="text-gray-600 font-bold">·</span>
          <span className="capitalize">{mediaType === 'tv' ? 'TV Series' : 'Movie'}</span>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
// Only re-render if props actually change
export default memo(MovieCard, (prevProps, nextProps) => {
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
