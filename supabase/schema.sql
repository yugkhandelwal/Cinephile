-- Run this SQL in your Supabase project to create required tables
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id integer not null,
  media_type text check (media_type in ('movie','tv')) not null,
  title text not null,
  year text not null,
  rating numeric not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  unique(user_id, media_id)
);

create table if not exists public.ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id integer not null,
  media_type text check (media_type in ('movie','tv')) not null,
  liked boolean,
  rating numeric,
  title text,
  updated_at timestamptz default now(),
  primary key(user_id, media_id)
);

-- RLS policies
alter table public.watchlist enable row level security;
alter table public.ratings enable row level security;

create policy "watchlist_select_own" on public.watchlist for select using (auth.uid() = user_id);
create policy "watchlist_modify_own" on public.watchlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ratings_select_own" on public.ratings for select using (auth.uid() = user_id);
create policy "ratings_modify_own" on public.ratings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
