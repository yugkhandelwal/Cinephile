import { supabase } from "@/shared/api/supabase/client";

const LOCAL_RATINGS_KEY = "cinephile_local_ratings";

export async function setLike(media_id: number, media_type: "movie" | "tv", liked: boolean, title: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    const localData = localStorage.getItem(LOCAL_RATINGS_KEY);
    const ratings: RatingRow[] = localData ? JSON.parse(localData) : [];
    const index = ratings.findIndex(r => r.media_id === media_id);
    
    if (index >= 0) {
      ratings[index] = { ...ratings[index], liked, title, updated_at: new Date().toISOString() };
    } else {
      ratings.push({
        user_id: "local_user",
        media_id,
        media_type,
        liked,
        rating: null,
        title,
        updated_at: new Date().toISOString()
      });
    }
    localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(ratings));
    return;
  }

   
  const payload = { user_id: user.id, media_id, media_type, liked, title } as any;
  const { error } = await supabase.from("ratings").upsert(payload, { onConflict: "user_id,media_id" });
  if (error) throw error;
}

export async function setRating(media_id: number, media_type: "movie" | "tv", rating: number, title: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    const localData = localStorage.getItem(LOCAL_RATINGS_KEY);
    const ratings: RatingRow[] = localData ? JSON.parse(localData) : [];
    const index = ratings.findIndex(r => r.media_id === media_id);
    
    if (index >= 0) {
      ratings[index] = { ...ratings[index], rating, title, updated_at: new Date().toISOString() };
    } else {
      ratings.push({
        user_id: "local_user",
        media_id,
        media_type,
        liked: null,
        rating,
        title,
        updated_at: new Date().toISOString()
      });
    }
    localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(ratings));
    return;
  }

   
  const payload = { user_id: user.id, media_id, media_type, rating, title } as any;
  const { error } = await supabase.from("ratings").upsert(payload, { onConflict: "user_id,media_id" });
  if (error) throw error;
}

export type RatingRow = {
  user_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  liked: boolean | null;
  rating: number | null;
  title: string | null;
  updated_at: string | null;
};

export async function getRatings(): Promise<RatingRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    const localData = localStorage.getItem(LOCAL_RATINGS_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  const { data, error } = await supabase.from("ratings").select("*");
  if (error) throw error;
  return data as RatingRow[];
}

export async function getMyRating(media_id: number): Promise<RatingRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    const localData = localStorage.getItem(LOCAL_RATINGS_KEY);
    if (!localData) return null;
    const ratings: RatingRow[] = JSON.parse(localData);
    return ratings.find(r => r.media_id === media_id) || null;
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("user_id", user.id)
    .eq("media_id", media_id)
    .maybeSingle();
  if (error) throw error;
  return data as RatingRow | null;
}
