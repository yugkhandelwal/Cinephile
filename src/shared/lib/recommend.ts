import { getWatchlist } from "@/shared/api/supabase/watchlist";
import { getRatings } from "@/shared/api/supabase/ratings";
import { tmdb } from "@/shared/api/tmdb/client";
import type { UIMediaItem } from "@/shared/api/tmdb/hooks";
import { toPoster, toTitle, toYear } from "@/shared/api/tmdb/client";

export type AIRationale = {
  topGenres: { id: number; name: string; score: number }[];
  basisCount: number;
  topSeeds: { id: number; type: "movie" | "tv"; title: string; weight: number }[];
};

// Simple heuristic recommender: infer top genres from user likes/ratings/watchlist by looking at TMDb details and genre_ids
export async function buildAIRecommendations(): Promise<{ items: UIMediaItem[]; rationale: AIRationale; reasons: Record<number, string[]> }>{
  const [wl, ratings, movieGenres, tvGenres] = await Promise.all([
    getWatchlist(),
    getRatings().catch(() => []),
    tmdb.genres.movie(),
    tmdb.genres.tv(),
  ]);
  const genreMap = new Map<number, string>([
    ...movieGenres.genres.map((g) => [g.id, g.name] as const),
    ...tvGenres.genres.map((g) => [g.id, g.name] as const),
  ]);

  // collect media seeds with weights
  const seedMap = new Map<string, { id: number; type: "movie" | "tv"; weight: number; title: string }>();
  const pushSeed = (id: number, type: "movie" | "tv", weight: number, title: string) => {
    const key = `${type}:${id}`;
    const cur = seedMap.get(key);
    seedMap.set(key, { id, type, title, weight: (cur?.weight ?? 0) + weight });
  };

  wl.forEach((w) => pushSeed(w.media_id, w.media_type, 0.6, w.title));
  ratings.forEach((r) => {
    const likeBoost = r.liked ? 1.2 : 0;
    const ratingBoost = r.rating ? Math.max(0, (r.rating - 6) / 4) : 0; // 7->0.25, 10->1
    const total = likeBoost + ratingBoost;
    if (total > 0) pushSeed(r.media_id, r.media_type, total, r.title ?? "");
  });

  // cold-start: no seeds at all
  if (seedMap.size === 0) {
    const [mt, tt] = await Promise.all([tmdb.movies.trending(1), tmdb.tv.trending(1)]);
    const merged = [...mt.results, ...tt.results].slice(0, 30);
    const items: UIMediaItem[] = merged.map((m: any) => ({
      id: m.id,
      mediaType: m.title ? "movie" : "tv",
      title: toTitle(m),
      year: toYear(m),
      rating: Number(m.vote_average?.toFixed?.(1) ?? 0),
      imageUrl: toPoster(m.poster_path),
    }));
    return {
      items,
      rationale: { topGenres: [], basisCount: 0, topSeeds: [] },
      reasons: Object.fromEntries(items.map((i) => [i.id!, ["Popular now"]])),
    };
  }

  const basis = Array.from(seedMap.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 12);

  const details = await Promise.all(
    basis.map((b) => (b.type === "movie" ? tmdb.movies.details(b.id) : tmdb.tv.details(b.id)).catch(() => null)),
  );

  const counts = new Map<number, number>();
  for (const d of details) {
    if (!d || !(d as any).genres) continue;
    for (const g of (d as any).genres as { id: number }[]) {
      counts.set(g.id, (counts.get(g.id) ?? 0) + 1);
    }
  }

  const ranked = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, score]) => ({ id, name: genreMap.get(id) ?? String(id), score }));

  // fetch TMDb recommendations for top seeds
  const recBatches = await Promise.all(
    basis.slice(0, 8).map((s) =>
      (s.type === "movie" ? tmdb.movies.recommendations(s.id) : tmdb.tv.recommendations(s.id))
        .then((res) => ({ seed: s, results: res.results }))
        .catch(() => ({ seed: s, results: [] })),
    ),
  );

  // also fetch a genre-based discover mix
  const with_genres = ranked.map((g) => g.id).join(",");
  const [movieRes, tvRes] = await Promise.all([
    tmdb.discover.movie({ with_genres, sort_by: "popularity.desc", page: 1 }),
    tmdb.discover.tv({ with_genres, sort_by: "popularity.desc", page: 1 }),
  ]);

  // score items: seed rec weight + genre affinity + freshness
  type AnyItem = any;
  const genreScores = new Map<number, number>(ranked.map((g) => [g.id, g.score]));
  const scoreMap = new Map<number, { item: AnyItem; score: number; reasons: string[]; mediaType: "movie" | "tv" }>();

  function boostForItem(it: AnyItem, base: number, reason: string, mediaType: "movie" | "tv") {
    const id = it.id as number;
    const prev = scoreMap.get(id);
    const yearStr = (it.release_date || it.first_air_date || "").slice(0, 4);
    const year = Number(yearStr);
    const recency = !Number.isNaN(year) ? Math.min(1, Math.max(0, (year - 2000) / 25)) * 0.2 : 0; // up to +0.2
    // genre affinity from genre_ids
    const gIds: number[] = (it.genre_ids || (it.genres?.map((g: any) => g.id) ?? []));
    const gAffinity = gIds.reduce((sum, gid) => sum + (genreScores.get(gid) ?? 0), 0) * 0.1; // small boost
    const add = base + recency + gAffinity + (Number(it.vote_average || 0) / 10) * 0.2;
    if (!prev) scoreMap.set(id, { item: it, score: add, reasons: [reason], mediaType });
    else scoreMap.set(id, { ...prev, score: prev.score + add, reasons: Array.from(new Set([...prev.reasons, reason])) });
  }

  // from seed recommendations
  for (const batch of recBatches) {
    for (const it of batch.results) {
      boostForItem(it, batch.seed.weight, `Because you liked ${batch.seed.title || 'a similar title'}`, batch.seed.type);
    }
  }
  // from genre discover
  for (const it of [...movieRes.results, ...tvRes.results]) {
    const mediaType: "movie" | "tv" = (it.title ? "movie" : "tv");
    boostForItem(it, 0.5, `Matches your favorite genres`, mediaType);
  }

  // remove seeds themselves and anything in watchlist
  const wlSet = new Set(wl.map((w) => w.media_id));
  for (const s of basis) scoreMap.delete(s.id);
  for (const id of Array.from(scoreMap.keys())) {
    if (wlSet.has(id)) scoreMap.delete(id);
  }

  const rankedItems = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);

  const reasons: Record<number, string[]> = {};
  const items: UIMediaItem[] = rankedItems.map(({ item, mediaType, reasons: why }) => {
    reasons[item.id] = why.slice(0, 2);
    return {
      id: item.id,
      mediaType,
      title: toTitle(item),
      year: toYear(item),
      rating: Number(item.vote_average?.toFixed?.(1) ?? 0),
      imageUrl: toPoster(item.poster_path),
    } as UIMediaItem;
  });

  const rationale: AIRationale = {
    topGenres: ranked,
    basisCount: basis.length,
    topSeeds: basis.map((b) => ({ id: b.id, type: b.type, title: b.title, weight: Number(b.weight.toFixed(2)) })),
  };
  return { items, rationale, reasons };
}
