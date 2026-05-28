begin;

create extension if not exists pgcrypto;

create table if not exists public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '🌱',
  amount numeric(20, 2) not null,
  freq text not null,
  freq_days smallint[] not null default '{}',
  duration_years smallint,
  start_month smallint not null default 0,
  total_invested numeric(20, 2) not null default 0,
  current_value numeric(20, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_plans_amount_check check (amount > 0),
  constraint user_plans_freq_check check (freq in ('day', 'week', 'month')),
  constraint user_plans_duration_check check (duration_years is null or duration_years > 0),
  constraint user_plans_start_month_check check (start_month >= 0)
);

create index if not exists idx_user_plans_user_id_created_at
  on public.user_plans(user_id, created_at desc);

create table if not exists public.user_plan_allocations (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.user_plans(id) on delete cascade,
  asset_symbol text not null,
  pct numeric(8, 3) not null,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint user_plan_allocations_pct_check check (pct >= 0 and pct <= 100),
  constraint user_plan_allocations_unique unique (plan_id, asset_symbol)
);

create index if not exists idx_user_plan_allocations_plan_id
  on public.user_plan_allocations(plan_id, position);

alter table public.user_plans enable row level security;
alter table public.user_plan_allocations enable row level security;

drop policy if exists "user_plans_select_own" on public.user_plans;
create policy "user_plans_select_own"
  on public.user_plans for select
  using (auth.uid() = user_id);

drop policy if exists "user_plans_insert_own" on public.user_plans;
create policy "user_plans_insert_own"
  on public.user_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_plans_update_own" on public.user_plans;
create policy "user_plans_update_own"
  on public.user_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_plans_delete_own" on public.user_plans;
create policy "user_plans_delete_own"
  on public.user_plans for delete
  using (auth.uid() = user_id);

drop policy if exists "user_plan_allocations_select_own" on public.user_plan_allocations;
create policy "user_plan_allocations_select_own"
  on public.user_plan_allocations for select
  using (
    exists (
      select 1
      from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_plan_allocations_insert_own" on public.user_plan_allocations;
create policy "user_plan_allocations_insert_own"
  on public.user_plan_allocations for insert
  with check (
    exists (
      select 1
      from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_plan_allocations_update_own" on public.user_plan_allocations;
create policy "user_plan_allocations_update_own"
  on public.user_plan_allocations for update
  using (
    exists (
      select 1
      from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_plan_allocations_delete_own" on public.user_plan_allocations;
create policy "user_plan_allocations_delete_own"
  on public.user_plan_allocations for delete
  using (
    exists (
      select 1
      from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  );

commit;
