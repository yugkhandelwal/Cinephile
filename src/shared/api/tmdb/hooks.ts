import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { tmdb, toPoster, toTitle, toYear } from "./client";
import { getWatchlist } from "@/shared/api/supabase/watchlist";
import { buildAIRecommendations } from "@/shared/lib/recommend";
import { TmdbMovie } from "./types";

export interface UIMediaItem {
  id?: number;
  mediaType?: "movie" | "tv";
  title: string;
  year: string;
  rating: number;
  imageUrl: string;
  backdropUrl?: string;
  description?: string;
  popularity?: number;
}

function map(items: TmdbMovie[]): UIMediaItem[] {
  return items.map((m) => ({
  id: m.id,
  mediaType: (m.media_type === "movie" || m.media_type === "tv") ? m.media_type : (m.title ? "movie" : "tv"),
    title: toTitle(m),
    year: toYear(m),
    rating: Number(m.vote_average?.toFixed?.(1) ?? 0),
    imageUrl: toPoster(m.poster_path),
    backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : undefined,
    description: m.overview,
    popularity: m.popularity,
  }));
}

export function useTrendingMovies(page = 1) {
  return useQuery({
    queryKey: ["tmdb", "movies", "trending", "v2", page],
    queryFn: async () => map((await tmdb.movies.trending(page)).results),
  });
}

export function useTrendingTV(page = 1) {
  return useQuery({
    queryKey: ["tmdb", "tv", "trending", page],
    queryFn: async () => map((await tmdb.tv.trending(page)).results),
  });
}

export function useNowPlayingMovies(page = 1) {
  return useQuery({
    queryKey: ["tmdb", "movies", "nowPlaying", page],
    queryFn: async () => map((await tmdb.movies.nowPlaying(page)).results),
  });
}

export function useUpcomingMovies(page = 1) {
  return useQuery({
    queryKey: ["tmdb", "movies", "upcoming", page],
    queryFn: async () => map((await tmdb.movies.upcoming(page)).results),
  });
}

export function useOnTheAirTV(page = 1) {
  return useQuery({
    queryKey: ["tmdb", "tv", "onTheAir", page],
    queryFn: async () => map((await tmdb.tv.onTheAir(page)).results),
  });
}

export function useSearchMulti(query: string, page = 1) {
  return useQuery({
    enabled: !!query,
    queryKey: ["tmdb", "multi", "search", query, page],
    queryFn: async () => map((await tmdb.multi.search(query, page)).results),
  });
}

export function useGenres(kind: "movie" | "tv") {
  return useQuery({
    queryKey: ["tmdb", "genres", kind],
    queryFn: async () => (await tmdb.genres[kind]()).genres,
  });
}

export function useDiscover(kind: "movie" | "tv", opts: { page?: number; sortBy?: string; withGenres?: number[]; withWatchProviders?: string; watchRegion?: string }) {
  return useQuery({
    queryKey: ["tmdb", "discover", kind, opts],
    queryFn: async () =>
      map(
        (
          await tmdb.discover[kind]({
            page: opts.page ?? 1,
            sort_by: opts.sortBy ?? "popularity.desc",
            with_genres: (opts.withGenres ?? []).join(","),
            ...(opts.withWatchProviders ? { with_watch_providers: opts.withWatchProviders } : {}),
            ...(opts.watchRegion ? { watch_region: opts.watchRegion } : {}),
          } as any)
        ).results,
      ),
  });
}

export function useRecommendationsFromWatchlist() {
  return useQuery({
    queryKey: ["tmdb", "recs", "watchlist"],
    queryFn: async () => {
      const wl = await getWatchlist();
      const top = wl.slice(0, 5); // limit calls
      const batches = await Promise.all(
        top.map((w) =>
          w.media_type === "movie"
            ? tmdb.movies.recommendations(w.media_id)
            : tmdb.tv.recommendations(w.media_id),
        ),
      );
      const merged = batches.flatMap((b) => b.results);
      // de-dupe by id
      const unique = Array.from(new Map(merged.map((m) => [m.id, m])).values());
      return map(unique).slice(0, 30);
    },
  });
}

export function useAIRecommendations() {
  return useQuery({
    queryKey: ["ai", "recs"],
    queryFn: buildAIRecommendations,
  });
}

export function useDetails(kind: "movie" | "tv", id: number | string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["tmdb", kind, "details", id],
    queryFn: async () => {
      const numId = Number(id);
      const details =
        kind === "movie"
          ? await tmdb.movies.detailsWithExtras(numId)
          : await tmdb.tv.detailsWithExtras(numId);
      const recs = details.recommendations?.results ?? [];
      return {
        details,
        recommendations: map(recs),
      };
    },
  });
}

export function usePrefetchDetails() {
  const qc = useQueryClient();
  return (kind: "movie" | "tv", id: number) => {
    qc.prefetchQuery({
      queryKey: ["tmdb", kind, "details", id],
      queryFn: async () => {
        const details = kind === "movie" ? await tmdb.movies.detailsWithExtras(id) : await tmdb.tv.detailsWithExtras(id);
        return { details, recommendations: map(details.recommendations?.results ?? []) };
      },
      staleTime: 60_000,
    });
  };
}

export function useSeason(tvId: number | string | undefined, seasonNumber: number | undefined) {
  return useQuery({
    enabled: !!tvId && seasonNumber !== undefined,
    queryKey: ["tmdb", "tv", "season", tvId, seasonNumber],
    queryFn: async () => {
      const numId = Number(tvId);
      const numSeason = Number(seasonNumber);
      return await tmdb.tv.season(numId, numSeason);
    },
  });
}

type PageResult = { items: UIMediaItem[]; page: number; totalPages: number };

export function useInfiniteTrending(kind: "movie" | "tv") {
  return useInfiniteQuery<PageResult>({
    queryKey: ["tmdb", kind, "trending", "infinite"],
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.page < last.totalPages ? all.length + 1 : undefined),
    queryFn: async ({ pageParam }) => {
      const res = kind === "movie" ? await tmdb.movies.trending(Number(pageParam)) : await tmdb.tv.trending(Number(pageParam));
      return { items: map(res.results), page: Number(pageParam), totalPages: res.total_pages };
    },
  });
}

export function useInfiniteDiscover(
  kind: "movie" | "tv",
  opts: { sortBy?: string; withGenres?: number[]; ratingMin?: number; yearStart?: number; yearEnd?: number },
) {
  return useInfiniteQuery<PageResult>({
    queryKey: ["tmdb", kind, "discover", opts],
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.page < last.totalPages ? all.length + 1 : undefined),
    queryFn: async ({ pageParam }) => {
      const base: any = { page: Number(pageParam), sort_by: opts.sortBy ?? "popularity.desc", with_genres: (opts.withGenres ?? []).join(",") };
      if (opts.ratingMin) base["vote_average.gte"] = opts.ratingMin;
      if (opts.yearStart || opts.yearEnd) {
        if (kind === "movie") {
          if (opts.yearStart) base["primary_release_date.gte"] = `${opts.yearStart}-01-01`;
          if (opts.yearEnd) base["primary_release_date.lte"] = `${opts.yearEnd}-12-31`;
        } else {
          if (opts.yearStart) base["first_air_date.gte"] = `${opts.yearStart}-01-01`;
          if (opts.yearEnd) base["first_air_date.lte"] = `${opts.yearEnd}-12-31`;
        }
      }
      const res = await tmdb.discover[kind](base);
      return { items: map(res.results), page: Number(pageParam), totalPages: res.total_pages } as PageResult;
    },
  });
}

export function useInfiniteSearchMulti(query: string) {
  return useInfiniteQuery<PageResult>({
    enabled: !!query,
    queryKey: ["tmdb", "multi", "search", "infinite", query],
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.page < last.totalPages ? all.length + 1 : undefined),
    queryFn: async ({ pageParam }) => {
      const res = await tmdb.multi.search(query, Number(pageParam));
      return { items: map(res.results), page: Number(pageParam), totalPages: res.total_pages } as PageResult;
    },
  });
}

export function useTmdbLogoByTitle(title: string | undefined) {
  return useQuery({
    queryKey: ["tmdb", "logo", title],
    queryFn: async () => {
      if (!title) return null;
      // 1. Search TV shows
      const searchRes = await tmdb.tv.search(title, 1);
      const first = searchRes.results?.[0];
      if (!first) return null;
      
      // 2. Fetch details for images
      const details = await tmdb.tv.detailsWithExtras(first.id);
      const logos = details.images?.logos;
      if (!logos || logos.length === 0) return null;
      
      // Prefer English or Japanese logo
      const prefLogo = logos.find((l: any) => l.iso_639_1 === 'en' || l.iso_639_1 === 'ja');
      const finalLogo = prefLogo || logos[0];
      
      return finalLogo?.file_path ? `https://image.tmdb.org/t/p/w500${finalLogo.file_path}` : null;
    },
    enabled: !!title,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}

export function useTmdbDetailsByTitle(title: string | undefined) {
  return useQuery({
    queryKey: ["tmdb", "detailsByTitle", title],
    queryFn: async () => {
      if (!title) return null;
      // 1. Search TV shows
      const searchRes = await tmdb.tv.search(title, 1);
      const first = searchRes.results?.[0];
      if (!first) return null;
      
      // 2. Fetch full details including videos and images
      const details = await tmdb.tv.detailsWithExtras(first.id);
      return details;
    },
    enabled: !!title,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}
