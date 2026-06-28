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
        {/* Modern Filter Header */}
        <div className="bg-transparent pt-8 pb-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">Movies</h1>
            
            <div className="flex items-center gap-3">
              {/* Genres Dropdown */}
              <select 
                value={selectedGenres.length > 0 ? selectedGenres[0] : ''}
                onChange={(e) => setSelectedGenres(e.target.value ? [Number(e.target.value)] : [])}
                className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl px-4 py-2 pr-10 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="" className="bg-zinc-900">All Genres</option>
                {movieGenres?.map((g) => (
                  <option key={g.id} value={g.id} className="bg-zinc-900">{g.name}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl px-4 py-2 pr-10 outline-none focus:border-primary/50 transition-colors cursor-pointer"
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
