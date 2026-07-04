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
  const [params, setParams] = useSearchParams();
  const [mediaType, setMediaType] = useState<"movie" | "tv">(() => (params.get('type') as any) || "movie");
  const { data: genres } = useGenres(mediaType);
  useDocumentTitle("Browse");
  const [selectedGenres, setSelectedGenres] = useState<number[]>(() => (params.get('genres')?.split(',').filter(Boolean).map(Number) || []));
  const [sortBy, setSortBy] = useState(() => params.get('sort') || "popularity.desc");
  const [ratingMin, setRatingMin] = useState<number>(() => Number(params.get('ratingMin') || 0));
  const [yearStart, setYearStart] = useState<number | undefined>(() => (params.get('yearStart') ? Number(params.get('yearStart')) : undefined));
  const [yearEnd, setYearEnd] = useState<number | undefined>(() => (params.get('yearEnd') ? Number(params.get('yearEnd')) : undefined));
  const discoverInf = useInfiniteDiscover(mediaType, { withGenres: selectedGenres, sortBy, ratingMin, yearStart, yearEnd });
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useScrollRestoration("movies");
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // load next page for discover list
          if (discoverInf.hasNextPage && !discoverInf.isFetchingNextPage) discoverInf.fetchNextPage();
        }
      });
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [discoverInf.hasNextPage, discoverInf.isFetchingNextPage]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (mediaType !== 'movie') next.set('type', mediaType); else next.delete('type');
    if (selectedGenres.length) next.set('genres', selectedGenres.join(',')); else next.delete('genres');
    if (sortBy) next.set('sort', sortBy); else next.delete('sort');
    if (ratingMin) next.set('ratingMin', String(ratingMin)); else next.delete('ratingMin');
    if (yearStart) next.set('yearStart', String(yearStart)); else next.delete('yearStart');
    if (yearEnd) next.set('yearEnd', String(yearEnd)); else next.delete('yearEnd');
    setParams(next, { replace: true });
  }, [mediaType, selectedGenres, sortBy]);

  // Reset genres when switching media type
  useEffect(() => {
    setSelectedGenres([]);
  }, [mediaType]);

  return (
  <>
    <SEO 
      title="Browse"
      description="Browse popular, trending, and top-rated movies and TV shows. Discover your next favorite from thousands of titles across all genres."
      keywords={['movies', 'tv shows', 'popular', 'trending', 'cinema', 'top rated']}
      url="https://cinephile.app/movies"
    />
    <div id="main" className="min-h-screen bg-background pb-tabbar">

      
      <div className="pt-6 md:pt-24">
        {/* Modern Filter Header */}
        <div className="bg-transparent pt-8 pb-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">Browse</h1>
            
            <div className="grid grid-cols-3 sm:flex sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Type Dropdown */}
              <select 
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as any)}
                className="w-full appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-medium rounded-xl px-2 sm:px-4 py-2 pr-7 sm:pr-10 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="movie" className="bg-zinc-900">Movies</option>
                <option value="tv" className="bg-zinc-900">TV Shows</option>
              </select>

              {/* Genres Dropdown */}
              <select 
                value={selectedGenres.length > 0 ? selectedGenres[0] : ''}
                onChange={(e) => setSelectedGenres(e.target.value ? [Number(e.target.value)] : [])}
                className="w-full appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-medium rounded-xl px-2 sm:px-4 py-2 pr-7 sm:pr-10 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="" className="bg-zinc-900">All Genres</option>
                {genres?.map((g) => (
                  <option key={g.id} value={g.id} className="bg-zinc-900">{g.name}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="w-full appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-medium rounded-xl px-2 sm:px-4 py-2 pr-7 sm:pr-10 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="popularity.desc" className="bg-zinc-900">Most Popular</option>
                <option value="vote_average.desc" className="bg-zinc-900">Top Rated</option>
                <option value="release_date.desc" className="bg-zinc-900">Newest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <InfiniteGrid
            pages={discoverInf.data?.pages.map((p) => p.items)}
            renderItem={(m) => <MovieCard key={`${m.mediaType}-${m.id}`} {...m} />}
            isLoading={discoverInf.isLoading}
            isError={!!discoverInf.isError}
            fetchNextPage={discoverInf.fetchNextPage}
            hasNextPage={discoverInf.hasNextPage}
            isFetchingNextPage={discoverInf.isFetchingNextPage}
            onRetry={() => discoverInf.refetch()}
          />

        </div>
      </div>

      <Footer />
  <BackToTop />
    </div>
  </>
  );
};

export default Movies;
