export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface TmdbSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  episodes?: TmdbEpisode[];
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id?: string;
}

export interface WatchProvider {
  logo_path: string;
  provider_name: string;
  provider_id: number;
  display_priority?: number;
}

export interface WatchProviderRegion {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
  free?: WatchProvider[];
}

export interface WatchProviderResponse {
  results?: Record<string, WatchProviderRegion>;
}

export interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  media_type?: "movie" | "tv" | "person";
  overview?: string;
  genres?: { id: number; name: string }[];
  runtime?: number; // movies
  episode_run_time?: number[]; // tv
  number_of_seasons?: number; // tv
  seasons?: TmdbSeason[]; // tv show seasons
  status?: string;
  homepage?: string | null;
  videos?: { results: Array<{ key: string; site: string; type: string; name: string }> };
  credits?: { 
    cast: Array<{ id: number; name: string; character?: string; profile_path: string | null }>; 
    crew: CrewMember[] 
  };
  images?: { backdrops: Array<{ file_path: string }>; posters: Array<{ file_path: string }>; logos?: Array<{ file_path: string; iso_639_1: string | null }> };
  recommendations?: { results: TmdbMovie[] };
  ['watch/providers']?: WatchProviderResponse;
}

export interface TmdbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Search result type for autocomplete/suggestions
export interface TmdbSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  popularity?: number;
}
