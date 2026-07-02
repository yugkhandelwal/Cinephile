import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MovieCard from "@/shared/components/MovieCard";
import { useParams, useNavigate } from "react-router-dom";
import { useDetails, useSeason } from "@/shared/api/tmdb/hooks";
import { toPoster, pickRegionProvider } from "@/shared/api/tmdb/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Star, Calendar, Clock, Tv, Play, Heart, BookmarkPlus, Share2, Loader2, Check, PlayCircle, ArrowLeft, Volume2, VolumeX, ArrowDownUp, Search, Download } from "lucide-react";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/shared/api/supabase/watchlist";
import { setLike } from "@/shared/api/supabase/ratings";
import { useAuth } from "@/context/AuthProvider";
import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "@/shared/hooks/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/components/ui/dialog";
import { TmdbSeason, TmdbEpisode } from "@/shared/api/tmdb/types";
import ReactPlayer from "react-player";
import { useWatchHistory } from "@/shared/hooks/useWatchHistory";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const getDirectProviderLink = (providerName: string, title: string, fallbackLink: string = '#') => {
  if (!title) return fallbackLink;
  
  const query = encodeURIComponent(title);
  const name = providerName.toLowerCase();
  
  if (name.includes('netflix')) return `https://www.netflix.com/search?q=${query}`;
  if (name.includes('amazon') || name.includes('prime')) return `https://www.amazon.com/s?k=${query}&i=instant-video`;
  if (name.includes('disney')) return `https://www.disneyplus.com/search?q=${query}`;
  if (name.includes('hulu')) return `https://www.hulu.com/search?q=${query}`;
  if (name.includes('apple tv') || name.includes('apple')) return `https://tv.apple.com/us/search?q=${query}`;
  if (name.includes('hbo') || name.includes('max')) return `https://play.max.com/search?q=${query}`;
  if (name.includes('peacock')) return `https://www.peacocktv.com/watch/search?q=${query}`;
  if (name.includes('paramount')) return `https://www.paramountplus.com/search/?q=${query}`;
  if (name.includes('crunchyroll')) return `https://www.crunchyroll.com/search?q=${query}`;
  if (name.includes('hotstar')) return `https://www.hotstar.com/in/explore?search_query=${query}`;
  if (name.includes('zee5')) return `https://www.zee5.com/search?q=${query}`;
  if (name.includes('jio')) return `https://www.jiocinema.com/search?q=${query}`;
  if (name.includes('sony')) return `https://www.sonyliv.com/search?q=${query}`;
  
  return fallbackLink;
};

const TitlePage = () => {
  const navigate = useNavigate();
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

  const { type, id } = useParams();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVideoLoaded(false);
  }, [id]);

  const kind = (type === "tv" ? "tv" : "movie") as "movie" | "tv";
  const { data, isLoading, isError, error } = useDetails(kind, id);
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
  
  const isSaved = watchlist?.some(w => w.media_id === Number(id)) || false;
  
  useEffect(() => {
    return () => {
      if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  const d = data?.details;
  useDocumentTitle(d?.title || d?.name ? `${d?.title || d?.name}` : "Title");

  const { addToHistory } = useWatchHistory();

  useEffect(() => {
    if (d && id) {
      addToHistory({
        id: Number(id),
        mediaType: kind,
        title: d.title || d.name || '',
        year: (d.release_date || d.first_air_date || '').slice(0, 4),
        rating: d.vote_average || 0,
        imageUrl: toPoster(d.poster_path)
      });
    }
  }, [d, id, kind, addToHistory]); // Include full dependencies

  const handleAddWatchlist = async () => {
    if (!d || !id || saving) return;
    
    setSaving(true);
    try {
      if (isSaved) {
        await removeFromWatchlist(Number(id));
        toast({
          title: "Removed from Watchlist",
          description: `${d.title || d.name} has been removed.`,
        });
      } else {
        await addToWatchlist({
          media_id: Number(id),
          media_type: kind,
          title: d.title || d.name || '',
          year: (d.release_date || d.first_air_date || '').slice(0, 4),
          rating: d.vote_average || 0,
          image_url: toPoster(d.poster_path)
        });
        toast({
          title: "Added to Watchlist",
          description: `${d.title || d.name} has been added to your watchlist.`,
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
    if (!d || !id || liking) return;
    
    setLiking(true);
    try {
      await setLike(Number(id), kind, true, d.title || d.name || '');
      setLiked(true);
      toast({
        title: "Liked",
        description: `You liked ${d.title || d.name}.`,
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
          title: d?.title || d?.name || 'Check this out!',
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
      // Ignore if user cancelled share dialog
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

  return (
    <div id="main" className="min-h-screen bg-background animate-fade-in">
      <div className="w-full">
        {isLoading && (
          <div className="pt-24 container mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
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
                const trailer = d.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
                return (
                  <>
                    {/* Always render banner as fallback/loading background */}
                    <div
                      className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${trailer && isVideoLoaded ? 'opacity-0' : 'opacity-60'}`}
                      style={{ 
                        backgroundImage: `url(${d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : '/placeholder.svg'})` 
                      }}
                    />
                    
                    {/* Render trailer on top, fading in once loaded */}
                    {trailer && (
                      <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-black flex items-center justify-center transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <iframe
                          ref={playerRef}
                          onLoad={() => {
                            setTimeout(() => setIsVideoLoaded(true), 1500);
                          }}
                          className="w-[150vw] h-[150vh] max-w-none opacity-70 pointer-events-none"
                          src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&modestbranding=1&enablejsapi=1&disablekb=1&iv_load_policy=3&loop=1&playlist=${trailer.key}`}
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

              {/* Gradients to seamlessly blend the image into the background */}
              <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none transition-opacity duration-1000 ${isInactive ? 'opacity-40' : 'opacity-100'}`} />
              <div className={`absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent pointer-events-none transition-opacity duration-1000 ${isInactive ? 'opacity-0' : 'opacity-100'}`} />
              
              {/* Content Overlay */}
              <div className="relative w-full h-full flex items-end pb-8 md:pb-16 lg:pb-24 z-20">
                <div className="pl-4 sm:pl-6 md:pl-16 lg:pl-24 pr-4 sm:pr-6 max-w-4xl w-full">
                  
                  {/* Title Info */}
                  <div className={`flex flex-col transition-all duration-1000 origin-bottom-left ${isInactive ? 'scale-95 opacity-50 translate-y-8' : 'scale-100 opacity-100'}`}>
                    {(() => {
                      const logos = d.images?.logos;
                      const enLogo = logos?.find(l => l.iso_639_1 === 'en') || logos?.[0];
                      
                      return enLogo ? (
                        <div className="mb-6 max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md">
                          <img 
                            src={`https://image.tmdb.org/t/p/w500${enLogo.file_path}`} 
                            alt={d.title || d.name} 
                            className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                          />
                        </div>
                      ) : (
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 font-heading tracking-wide drop-shadow-2xl text-white">
                          {d.title || d.name}
                        </h1>
                      );
                    })()}
                    
                    {/* Meta Info */}
                    <div className={`flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base font-medium transition-all duration-1000 ${isInactive ? 'opacity-0 h-0 overflow-hidden !mb-0' : 'opacity-100 h-6'}`}>
                      {d.vote_average > 0 && (
                        <div className="flex items-center gap-1.5 text-yellow-500 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-white font-bold">{d.vote_average.toFixed(1)}</span>
                        </div>
                      )}

                      {(d.release_date || d.first_air_date) && (
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <span>{(d.release_date || d.first_air_date || '').slice(0, 4)}</span>
                        </div>
                      )}
                      
                      {d.runtime > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <span className="text-gray-500 font-bold">·</span>
                          <span>{Math.floor(d.runtime / 60)}h {d.runtime % 60}m</span>
                        </div>
                      )}
                      
                      {d.number_of_seasons > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <span className="text-gray-500 font-bold">·</span>
                          <span>{d.number_of_seasons} Season{d.number_of_seasons > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {/* Genres */}
                      {d.genres && d.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center ml-2 border-l border-white/20 pl-4">
                          {d.genres.slice(0, 3).map((g) => (
                            <span key={g.id} className="text-gray-200">
                              {g.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className={`flex flex-wrap items-center gap-3 sm:gap-4 transition-all duration-1000 ${isInactive ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      <button 
                        onClick={() => navigate(`/play/${kind}/${id}${kind === 'tv' ? '?s=1&e=1' : ''}`)}
                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] text-sm sm:text-base whitespace-nowrap"
                      >
                        <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        Play Now
                      </button>
                      
                      <button
                        onClick={handleAddWatchlist}
                        disabled={saving}
                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 backdrop-blur-md border px-5 sm:px-6 py-3 sm:py-4 rounded-full font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base whitespace-nowrap shadow-lg ${
                          isSaved ? "bg-primary text-white border-primary hover:bg-primary/80" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        }`}
                        aria-label={saving ? "Updating..." : isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
                      >
                        {saving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : isSaved ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
                        {isSaved ? "Added" : "Watchlist"}
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

                      {d.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') && (
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
            {/* Streaming Providers */}
            {(() => {
              const prov = d["watch/providers"];
              const region = Intl.DateTimeFormat().resolvedOptions().timeZone?.includes("America") ? "US" : "IN";
              const entry = pickRegionProvider(prov, region);
              if (!entry) return null;
              const flat: { logo: string; name: string }[] = [
                ...(entry.flatrate || []),
                ...(entry.ads || []),
                ...(entry.free || []),
                ...(entry.rent || []),
                ...(entry.buy || []),
              ].slice(0, 8).map((p) => ({ logo: p.logo_path, name: p.provider_name }));
              if (!flat.length) return null;
              return (
                <div className="px-4 sm:px-6 md:px-16 lg:px-24 max-w-5xl mt-8 sm:mt-12 mb-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 font-heading text-white">
                    <Play className="w-6 h-6 text-white" />
                    Available on
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {flat.map((p, i) => (
                      <a 
                        key={i} 
                        href={getDirectProviderLink(p.name, d.title || d.name || '', entry.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 hover:bg-white/20 hover:border-white/30 transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95 group"
                      >
                        <img 
                          src={p.logo ? `https://image.tmdb.org/t/p/w92${p.logo}` : '/placeholder.svg'} 
                          loading="lazy" 
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover group-hover:shadow-md transition-shadow" 
                        />
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{p.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Content Sections */}
            <div className="flex flex-col gap-12 pb-24">
              {/* Seasons */}
              {kind === "tv" && d.seasons && d.seasons.length > 0 && (
                <div className="px-6 md:px-16 lg:px-24 max-w-5xl mt-8">
                  <h2 className="text-2xl font-bold mb-4 font-heading text-white">Episodes</h2>
                  <SeasonsTab tvId={id} seasons={d.seasons || []} />
                </div>
              )}

              {/* Storyline & Details */}
              <div className="px-4 sm:px-6 md:px-16 lg:px-24 max-w-5xl">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 font-heading text-white">Storyline</h2>
                <p className="text-base sm:text-lg leading-relaxed text-gray-300">
                  {d.overview || 'No overview available.'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  {d.status && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <p className="font-medium text-gray-200">{d.status}</p>
                    </div>
                  )}
                  {(d as any).original_language && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Language</p>
                      <p className="font-medium text-gray-200">{(d as any).original_language.toUpperCase()}</p>
                    </div>
                  )}
                  {(d as any).budget && (d as any).budget > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Budget</p>
                      <p className="font-medium text-gray-200">${((d as any).budget / 1000000).toFixed(1)}M</p>
                    </div>
                  )}
                  {(d as any).revenue && (d as any).revenue > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Revenue</p>
                      <p className="font-medium text-gray-200">${((d as any).revenue / 1000000).toFixed(1)}M</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Billed Cast */}
              {d.credits?.cast?.length > 0 && (
                <div className="w-full">
                  <div className="px-4 sm:px-6 md:px-16 lg:px-24 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">Top Cast</h2>
                  </div>
                  <div className="flex overflow-x-auto gap-4 pl-4 sm:pl-6 md:pl-16 lg:pl-24 scroll-pl-4 sm:scroll-pl-6 md:scroll-pl-16 lg:scroll-pl-24 pr-4 sm:pr-8 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar">
                    {d.credits.cast.slice(0, 18).map((c) => (
                      <div key={c.id} className="flex-none w-[120px] sm:w-[140px] snap-start group text-center cursor-pointer">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-white transition-all shadow-lg mb-3 bg-white/5">
                          <img 
                            src={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '/placeholder.svg'} 
                            loading="lazy" 
                            alt={c.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                        </div>
                        <p className="text-sm font-semibold text-gray-200 line-clamp-1">{c.name}</p>
                        {c.character && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{c.character}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Trailer */}
              {d.videos?.results?.find((v)=> v.site === 'YouTube' && v.type === 'Trailer') && (
                <div className="px-4 sm:px-6 md:px-16 lg:px-24 max-w-5xl">
                  <h2 className="text-xl sm:text-2xl font-bold mb-6 font-heading text-white">Official Trailer</h2>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${d.videos!.results.find((v)=> v.site==='YouTube' && v.type==='Trailer')!.key}`}
                      title="Trailer"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}



              {/* You May Also Like */}
              {data.recommendations?.length > 0 && (
                <div className="w-full">
                  <div className="px-4 sm:px-6 md:px-16 lg:px-24 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">You May Also Like</h2>
                  </div>
                  <div className="flex overflow-x-auto gap-3 sm:gap-4 pl-4 sm:pl-6 md:pl-16 lg:pl-24 scroll-pl-4 sm:scroll-pl-6 md:scroll-pl-16 lg:scroll-pl-24 pr-4 sm:pr-8 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar">
                    {data.recommendations.slice(0, 18).map((m) => (
                      <div key={`${m.mediaType}-${m.id}`} className="flex-none w-[160px] sm:w-[200px] md:w-[240px] snap-start">
                        <MovieCard {...m} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

// Seasons Tab Component for TV Shows
interface SeasonsTabProps {
  tvId: string | undefined;
  seasons: TmdbSeason[];
}

const SeasonsTab = ({ tvId, seasons }: SeasonsTabProps) => {
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { data: seasonData, isLoading } = useSeason(tvId, selectedSeason);

  const regularSeasons = seasons.filter(s => s.season_number > 0);

  const filteredEpisodes = (seasonData?.episodes || [])
    .filter((ep: TmdbEpisode) => ep.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a: TmdbEpisode, b: TmdbEpisode) => {
      if (sortOrder === 'asc') return a.episode_number - b.episode_number;
      return b.episode_number - a.episode_number;
    });

  return (
    <div className="space-y-6 pt-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Select value={selectedSeason.toString()} onValueChange={(val) => setSelectedSeason(parseInt(val))}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white font-medium h-12 rounded-xl transition-colors focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white rounded-xl shadow-2xl">
            {regularSeasons.map((season) => (
              <SelectItem key={season.season_number} value={season.season_number.toString()} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                Season {season.season_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search episode..." 
            className="w-full pl-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-0 focus-visible:border-white/30 hover:bg-white/10 transition-colors shadow-inner"
          />
        </div>

        <button 
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="h-12 w-12 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0 active:scale-95"
        >
          <ArrowDownUp className="w-5 h-5" />
        </button>
      </div>

      {/* Episodes List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-6">
              <Skeleton className="w-40 md:w-48 h-full rounded-xl bg-white/5" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-1/3 bg-white/5 rounded-md" />
                <Skeleton className="h-4 w-16 bg-white/5 rounded-md" />
                <Skeleton className="h-4 w-full bg-white/5 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEpisodes.length > 0 ? (
        <div className="space-y-3">
          {filteredEpisodes.map((episode: TmdbEpisode) => (
            <div 
              key={episode.id}
              onClick={() => navigate(`/play/tv/${tvId}?s=${selectedSeason}&e=${episode.episode_number}`)}
              className="flex items-center gap-6 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer text-left w-full"
            >
              <div className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 group-hover:border-white/20 transition-colors">
                {episode.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                    alt={episode.name}
                    className="w-40 md:w-56 aspect-[16/9] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-40 md:w-56 aspect-[16/9] bg-zinc-800 flex items-center justify-center">
                    <Tv className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                {/* Episode Number Badge */}
                <div className="absolute bottom-2 left-2 bg-black/90 backdrop-blur-sm text-white/90 text-xs font-bold px-2 py-0.5 rounded-md border border-white/10 shadow-lg">
                  {episode.episode_number}
                </div>
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-lg md:text-xl font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                  {episode.name}
                </h4>
                {episode.runtime > 0 && (
                  <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide">
                    {episode.runtime} min
                  </p>
                )}
                <p className="text-sm md:text-base text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {episode.overview || 'No episode description available.'}
                </p>
              </div>

              <button className="shrink-0 p-3 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all md:mr-4 opacity-0 group-hover:opacity-100 hidden sm:flex active:scale-95">
                <PlayCircle className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
          <p className="text-gray-400 text-lg">No episodes found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default TitlePage;
