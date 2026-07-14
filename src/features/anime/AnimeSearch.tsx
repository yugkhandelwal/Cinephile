import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MediaCard from "@/shared/components/MediaCard";
import { useSearchParams } from "react-router-dom";
import { useMalSearch } from "@/shared/api/mal/hooks";
import { useEffect, useRef, useMemo, useState } from "react";
import InfiniteGrid from "@/shared/components/InfiniteGrid";
import { useScrollRestoration } from "@/shared/hooks/useScrollRestoration";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { searchQuerySchema } from "@/shared/lib/validation";
import { AlertCircle, Search as SearchIcon, X, Clock } from "lucide-react";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";

const AnimeSearch = () => {
  const [params, setParams] = useSearchParams();
  const rawQuery = params.get("q") || "";
  const [localQuery, setLocalQuery] = useState(rawQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('animeRecentSearches', []);

  // Sync local query to URL with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localQuery.trim()) {
        setParams({ q: localQuery.trim() }, { replace: true });
        
        if (localQuery.trim() !== rawQuery) {
            setRecentSearches(prev => {
                const updated = [localQuery.trim(), ...prev.filter(q => q.toLowerCase() !== localQuery.trim().toLowerCase())].slice(0, 5);
                return updated;
            });
        }
      } else {
        setParams({}, { replace: true });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [localQuery, setParams]);

  // Sync URL to local if changed externally
  useEffect(() => {
    setLocalQuery(rawQuery);
  }, [rawQuery]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && !rawQuery && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  const sanitizedQuery = useMemo(() => {
    try {
      return searchQuerySchema.parse(rawQuery);
    } catch {
      return "";
    }
  }, [rawQuery]);

  const validationError = useMemo(() => {
    if (!rawQuery) return null;
    const result = searchQuerySchema.safeParse(rawQuery);
    if (!result.success) {
      return result.error.errors[0]?.message || "Invalid search query";
    }
    return null;
  }, [rawQuery]);

  useDocumentTitle(sanitizedQuery ? `Search Anime: ${sanitizedQuery}` : "Search Anime");
  
  const inf = useMalSearch(sanitizedQuery);
  useScrollRestoration("anime-search");

  const filteredPages = useMemo(() => {
    if (!inf.data?.pages) return undefined;
    return inf.data.pages.map(p => p.data.map(item => ({ ...item, mediaType: 'anime' as const })));
  }, [inf.data?.pages]);

  return (
    <div id="main" className="min-h-screen bg-background pb-tabbar pt-20">

      {/* Top Bar for Mobile */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 md:hidden border-b border-white/5 flex gap-2 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-rose-500" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/10 rounded-full text-white placeholder-gray-400 outline-none appearance-none focus:outline-none focus:border-rose-500 transition-all shadow-inner lg-surface text-sm [webkit-tap-highlight-color:transparent]"
            placeholder="Search anime..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          {localQuery && (
            <button 
              onClick={() => {
                setLocalQuery('');
                setParams({}, { replace: true });
                searchInputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="pt-6 md:pt-12 container mx-auto px-4 py-8">
        
        {/* Desktop Search Input Box */}
        <div className="hidden md:block relative max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-rose-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 outline-none appearance-none focus:outline-none focus:border-rose-500 transition-all lg-surface text-lg shadow-lg"
            placeholder="Search anime..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          {localQuery && (
            <button 
              onClick={() => {
                setLocalQuery('');
                setParams({}, { replace: true });
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-6">
          {sanitizedQuery && (
            <h1 className="text-xl md:text-4xl font-heading font-bold mb-3 tracking-wide drop-shadow-sm text-white hidden md:block">
              Results for <span className="text-rose-500">{sanitizedQuery}</span>
            </h1>
          )}
          
          {/* Empty State */}
          {!sanitizedQuery && !localQuery && (
            <div className="flex flex-col gap-10 animate-fade-in mt-4 md:mt-0">
              
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white tracking-wide">Recent Anime Searches</h3>
                    <button 
                      onClick={() => setRecentSearches([])}
                      className="text-xs font-semibold text-white/40 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => {
                           setLocalQuery(search);
                           setTimeout(() => searchInputRef.current?.focus(), 50);
                        }}
                        className="flex items-center gap-2 h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white/80 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-white/40" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recentSearches.length === 0 && (
                <div className="flex flex-col items-center justify-center py-[15vh] px-4 animate-fade-in opacity-80">
                  <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-[40px] pointer-events-none" />
                    <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl -rotate-12 hover:rotate-0 transition-transform duration-500 ease-out backdrop-blur-xl">
                      <SearchIcon className="w-10 h-10 text-rose-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white mb-2 tracking-wide text-center">Search Anime</h3>
                  <p className="text-gray-400 text-center max-w-sm text-sm leading-relaxed">
                    Find your next favorite anime using the MAL database.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {validationError && rawQuery && (
            <div className="mt-6 p-5 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4 shadow-lg backdrop-blur-sm">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-bold text-destructive">Invalid Search Query</p>
                <p className="text-sm text-destructive/90 mt-1">{validationError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {sanitizedQuery && (
          <>
            {inf.isLoading && <p className="text-muted-foreground text-center py-10">Searching anime...</p>}
            {inf.isError && <p className="text-destructive text-center py-10">Failed to fetch anime results. Check your connection.</p>}

            {filteredPages && filteredPages[0]?.length === 0 && !inf.isLoading && (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <SearchIcon className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No anime found</h3>
                <p className="text-white/50 text-sm">Try adjusting your search term.</p>
              </div>
            )}

            <InfiniteGrid
              title=""
              subtitle=""
              pages={filteredPages}
              renderItem={(item) => <MediaCard key={`anime-${item.id}`} {...item} tag={item.rating >= 8 ? 'HOT' : undefined} />}
              isLoading={inf.isLoading}
              isError={!!inf.isError}
              fetchNextPage={inf.fetchNextPage}
              hasNextPage={inf.hasNextPage}
              isFetchingNextPage={inf.isFetchingNextPage}
              onRetry={() => inf.refetch()}
              emptyText=""
            />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AnimeSearch;
