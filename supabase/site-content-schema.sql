-- City Pet House & Animal Clinic — Admin page-content cross-device sync
-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query > Run).
-- Uses the same Supabase project as supabase/vet-schema.sql / orders-schema.sql if you've
-- already set those up -- no new project or env vars needed, just this one extra table.
--
-- Before this table exists (or before Supabase is configured at all), every admin-editable
-- page (Home, Services, Blog, FAQ, Career, About, Legal pages, How to Buy, the archives,
-- Testimonials, Contact, Dog Breed Archive) saves its content to that one browser's
-- localStorage only -- edits never reach other visitors, other devices, or the mobile app.
-- This table is the shared home for that content: one row per page, keyed by the same string
-- each page already used as its localStorage key, so an edit already sitting in your browser
-- gets carried forward the first time this loads instead of being lost.

create table if not exists site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Same as orders/refunds: no login/auth system yet, so the table is open to the public "anon"
-- key -- the admin pages themselves are the only place that calls the write path.
alter table site_content enable row level security;

drop policy if exists "public read/write" on site_content;
create policy "public read/write" on site_content for all using (true) with check (true);

-- Realtime push so a second admin tab (or the mobile app) sees an edit without reloading.
alter publication supabase_realtime add table site_content;
