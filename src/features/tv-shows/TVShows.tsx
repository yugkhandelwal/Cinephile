import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import ContentSection from "../home/ContentSection";
import MovieCard from "@/shared/components/MovieCard";
import { useTrendingTV, useGenres, useDiscover, useInfiniteDiscover, useInfiniteTrending } from "@/shared/api/tmdb/hooks";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/shared/components/ui/skeleton";
import InfiniteGrid from "@/shared/components/InfiniteGrid";
import { useScrollRestoration } from "@/shared/hooks/useScrollRestoration";
import BackToTop from "@/shared/components/BackToTop";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { SEO } from "@/shared/components/SEO";

const TVShows = () => {
  const [params, setParams] = useSearchParams();
  useDocumentTitle("TV Shows");
  const [sortBy, setSortBy] = useState(() => params.get('sort') || "popularity.desc");
  const trendingInf = useInfiniteTrending("tv");
  const { data: tvGenres } = useGenres("tv");
  const [selectedGenres, setSelectedGenres] = useState<number[]>(() => (params.get('genres')?.split(',').filter(Boolean).map(Number) || []));
  const [ratingMin, setRatingMin] = useState<number>(() => Number(params.get('ratingMin') || 0));
  const [yearStart, setYearStart] = useState<number | undefined>(() => (params.get('yearStart') ? Number(params.get('yearStart')) : undefined));
  const [yearEnd, setYearEnd] = useState<number | undefined>(() => (params.get('yearEnd') ? Number(params.get('yearEnd')) : undefined));
  const discoverInf = useInfiniteDiscover("tv", { withGenres: selectedGenres, sortBy, ratingMin, yearStart, yearEnd });
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useScrollRestoration("tv");

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (selectedGenres.length) next.set('genres', selectedGenres.join(',')); else next.delete('genres');
    if (sortBy) next.set('sort', sortBy); else next.delete('sort');
  if (ratingMin) next.set('ratingMin', String(ratingMin)); else next.delete('ratingMin');
  if (yearStart) next.set('yearStart', String(yearStart)); else next.delete('yearStart');
  if (yearEnd) next.set('yearEnd', String(yearEnd)); else next.delete('yearEnd');
    setParams(next, { replace: true });
  }, [selectedGenres, sortBy]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (discoverInf.hasNextPage && !discoverInf.isFetchingNextPage) discoverInf.fetchNextPage();
          if (trendingInf.hasNextPage && !trendingInf.isFetchingNextPage) trendingInf.fetchNextPage();
        }
      });
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [discoverInf.hasNextPage, discoverInf.isFetchingNextPage, trendingInf.hasNextPage, trendingInf.isFetchingNextPage]);

  const dramaShows = [
    { title: "Breaking Bad", year: "2008", rating: 9.5, imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop" },
    { title: "The Crown", year: "2016", rating: 8.7, imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop" },
    { title: "Succession", year: "2018", rating: 8.9, imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop" },
    { title: "The Last of Us", year: "2023", rating: 8.8, imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop" },
    { title: "Better Call Saul", year: "2015", rating: 9.0, imageUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop" },
    { title: "The Wire", year: "2002", rating: 9.3, imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop" },
  ];

  return (
  <>
    <SEO 
      title="TV Shows"
      description="Explore popular TV shows, trending series, and top-rated programs. Discover your next binge-watch from thousands of TV series."
      keywords={['tv shows', 'series', 'streaming', 'television', 'binge watch', 'top tv shows']}
      url="https://cinephile.app/tv-shows"
    />
    <div id="main" className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore <span className="text-primary">TV Shows</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Dive into captivating series and binge-worthy content
            </p>
          </div>
        </div>

        <div className="sticky top-16 z-20 bg-background/80 backdrop-blur py-3 border-b border-border">
          <div className="container mx-auto px-4 flex flex-wrap gap-3 items-center">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="first_air_date.desc">Newest</option>
          </select>
          <div className="flex gap-2 flex-wrap">
            {tvGenres?.map((g) => (
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

        {(trendingInf.isLoading || discoverInf.isLoading) && (
          <div className="container mx-auto px-4 py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        )}
        {(trendingInf.isError || discoverInf.isError) && (
          <div className="container mx-auto px-4 py-12 text-destructive">Failed to load. Check your API key.</div>
        )}

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
        {discoverInf.isFetchingNextPage && (
          <div className="container mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        )}

        <InfiniteGrid
          title="Trending TV Series"
          subtitle="Streaming Universe"
          pages={trendingInf.data?.pages.map((p) => p.items)}
          renderItem={(m) => <MovieCard key={`${m.mediaType}-${m.id}`} {...m} />}
          isLoading={trendingInf.isLoading}
          isError={!!trendingInf.isError}
          fetchNextPage={trendingInf.fetchNextPage}
          hasNextPage={trendingInf.hasNextPage}
          isFetchingNextPage={trendingInf.isFetchingNextPage}
          onRetry={() => trendingInf.refetch()}
        />
        {trendingInf.isFetchingNextPage && (
          <div className="container mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        )}

  <div className="h-2" />

        <ContentSection
          title="Must-Watch Dramas"
          subtitle="Award Winners"
          onViewAll={() => {}}
        >
          {dramaShows.map((show, index) => (
            <MovieCard key={index} {...show} />
          ))}
        </ContentSection>
      </div>

      <Footer />
  <BackToTop />
    </div>
  </>
  );
};

export default TVShows;
