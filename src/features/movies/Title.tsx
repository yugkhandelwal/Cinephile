import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MovieCard from "@/shared/components/MovieCard";
import { useParams } from "react-router-dom";
import { useDetails, useSeason } from "@/shared/api/tmdb/hooks";
import { toPoster, pickRegionProvider } from "@/shared/api/tmdb/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Star, Calendar, Clock, Tv, Play, Heart, BookmarkPlus, Share2, Loader2, Check, Copy } from "lucide-react";
import { addToWatchlist } from "@/shared/api/supabase/watchlist";
import { setLike } from "@/shared/api/supabase/ratings";
import { useAuth } from "@/context/AuthProvider";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "@/shared/hooks/use-toast";
import { TmdbSeason, TmdbEpisode } from "@/shared/api/tmdb/types";

const TitlePage = () => {
  const { type, id } = useParams();
  const kind = (type === "tv" ? "tv" : "movie") as "movie" | "tv";
  const { data, isLoading, isError, error } = useDetails(kind, id);
  const { user } = useAuth();
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const likeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (likeTimerRef.current) clearTimeout(likeTimerRef.current);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  const d = data?.details;
  useDocumentTitle(d?.title || d?.name ? `${d?.title || d?.name}` : "Title");

  const handleAddWatchlist = async () => {
    if (!user || !d || !id || saving) return;
    
    setSaving(true);
    try {
      await addToWatchlist({
        media_id: Number(id),
        media_type: kind,
        title: d.title || d.name || '',
        year: (d.release_date || d.first_air_date || '').slice(0, 4),
        rating: d.vote_average || 0,
        image_url: toPoster(d.poster_path)
      });
      setSaved(true);
      toast({
        title: "Added to Watchlist",
        description: `${d.title || d.name} has been added to your watchlist.`,
      });
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
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

  const handleLike = async () => {
    if (!user || !d || !id || liking) return;
    
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
    <div id="main" className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {isLoading && (
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        )}
        {isError && (
          <div className="container mx-auto px-4 py-12">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
              <p className="text-destructive font-semibold mb-2">Failed to load content</p>
              <p className="text-sm text-muted-foreground">{String((error as Error)?.message || 'Please try again later')}</p>
            </div>
          </div>
        )}
        {d && (
          <>
            {/* Hero Section with Backdrop */}
            <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : '/placeholder.svg'})` 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
              </div>
              
              {/* Content Overlay */}
              <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
                <div className="flex flex-col md:flex-row gap-6 w-full">
                  {/* Poster */}
                  <div className="flex-shrink-0">
                    <img 
                      src={toPoster(d.poster_path)} 
                      alt={d.title || d.name || 'Poster'} 
                      loading="eager"
                      className="w-48 md:w-64 rounded-xl shadow-2xl border-2 border-border/50"
                    />
                  </div>
                  
                  {/* Title Info */}
                  <div className="flex-1 flex flex-col justify-end text-white">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 drop-shadow-lg">
                      {d.title || d.name}
                    </h1>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-4 text-sm md:text-base">
                      {(d.release_date || d.first_air_date) && (
                        <div className="flex items-center gap-1.5 bg-background/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Calendar className="w-4 h-4" />
                          <span>{(d.release_date || d.first_air_date || '').slice(0, 4)}</span>
                        </div>
                      )}
                      
                      {d.runtime && (
                        <div className="flex items-center gap-1.5 bg-background/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Clock className="w-4 h-4" />
                          <span>{Math.floor(d.runtime / 60)}h {d.runtime % 60}m</span>
                        </div>
                      )}
                      
                      {d.number_of_seasons && (
                        <div className="flex items-center gap-1.5 bg-background/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Tv className="w-4 h-4" />
                          <span>{d.number_of_seasons} Season{d.number_of_seasons > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {d.vote_average && (
                        <div className="flex items-center gap-1.5 bg-yellow-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{d.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {d.genres?.map((g) => (
                        <Badge key={g.id} variant="secondary" className="bg-background/40 backdrop-blur-sm border-border/50">
                          {g.name}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleAddWatchlist}
                        disabled={!user || saving || saved}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={saving ? "Adding to watchlist..." : saved ? "Added to watchlist" : "Add to Watchlist"}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Adding...
                          </>
                        ) : saved ? (
                          <>
                            <Check className="w-5 h-5" />
                            Added!
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-5 h-5" />
                            Add to Watchlist
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleLike}
                        disabled={!user || liking || liked}
                        className="flex items-center gap-2 bg-background/40 backdrop-blur-sm text-white border border-border/50 px-6 py-3 rounded-lg font-semibold hover:bg-destructive hover:border-destructive transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={liking ? "Liking..." : liked ? "Liked" : "Like"}
                      >
                        {liking ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Liking...
                          </>
                        ) : liked ? (
                          <>
                            <Check className="w-5 h-5" />
                            Liked!
                          </>
                        ) : (
                          <>
                            <Heart className="w-5 h-5" />
                            Like
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleShare}
                        disabled={sharing || shared}
                        className="flex items-center gap-2 bg-background/40 backdrop-blur-sm text-white border border-border/50 px-6 py-3 rounded-lg font-semibold hover:bg-accent hover:border-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={sharing ? "Sharing..." : shared ? "Shared" : "Share"}
                      >
                        {sharing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sharing...
                          </>
                        ) : shared ? (
                          <>
                            <Check className="w-5 h-5" />
                            Shared!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-5 h-5" />
                            Share
                          </>
                        )}
                      </button>
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
                <div className="bg-card/50 backdrop-blur-sm border-y border-border py-6">
                  <div className="container mx-auto px-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      Available on
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {flat.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-background border border-border rounded-lg px-4 py-2 hover:border-primary transition-colors">
                          <img 
                            src={p.logo ? `https://image.tmdb.org/t/p/w92${p.logo}` : '/placeholder.svg'} 
                            loading="lazy" 
                            alt={p.name}
                            className="w-8 h-8 rounded object-cover" 
                          />
                          <span className="text-sm font-medium">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Tabs Section */}
            <div className="container mx-auto px-4 py-12">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6 bg-card border border-border p-1">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Overview
                  </TabsTrigger>
                  {kind === "tv" && d.seasons && d.seasons.length > 0 && (
                    <TabsTrigger value="seasons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Seasons
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="cast" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Cast & Crew
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Videos
                  </TabsTrigger>
                  <TabsTrigger value="similar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Similar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Storyline</h2>
                        <p className="text-base leading-relaxed text-muted-foreground">
                          {d.overview || 'No overview available.'}
                        </p>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-4">
                        {d.status && (
                          <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="font-semibold">{d.status}</p>
                          </div>
                        )}
                        {(d as any).original_language && (
                          <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Language</p>
                            <p className="font-semibold">{(d as any).original_language.toUpperCase()}</p>
                          </div>
                        )}
                        {(d as any).budget && (d as any).budget > 0 && (
                          <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Budget</p>
                            <p className="font-semibold">${((d as any).budget / 1000000).toFixed(1)}M</p>
                          </div>
                        )}
                        {(d as any).revenue && (d as any).revenue > 0 && (
                          <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                            <p className="font-semibold">${((d as any).revenue / 1000000).toFixed(1)}M</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Official Trailer</h2>
                      {d.videos?.results?.find((v)=> v.site === 'YouTube' && v.type === 'Trailer') ? (
                        <div className="aspect-video rounded-xl overflow-hidden border-2 border-border shadow-lg">
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
                      ) : (
                        <div className="aspect-video bg-card border border-border rounded-xl flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">No trailer available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {kind === "tv" && (
                  <TabsContent value="seasons">
                    <SeasonsTab tvId={id} seasons={d.seasons || []} />
                  </TabsContent>
                )}

                <TabsContent value="cast">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Top Billed Cast</h2>
                    {d.credits?.cast?.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {d.credits.cast.slice(0, 18).map((c) => (
                          <div key={c.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all hover:shadow-lg">
                            <div className="aspect-[2/3] overflow-hidden">
                              <img 
                                src={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '/placeholder.svg'} 
                                loading="lazy" 
                                alt={c.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                              />
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-semibold line-clamp-1">{c.name}</p>
                              {c.character && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.character}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No cast information available.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="videos">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Videos & Clips</h2>
                    {d.videos?.results?.filter((v)=> v.site==='YouTube').length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {d.videos.results.filter((v)=> v.site==='YouTube').slice(0, 12).map((v) => (
                          <div key={`${v.site}-${v.key}`} className="group">
                            <div className="aspect-video rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors shadow-md">
                              <iframe 
                                className="w-full h-full" 
                                src={`https://www.youtube.com/embed/${v.key}`} 
                                title={v.name} 
                                loading="lazy" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen 
                              />
                            </div>
                            <p className="text-sm font-medium mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {v.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-card border border-border rounded-xl">
                        <p className="text-muted-foreground">No videos available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="similar">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                    {data.recommendations?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {data.recommendations.slice(0, 18).map((m) => (
                          <MovieCard key={`${m.mediaType}-${m.id}`} {...m} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-card border border-border rounded-xl">
                        <p className="text-muted-foreground">No similar titles found</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const { data: seasonData, isLoading } = useSeason(tvId, selectedSeason);

  // Filter out special seasons (season 0 is usually specials)
  const regularSeasons = seasons.filter(s => s.season_number > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Seasons & Episodes</h2>
        <Badge variant="secondary" className="text-sm">
          {regularSeasons.length} {regularSeasons.length === 1 ? 'Season' : 'Seasons'}
        </Badge>
      </div>

      {/* Season Selector */}
      <div className="flex gap-2 flex-wrap">
        {regularSeasons.map((season) => (
          <button
            key={season.season_number}
            onClick={() => setSelectedSeason(season.season_number)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedSeason === season.season_number
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-card border border-border hover:border-primary hover:bg-accent'
            }`}
          >
            Season {season.season_number}
          </button>
        ))}
      </div>

      {/* Season Details */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : seasonData ? (
        <div className="space-y-4">
          {/* Season Overview */}
          {seasonData.overview && (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Tv className="w-5 h-5 text-primary" />
                {seasonData.name}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{seasonData.overview}</p>
              {seasonData.air_date && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  First Aired: {new Date(seasonData.air_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              )}
            </div>
          )}

          {/* Episodes List */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Episodes ({seasonData.episodes?.length || 0})</h3>
            
            {seasonData.episodes && seasonData.episodes.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-2">
                {seasonData.episodes.map((episode: TmdbEpisode) => (
                  <AccordionItem 
                    key={episode.id} 
                    value={`episode-${episode.episode_number}`}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                      <div className="flex items-start gap-4 text-left flex-1">
                        {/* Episode Thumbnail */}
                        {episode.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                            alt={episode.name}
                            className="w-32 h-18 object-cover rounded-lg border border-border flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-32 h-18 bg-muted rounded-lg border border-border flex items-center justify-center flex-shrink-0">
                            <Play className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Episode {episode.episode_number}
                                </Badge>
                                {episode.vote_average > 0 && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    <span className="font-medium">{episode.vote_average.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              <h4 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                                {episode.name}
                              </h4>
                              {episode.air_date && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(episode.air_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                  {episode.runtime && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <Clock className="w-3 h-3" />
                                      {episode.runtime}m
                                    </>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="pt-3 border-t border-border mt-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {episode.overview || 'No episode description available.'}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <p className="text-muted-foreground">No episodes information available</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground">Failed to load season data</p>
        </div>
      )}
    </div>
  );
};

export default TitlePage;
