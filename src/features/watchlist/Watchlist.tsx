import Footer from "@/shared/components/layout/Footer";
import MediaCard from "@/shared/components/MediaCard";
import { BookmarkPlus, Loader2, Search, ArrowDownAZ, Star, Calendar, LayoutGrid, List } from "lucide-react";
import { getWatchlist } from "@/shared/api/supabase/watchlist";
import { useAuth } from "@/context/AuthProvider";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { SEO } from "@/shared/components/SEO";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

type ViewMode = "grid" | "list";

const Watchlist = () => {
  useDocumentTitle("Watchlist");
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv" | "anime">("all");
  const [sortBy, setSortBy] = useState<"date" | "rating" | "title">("date");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data: items, error, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlist,
  });

  const filteredAndSortedItems = useMemo(() => {
    if (!items) return [];
    let result = items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = mediaFilter === "all" || item.media_type === mediaFilter;
      return matchesSearch && matchesType;
    });
    result = [...result].sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });
    return result;
  }, [items, searchQuery, mediaFilter, sortBy]);

  return (
    <>
      <SEO
        title="My Watchlist"
        description="Your personal collection of movies and TV shows to watch."
        keywords={["watchlist", "my movies", "saved shows", "to watch", "movie list"]}
        url="https://cinephile.app/watchlist"
      />
      <div id="main" className="min-h-screen bg-background flex flex-col pb-tabbar">
        <div className="pt-6 md:pt-24 pb-20 flex-grow">

          {/* Page Header */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
                  Watchlist
                </h1>
                {items && items.length > 0 && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                    {items.length}
                  </span>
                )}
              </div>

              {items && items.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-52 bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                  {/* View toggle */}
                  <div className="flex bg-white/5 rounded-xl p-1 border border-white/8 shrink-0">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter + Sort Bar */}
            {items && items.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 py-3 border-y border-white/5">
                {/* Type filter */}
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/8">
                  {(["all", "movie", "tv", "anime"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMediaFilter(type)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        mediaFilter === type
                          ? "bg-primary/20 text-primary"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {type === "all" ? "All" : type === "movie" ? "Movies" : type === "tv" ? "TV" : "Anime"}
                    </button>
                  ))}
                </div>

                <div className="w-px h-5 bg-white/10 hidden sm:block" />

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 font-medium">Sort:</span>
                  <div className="flex bg-white/5 rounded-xl p-1 border border-white/8">
                    {(
                      [
                        { key: "date", icon: Calendar, label: "Date" },
                        { key: "rating", icon: Star, label: "Rating" },
                        { key: "title", icon: ArrowDownAZ, label: "A–Z" },
                      ] as const
                    ).map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        onClick={() => setSortBy(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          sortBy === key
                            ? "bg-white/10 text-white"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result count */}
                {searchQuery && (
                  <span className="text-xs text-white/30 ml-auto">
                    {filteredAndSortedItems.length} result{filteredAndSortedItems.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-6xl mx-auto px-4">
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {(error as Error).message}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="aspect-[2/3] rounded-2xl bg-skeleton overflow-hidden relative">
                      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                    </div>
                    <div className="h-3.5 w-3/4 rounded-full bg-skeleton animate-pulse" />
                    <div className="h-2.5 w-1/2 rounded-full bg-skeleton animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : items && items.length > 0 ? (
            filteredAndSortedItems.length > 0 ? (
              viewMode === "grid" ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto px-4"
                >
                  {filteredAndSortedItems.map((item, i) => (
                    <motion.div
                      key={item.media_id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                    >
                      <MediaCard
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
                /* List view */
                <div className="max-w-4xl mx-auto px-4 flex flex-col gap-2">
                  {filteredAndSortedItems.map((item, i) => (
                    <motion.div
                      key={item.media_id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
                    >
                      <Link
                        to={
                          item.media_type === "anime"
                            ? `/anime/${item.media_id}`
                            : `/${item.media_type}/${item.media_id}`
                        }
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white/3 border border-white/6 hoverable:hover:bg-white/8 transition-colors group"
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-12 h-[72px] object-cover rounded-xl flex-none border border-white/8"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white/90 text-sm truncate hoverable:group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">{item.year}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {item.rating > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {item.rating.toFixed(1)}
                            </span>
                          )}
                          <span className="hidden sm:block px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/5 text-white/40 border border-white/8 uppercase tracking-wider">
                            {item.media_type === "tv" ? "Series" : item.media_type === "anime" ? "Anime" : "Film"}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <p className="text-white/40 text-base mb-3">No items match your filters.</p>
                <button
                  onClick={() => { setSearchQuery(""); setMediaFilter("all"); }}
                  className="text-primary text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-32 px-4">
              <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/15 rounded-full blur-[40px]" />
                <motion.div
                  animate={{ rotate: [12, 6, 12] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-24 h-24 bg-primary/10 border border-primary/20 rounded-[2rem] flex items-center justify-center shadow-2xl backdrop-blur-xl"
                >
                  <BookmarkPlus className="w-10 h-10 text-primary" />
                </motion.div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3 tracking-tight">
                Your watchlist is empty
              </h3>
              <p className="text-white/40 text-center max-w-sm mb-8 leading-relaxed">
                Add movies, TV shows, and anime to keep track of what you want to watch.
              </p>
              <Link
                to="/"
                className="px-8 py-3.5 bg-white text-black rounded-full font-bold text-sm hover:bg-white/90 hover:scale-[1.03] active:scale-95 transition-all shadow-xl"
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
