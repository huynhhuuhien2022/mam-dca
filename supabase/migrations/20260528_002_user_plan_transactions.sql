begin;

create extension if not exists pgcrypto;

create table if not exists public.user_plan_transactions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.user_plans(id) on delete cascade,
  asset_symbol text not null,
  amount numeric(20, 2) not null,
  due_date date not null,
  status text not null default 'pending',
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_plan_transactions_status_check check (status in ('pending', 'success')),
  constraint user_plan_transactions_amount_check check (amount >= 0),
  constraint user_plan_transactions_unique unique (plan_id, asset_symbol, due_date)
);

create index if not exists idx_user_plan_transactions_plan_due
  on public.user_plan_transactions(plan_id, due_date desc);

alter table public.user_plan_transactions enable row level security;

drop policy if exists "user_plan_transactions_select_own" on public.user_plan_transactions;
create policy "user_plan_transactions_select_own"
  on public.user_plan_transactions for select
  using (
    exists (
      select 1 from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_plan_transactions_insert_own" on public.user_plan_transactions;
create policy "user_plan_transactions_insert_own"
  on public.user_plan_transactions for insert
  with check (
    exists (
      select 1 from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_plan_transactions_update_own" on public.user_plan_transactions;
create policy "user_plan_transactions_update_own"
  on public.user_plan_transactions for update
  using (
    exists (
      select 1 from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_plan_transactions_delete_own" on public.user_plan_transactions;
create policy "user_plan_transactions_delete_own"
  on public.user_plan_transactions for delete
  using (
    exists (
      select 1 from public.user_plans p
      where p.id = plan_id
        and p.user_id = auth.uid()
    )
  );

commit;
