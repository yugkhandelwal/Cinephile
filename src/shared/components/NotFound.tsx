import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentTitle("Not Found");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Film strip decorations */}
      <div className="absolute top-0 left-0 right-0 h-12 flex gap-1 overflow-hidden opacity-10">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="shrink-0 w-8 h-full bg-white/20 rounded-sm" />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 flex gap-1 overflow-hidden opacity-10">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="shrink-0 w-8 h-full bg-white/20 rounded-sm" />
        ))}
      </div>

      <div className="text-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Giant 404 */}
          <div className="relative mb-6">
            <h1
              className="text-[160px] sm:text-[220px] font-black leading-none select-none tracking-tighter"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: "2px rgba(255,255,255,0.12)",
                filter: "drop-shadow(0 0 80px rgba(145,70,255,0.2))",
              }}
            >
              404
            </h1>
            {/* Glowing overlay number */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-[160px] sm:text-[220px] font-black leading-none tracking-tighter"
                style={{
                  background: "linear-gradient(135deg, hsl(258,85%,70%) 0%, hsl(280,85%,60%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  opacity: 0.15,
                }}
              >
                404
              </span>
            </div>
          </div>

          {/* Film reel icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center relative"
          >
            <div className="absolute inset-2 rounded-full border-2 border-white/5" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute w-3 h-3 rounded-full bg-white/10"
                style={{
                  transform: `rotate(${deg}deg) translateY(-16px)`,
                }}
              />
            ))}
            <div className="w-4 h-4 rounded-full bg-white/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-lg sm:text-xl font-bold text-white mb-2">
              This scene was cut from the final edit.
            </p>
            <p className="text-sm text-white/40 mb-10 max-w-sm mx-auto leading-relaxed">
              The page at <code className="text-primary/80 font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">{location.pathname}</code> doesn't exist. Maybe it was deleted, moved, or never made it past development.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(145,70,255,0.3)]"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
