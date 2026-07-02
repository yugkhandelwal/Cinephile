import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MovieCard from "@/shared/components/MovieCard";
import { BookmarkPlus, Loader2 } from "lucide-react";
import { getWatchlist } from "@/shared/api/supabase/watchlist";
import { useAuth } from "@/context/AuthProvider";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { SEO } from "@/shared/components/SEO";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Watchlist = () => {
  useDocumentTitle("Watchlist");
  const { user } = useAuth();
  
  const { data: items, error, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlist
  });

  return (
  <>
    <SEO 
      title="My Watchlist"
      description="Your personal collection of movies and TV shows to watch. Keep track of content you want to see and never miss your favorites."
      keywords={['watchlist', 'my movies', 'saved shows', 'to watch', 'movie list']}
      url="https://cinephile.app/watchlist"
    />
    <div id="main" className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20">
        {/* Modern Header */}
        <div className="bg-transparent pt-8 pb-6 mb-8">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
              Watchlist
            </h1>
          </div>
        </div>
        
        {error && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">{(error as Error).message}</div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 animate-fade-in">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-400">Loading your watchlist...</p>
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto px-4">
            {items.map((item) => (
              <div key={item.media_id} className="relative group">
                <MovieCard
                  id={item.media_id}
                  mediaType={item.media_type}
                  title={item.title}
                  year={item.year}
                  rating={item.rating}
                  imageUrl={item.image_url}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-4 animate-fade-in">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] pointer-events-none" />
              <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500 ease-out backdrop-blur-xl">
                <BookmarkPlus className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-bold text-white mb-4 tracking-wide">Your watchlist is empty</h3>
            <p className="text-gray-400 text-center max-w-sm mb-10 text-lg leading-relaxed">
              Keep track of movies and TV shows you want to watch by adding them to your watchlist.
            </p>
            <Link 
              to="/movies" 
              className="px-8 py-3.5 bg-white text-black rounded-xl font-bold text-base hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Explore Movies
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  </>
  );
};

export default Watchlist;
