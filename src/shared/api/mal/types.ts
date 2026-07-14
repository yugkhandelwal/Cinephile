export interface MalAnimeNode {
  id: number;
  title: string;
  main_picture?: {
    medium: string;
    large: string;
  };
  synopsis?: string;
  mean?: number;
  start_season?: {
    year: number;
    season: string;
  };
  num_episodes?: number;
  status?: string;
  genres?: { id: number; name: string }[];
  studios?: { id: number; name: string }[];
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
  rank?: number;
  popularity?: number;
  average_episode_duration?: number;
  pictures?: { medium: string; large: string }[];
  background?: string;
  related_anime?: {
    node: MalAnimeNode;
    relation_type: string;
    relation_type_formatted: string;
  }[];
  recommendations?: {
    node: MalAnimeNode;
    num_recommendations: number;
  }[];
  statistics?: {
    status: {
      watching: string;
      completed: string;
      on_hold: string;
      dropped: string;
      plan_to_watch: string;
    };
    num_list_users: number;
  };
}

export interface MalAnimeEdge {
  node: MalAnimeNode;
}

export interface MalAnimeListResponse {
  data: MalAnimeEdge[];
  paging: {
    next?: string;
    previous?: string;
  };
}
