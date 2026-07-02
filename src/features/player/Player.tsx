import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { X, MonitorPlay } from "lucide-react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
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
    getMovieUrl: (id) => `https://player.videasy.net/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://player.videasy.net/tv/${id}/${season}/${episode}`
  },
  {
    id: "vidsrc",
    name: "Server 4",
    getMovieUrl: (id) => `https://vidsrc-embed.ru/embed/movie/${id}`,
    getTvUrl: (id, season, episode) => `https://vidsrc-embed.ru/embed/tv/${id}/${season}-${episode}`
  }
];

const Player = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const season = searchParams.get("s") || "1";
  const episode = searchParams.get("e") || "1";

  const [activeServer, setActiveServer] = useState<string>(SERVERS[0].id);
  
  useDocumentTitle(`Playing ${type === "tv" ? `S${season} E${episode}` : "Movie"}`);

  const server = SERVERS.find(s => s.id === activeServer) || SERVERS[0];

  const iframeUrl = type === "tv" 
    ? server.getTvUrl(id!, season, episode)
    : server.getMovieUrl(id!);

  return (
    <div className="fixed inset-0 bg-black flex flex-col w-full h-full z-[100] animate-fade-in">
      {/* Top Navigation Bar */}
      {/* We use a large invisible hit area to trigger the hover state for the controls */}
      <div className="absolute top-0 left-0 right-0 h-32 z-40 peer" />
      
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none transition-all duration-500 opacity-0 peer-hover:opacity-100 hover:opacity-100">
        <button 
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate(`/title/${type}/${id}`, { replace: true });
            }
          }}
          className="pointer-events-auto flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-2xl rounded-full text-white transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 hover:scale-105 active:scale-95 group"
          title="Close Player"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-2xl pl-5 pr-2 py-2 rounded-full border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all hover:bg-black/50 hover:border-white/20">
            <MonitorPlay className="w-4 h-4 text-primary animate-pulse" />
            <Select value={activeServer} onValueChange={setActiveServer}>
              <SelectTrigger className="w-[110px] h-8 bg-transparent border-0 text-white font-semibold focus:ring-0 focus:ring-offset-0 px-2 tracking-wide">
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
        </div>
      </div>

      {/* Video Player Container */}
      <div className="flex-1 w-full h-full relative">
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
