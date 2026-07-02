import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MovieCard from "@/shared/components/MovieCard";
import { BookmarkPlus, Loader2, Search, ArrowDownAZ, Star, Calendar } from "lucide-react";
import { getWatchlist } from "@/shared/api/supabase/watchlist";
import { useAuth } from "@/context/AuthProvider";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { SEO } from "@/shared/components/SEO";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const Watchlist = () => {
  useDocumentTitle("Watchlist");
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");
  const [sortBy, setSortBy] = useState<"date" | "rating" | "title">("date");
  
  const { data: items, error, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlist
  });

  const filteredAndSortedItems = useMemo(() => {
    if (!items) return [];
    
    // Filter
    let result = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = mediaFilter === "all" || item.media_type === mediaFilter;
      return matchesSearch && matchesType;
    });
    
    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      // Date added (assuming array order is chronological, or if we had created_at we'd use that. 
      // Default to returning as-is for 'date' since getWatchlist returns in order)
      return 0;
    });
    
    return result;
  }, [items, searchQuery, mediaFilter, sortBy]);

  return (
  <>
    <SEO 
      title="My Watchlist"
      description="Your personal collection of movies and TV shows to watch. Keep track of content you want to see and never miss your favorites."
      keywords={['watchlist', 'my movies', 'saved shows', 'to watch', 'movie list']}
      url="https://cinephile.app/watchlist"
    />
    <div id="main" className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-20 flex-grow">
        {/* Modern Header */}
        <div className="bg-transparent pt-8 pb-6 mb-2">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
                Watchlist
              </h1>
              {items && items.length > 0 && (
                <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm font-semibold border border-white/5">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {items && items.length > 0 && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search watchlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Filters */}
        {items && items.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 mb-8">
            <div className="flex flex-wrap items-center gap-4 py-4 border-y border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">Type:</span>
                <div className="flex bg-white/5 rounded-lg p-1">
                  {["all", "movie", "tv"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setMediaFilter(type as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        mediaFilter === type 
                          ? "bg-white/10 text-white shadow-sm" 
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      {type === "all" ? "All" : type === "movie" ? "Movies" : "TV Shows"}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">Sort by:</span>
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setSortBy("date")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${sortBy === "date" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Date Added
                  </button>
                  <button
                    onClick={() => setSortBy("rating")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${sortBy === "rating" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    <Star className="w-3.5 h-3.5" /> Rating
                  </button>
                  <button
                    onClick={() => setSortBy("title")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${sortBy === "title" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    <ArrowDownAZ className="w-3.5 h-3.5" /> Title
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
          filteredAndSortedItems.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto px-4"
            >
              {filteredAndSortedItems.map((item, i) => (
                <motion.div 
                  key={item.media_id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative group"
                >
                  <MovieCard
                    id={item.media_id}
                    mediaType={item.media_type}
                    title={item.title}
                    year={item.year}
                    rating={item.rating}
                    imageUrl={item.image_url}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <p className="text-gray-400 text-lg">No items match your filters.</p>
              <button 
                onClick={() => { setSearchQuery(""); setMediaFilter("all"); }}
                className="mt-4 text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          )
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
              to="/" 
              className="px-8 py-3.5 bg-white text-black rounded-xl font-bold text-base hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Start Exploring
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
