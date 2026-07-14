import { MalAnimeListResponse, MalAnimeNode } from "./types";

const MAL_API_URL = "/api/mal";

export const malClient = {
  async fetch(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(MAL_API_URL, window.location.origin);
    url.searchParams.append("endpoint", endpoint);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`MAL API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Failed to fetch from MAL:", error);
      throw error;
    }
  },

  async getTopAnime(limit = 20, offset = 0, rankingType = "all"): Promise<MalAnimeListResponse> {
    return this.fetch("/anime/ranking", {
      ranking_type: rankingType,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: "id,title,main_picture,synopsis,mean,start_season,num_episodes,status,genres,studios",
    });
  },

  async getSeasonalAnime(year: number, season: string, limit = 20, offset = 0): Promise<MalAnimeListResponse> {
    return this.fetch(`/anime/season/${year}/${season}`, {
      limit: limit.toString(),
      offset: offset.toString(),
      fields: "id,title,main_picture,synopsis,mean,start_season,num_episodes,status,genres,studios",
      sort: "anime_score",
    });
  },

  async searchAnime(query: string, limit = 20, offset = 0): Promise<MalAnimeListResponse> {
    return this.fetch("/anime", {
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: "id,title,main_picture,synopsis,mean,start_season,num_episodes,status,genres,studios",
    });
  },

  async getAnimeDetails(id: number): Promise<MalAnimeNode> {
    return this.fetch(`/anime/${id}`, {
      fields: "id,title,main_picture,synopsis,mean,start_season,num_episodes,status,genres,studios,pictures,background,related_anime,recommendations,statistics,alternative_titles,rank,popularity,average_episode_duration",
    });
  },
};
