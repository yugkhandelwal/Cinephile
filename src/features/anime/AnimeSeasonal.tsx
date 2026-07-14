import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import MediaCard from "@/shared/components/MediaCard";
import { useMalSeasonalAnime } from "@/shared/api/mal/hooks";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import InfiniteGrid from "@/shared/components/InfiniteGrid";
import { useScrollRestoration } from "@/shared/hooks/useScrollRestoration";
import BackToTop from "@/shared/components/BackToTop";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { SEO } from "@/shared/components/SEO";

const AnimeSeasonal = () => {
  const [params, setParams] = useSearchParams();
  
  const currentYear = new Date().getFullYear();
  const month = new Date().getMonth();
  const currentSeason = month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall';

  const [year, setYear] = useState<number>(() => parseInt(params.get('year') || currentYear.toString()));
  const [season, setSeason] = useState<string>(() => params.get('season') || currentSeason);
  
  useDocumentTitle(`Seasonal Anime - ${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`);

  const discoverInf = useMalSeasonalAnime(year, season);
  useScrollRestoration("anime-seasonal");

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (year !== currentYear) next.set('year', year.toString()); 
    else next.delete('year');
    if (season !== currentSeason) next.set('season', season);
    else next.delete('season');
    setParams(next, { replace: true });
  }, [year, season, currentYear, currentSeason, params, setParams]);

  const normalizeToCard = (item: any) => ({
    ...item,
    mediaType: "anime" as const,
  });

  return (
  <>
    <SEO 
      title={`Seasonal Anime - ${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`}
      description="Browse seasonal anime releases."
      keywords={['anime', 'seasonal anime', 'new anime', season, year.toString()]}
      url="https://cinephile.app/anime/seasonal"
    />
    <div id="main" className="min-h-screen bg-background pb-tabbar">
      
      <div className="pt-6 md:pt-24">
        {/* Modern Filter Header */}
        <div className="bg-transparent pt-8 pb-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">Seasonal Anime</h1>
            
            <div className="flex w-full sm:w-auto gap-2">
              <select 
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full sm:w-40 appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl px-4 py-3 pr-10 outline-none focus:border-rose-500 transition-colors cursor-pointer shadow-lg backdrop-blur-sm"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.8rem auto' }}
              >
                <option value="winter" className="bg-zinc-900 text-white">Winter</option>
                <option value="spring" className="bg-zinc-900 text-white">Spring</option>
                <option value="summer" className="bg-zinc-900 text-white">Summer</option>
                <option value="fall" className="bg-zinc-900 text-white">Fall</option>
              </select>

              <select 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full sm:w-32 appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl px-4 py-3 pr-10 outline-none focus:border-rose-500 transition-colors cursor-pointer shadow-lg backdrop-blur-sm"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.8rem auto' }}
              >
                {Array.from({length: 10}, (_, i) => currentYear + 1 - i).map(y => (
                  <option key={y} value={y} className="bg-zinc-900 text-white">{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <InfiniteGrid
            pages={discoverInf.data?.pages.map((p) => p.data.map(item => normalizeToCard(item)))}
            renderItem={(m) => <MediaCard key={`seasonal-${m.id}`} {...m} tag="NEW" />}
            isLoading={discoverInf.isLoading}
            isError={!!discoverInf.isError}
            fetchNextPage={discoverInf.fetchNextPage}
            hasNextPage={discoverInf.hasNextPage}
            isFetchingNextPage={discoverInf.isFetchingNextPage}
            onRetry={() => discoverInf.refetch()}
            emptyText={`No anime found for ${season.charAt(0).toUpperCase() + season.slice(1)} ${year}.`}
          />
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  </>
  );
};

export default AnimeSeasonal;
