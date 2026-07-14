import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MediaCard from "@/shared/components/MediaCard";
import { useParams, useNavigate } from "react-router-dom";
import { useMalDetails } from "@/shared/api/mal/hooks";
import { useTmdbDetailsByTitle } from "@/shared/api/tmdb/hooks";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Star, Clock, PlayCircle, ArrowLeft, BookmarkPlus, Heart, Share2, Loader2, Check, Volume2, VolumeX } from "lucide-react";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/shared/api/supabase/watchlist";
import { setLike } from "@/shared/api/supabase/ratings";
import { useAuth } from "@/context/AuthProvider";
import { useState, useRef, useEffect, useCallback } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "@/shared/hooks/use-toast";
import { useWatchHistory } from "@/shared/hooks/useWatchHistory";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVibrant } from "@/shared/hooks/useVibrant";
import { MovieSEO } from "@/shared/components/MovieSEO";

const AnimeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const actualId = id?.split('-')[0];
  const slug = id?.includes('-') ? id.split('-').slice(1).join('-') : undefined;

  const playerRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    setIsPlaying(true);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (playerRef.current && playerRef.current.contentWindow) {
        playerRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: prev ? 'unMute' : 'mute', args: [] }),
          '*'
        );
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key.toLowerCase() === 'm') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      setIsInactive(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsInactive(true);
      }, 4000);
    };
    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVideoLoaded(false);
  }, [actualId]);

  const { data: d, isLoading, isError, error } = useMalDetails(actualId);
  const { data: tmdbDetails } = useTmdbDetailsByTitle(d?.title);

  const { user } = useAuth();
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const likeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  
  const { data: watchlist } = useQuery({ 
    queryKey: ["watchlist"], 
    queryFn: getWatchlist,
    staleTime: 60000 
  });
  
  const isSaved = watchlist?.some(w => w.media_id === Number(actualId) && w.media_type === "anime") || false;
  
  useEffect(() => {
    return () => {
      if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  const posterUrl = d?.main_picture?.large || d?.main_picture?.medium || "";
  const { colors: vibrantColors } = useVibrant(posterUrl);
  useDocumentTitle(d?.title ? `${d.title} - Anime` : "Anime");

  const { addToHistory } = useWatchHistory();

  useEffect(() => {
    if (d && actualId) {
      addToHistory({
        id: Number(actualId),
        mediaType: "anime",
        title: d.title || '',
        year: d.start_season?.year?.toString() || '',
        rating: d.mean || 0,
        imageUrl: posterUrl
      });
    }
  }, [d, actualId, addToHistory, posterUrl]);

  const handleAddWatchlist = async () => {
    if (!d || !actualId || saving) return;
    
    setSaving(true);
    try {
      if (isSaved) {
        await removeFromWatchlist(Number(actualId));
        toast({
          title: "Removed",
          description: `${d.title} has been removed from your watchlist.`,
        });
      } else {
        await addToWatchlist({ 
          media_id: Number(actualId),
          media_type: "anime",
          title: d.title || '',
          year: d.start_season?.year?.toString() || '',
          rating: d.mean || 0,
          image_url: posterUrl
        });
        toast({
          title: "Added to Watchlist",
          description: `${d.title} has been added to your watchlist.`,
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

  const handleLike = async () => {
    if (!d || !actualId || liking) return;
    
    setLiking(true);
    try {
      await setLike(Number(actualId), "anime", true, d.title || '');
      setLiked(true);
      toast({
        title: "Liked",
        description: `You liked ${d.title}.`,
      });
      if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
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

  const handleShare = async () => {
    if (sharing) return;
    
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: d?.title || 'Check this out!',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Link copied to clipboard!",
        });
      }
      setShared(true);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
      shareTimerRef.current = setTimeout(() => setShared(false), 2000);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to share. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSharing(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"overview" | "similar">("overview");

  // Choose the best backdrop: prefer a landscape picture, fallback to a blurred poster
  const backgroundPicture = d?.pictures?.find(p => p.large !== posterUrl)?.large || posterUrl;

  return (
    <div id="main" className="min-h-screen bg-background animate-fade-in pb-tabbar">
      <div className="w-full">
        {isLoading && (
          <div className="pt-24 container mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
              <Skeleton className="h-[70vh] md:h-[85vh] w-full rounded-2xl" />
            </div>
          </div>
        )}
        {isError && (
          <div className="pt-24 container mx-auto px-4 py-12">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
              <p className="text-destructive font-semibold mb-2">Failed to load content</p>
              <p className="text-sm text-muted-foreground">{String((error as Error)?.message || 'Please try again later')}</p>
            </div>
          </div>
        )}
        {d && (
          <>
            <MovieSEO
              title={d.title || 'Title'}
              description={d.synopsis || 'Description not available.'}
              posterUrl={posterUrl}
              releaseDate={d.start_season ? `${d.start_season.year}-${d.start_season.season}` : ''}
              rating={d.mean || 0}
              genres={d.genres?.map((g: any) => g.name) || []}
              tmdbId={d.id}
              type="tv"
              slug={slug}
            />
            {/* Cinematic Hero Section */}
            <div className="relative w-full h-[70vh] md:h-[85vh] min-h-[500px] md:min-h-[600px] overflow-hidden bg-black group">
              {/* Back Button */}
              <button 
                onClick={() => navigate(-1)}
                className={`absolute top-6 left-6 md:top-8 md:left-8 lg:left-12 z-50 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all duration-700 shadow-lg hover:scale-110 active:scale-95 ${isInactive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              {(() => {
                const trailer = tmdbDetails?.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
                return (
                  <>
                    <div
                      className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${trailer && isVideoLoaded ? 'opacity-0' : 'opacity-60'}`}
                      style={{ 
                        backgroundImage: `url(${backgroundPicture})`,
                        filter: backgroundPicture === posterUrl ? 'blur(20px)' : 'none'
                      }}
                    />

                    {/* Dynamic Color Overlay from Poster */}
                    <div 
                      className="absolute inset-0 transition-colors duration-1000 pointer-events-none mix-blend-multiply opacity-60 z-10"
                      style={{ backgroundColor: vibrantColors?.DarkVibrant || 'transparent' }}
                    />
                    
                    {/* Render trailer on top, fading in once loaded */}
                    {trailer && (
                      <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-black transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <iframe
                          ref={playerRef}
                          onLoad={() => {
                            setTimeout(() => setIsVideoLoaded(true), 1500);
                          }}
                          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none"
                          src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&modestbranding=1&enablejsapi=1&disablekb=1&iv_load_policy=3&cc_load_policy=3&loop=1&playlist=${trailer.key}`}
                          title="Trailer"
                          allow="autoplay; encrypted-media"
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </>
                );
              })()}
              
              {/* Gradients */}
              <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none transition-opacity duration-1000 ${isInactive ? 'opacity-40' : 'opacity-100'}`} />
              <div className={`absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent pointer-events-none transition-opacity duration-1000 ${isInactive ? 'opacity-0' : 'opacity-100'}`} />
              
              {/* Content Overlay */}
              <div className="relative w-full h-full flex items-end pb-8 md:pb-16 lg:pb-24 z-20">
                <div className="pl-4 sm:pl-6 md:pl-16 lg:pl-24 pr-4 sm:pr-6 max-w-4xl w-full">
                  
                  {/* Title Info */}
                  <div className={`flex flex-col transition-all duration-1000 origin-bottom-left ${isInactive ? 'scale-95 opacity-50 translate-y-8' : 'scale-100 opacity-100'}`}>
                    {(() => {
                      const logos = tmdbDetails?.images?.logos;
                      const enLogo = logos?.find((l: any) => l.iso_639_1 === 'en') || logos?.find((l: any) => l.iso_639_1 === 'ja') || logos?.[0];
                      
                      return enLogo ? (
                        <div className="mb-6 max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md">
                          <img 
                            src={`https://image.tmdb.org/t/p/w500${enLogo.file_path}`} 
                            alt={d.title} 
                            className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                          />
                        </div>
                      ) : (
                        <h1 
                          className="font-bold mb-4 sm:mb-2 font-heading tracking-wide drop-shadow-2xl text-white transition-all duration-1000 line-clamp-2"
                          style={{ 
                            fontSize: 'clamp(2rem, 6vw, 4rem)',
                            textShadow: vibrantColors?.Vibrant ? `0 4px 40px ${vibrantColors.Vibrant}80` : undefined 
                          }}
                        >
                          {d.title}
                        </h1>
                      );
                    })()}
                    {d.alternative_titles?.ja && (
                      <h2 className="text-xl sm:text-2xl text-gray-300 font-medium mb-6 font-heading drop-shadow-lg">
                        {d.alternative_titles.ja}
                      </h2>
                    )}
                    
                    {/* Meta Info */}
                    <div className={`flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base font-medium transition-all duration-1000 ${isInactive ? 'opacity-0 h-0 overflow-hidden !mb-0' : 'opacity-100 h-auto'}`}>
                      {d.mean && d.mean > 0 && (
                        <div className="flex items-center gap-1.5 text-yellow-500 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-white font-bold">{d.mean.toFixed(2)}</span>
                        </div>
                      )}

                      {d.start_season && (
                        <div className="flex items-center gap-1.5 text-gray-200 capitalize">
                          <span>{d.start_season.season} {d.start_season.year}</span>
                        </div>
                      )}
                      
                      {d.num_episodes && d.num_episodes > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <span className="text-gray-400 font-bold">·</span>
                          <span>{d.num_episodes} Episodes</span>
                        </div>
                      )}

                      {d.average_episode_duration && d.average_episode_duration > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <span className="text-gray-400 font-bold">·</span>
                          <span>{Math.floor(d.average_episode_duration / 60)}m</span>
                        </div>
                      )}
                      
                      {/* Genres */}
                      {d.genres && d.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center ml-2 border-l border-white/20 pl-4">
                          {d.genres.slice(0, 3).map((g, index, array) => (
                            <span key={g.id} className="text-gray-200 flex items-center gap-2">
                              {g.name}
                              {index < array.length - 1 && <span className="text-gray-400 font-bold">•</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className={`flex flex-row items-center gap-3 sm:gap-4 overflow-x-auto hide-scrollbar w-[100vw] -ml-4 pl-4 pr-4 sm:ml-0 sm:pl-0 sm:pr-0 sm:w-auto pb-2 transition-all duration-1000 ${isInactive ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      <button
                        onClick={() => navigate(`/anime/watch/${actualId}?ep=1`)}
                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-rose-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.3)] text-sm sm:text-base whitespace-nowrap"
                        style={{ boxShadow: vibrantColors?.Vibrant ? `0 0 20px ${vibrantColors.Vibrant}80` : undefined }}
                      >
                        <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="sm:hidden">Play</span>
                        <span className="hidden sm:inline">Play Now</span>
                      </button>
                      
                      <button
                        onClick={handleAddWatchlist}
                        disabled={saving}
                        className={`flex items-center justify-center gap-2 backdrop-blur-md border rounded-full font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shrink-0 w-12 h-12 sm:w-auto sm:h-auto sm:px-6 sm:py-4 ${
                          isSaved ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        }`}
                        aria-label={saving ? "Updating..." : isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
                      >
                        {saving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : isSaved ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
                        <span className="hidden sm:inline text-base whitespace-nowrap">{isSaved ? "Added" : "Watchlist"}</span>
                      </button>
                      
                      <button
                        onClick={handleLike}
                        disabled={liking || liked}
                        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-red-500 hover:border-red-500 hover:text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shrink-0 shadow-lg"
                        aria-label={liking ? "Liking..." : liked ? "Liked" : "Like"}
                      >
                        {liking ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : liked ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                      
                      <button
                        onClick={handleShare}
                        disabled={sharing || shared}
                        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shrink-0 shadow-lg"
                        aria-label={sharing ? "Sharing..." : shared ? "Shared" : "Share"}
                      >
                        {sharing ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : shared ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>

                      {tmdbDetails?.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') && (
                        <button
                          onClick={toggleMute}
                          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-black/40 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-black/60 transition-all hover:scale-105 active:scale-95 sm:ml-2 shrink-0 shadow-lg"
                          aria-label={isMuted ? "Unmute Trailer" : "Mute Trailer"}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="max-w-5xl mb-8 border-b border-white/10 w-full">
              <div className="flex gap-6 overflow-x-auto hide-scrollbar px-4 sm:px-6 md:px-16 lg:px-24">
                <button 
                  onClick={() => setActiveTab("overview")} 
                  className={`font-bold pb-4 border-b-2 transition-colors whitespace-nowrap px-1 ${activeTab === "overview" ? "border-rose-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab("similar")} 
                  className={`font-bold pb-4 border-b-2 transition-colors whitespace-nowrap px-1 ${activeTab === "similar" ? "border-rose-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
                >
                  Recommendations
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex flex-col gap-12 pb-24">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="px-4 sm:px-6 md:px-16 lg:px-24 max-w-5xl animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 font-heading text-white">Synopsis</h2>
                  <p className="text-base sm:text-lg leading-relaxed text-gray-300">
                    {d.synopsis || 'No synopsis available.'}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 p-6 bg-white/5 rounded-2xl border border-white/5">
                    {d.status && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Status</p>
                        <p className="font-medium text-gray-200 capitalize">{d.status.replace(/_/g, ' ')}</p>
                      </div>
                    )}
                    {d.rank && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Rank</p>
                        <p className="font-medium text-gray-200">#{d.rank}</p>
                      </div>
                    )}
                    {d.popularity && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Popularity</p>
                        <p className="font-medium text-gray-200">#{d.popularity}</p>
                      </div>
                    )}
                    {d.studios && d.studios.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Studios</p>
                        <p className="font-medium text-gray-200">{d.studios.map(s => s.name).join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Similar Tab */}
              {activeTab === "similar" && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4">
                  {d.recommendations && d.recommendations.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-6 md:px-16 lg:px-24 max-w-7xl">
                      {d.recommendations.slice(0, 15).map((m) => (
                        <div key={`rec-${m.node.id}`} className="relative group">
                          <MediaCard
                            id={m.node.id}
                            mediaType="anime"
                            title={m.node.title}
                            imageUrl={m.node.main_picture?.large || m.node.main_picture?.medium || ""}
                            rating={m.node.mean || 0}
                            year={m.node.start_season?.year?.toString() || ""}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 sm:px-6 md:px-16 lg:px-24 max-w-5xl">
                      <div className="text-center py-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                        <p className="text-gray-400 text-lg">No recommendations available.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnimeDetails;
