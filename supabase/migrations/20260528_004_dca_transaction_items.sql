begin;

create extension if not exists pgcrypto;

create table if not exists public.user_dca_transactions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.user_plans(id) on delete cascade,
  due_date date not null,
  total_amount numeric(20, 2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_dca_transactions_status_check check (status in ('pending', 'partial', 'success')),
  constraint user_dca_transactions_total_amount_check check (total_amount >= 0),
  constraint user_dca_transactions_unique unique (plan_id, due_date)
);

create index if not exists idx_user_dca_transactions_plan_due
  on public.user_dca_transactions(plan_id, due_date desc);

create table if not exists public.user_dca_transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.user_dca_transactions(id) on delete cascade,
  asset_symbol text not null,
  amount numeric(20, 2) not null,
  status text not null default 'pending',
  executed_price numeric(20, 6),
  quantity numeric(24, 8),
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_dca_transaction_items_status_check check (status in ('pending', 'success')),
  constraint user_dca_transaction_items_amount_check check (amount >= 0),
  constraint user_dca_transaction_items_quantity_check check (quantity is null or quantity >= 0),
  constraint user_dca_transaction_items_unique unique (transaction_id, asset_symbol)
);

create index if not exists idx_user_dca_transaction_items_tx
  on public.user_dca_transaction_items(transaction_id);

create table if not exists public.user_plan_holdings (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.user_plans(id) on delete cascade,
  asset_symbol text not null,
  quantity numeric(24, 8) not null default 0,
  total_invested numeric(20, 2) not null default 0,
  updated_at timestamptz not null default now(),
  constraint user_plan_holdings_quantity_check check (quantity >= 0),
  constraint user_plan_holdings_total_invested_check check (total_invested >= 0),
  constraint user_plan_holdings_unique unique (plan_id, asset_symbol)
);

create index if not exists idx_user_plan_holdings_plan
  on public.user_plan_holdings(plan_id);

alter table public.user_dca_transactions enable row level security;
alter table public.user_dca_transaction_items enable row level security;
alter table public.user_plan_holdings enable row level security;

drop policy if exists "user_dca_transactions_select_own" on public.user_dca_transactions;
create policy "user_dca_transactions_select_own"
  on public.user_dca_transactions for select
  using (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()));

drop policy if exists "user_dca_transactions_insert_own" on public.user_dca_transactions;
create policy "user_dca_transactions_insert_own"
  on public.user_dca_transactions for insert
  with check (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()));

drop policy if exists "user_dca_transactions_update_own" on public.user_dca_transactions;
create policy "user_dca_transactions_update_own"
  on public.user_dca_transactions for update
  using (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()));

drop policy if exists "user_dca_transactions_delete_own" on public.user_dca_transactions;
create policy "user_dca_transactions_delete_own"
  on public.user_dca_transactions for delete
  using (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()));

drop policy if exists "user_dca_transaction_items_select_own" on public.user_dca_transaction_items;
create policy "user_dca_transaction_items_select_own"
  on public.user_dca_transaction_items for select
  using (
    exists (
      select 1
      from public.user_dca_transactions t
      join public.user_plans p on p.id = t.plan_id
      where t.id = transaction_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_dca_transaction_items_insert_own" on public.user_dca_transaction_items;
create policy "user_dca_transaction_items_insert_own"
  on public.user_dca_transaction_items for insert
  with check (
    exists (
      select 1
      from public.user_dca_transactions t
      join public.user_plans p on p.id = t.plan_id
      where t.id = transaction_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_dca_transaction_items_update_own" on public.user_dca_transaction_items;
create policy "user_dca_transaction_items_update_own"
  on public.user_dca_transaction_items for update
  using (
    exists (
      select 1
      from public.user_dca_transactions t
      join public.user_plans p on p.id = t.plan_id
      where t.id = transaction_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.user_dca_transactions t
      join public.user_plans p on p.id = t.plan_id
      where t.id = transaction_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "user_plan_holdings_select_own" on public.user_plan_holdings;
create policy "user_plan_holdings_select_own"
  on public.user_plan_holdings for select
  using (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()));

drop policy if exists "user_plan_holdings_insert_own" on public.user_plan_holdings;
create policy "user_plan_holdings_insert_own"
  on public.user_plan_holdings for insert
  with check (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()));

drop policy if exists "user_plan_holdings_update_own" on public.user_plan_holdings;
create policy "user_plan_holdings_update_own"
  on public.user_plan_holdings for update
  using (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.user_plans p where p.id = plan_id and p.user_id = auth.uid()));

commit;
