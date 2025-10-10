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
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Search results for <span className="text-primary">{sanitizedQuery || "…"}</span>
          </h1>
          {!sanitizedQuery && <p className="text-muted-foreground">Type a query in the search bar to begin.</p>}
          
          {/* Show validation error if query is invalid */}
          {validationError && rawQuery && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Invalid Search Query</p>
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
