import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { malClient } from "./client";
import { UIMediaItem } from "../tmdb/hooks";
import { MalAnimeNode } from "./types";

// Helper to convert MAL anime to our common UI format
export function mapMalToUI(anime: MalAnimeNode): UIMediaItem {
  return {
    id: anime.id,
    mediaType: "tv", // mostly tv for anime, but we could differentiate based on 'media_type' if we had it
    title: anime.title,
    year: anime.start_season?.year?.toString() || "",
    rating: anime.mean || 0,
    imageUrl: anime.main_picture?.large || anime.main_picture?.medium || "",
    backdropUrl: anime.main_picture?.large, // MAL doesn't provide backdrops by default without full details
    description: anime.synopsis,
  };
}

export const useMalTopAnime = (rankingType: string = "all") => {
  return useInfiniteQuery({
    queryKey: ["mal", "topAnime", rankingType],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await malClient.getTopAnime(20, pageParam, rankingType);
      if (!response) return { data: [], nextOffset: undefined };
      
      const hasMore = !!response.paging?.next;
      return {
        data: response.data.map(edge => mapMalToUI(edge.node)),
        nextOffset: hasMore ? pageParam + 20 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};

export const useMalSeasonalAnime = (year: number, season: string) => {
  return useInfiniteQuery({
    queryKey: ["mal", "seasonalAnime", year, season],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await malClient.getSeasonalAnime(year, season, 20, pageParam);
      if (!response) return { data: [], nextOffset: undefined };
      
      const hasMore = !!response.paging?.next;
      return {
        data: response.data.map(edge => mapMalToUI(edge.node)),
        nextOffset: hasMore ? pageParam + 20 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};

export const useMalSearch = (query: string) => {
  return useInfiniteQuery({
    queryKey: ["mal", "search", query],
    queryFn: async ({ pageParam = 0 }) => {
      if (!query) return { data: [], nextOffset: undefined };
      const response = await malClient.searchAnime(query, 20, pageParam);
      if (!response) return { data: [], nextOffset: undefined };
      
      const hasMore = !!response.paging?.next;
      return {
        data: response.data.map(edge => mapMalToUI(edge.node)),
        nextOffset: hasMore ? pageParam + 20 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!query,
  });
};

export const useMalDetails = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ["mal", "details", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await malClient.getAnimeDetails(Number(id));
      return response;
    },
    enabled: !!id,
  });
};
