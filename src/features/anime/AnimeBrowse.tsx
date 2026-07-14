import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MediaCard from "@/shared/components/MediaCard";
import { useMalTopAnime } from "@/shared/api/mal/hooks";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import InfiniteGrid from "@/shared/components/InfiniteGrid";
import { useScrollRestoration } from "@/shared/hooks/useScrollRestoration";
import BackToTop from "@/shared/components/BackToTop";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { SEO } from "@/shared/components/SEO";

const AnimeBrowse = () => {
  const [params, setParams] = useSearchParams();
  const [rankingType, setRankingType] = useState<string>(() => params.get('ranking') || "all");
  
  useDocumentTitle("Browse Anime");

  const discoverInf = useMalTopAnime(rankingType);
  useScrollRestoration("anime-browse");

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (rankingType && rankingType !== "all") next.set('ranking', rankingType); 
    else next.delete('ranking');
    setParams(next, { replace: true });
  }, [rankingType]);

  const normalizeToCard = (item: any) => ({
    ...item,
    mediaType: "anime" as const,
  });

  return (
  <>
    <SEO 
      title="Browse Anime"
      description="Browse popular, airing, and top-rated anime. Discover your next favorite series from MyAnimeList."
      keywords={['anime', 'manga', 'popular anime', 'trending anime', 'top rated anime']}
      url="https://cinephile.app/anime/browse"
    />
    <div id="main" className="min-h-screen bg-background pb-tabbar">
      
      <div className="pt-6 md:pt-24">
        {/* Modern Filter Header */}
        <div className="bg-transparent pt-8 pb-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">Browse Anime</h1>
            
            <div className="w-full sm:w-auto">
              {/* Ranking Type Dropdown */}
              <select 
                value={rankingType}
                onChange={(e) => setRankingType(e.target.value)}
                className="w-full sm:w-64 appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl px-4 py-3 pr-10 outline-none focus:border-rose-500 transition-colors cursor-pointer shadow-lg backdrop-blur-sm"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.8rem auto' }}
              >
                <option value="all" className="bg-zinc-900 text-white">Top Anime (All Time)</option>
                <option value="airing" className="bg-zinc-900 text-white">Top Airing</option>
                <option value="upcoming" className="bg-zinc-900 text-white">Top Upcoming</option>
                <option value="tv" className="bg-zinc-900 text-white">Top TV Series</option>
                <option value="movie" className="bg-zinc-900 text-white">Top Movies</option>
                <option value="bypopularity" className="bg-zinc-900 text-white">Most Popular</option>
                <option value="favorite" className="bg-zinc-900 text-white">Most Favorited</option>
              </select>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <InfiniteGrid
            pages={discoverInf.data?.pages.map((p) => p.data.map(item => normalizeToCard(item)))}
            renderItem={(m) => <MediaCard key={`browse-${m.id}`} {...m} tag={m.rating >= 8 ? 'HOT' : undefined} />}
            isLoading={discoverInf.isLoading}
            isError={!!discoverInf.isError}
            fetchNextPage={discoverInf.fetchNextPage}
            hasNextPage={discoverInf.hasNextPage}
            isFetchingNextPage={discoverInf.isFetchingNextPage}
            onRetry={() => discoverInf.refetch()}
            emptyText="No anime found."
          />
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  </>
  );
};

export default AnimeBrowse;
