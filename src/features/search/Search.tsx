import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import ContentSection from "../home/ContentSection";
import MovieCard from "@/shared/components/MovieCard";
import { useSearchParams } from "react-router-dom";
import { useInfiniteSearchMulti } from "@/shared/api/tmdb/hooks";
import { useEffect, useRef, useMemo } from "react";
import InfiniteGrid from "@/shared/components/InfiniteGrid";
import { useScrollRestoration } from "@/shared/hooks/useScrollRestoration";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { searchQuerySchema } from "@/shared/lib/validation";
import { AlertCircle } from "lucide-react";

const Search = () => {
  const [params] = useSearchParams();
  const rawQuery = params.get("q") || "";
  
  // Validate and sanitize search query
  const sanitizedQuery = useMemo(() => {
    try {
      return searchQuerySchema.parse(rawQuery);
    } catch {
      return ""; // Return empty string if validation fails
    }
  }, [rawQuery]);

  // Check if query is valid
  const isValidQuery = useMemo(() => {
    const result = searchQuerySchema.safeParse(rawQuery);
    return result.success;
  }, [rawQuery]);

  const validationError = useMemo(() => {
    if (!rawQuery) return null;
    const result = searchQuerySchema.safeParse(rawQuery);
    if (!result.success) {
      return result.error.errors[0]?.message || "Invalid search query";
    }
    return null;
  }, [rawQuery]);

  useDocumentTitle(sanitizedQuery ? `Search: ${sanitizedQuery}` : "Search");
  const inf = useInfiniteSearchMulti(sanitizedQuery);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useScrollRestoration("search");

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && inf.hasNextPage && !inf.isFetchingNextPage) {
          inf.fetchNextPage();
        }
      });
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [inf.hasNextPage, inf.isFetchingNextPage, sanitizedQuery]);

  return (
  <div id="main" className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 tracking-wide drop-shadow-sm text-white">
            Search results {sanitizedQuery ? <span>for <span className="text-primary">{sanitizedQuery}</span></span> : ""}
          </h1>
          
          {!sanitizedQuery && (
            <div className="flex flex-col items-center justify-center py-32 px-4 animate-fade-in">
              <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] pointer-events-none" />
                <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl -rotate-12 hover:rotate-0 transition-transform duration-500 ease-out backdrop-blur-xl">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-heading font-bold text-white mb-4 tracking-wide text-center">Discover something new</h3>
              <p className="text-gray-400 text-center max-w-md mb-10 text-lg leading-relaxed">
                Click the search icon in the top navigation bar to explore our extensive library of movies and TV shows.
              </p>
            </div>
          )}
          
          {/* Show validation error if query is invalid */}
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

  {inf.isLoading && <p className="text-muted-foreground">Loading…</p>}
  {inf.isError && <p className="text-destructive">Failed to fetch results. Check your API key.</p>}

              <InfiniteGrid
                title="Results"
                subtitle="Across movies and TV"
                pages={inf.data?.pages.map((p) => p.items)}
                renderItem={(item) => <MovieCard key={`${item.mediaType}-${item.id}`} {...item} />}
                isLoading={inf.isLoading}
                isError={!!inf.isError}
                fetchNextPage={inf.fetchNextPage}
                hasNextPage={inf.hasNextPage}
                isFetchingNextPage={inf.isFetchingNextPage}
                onRetry={() => inf.refetch()}
                emptyText={sanitizedQuery ? "No matches found" : "Type to search"}
              />
        <div ref={sentinelRef} className="h-10" />
      </div>
      <Footer />
    </div>
  );
};

export default Search;
