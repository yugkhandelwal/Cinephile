import { Star, Heart, BookmarkPlus, Loader2, Check } from "lucide-react";
import { addToWatchlist } from "@/shared/api/supabase/watchlist";
import { setLike } from "@/shared/api/supabase/ratings";
import { useAuth } from "@/context/AuthProvider";
import { useState, useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/shared/hooks/use-toast";
import { getPosterImageProps, ASPECT_RATIOS, getAspectRatioPadding } from "@/shared/lib/imageOptimizer";
import { usePrefetchDetails } from "@/shared/api/tmdb/hooks";

interface MovieCardProps {
  id?: number;
  mediaType?: "movie" | "tv";
  title: string;
  year: string;
  rating: number;
  imageUrl: string;
  tag?: string;
}

const MovieCard = ({ id, mediaType = "movie", title, year, rating, imageUrl, tag }: MovieCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const prefetchDetails = usePrefetchDetails();
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const likeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
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
    if (!user || !id || saving) return;
    
    setSaving(true);
    try {
      await addToWatchlist({ media_id: id, media_type: mediaType, title, year, rating, image_url: imageUrl });
      setSaved(true);
      toast({
        title: "Added to Watchlist",
        description: `${title} has been added to your watchlist.`,
      });
      
      // Clear previous timer if it exists
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      // Reset success state after animation
      saveTimerRef.current = setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const onLike = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!user || !id || liking) return;
    
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
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 group-hover:border-white/30 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
        <img 
          {...imageProps}
          src={imageUrl}
          alt={`${title} poster`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none lg:pointer-events-auto">
          {/* Play Icon */}
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl border border-white/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          
          {/* Action Buttons (Top Right) */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 transform lg:translate-x-4 opacity-100 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 transition-all duration-300 delay-100 pointer-events-auto">
            <button 
              onClick={onLike} 
              onKeyDown={(e) => handleKeyDown(e, onLike)}
              disabled={!user || liking || liked} 
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors disabled:opacity-50 border border-white/20"
              title={!user ? "Sign in to like" : liking ? "Liking..." : liked ? "Liked!" : "Like"}
            >
              {liking ? <Loader2 className="w-4 h-4 animate-spin" /> : liked ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            </button>
            <button 
              onClick={onAddWatchlist} 
              onKeyDown={(e) => handleKeyDown(e, onAddWatchlist)}
              disabled={!user || saving || saved} 
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors disabled:opacity-50 border border-white/20"
              title={!user ? "Sign in to add to watchlist" : saving ? "Adding..." : saved ? "Added!" : "Add to Watchlist"}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Top Left Ribbon Badge */}
        {tag && (
          <div 
            className="absolute top-0 left-4 bg-[#d72323] text-white flex flex-col items-center justify-start pt-2.5 pb-3.5 px-2.5 z-10 shadow-lg"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}
          >
            {tag.split(' ').map((line, i) => (
              <span key={i} className="text-[11px] font-black leading-none uppercase tracking-wider">{line}</span>
            ))}
          </div>
        )}
      </div>
      
      {/* Metadata */}
      <div className="pt-3 flex flex-col gap-1.5 px-1">
        <h3 className="font-sans font-normal text-white text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs md:text-[13px] text-gray-400 font-medium whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-1.5 text-red-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-gray-300">{rating?.toFixed(1) || rating || 'N/A'}</span>
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
