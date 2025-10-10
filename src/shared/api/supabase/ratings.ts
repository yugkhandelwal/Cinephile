import { supabase } from "@/shared/api/supabase/client";

export async function setLike(media_id: number, media_type: "movie" | "tv", liked: boolean, title: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const payload = { user_id: user.id, media_id, media_type, liked, title } as any;
  const { error } = await supabase.from("ratings").upsert(payload, { onConflict: "user_id,media_id" });
  if (error) throw error;
}

export async function setRating(media_id: number, media_type: "movie" | "tv", rating: number, title: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
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
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("ratings").select("*");
  if (error) throw error;
  return data as RatingRow[];
}

export async function getMyRating(media_id: number): Promise<RatingRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("user_id", user.id)
    .eq("media_id", media_id)
    .maybeSingle();
  if (error) throw error;
  return data as RatingRow | null;
}
