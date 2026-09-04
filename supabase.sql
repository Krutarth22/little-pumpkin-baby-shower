-- Production schema: run once in Supabase dashboard → SQL editor → New query → Run.
-- Then: Storage → New bucket → name "keepsake", Public ON.
-- Auth → Providers → Email → enable Email OTP / magic link (on by default).

-- RSVPs: anyone can insert, only the authorized host email can read.
-- Add another host by extending the email list in the SELECT policy below.
create table if not exists rsvps (
  id text primary key,
  name text not null,
  contact text not null,
  attending text not null check (attending in ('yes','no')),
  adults int default 1,
  kids int default 0,
  message text,
  created_at timestamptz default now()
);
alter table rsvps enable row level security;
drop policy if exists "Anyone can RSVP" on rsvps;
create policy "Anyone can RSVP" on rsvps
  for insert to anon, authenticated with check (true);
drop policy if exists "Host can read RSVPs" on rsvps;
create policy "Host can read RSVPs" on rsvps
  for select to authenticated
  using (lower(auth.jwt() ->> 'email') in ('raksha0912@gmail.com'));

-- Keepsake wall: anyone can post and view (it's a public wall by design).
-- (Photos themselves live in the public "keepsake" storage bucket.)
create table if not exists keepsake_notes (
  id bigint generated always as identity primary key,
  gname text not null,
  gtext text not null,
  photo_url text,
  created_at timestamptz default now()
);
alter table keepsake_notes enable row level security;
drop policy if exists "Anyone can post keepsake" on keepsake_notes;
create policy "Anyone can post keepsake" on keepsake_notes
  for insert to anon, authenticated with check (true);
drop policy if exists "Anyone can view keepsake" on keepsake_notes;
create policy "Anyone can view keepsake" on keepsake_notes
  for select to anon, authenticated using (true);

-- Storage policies for the "keepsake" bucket (create the bucket in the dashboard first).
drop policy if exists "Anyone can upload keepsake photo" on storage.objects;
create policy "Anyone can upload keepsake photo" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'keepsake');
drop policy if exists "Anyone can view keepsake photo" on storage.objects;
create policy "Anyone can view keepsake photo" on storage.objects
  for select to anon, authenticated using (bucket_id = 'keepsake');
