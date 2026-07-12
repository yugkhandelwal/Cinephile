import { useState, useMemo } from 'react';
import { useDiscover } from '@/shared/api/tmdb/hooks';
import ContentSection from './ContentSection';
import MovieCard from '@/shared/components/MovieCard';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { SectionErrorBoundary } from '@/shared/components/ErrorBoundary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

const PLATFORMS = [
  { id: '8', name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com' },
  { id: '9', name: 'Amazon Prime', logo: 'https://logo.clearbit.com/primevideo.com' },
  { id: '337', name: 'Disney+', logo: 'https://logo.clearbit.com/disneyplus.com' },
  { id: '15', name: 'Hulu', logo: 'https://logo.clearbit.com/hulu.com' },
  { id: '384', name: 'Max', logo: 'https://logo.clearbit.com/max.com' },
  { id: '531', name: 'Paramount+', logo: 'https://logo.clearbit.com/paramountplus.com' },
  { id: '350', name: 'Apple TV+', logo: 'https://logo.clearbit.com/tv.apple.com' }
];

const AvailableOnPlatform = () => {
  const [platform, setPlatform] = useState(PLATFORMS[0]);

  const { data: movies, isLoading: isMoviesLoading } = useDiscover('movie', { 
    withWatchProviders: platform.id, 
    watchRegion: 'US' 
  });

  const { data: tvShows, isLoading: isTvLoading } = useDiscover('tv', { 
    withWatchProviders: platform.id, 
    watchRegion: 'US' 
  });

  const mixedContent = useMemo(() => {
    if (!movies && !tvShows) return [];
    
    // Sort individually first to ensure we get the best of both
    const sortedMovies = [...(movies || [])].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const sortedSeries = [...(tvShows || [])].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    // Interleave them for a balanced mix
    const mixed = [];
    const maxLength = Math.max(sortedMovies.length, sortedSeries.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (sortedMovies[i]) mixed.push(sortedMovies[i]);
      if (sortedSeries[i]) mixed.push(sortedSeries[i]);
      
      if (mixed.length >= 15) break; // Stop when we have 15 items
    }
    
    return mixed;
  }, [movies, tvShows]);

  const isLoading = isMoviesLoading || isTvLoading;

  return (
    <SectionErrorBoundary>
      <div className="relative w-full">
        <ContentSection
          title={
            <div className="flex items-center flex-wrap gap-3 sm:gap-4">
              <span>Available on</span>
              <Select value={platform.id} onValueChange={(val) => setPlatform(PLATFORMS.find(p => p.id === val) || PLATFORMS[0])}>
                <SelectTrigger className="w-auto min-w-[160px] bg-transparent border-transparent shadow-none h-auto focus:ring-0 text-white hover:bg-white/5 transition-colors px-2 py-0">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl md:text-4xl font-bold font-heading tracking-tight">{platform.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover/95 backdrop-blur-xl border-white/10 text-white">
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white data-[state=checked]:bg-primary/20 data-[state=checked]:text-primary-foreground py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
          subtitle={`Popular movies and shows currently streaming on ${platform.name}`}
        >
          {isLoading ? (
            Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[2/3] rounded-xl" />
            ))
          ) : (
            mixedContent.map(item => (
              <MovieCard key={`${item.mediaType}-${item.id}`} {...item} />
            ))
          )}
        </ContentSection>
      </div>
    </SectionErrorBoundary>
  );
};

export default AvailableOnPlatform;
