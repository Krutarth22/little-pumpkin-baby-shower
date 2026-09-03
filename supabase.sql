-- Supabase schema for production (free tier is enough for 60-70 guests)
-- Create project at supabase.com, run this in SQL editor, then set
-- SUPABASE_URL + SUPABASE_ANON_KEY in app.js fetch calls (see README).

create table if not exists rsvps (
  id text primary key,
  name text not null,
  contact text not null,
  attending text not null check (attending in ('yes','no')),
  adults int default 1,
  kids int default 0,
  kids_detail text,
  dietary text,
  message text,
  created_at timestamptz default now()
);
alter table rsvps enable row level security;
create policy "public insert" on rsvps for insert to anon with check (true);
create policy "public read" on rsvps for select to anon using (true);

create table if not exists gift_claims (
  gift_id text primary key,
  by_name text not null,
  claimed_at timestamptz default now()
);
alter table gift_claims enable row level security;
create policy "public all" on gift_claims for all to anon using (true) with check (true);

create table if not exists guestbook (
  id bigint generated always as identity primary key,
  gname text not null,
  gtext text not null,
  created_at timestamptz default now()
);
alter table guestbook enable row level security;
create policy "public all gb" on guestbook for all to anon using (true) with check (true);

-- Storage bucket for photos: create bucket "photos" (public) in Supabase Storage dashboard.
