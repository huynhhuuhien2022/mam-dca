begin;

create extension if not exists pgcrypto;

create table if not exists public.user_streak_months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  success_month date not null,
  first_success_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_streak_months_unique unique (user_id, success_month)
);

create index if not exists idx_user_streak_months_user_month
  on public.user_streak_months(user_id, success_month desc);

alter table public.user_streak_months enable row level security;

drop policy if exists "user_streak_months_select_own" on public.user_streak_months;
create policy "user_streak_months_select_own"
  on public.user_streak_months for select
  using (auth.uid() = user_id);

drop policy if exists "user_streak_months_insert_own" on public.user_streak_months;
create policy "user_streak_months_insert_own"
  on public.user_streak_months for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_streak_months_update_own" on public.user_streak_months;
create policy "user_streak_months_update_own"
  on public.user_streak_months for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_streak_months_delete_own" on public.user_streak_months;
create policy "user_streak_months_delete_own"
  on public.user_streak_months for delete
  using (auth.uid() = user_id);

commit;
