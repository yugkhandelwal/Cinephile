import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MonitorPlay, SkipBack, SkipForward, Settings2, Info, ListVideo, PlayCircle, Star, Tv } from "lucide-react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useMalDetails } from "@/shared/api/mal/hooks";
import { useContinueWatching } from "@/shared/hooks/useContinueWatching";
import { Switch } from "@/shared/components/ui/switch";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import MediaCard from "@/shared/components/MediaCard";

const SERVERS = [
  { id: "server1", name: "Server 1", getUrl: (id: string, ep: number, type: string, ap: boolean) => `https://tryembed.us.cc/embed/anime/${id}/${ep}/${type}${ap ? "?autoplay=1" : ""}` },
  { id: "server2", name: "Server 2", getUrl: (id: string, ep: number, type: string, ap: boolean) => `https://megaplay.buzz/stream/mal/${id}/${ep}/${type}${ap ? "?autoplay=1" : ""}` },
  { id: "server3", name: "Server 3", getUrl: (id: string, ep: number, type: string, ap: boolean) => `https://zokoanime.video/stream/mal/${id}/${ep}/${type}${ap ? "?autoplay=1" : ""}` },
];

const fetchAnilistEpisodes = async (malId: number) => {
  const query = `
    query ($idMal: Int) {
      Media (idMal: $idMal, type: ANIME) {
        episodes
        nextAiringEpisode {
          episode
        }
      }
    }
  `;
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ query, variables: { idMal: malId } }),
  });
  if (!response.ok) throw new Error("AniList fetch failed");
  const json = await response.json();
  return json.data?.Media;
};

const AnimePlayer = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentEpStr = searchParams.get("ep") || "1";
  const currentEp = parseInt(currentEpStr, 10);
  const initialServer = searchParams.get("server") || SERVERS[0].id;
  const initialAudio = (searchParams.get("audio") as "sub" | "dub") || "sub";
  const initialTime = searchParams.get("t") || "0";
  
  const { data: anime, isLoading } = useMalDetails(id);
  
  const [activeServer, setActiveServer] = useState(
    SERVERS.find(s => s.id === initialServer) ? initialServer : SERVERS[0].id
  );
  const [audioType, setAudioType] = useState<"sub" | "dub">(initialAudio);
  const [currentTime, setCurrentTime] = useState(Number(initialTime));
  const { saveProgress } = useContinueWatching();
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [searchEp, setSearchEp] = useState("");
  const [episodeRange, setEpisodeRange] = useState(0);

  const title = anime?.title || "Loading Anime...";
  useDocumentTitle(`Playing: ${title} - Episode ${currentEp}`);

  // Fetch true episode count for ongoing series from AniList
  const { data: anilistData } = useQuery({
    queryKey: ["anilist", "episodes", id],
    queryFn: () => fetchAnilistEpisodes(Number(id)),
    enabled: !!id && (!anime || !anime.num_episodes),
  });

  // Calculate episodes count accurately
  const episodesCount = useMemo(() => {
    if (anime?.num_episodes && anime.num_episodes > 0) {
      return anime.num_episodes;
    }
    if (anilistData) {
      if (anilistData.nextAiringEpisode?.episode) {
        return anilistData.nextAiringEpisode.episode - 1;
      }
      if (anilistData.episodes) {
        return anilistData.episodes;
      }
    }
    return 100; // Ultimate fallback if everything fails while loading
  }, [anime?.num_episodes, anilistData]);
  
  const CHUNK_SIZE = 100;
  const episodeChunks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < episodesCount; i += CHUNK_SIZE) {
      const start = i + 1;
      const end = Math.min(i + CHUNK_SIZE, episodesCount);
      chunks.push({
        label: `${start.toString().padStart(3, '0')} - ${end.toString().padStart(3, '0')}`,
        start,
        end,
      });
    }
    return chunks;
  }, [episodesCount]);

  useEffect(() => {
    const rangeIndex = Math.floor((currentEp - 1) / CHUNK_SIZE);
    if (rangeIndex !== episodeRange && rangeIndex >= 0 && rangeIndex < episodeChunks.length) {
      setEpisodeRange(rangeIndex);
    }
  }, [currentEp, episodeChunks.length]);

  const displayedEpisodes = useMemo(() => {
    const chunk = episodeChunks[episodeRange];
    if (!chunk) return [];
    const eps = Array.from({ length: chunk.end - chunk.start + 1 }, (_, i) => chunk.start + i);
    if (!searchEp) return eps;
    return eps.filter(ep => ep.toString().includes(searchEp));
  }, [episodeChunks, episodeRange, searchEp]);

  const handleNext = () => {
    if (currentEp < episodesCount) {
      navigate(`/anime/watch/${id}?ep=${currentEp + 1}`, { replace: true });
    }
  };

  const handlePrev = () => {
    if (currentEp > 1) {
      navigate(`/anime/watch/${id}?ep=${currentEp - 1}`, { replace: true });
    }
  };

  // Listen for postMessage events from iframe to trigger Auto Next
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!autoNext) return;
      
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        // Common event signatures from video embed providers for "video ended"
        if (
          e.data === "ended" || 
          data?.event === "ended" || 
          data?.name === "ended" ||
          data?.value === "ended" ||
          data?.message === "videoEnded"
        ) {
          handleNext();
        }
      } catch (err) {
        // If parsing fails or data is not a string, ignore
      }
    };
    
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [autoNext, currentEp, episodesCount, id, navigate]);

  // Local timer for progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save progress every second for real-time sync
  useEffect(() => {
    if (!anime || currentTime === 0) return;
    
    // Estimate runtime (24 mins per episode average for anime if unknown)
    const duration = anime.average_episode_duration ? anime.average_episode_duration : 24 * 60;
    const progressPercentage = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

    saveProgress({
      mediaType: 'anime',
      contentId: Number(id),
      episodeNumber: currentEp,
      serverId: activeServer,
      audioLanguage: audioType,
      currentTime,
      duration,
      progressPercentage,
      title: anime.title,
      posterUrl: anime.main_picture?.large || anime.main_picture?.medium,
      backdropUrl: anime.main_picture?.large // MAL doesn't provide backdrops normally, fallback to main
    });
  }, [currentTime, id, currentEp, activeServer, audioType, anime, saveProgress]);

  const activeServerObj = SERVERS.find(s => s.id === activeServer) || SERVERS[0];
  const embedUrl = activeServerObj.getUrl(id || "", currentEp, audioType, autoPlay);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(`/anime/${id}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans overflow-x-hidden pb-12">
      
      {/* Top Navbar / Breadcrumbs */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg md:text-xl line-clamp-1 hover:text-primary transition-colors cursor-pointer" onClick={handleBack}>
              {title}
            </h1>
            <p className="text-white/50 text-sm font-medium">You are watching <span className="text-primary">Episode {currentEp}</span></p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
          >
            <Info className="w-4 h-4" />
            Detail
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[1600px] mx-auto px-0 md:px-4 lg:px-8 pt-4 md:pt-6 flex flex-col gap-6">
        
        {/* Player Section */}
        <div className="w-full bg-[#0a0a0a] md:rounded-2xl border border-transparent md:border-white/5 overflow-hidden shadow-2xl flex flex-col">
          
          {/* 16:9 Video Player */}
          <div className="w-full aspect-video bg-black relative shadow-inner">
            {isLoading ? (
              <Skeleton className="w-full h-full bg-white/5" />
            ) : (
              <iframe
                key={`${id}-${currentEp}-${activeServer}`}
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              ></iframe>
            )}
            
            {/* Server Tag Overlay (Yenime style) */}
            <div className="absolute top-4 right-4 pointer-events-none z-10 flex gap-2">
               <div className="bg-primary text-white backdrop-blur-md px-3 py-1 rounded shadow-lg text-[10px] font-black tracking-widest uppercase pointer-events-auto border border-white/10">
                 {SERVERS.find(s => s.id === activeServer)?.name}
               </div>
            </div>
          </div>

          {/* Control Bar (Directly below player) */}
          <div className="p-4 bg-[#0a0a0a] flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5">
            
            {/* Left: Server Switcher & Audio Type */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              
              {/* Audio Sub/Dub Toggle */}
              <div className="flex bg-[#111] border border-white/10 rounded-xl p-1 h-[42px] w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setAudioType("sub")}
                  className={`flex-1 sm:px-6 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    audioType === "sub" ? "bg-primary text-white shadow-md" : "text-white/50 hover:text-white"
                  }`}
                >
                  SUB
                </button>
                <button
                  onClick={() => setAudioType("dub")}
                  className={`flex-1 sm:px-6 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    audioType === "dub" ? "bg-primary text-white shadow-md" : "text-white/50 hover:text-white"
                  }`}
                >
                  DUB
                </button>
              </div>

              {/* Server Dropdown */}
              <Select value={activeServer} onValueChange={setActiveServer}>
                <SelectTrigger className="w-full sm:w-[160px] bg-[#111] border-white/10 text-white rounded-xl focus:ring-0 font-bold h-[42px]">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-primary" />
                    <SelectValue placeholder="Select Server" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                  {SERVERS.map((server) => (
                    <SelectItem key={server.id} value={server.id} className="hover:bg-white/10 cursor-pointer font-semibold py-2.5">
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right: Navigation & Toggles */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-end gap-4 w-full md:w-auto">
              {/* Toggles */}
              <div className="flex items-center gap-4 px-4 py-2 bg-[#111] rounded-xl border border-white/5 text-xs text-white/60 font-semibold tracking-wide">
                <div className="flex items-center gap-2">
                  <Switch checked={autoPlay} onCheckedChange={setAutoPlay} className="scale-75 data-[state=checked]:bg-primary" />
                  <span className={autoPlay ? "text-white" : ""}>Auto Play</span>
                </div>
                <div className="w-[1px] h-4 bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <Switch checked={autoNext} onCheckedChange={setAutoNext} className="scale-75 data-[state=checked]:bg-primary" />
                  <span className={autoNext ? "text-white" : ""}>Auto Next</span>
                </div>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev}
                  disabled={currentEp <= 1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl text-sm font-bold text-white transition-all border border-white/5"
                >
                  <SkipBack className="w-4 h-4" /> Prev
                </button>
                <button 
                  onClick={handleNext}
                  disabled={currentEp >= episodesCount}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl text-sm font-bold text-white transition-all border border-white/5"
                >
                  Next <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Lower Section: Details & Episodes */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          
          {/* Left Column: Anime Quick Info */}
          <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-4">
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
              {isLoading ? (
                <Skeleton className="w-32 aspect-[2/3] rounded-xl" />
              ) : (
                <div className="flex gap-4">
                  <img 
                    src={anime?.main_picture?.large || anime?.main_picture?.medium} 
                    alt={title} 
                    className="w-28 h-40 object-cover rounded-xl shadow-lg border border-white/10"
                  />
                  <div className="flex flex-col gap-2">
                    <h2 className="text-white font-bold text-lg leading-tight line-clamp-3">{title}</h2>
                    <div className="flex items-center gap-1 text-xs font-semibold text-white/50 bg-white/5 w-fit px-2 py-1 rounded-md">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {anime?.mean || "N/A"}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-white/50 bg-white/5 w-fit px-2 py-1 rounded-md capitalize">
                      <Tv className="w-3 h-3" />
                      {anime?.media_type || "TV"}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-white/60 leading-relaxed line-clamp-6">
                {anime?.synopsis || "No synopsis available."}
              </div>
            </div>
          </div>

          {/* Right Column: Episode Grid */}
          <div className="flex-1 bg-[#0a0a0a] rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <ListVideo className="w-6 h-6 text-primary" />
                List of Episodes
              </h3>
              
              {/* Search/Filter Bar & Range Selector */}
              <div className="flex items-center gap-3">
                {episodeChunks.length > 1 && (
                  <Select value={episodeRange.toString()} onValueChange={(v) => setEpisodeRange(parseInt(v, 10))}>
                    <SelectTrigger className="w-[140px] bg-[#111] border-white/10 text-white rounded-lg focus:ring-0">
                      <SelectValue placeholder="Episodes" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white rounded-lg">
                      {episodeChunks.map((chunk, idx) => (
                        <SelectItem key={idx} value={idx.toString()} className="hover:bg-white/10 cursor-pointer">
                          EPS: {chunk.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="relative w-40 sm:w-48">
                  <input 
                    type="number" 
                    placeholder="Episode number..." 
                    value={searchEp}
                    onChange={(e) => setSearchEp(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/30"
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                {Array.from({ length: 30 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded-md bg-white/5" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2.5">
                {displayedEpisodes.map((ep) => {
                  const isActive = ep === currentEp;
                  return (
                    <button
                      key={ep}
                      onClick={() => navigate(`/anime/watch/${id}?ep=${ep}`, { replace: true })}
                      className={`
                        aspect-[4/3] flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-300 border
                        ${isActive 
                          ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(225,29,72,0.4)] scale-105 z-10' 
                          : 'bg-[#111] text-white/60 hover:bg-white/10 hover:text-white border-white/5'}
                      `}
                    >
                      {ep}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Seasons & Related Anime Section */}
      {anime?.related_anime && anime.related_anime.length > 0 && (
        <div className="w-full max-w-[1600px] mx-auto px-0 md:px-4 lg:px-8 mt-6">
          <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
            <h3 className="text-white font-bold text-xl flex items-center gap-2">
              <Tv className="w-6 h-6 text-primary" />
              Seasons & Related
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {anime.related_anime.map((related) => (
                <MediaCard 
                  key={related.node.id}
                  id={related.node.id}
                  title={related.node.title}
                  mediaType="anime"
                  imageUrl={related.node.main_picture?.large || related.node.main_picture?.medium || ""}
                  rating={related.node.mean || 0}
                  year={related.node.start_season?.year?.toString() || ""}
                  tag={related.relation_type_formatted.replace("_", " ")}
                />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnimePlayer;
