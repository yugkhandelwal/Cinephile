import { createContext, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthProvider";
import { getRatings, setLike as svcSetLike, setRating as svcSetRating, type RatingRow } from "@/shared/api/supabase/ratings";
import { toast } from "@/shared/hooks/use-toast";

type Key = string; // `${media_type}:${media_id}`

type Entry = {
  media_id: number;
  media_type: "movie" | "tv";
  liked: boolean | null;
  rating: number | null;
  title?: string | null;
};

function toKey(media_type: "movie" | "tv", media_id: number): Key {
  return `${media_type}:${media_id}`;
}

type RatingsContextValue = {
  isLoading: boolean;
  get: (media_type: "movie" | "tv", media_id: number) => Entry | undefined;
  setLike: (media_type: "movie" | "tv", media_id: number, title: string, liked: boolean) => Promise<void>;
  setRating: (media_type: "movie" | "tv", media_id: number, title: string, rating: number) => Promise<void>;
};

const RatingsContext = createContext<RatingsContextValue | null>(null);

export function RatingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    enabled: !!user,
    queryKey: ["supabase", "ratings", user?.id],
    queryFn: async () => await getRatings(),
    staleTime: 60_000,
  });

  const map = useMemo(() => {
    const m = new Map<Key, Entry>();
    (query.data || []).forEach((r: RatingRow) => {
      m.set(toKey(r.media_type, r.media_id), {
        media_id: r.media_id,
        media_type: r.media_type,
        liked: r.liked,
        rating: r.rating,
        title: r.title ?? undefined,
      });
    });
    return m;
  }, [query.data]);

  const get = (media_type: "movie" | "tv", media_id: number) => map.get(toKey(media_type, media_id));

  async function setLike(media_type: "movie" | "tv", media_id: number, title: string, liked: boolean) {
  const key = ["supabase", "ratings", user?.id] as const;
  const prev = qc.getQueryData<RatingRow[]>(key) || [];
    // optimistic update
    const existsIdx = prev.findIndex((r) => r.media_id === media_id && r.media_type === media_type);
    const next: RatingRow[] = [...prev];
    if (existsIdx >= 0) next[existsIdx] = { ...next[existsIdx], liked };
    else next.unshift({ user_id: user!.id, media_id, media_type, liked, rating: null, title, updated_at: new Date().toISOString() });
  qc.setQueryData(key, next);
    try {
      await svcSetLike(media_id, media_type, liked, title);
      toast({ title: liked ? "Liked" : "Unliked", description: title });
    } catch (e: any) {
      // rollback
  qc.setQueryData(key, prev);
      toast({ title: "Failed to update like", description: String(e?.message || e), variant: "destructive" as any });
    } finally {
  qc.invalidateQueries({ queryKey: key, exact: true });
    }
  }

  async function setRating(media_type: "movie" | "tv", media_id: number, title: string, rating: number) {
    const key = ["supabase", "ratings", user?.id] as const;
  const prev = qc.getQueryData<RatingRow[]>(key) || [];
    const existsIdx = prev.findIndex((r) => r.media_id === media_id && r.media_type === media_type);
    const next: RatingRow[] = [...prev];
    if (existsIdx >= 0) next[existsIdx] = { ...next[existsIdx], rating };
    else next.unshift({ user_id: user!.id, media_id, media_type, liked: null, rating, title, updated_at: new Date().toISOString() });
  qc.setQueryData(key, next);
    try {
      await svcSetRating(media_id, media_type, rating, title);
      toast({ title: `Rated ${rating}/10`, description: title });
    } catch (e: any) {
  qc.setQueryData(key, prev);
      toast({ title: "Failed to set rating", description: String(e?.message || e), variant: "destructive" as any });
    } finally {
  qc.invalidateQueries({ queryKey: key, exact: true });
    }
  }

  const value: RatingsContextValue = {
    isLoading: !!user && query.isLoading,
    get,
    setLike,
    setRating,
  };

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error("useRatings must be used within RatingsProvider");
  return ctx;
}
