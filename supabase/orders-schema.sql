-- City Pet House & Animal Clinic — Order cross-device sync
-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query > Run).
-- Uses the same Supabase project as supabase/vet-schema.sql if you've already set that up --
-- no new project or env vars needed, just these two extra tables.

create table if not exists orders (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists refunds (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- The site has no login/auth system yet (same as the rest of City Pet House), so every table
-- is open to the public "anon" key -- that matches how the rest of the app already works.
alter table orders enable row level security;
alter table refunds enable row level security;

drop policy if exists "public read/write" on orders;
drop policy if exists "public read/write" on refunds;

create policy "public read/write" on orders for all using (true) with check (true);
create policy "public read/write" on refunds for all using (true) with check (true);

-- Turn on realtime push updates so admin sees a new order (or a payment status change) without
-- needing to reload the page.
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table refunds;
