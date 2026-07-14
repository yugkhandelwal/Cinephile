import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Tv, Play } from "lucide-react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useContentMode } from "@/context/ContentModeProvider";
import { useTrendingMovies } from "@/shared/api/tmdb/hooks";
import { useMalTopAnime } from "@/shared/api/mal/hooks";

const BackgroundCarousel = ({ images }: { images: string[] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden group-hover:scale-105 transition-all duration-1000 opacity-20 group-hover:opacity-40">
      {images.map((img, i) => (
        <div
          key={`${img}-${i}`}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
    </div>
  );
};

const Landing = () => {
  useDocumentTitle("Cinephile - Choose Your Experience");
  const navigate = useNavigate();
  const { setMode } = useContentMode();

  const { data: moviesData } = useTrendingMovies();
  const { data: animeData } = useMalTopAnime("bypopularity");

  const movieImages = useMemo(() => {
    if (!moviesData || moviesData.length === 0) {
      return [];
    }
    return moviesData
      .slice(0, 15)
      .map(m => m.backdropUrl || m.imageUrl)
      .filter(Boolean) as string[];
  }, [moviesData]);

  const animeImages = useMemo(() => {
    if (!animeData?.pages?.[0]?.data || animeData.pages[0].data.length === 0) {
      return [];
    }
    return animeData.pages[0].data
      .slice(0, 15)
      .map(a => a.backdropUrl || a.imageUrl)
      .filter(Boolean) as string[];
  }, [animeData]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col md:flex-row overflow-hidden z-50">
      
      {/* Movies & TV Shows Section */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex-1 group cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-white/10"
        onClick={() => {
          setMode('movies');
          navigate("/home");
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-background z-10 group-hover:opacity-50 transition-opacity duration-700" />
        <BackgroundCarousel images={movieImages} />
        
        <div className="relative z-20 h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight group-hover:tracking-wide transition-all duration-500">Movies & TV</h2>
            <p className="text-white/60 max-w-md mx-auto text-sm md:text-base">Explore the latest blockbusters, trending series, and cinematic masterpieces from around the globe.</p>
          </div>
          
          <div className="mt-8 flex items-center text-indigo-400 font-semibold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
            <span>Enter Experience</span>
            <Play className="w-4 h-4 ml-2 fill-current" />
          </div>
        </div>
      </motion.div>

      {/* Anime Section */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="relative flex-1 group cursor-pointer overflow-hidden"
        onClick={() => {
          setMode('anime');
          navigate("/anime");
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-rose-900/40 to-background z-10 group-hover:opacity-50 transition-opacity duration-700" />
        <BackgroundCarousel images={animeImages} />
        
        <div className="relative z-20 h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight group-hover:tracking-wide transition-all duration-500">Anime</h2>
            <p className="text-white/60 max-w-md mx-auto text-sm md:text-base">Dive into the world of Japanese animation, discover seasonal hits, and explore legendary classics.</p>
          </div>
          
          <div className="mt-8 flex items-center text-rose-400 font-semibold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
            <span>Enter Experience</span>
            <Play className="w-4 h-4 ml-2 fill-current" />
          </div>
        </div>
      </motion.div>

      {/* Center Branding */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.5, delay: 0.5 }}
          className="flex items-center justify-center drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
        >
          <img src="/logo_cropped.png" alt="Cinephile Logo" className="w-20 h-20 md:w-28 md:h-28 drop-shadow-2xl" />
        </motion.div>
      </div>
      
    </div>
  );
};

export default Landing;
