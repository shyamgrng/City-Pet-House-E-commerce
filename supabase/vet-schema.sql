-- City Pet House & Animal Clinic — Web Vet cross-device sync
-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query > Run).

create table if not exists vet_bookings (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Chat messages are insert-only rows (not nested in vet_bookings) so a message from the
-- doctor and one from the client sent seconds apart can never overwrite each other.
create table if not exists vet_chat_messages (
  id bigint generated always as identity primary key,
  booking_id text not null,
  "from" text not null,
  text text not null,
  ts bigint not null,
  created_at timestamptz not null default now()
);

-- Shared photos/videos/files, same insert-only reasoning as chat messages.
create table if not exists vet_shared_docs (
  id bigint generated always as identity primary key,
  booking_id text not null,
  "from" text not null,
  name text not null,
  kind text not null,
  url text not null default '',
  ts bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists vet_doctors (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists vet_availability (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists vet_activity (
  id text primary key,
  type text not null,
  text text not null,
  ts bigint not null
);

create table if not exists vet_settings (
  id text primary key,
  value boolean not null
);

-- The site has no login/auth system yet (same as the rest of City Pet House), so every table
-- is open to the public "anon" key -- that matches how the rest of the app already works.
alter table vet_bookings enable row level security;
alter table vet_chat_messages enable row level security;
alter table vet_shared_docs enable row level security;
alter table vet_doctors enable row level security;
alter table vet_availability enable row level security;
alter table vet_activity enable row level security;
alter table vet_settings enable row level security;

drop policy if exists "public read/write" on vet_bookings;
drop policy if exists "public read/write" on vet_chat_messages;
drop policy if exists "public read/write" on vet_shared_docs;
drop policy if exists "public read/write" on vet_doctors;
drop policy if exists "public read/write" on vet_availability;
drop policy if exists "public read/write" on vet_activity;
drop policy if exists "public read/write" on vet_settings;

create policy "public read/write" on vet_bookings for all using (true) with check (true);
create policy "public read/write" on vet_chat_messages for all using (true) with check (true);
create policy "public read/write" on vet_shared_docs for all using (true) with check (true);
create policy "public read/write" on vet_doctors for all using (true) with check (true);
create policy "public read/write" on vet_availability for all using (true) with check (true);
create policy "public read/write" on vet_activity for all using (true) with check (true);
create policy "public read/write" on vet_settings for all using (true) with check (true);

-- Turn on realtime push updates for the tables the app needs to live-refresh across devices.
alter publication supabase_realtime add table vet_bookings;
alter publication supabase_realtime add table vet_chat_messages;
alter publication supabase_realtime add table vet_shared_docs;
alter publication supabase_realtime add table vet_doctors;
alter publication supabase_realtime add table vet_availability;
