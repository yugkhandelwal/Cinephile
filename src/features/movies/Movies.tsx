import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import ContentSection from "../home/ContentSection";
import MovieCard from "@/shared/components/MovieCard";
import { useTrendingMovies, useGenres, useDiscover, useInfiniteDiscover, useInfiniteTrending } from "@/shared/api/tmdb/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/shared/components/ui/skeleton";
import InfiniteGrid from "@/shared/components/InfiniteGrid";
import { useScrollRestoration } from "@/shared/hooks/useScrollRestoration";
import BackToTop from "@/shared/components/BackToTop";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { SEO } from "@/shared/components/SEO";

const Movies = () => {
  const { data: movieGenres } = useGenres("movie");
  useDocumentTitle("Movies");
  const [params, setParams] = useSearchParams();
  const [selectedGenres, setSelectedGenres] = useState<number[]>(() => (params.get('genres')?.split(',').filter(Boolean).map(Number) || []));
  const [sortBy, setSortBy] = useState(() => params.get('sort') || "popularity.desc");
  const trendingInf = useInfiniteTrending("movie");
  const [ratingMin, setRatingMin] = useState<number>(() => Number(params.get('ratingMin') || 0));
  const [yearStart, setYearStart] = useState<number | undefined>(() => (params.get('yearStart') ? Number(params.get('yearStart')) : undefined));
  const [yearEnd, setYearEnd] = useState<number | undefined>(() => (params.get('yearEnd') ? Number(params.get('yearEnd')) : undefined));
  const discoverInf = useInfiniteDiscover("movie", { withGenres: selectedGenres, sortBy, ratingMin, yearStart, yearEnd });
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useScrollRestoration("movies");
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // load next pages for both lists
          if (discoverInf.hasNextPage && !discoverInf.isFetchingNextPage) discoverInf.fetchNextPage();
          if (trendingInf.hasNextPage && !trendingInf.isFetchingNextPage) trendingInf.fetchNextPage();
        }
      });
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [discoverInf.hasNextPage, discoverInf.isFetchingNextPage, trendingInf.hasNextPage, trendingInf.isFetchingNextPage]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (selectedGenres.length) next.set('genres', selectedGenres.join(',')); else next.delete('genres');
    if (sortBy) next.set('sort', sortBy); else next.delete('sort');
    if (ratingMin) next.set('ratingMin', String(ratingMin)); else next.delete('ratingMin');
    if (yearStart) next.set('yearStart', String(yearStart)); else next.delete('yearStart');
    if (yearEnd) next.set('yearEnd', String(yearEnd)); else next.delete('yearEnd');
    setParams(next, { replace: true });
  }, [selectedGenres, sortBy]);

  const actionMovies = [
    { title: "Monster: The Ed Gein Story", year: "2025", rating: 7.5, imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop" },
    { title: "Freakin' Friday", year: "2025", rating: 8.3, imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop" },
    { title: "One Battle After Another", year: "2025", rating: 8.0, imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop" },
    { title: "TRON: Ares", year: "2025", rating: 7.9, imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop" },
    { title: "The Conjuring: Last Rites", year: "2025", rating: 8.1, imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop" },
    { title: "HIM", year: "2025", rating: 6.0, imageUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop" },
  ];

  return (
  <>
    <SEO 
      title="Movies"
      description="Browse popular, trending, and top-rated movies. Discover your next favorite film from thousands of movies across all genres."
      keywords={['movies', 'popular movies', 'trending films', 'cinema', 'top rated movies']}
      url="https://cinephile.app/movies"
    />
    <div id="main" className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover <span className="text-primary">Movies</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse through thousands of movies from all genres and eras
            </p>
          </div>
        </div>

        <div className="sticky top-16 z-20 bg-background/80 backdrop-blur py-3 border-b border-border">
          <div className="container mx-auto px-4 flex flex-wrap gap-3 items-center">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="release_date.desc">Newest</option>
          </select>
          <div className="flex gap-2 flex-wrap">
            {movieGenres?.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenres((cur) => cur.includes(g.id) ? cur.filter((id) => id !== g.id) : [...cur, g.id])}
                className={`text-xs px-3 py-1 rounded-full border ${selectedGenres.includes(g.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
              >
                {g.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Min rating</label>
            <input type="number" min={0} max={10} step={0.5} value={ratingMin || ''} onChange={(e) => setRatingMin(Number(e.target.value) || 0)} className="h-8 w-20 rounded border border-border bg-background px-2 text-xs" />
            <label className="text-xs text-muted-foreground">Year</label>
            <input placeholder="From" type="number" value={yearStart || ''} onChange={(e) => setYearStart(e.target.value ? Number(e.target.value) : undefined)} className="h-8 w-20 rounded border border-border bg-background px-2 text-xs" />
            <span className="text-xs">–</span>
            <input placeholder="To" type="number" value={yearEnd || ''} onChange={(e) => setYearEnd(e.target.value ? Number(e.target.value) : undefined)} className="h-8 w-20 rounded border border-border bg-background px-2 text-xs" />
          </div>
          <button
            onClick={() => { setSelectedGenres([]); setSortBy('popularity.desc'); setRatingMin(0); setYearStart(undefined); setYearEnd(undefined); }}
            className="ml-auto text-xs px-3 py-1 rounded-full border border-border"
          >
            Clear filters
          </button>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <InfiniteGrid
            title="Filtered Results"
            subtitle="Based on your filters"
            pages={discoverInf.data?.pages.map((p) => p.items)}
            renderItem={(m) => <MovieCard key={`${m.mediaType}-${m.id}`} {...m} />}
            isLoading={discoverInf.isLoading}
            isError={!!discoverInf.isError}
            fetchNextPage={discoverInf.fetchNextPage}
            hasNextPage={discoverInf.hasNextPage}
            isFetchingNextPage={discoverInf.isFetchingNextPage}
            onRetry={() => discoverInf.refetch()}
          />

          <InfiniteGrid
            title="Trending Movies"
            subtitle="Cinema Collection"
            pages={trendingInf.data?.pages.map((p) => p.items)}
            renderItem={(m) => <MovieCard key={`${m.mediaType}-${m.id}`} {...m} />}
            isLoading={trendingInf.isLoading}
            isError={!!trendingInf.isError}
            fetchNextPage={trendingInf.fetchNextPage}
            hasNextPage={trendingInf.hasNextPage}
            isFetchingNextPage={trendingInf.isFetchingNextPage}
            onRetry={() => trendingInf.refetch()}
          />

          <ContentSection
            title="Action & Adventure"
            subtitle="High Octane"
            onViewAll={() => {}}
          >
            {actionMovies.map((movie, index) => (
              <MovieCard key={index} {...movie} />
            ))}
          </ContentSection>
        </div>
      </div>

      <Footer />
  <BackToTop />
    </div>
  </>
  );
};

export default Movies;
