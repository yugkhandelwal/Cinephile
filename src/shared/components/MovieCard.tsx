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
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img 
          {...imageProps}
          src={imageUrl} // Fallback to original if not TMDb image
          alt={`${title} poster`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {tag && (
          <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold">
            {tag}
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold">{rating}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{year}</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={onLike} 
              onKeyDown={(e) => handleKeyDown(e, onLike)}
              disabled={!user || liking || liked} 
              className="text-muted-foreground hover:text-destructive transition-all disabled:opacity-50 disabled:cursor-not-allowed relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label={liking ? "Liking..." : liked ? "Liked" : "Like"}
              title={!user ? "Sign in to like" : liking ? "Liking..." : liked ? "Liked!" : "Like"}
              tabIndex={0}
            >
              {liking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : liked ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
            </button>
            <button 
              onClick={onAddWatchlist} 
              onKeyDown={(e) => handleKeyDown(e, onAddWatchlist)}
              disabled={!user || saving || saved} 
              className="text-muted-foreground hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label={saving ? "Adding to watchlist..." : saved ? "Added to watchlist" : "Add to Watchlist"}
              title={!user ? "Sign in to add to watchlist" : saving ? "Adding..." : saved ? "Added!" : "Add to Watchlist"}
              tabIndex={0}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <BookmarkPlus className="w-4 h-4" />
              )}
            </button>
          </div>
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
