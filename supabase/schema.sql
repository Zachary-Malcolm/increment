-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor > New query).
-- One row per learner holding their progress as JSON. Row Level Security means each person can only
-- ever read or write their own row.

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Read own progress" on public.progress
  for select using (auth.uid() = user_id);
create policy "Insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "Update own progress" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Lets a signed-in learner delete their own account (and, through the cascade, their progress).
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
