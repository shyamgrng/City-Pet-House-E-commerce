-- City Pet House & Animal Clinic — Finance ledger payments cross-device sync
-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query > Run).
-- Uses the same Supabase project as the other schema files if you've already set one up --
-- no new project or env vars needed, just this one extra table.
--
-- Only recorded payouts to B2B suppliers/doctors/couriers live here. Everything else the
-- Finance ledger shows (sales, commission, payables) is derived live from orders, vet bookings,
-- and deliveries, which already have their own sync.

create table if not exists ledger_payments (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table ledger_payments enable row level security;

drop policy if exists "public read/write" on ledger_payments;
create policy "public read/write" on ledger_payments for all using (true) with check (true);

alter publication supabase_realtime add table ledger_payments;
