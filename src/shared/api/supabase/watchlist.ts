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

const LOCAL_WATCHLIST_KEY = "cinephile_local_watchlist";

export async function addToWatchlist(item: Omit<WatchlistItem, "id" | "user_id" | "created_at">) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Fallback to local storage
    const localData = localStorage.getItem(LOCAL_WATCHLIST_KEY);
    const watchlist: WatchlistItem[] = localData ? JSON.parse(localData) : [];
    
    // Check if already exists
    if (!watchlist.some(w => w.media_id === item.media_id)) {
      watchlist.unshift({
        ...item,
        id: `local_${Date.now()}`,
        user_id: "local_user",
        created_at: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(watchlist));
    }
    return;
  }

  const payload: TablesInsert<"watchlist"> = { ...item, user_id: user.id } as TablesInsert<"watchlist">;
   
  const { error } = await (supabase as any)
    .from("watchlist")
    .upsert(payload, { onConflict: "user_id,media_id" });
  if (error) throw error;
}

export async function removeFromWatchlist(media_id: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    const localData = localStorage.getItem(LOCAL_WATCHLIST_KEY);
    if (localData) {
      let watchlist: WatchlistItem[] = JSON.parse(localData);
      watchlist = watchlist.filter(w => w.media_id !== media_id);
      localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(watchlist));
    }
    return;
  }

  const { error } = await supabase.from("watchlist").delete().eq("user_id", user.id).eq("media_id", media_id);
  if (error) throw error;
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    const localData = localStorage.getItem(LOCAL_WATCHLIST_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  const { data, error } = await supabase.from("watchlist").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as WatchlistItem[];
}

