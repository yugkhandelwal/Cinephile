import { supabase } from "@/shared/api/supabase/client";
import type { TablesInsert } from "@/shared/api/supabase/types";

export type WatchlistItem = {
  id: string;
  user_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  year: string;
  rating: number;
  image_url: string;
  created_at: string;
};

export async function addToWatchlist(item: Omit<WatchlistItem, "id" | "user_id" | "created_at">) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const payload: TablesInsert<"watchlist"> = { ...item, user_id: user.id } as TablesInsert<"watchlist">;
  const { error } = await (supabase as any)
    .from("watchlist")
    .upsert(payload, { onConflict: "user_id,media_id" });
  if (error) throw error;
}

export async function removeFromWatchlist(media_id: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase.from("watchlist").delete().eq("user_id", user.id).eq("media_id", media_id);
  if (error) throw error;
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("watchlist").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as WatchlistItem[];
}
