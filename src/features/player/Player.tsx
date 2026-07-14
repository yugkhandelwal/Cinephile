import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { X, MonitorPlay, ListVideo } from "lucide-react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useSeason, useDetails } from "@/shared/api/tmdb/hooks";
import { generateSeoUrl } from "@/shared/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type ServerInfo = {
  id: string;
  name: string;
  getMovieUrl: (id: string) => string;
  getTvUrl: (id: string, season: string, episode: string) => string;
};

const SERVERS: ServerInfo[] = [
  {
    id: "vidking",
    name: "Server 1",
    getMovieUrl: (id) => `https://www.vidking.net/embed/movie/${id}?color=9146ff&autoPlay=true`,
    getTvUrl: (id, season, episode) => `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=9146ff&autoPlay=true&nextEpisode=true&episodeSelector=true`
  },
  {
    id: "peachify",
    name: "Server 2",
    getMovieUrl: (id) => `https://peachify.top/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://peachify.top/embed/tv/${id}/${season}/${episode}`
  },
  {
    id: "videasy",
    name: "Server 3",
    getMovieUrl: (id) => `https://player.videasy.net/movie/${id}?color=8B5CF6&overlay=true`,
    getTvUrl: (id, season, episode) => `https://player.videasy.net/tv/${id}/${season}/${episode}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6`
  },
  {
    id: "vidsrc",
    name: "Server 4",
    getMovieUrl: (id) => `https://vidsrc-embed.ru/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc-embed.ru/embed/tv/${id}/${season}-${episode}`
  },
  {
    id: "vidcore",
    name: "Server 5",
    getMovieUrl: (id) => `https://vidcore.net/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidcore.net/tv/${id}/${season}/${episode}`
  },
  {
    id: "cinezo",
    name: "Server 6",
    getMovieUrl: (id) => `https://player.cinezo.live/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://player.cinezo.live/embed/tv/${id}/${season}/${episode}`
  }
];

const Player = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const actualId = id?.split('-')[0];
  const season = searchParams.get("s") || "1";
  const episode = searchParams.get("e") || "1";

  const [activeServer, setActiveServer] = useState<string>(SERVERS[0].id);
  
  useDocumentTitle(`Playing ${type === "tv" ? `S${season} E${episode}` : "Movie"}`);

  const server = SERVERS.find(s => s.id === activeServer) || SERVERS[0];

  const iframeUrl = type === "tv" 
    ? server.getTvUrl(actualId!, season, episode)
    : server.getMovieUrl(actualId!);

  // Fetch episodes for the current season if it's a TV show
  const { data: seasonData } = useSeason(type === "tv" ? actualId : undefined, type === "tv" ? Number(season) : undefined);
  const { data: tvDetails } = useDetails(type === "tv" ? "tv" : "movie", actualId);

  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-center md:block w-full h-full z-[100] animate-fade-in">
      {/* Top Navigation Bar / Controls */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-6 bg-transparent md:bg-gradient-to-b md:from-black/80 md:via-black/40 md:to-transparent pointer-events-auto transition-all duration-500 md:opacity-0 md:hover:opacity-100 flex-shrink-0">
        <button 
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate(generateSeoUrl(type as 'movie' | 'tv', actualId!, tvDetails?.title || tvDetails?.name), { replace: true });
            }
          }}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/10 md:bg-black/40 hover:bg-white/20 md:hover:bg-black/60 backdrop-blur-2xl rounded-full text-white transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 hover:scale-105 active:scale-95 group shrink-0"
          title="Close Player"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1 md:gap-2 bg-white/10 md:bg-black/40 backdrop-blur-2xl pl-3 pr-1 py-1.5 md:pl-5 md:pr-2 md:py-2 rounded-full border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all hover:bg-white/20 md:hover:bg-black/50 hover:border-white/20">
            <MonitorPlay className="w-4 h-4 text-primary animate-pulse shrink-0" />
            <Select value={activeServer} onValueChange={setActiveServer}>
              <SelectTrigger className="w-[90px] md:w-[110px] h-6 md:h-8 bg-transparent border-0 text-white font-semibold focus:ring-0 focus:ring-offset-0 px-1 md:px-2 tracking-wide text-xs md:text-sm">
                <SelectValue placeholder="Server" />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-black/80 backdrop-blur-3xl border-white/10 text-white rounded-2xl shadow-2xl p-2">
                {SERVERS.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer rounded-xl font-medium transition-colors py-2.5">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "tv" && (
            <Sheet>
              <SheetTrigger asChild>
                <button 
                  className="pointer-events-auto flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/10 md:bg-black/40 hover:bg-white/20 md:hover:bg-black/60 backdrop-blur-2xl rounded-full text-white transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 hover:scale-105 active:scale-95 group shrink-0"
                  title="Episodes"
                >
                  <ListVideo className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-full sm:max-w-md bg-black/80 backdrop-blur-3xl border-l border-white/10 p-0 flex flex-col h-full z-[200]"
                onOpenAutoFocus={(e) => {
                  const el = document.getElementById('active-episode');
                  if (el) {
                    e.preventDefault();
                    el.focus();
                  }
                }}
              >
                <SheetHeader className="p-4 pr-12 border-b border-white/10 flex flex-row items-center justify-between space-y-0 h-16">
                  <SheetTitle className="text-white text-xl">Episodes</SheetTitle>
                  <Select 
                    value={season} 
                    onValueChange={(val) => navigate(`/play/tv/${id}?s=${val}&e=1`, { replace: true })}
                  >
                    <SelectTrigger className="w-[120px] h-8 bg-white/10 border-white/20 text-white focus:ring-0 focus:ring-offset-0 text-xs rounded-full">
                      <SelectValue placeholder="Season" />
                    </SelectTrigger>
                    <SelectContent className="z-[300] bg-black/90 backdrop-blur-xl border-white/10 text-white max-h-[300px] rounded-2xl">
                      {tvDetails?.details?.seasons ? (
                        tvDetails.details.seasons.filter((s: any) => s.season_number > 0).map((s: any) => (
                          <SelectItem key={s.id} value={s.season_number.toString()} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer rounded-full">
                            Season {s.season_number}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={season.toString()} className="rounded-full">
                          Season {season}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {seasonData?.episodes?.map((ep: any) => (
                    <button
                      key={ep.id}
                      id={Number(episode) === ep.episode_number ? "active-episode" : undefined}
                      onClick={() => navigate(`/play/tv/${id}?s=${season}&e=${ep.episode_number}`, { replace: true })}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black
                        ${Number(episode) === ep.episode_number 
                          ? 'bg-primary/20 border-primary/50' 
                          : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                    >
                      <div className="w-24 aspect-video bg-white/10 rounded-lg overflow-hidden shrink-0 relative">
                        {ep.still_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} 
                            alt={ep.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${Number(episode) === ep.episode_number ? 'bg-primary text-white' : 'bg-white/20 text-white/80'}`}>
                            E{ep.episode_number}
                          </span>
                          <span className="text-sm font-semibold text-white truncate">{ep.name}</span>
                        </div>
                        <p className="text-xs text-white/50 line-clamp-2">{ep.overview || "No description available."}</p>
                      </div>
                    </button>
                  ))}
                  {!seasonData && <div className="text-center text-white/50 py-8">Loading episodes...</div>}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Video Player Container */}
      <div className="w-full aspect-video md:aspect-auto md:flex-1 md:h-full relative shrink-0">
        <iframe
          key={iframeUrl}
          src={iframeUrl}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      </div>
    </div>
  );
};

export default Player;
