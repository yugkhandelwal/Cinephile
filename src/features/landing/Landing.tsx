import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="absolute inset-0 overflow-hidden opacity-10 blur-xl">
      {images.map((img, i) => (
        <img
          key={`${img}-${i}`}
          src={img}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"
            }`}
        />
      ))}
    </div>
  );
};

const OrbCarousel = ({ images }: { images: string[] }) => {
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
    <div className="absolute inset-0 overflow-hidden mix-blend-overlay opacity-60" style={{ borderRadius: "inherit" }}>
      {images.map((img, i) => (
        <img
          key={`orb-${img}-${i}`}
          src={img}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"
            }`}
        />
      ))}
    </div>
  );
};

const Landing = () => {
  useDocumentTitle("Cinephile - Choose Your Experience");
  const navigate = useNavigate();
  const { setMode } = useContentMode();
  const [selectedExperience, setSelectedExperience] = useState<'movies' | 'anime' | null>(null);

  const { data: moviesData } = useTrendingMovies();
  const { data: animeData } = useMalTopAnime("bypopularity");

  const movieImages = useMemo(() => {
    if (!moviesData || moviesData.length === 0) return [];
    return moviesData
      .slice(0, 15)
      .map(m => m.backdropUrl || m.imageUrl)
      .filter(Boolean) as string[];
  }, [moviesData]);

  const animeImages = useMemo(() => {
    if (!animeData?.pages?.[0]?.data || animeData.pages[0].data.length === 0) return [];
    return animeData.pages[0].data
      .slice(0, 15)
      .map(a => a.backdropUrl || a.imageUrl)
      .filter(Boolean) as string[];
  }, [animeData]);

  const allImages = useMemo(() => {
    // Interleave movie and anime images for a mixed background
    const mixed = [];
    const maxLen = Math.max(movieImages.length, animeImages.length);
    for (let i = 0; i < maxLen; i++) {
      if (movieImages[i]) mixed.push(movieImages[i]);
      if (animeImages[i]) mixed.push(animeImages[i]);
    }
    return mixed.slice(0, 20); // max 20 images
  }, [movieImages, animeImages]);

  const handleOrbClick = (type: 'movies' | 'anime') => {
    if (selectedExperience) return;
    setSelectedExperience(type);
  };

  const handleAnimationComplete = () => {
    if (selectedExperience === 'movies') {
      setMode('movies');
      navigate("/home");
    } else if (selectedExperience === 'anime') {
      setMode('anime');
      navigate("/anime");
    }
  };

  // Define liquid shape keyframes
  const liquidShape1 = "40% 60% 70% 30% / 40% 50% 60% 50%";
  const liquidShape2 = "60% 40% 30% 70% / 60% 30% 70% 40%";
  const liquidShape3 = "50% 50% 50% 50% / 50% 50% 50% 50%";

  return (
    <div className="fixed inset-0 bg-[#020202] flex flex-col items-center justify-center overflow-hidden z-50">

      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111] via-[#050505] to-black" />
      <BackgroundCarousel images={allImages} />

      {/* Center Branding */}
      <AnimatePresence>
        {!selectedExperience && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
            className="absolute top-16 left-1/2 -translate-x-1/2 -ml-16 z-30 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          >
            <div className="relative flex items-center justify-center">
              <img 
                src="/logo_cropped.png" 
                alt="Cinephile" 
                className="absolute right-full mr-4 w-20 h-20 drop-shadow-2xl" 
              />
              <span className="font-heading font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent text-5xl whitespace-nowrap tracking-wide">
                Cinephile
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 w-full max-w-5xl px-4 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 h-full">

        {/* Movies Orb */}
        <AnimatePresence>
          {(!selectedExperience || selectedExperience === 'movies') && (
            <motion.div
              layoutId="movies-orb"
              className={`relative cursor-pointer group flex items-center justify-center will-change-transform transform-gpu ${selectedExperience === 'movies' ? 'z-50' : 'z-10'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                selectedExperience === 'movies'
                  ? {
                    scale: 50,
                    borderRadius: "0%",
                    opacity: 1,
                    x: 0,
                    y: 0
                  }
                  : {
                    opacity: 1,
                    scale: 1,
                    y: [0, -15, 0],
                    borderRadius: [liquidShape1, liquidShape2, liquidShape3, liquidShape1],
                  }
              }
              transition={
                selectedExperience === 'movies'
                  ? { duration: 0.5, ease: "circIn" }
                  : {
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    borderRadius: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                  }
              }
              onAnimationComplete={() => {
                if (selectedExperience === 'movies') handleAnimationComplete();
              }}
              onClick={() => handleOrbClick('movies')}
              style={{
                width: "280px",
                height: "280px"
              }}
            >
              <OrbCarousel images={movieImages} />
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${selectedExperience === 'movies' ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'} bg-gradient-to-br from-indigo-500/60 via-purple-700/80 to-indigo-900/90 backdrop-blur-sm shadow-[inset_0_-20px_60px_rgba(0,0,0,0.6),inset_0_20px_40px_rgba(255,255,255,0.4),0_0_50px_rgba(79,70,229,0.3)] ring-1 ring-white/20`}
                style={{ borderRadius: "inherit" }}
              />
              {/* Glossy Reflection */}
              <div
                className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-500 ${selectedExperience === 'movies' ? 'opacity-0' : 'opacity-100'}`}
                style={{ borderRadius: "inherit" }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.6)_0%,transparent_50%)] mix-blend-overlay" />
                <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/40 to-white/5 rounded-b-[50%] mix-blend-overlay blur-[1px]" />
              </div>

              {!selectedExperience && (
                <motion.div
                  className="relative z-10 flex flex-col items-center pointer-events-none"
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <h2 className="text-3xl font-black text-white tracking-wider mb-2 drop-shadow-md">MOVIES</h2>
                  <p className="text-white/70 text-xs tracking-[0.2em] font-medium">EXPLORE</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anime Orb */}
        <AnimatePresence>
          {(!selectedExperience || selectedExperience === 'anime') && (
            <motion.div
              layoutId="anime-orb"
              className={`relative cursor-pointer group flex items-center justify-center will-change-transform transform-gpu ${selectedExperience === 'anime' ? 'z-50' : 'z-10'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                selectedExperience === 'anime'
                  ? {
                    scale: 50,
                    borderRadius: "0%",
                    opacity: 1,
                    x: 0,
                    y: 0
                  }
                  : {
                    opacity: 1,
                    scale: 1,
                    y: [0, -20, 0], // slight offset timing from movie orb
                    borderRadius: [liquidShape3, liquidShape1, liquidShape2, liquidShape3],
                  }
              }
              transition={
                selectedExperience === 'anime'
                  ? { duration: 0.5, ease: "circIn" }
                  : {
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                    borderRadius: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                  }
              }
              onAnimationComplete={() => {
                if (selectedExperience === 'anime') handleAnimationComplete();
              }}
              onClick={() => handleOrbClick('anime')}
              style={{
                width: "280px",
                height: "280px"
              }}
            >
              <OrbCarousel images={animeImages} />
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${selectedExperience === 'anime' ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'} bg-gradient-to-br from-rose-500/60 via-red-700/80 to-rose-900/90 backdrop-blur-sm shadow-[inset_0_-20px_60px_rgba(0,0,0,0.6),inset_0_20px_40px_rgba(255,255,255,0.4),0_0_50px_rgba(225,29,72,0.3)] ring-1 ring-white/20`}
                style={{ borderRadius: "inherit" }}
              />
              {/* Glossy Reflection */}
              <div
                className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-500 ${selectedExperience === 'anime' ? 'opacity-0' : 'opacity-100'}`}
                style={{ borderRadius: "inherit" }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.6)_0%,transparent_50%)] mix-blend-overlay" />
                <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/40 to-white/5 rounded-b-[50%] mix-blend-overlay blur-[1px]" />
              </div>

              {!selectedExperience && (
                <motion.div
                  className="relative z-10 flex flex-col items-center pointer-events-none"
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <h2 className="text-3xl font-black text-white tracking-wider mb-2 drop-shadow-md">ANIME</h2>
                  <p className="text-white/70 text-xs tracking-[0.2em] font-medium">EXPLORE</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};

export default Landing;
