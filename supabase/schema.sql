-- Run this in Supabase → SQL Editor → New query → Run

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Allow the public form + admin UI to work with the anon key (fine for testing)
alter table public.subscriptions enable row level security;

drop policy if exists "Allow public insert" on public.subscriptions;
drop policy if exists "Allow public select" on public.subscriptions;
drop policy if exists "Allow public delete" on public.subscriptions;

create policy "Allow public insert"
  on public.subscriptions
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow public select"
  on public.subscriptions
  for select
  to anon, authenticated
  using (true);

create policy "Allow public delete"
  on public.subscriptions
  for delete
  to anon, authenticated
  using (true);
