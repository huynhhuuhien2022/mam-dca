-- Asset schema for DCA platform (scope: stock, fund certificate, gold)
-- Created on 2026-05-26

begin;

-- Optional extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- ============================================================
-- 1) Asset types (separated as requested)
-- ============================================================
create table if not exists public.asset_types (
  id smallint generated always as identity primary key,
  code text not null unique,
  name_vi text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asset_types_code_check check (code in ('stock', 'fund_certificate', 'gold'))
);

-- Seed fixed asset types
insert into public.asset_types (code, name_vi, description)
values
  ('stock', 'Co phieu', 'Tai san co phieu niem yet'),
  ('fund_certificate', 'Chung chi quy', 'Chung chi quy mo/quy dau tu'),
  ('gold', 'Vang', 'Vang vat chat hoac dai dien theo gia vang')
on conflict (code) do update
set
  name_vi = excluded.name_vi,
  description = excluded.description,
  updated_at = now();

-- ============================================================
-- 2) Assets (common table)
-- ============================================================
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_type_id smallint not null references public.asset_types(id),
  symbol text not null,
  name text not null,
  risk_level text not null,
  currency text not null default 'VND',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assets_symbol_unique unique (symbol),
  constraint assets_risk_level_check check (risk_level in ('thap', 'trung_binh', 'cao'))
);

create index if not exists idx_assets_asset_type_id on public.assets(asset_type_id);
create index if not exists idx_assets_is_active on public.assets(is_active);

-- ============================================================
-- 3) Time-series market snapshots (shared)
-- ============================================================
create table if not exists public.asset_market_snapshots (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  as_of_at timestamptz not null,
  price numeric(20, 6) not null,
  change_pct_1d numeric(8, 4),
  return_ytd numeric(8, 4),
  cagr_3y numeric(8, 4),
  cagr_5y numeric(8, 4),
  volatility_1y numeric(8, 4),
  source text,
  created_at timestamptz not null default now(),
  constraint asset_market_snapshots_asset_time_unique unique (asset_id, as_of_at)
);

create index if not exists idx_market_snapshots_asset_time on public.asset_market_snapshots(asset_id, as_of_at desc);

-- ============================================================
-- 4) DCA behavior profile (shared)
-- ============================================================
create table if not exists public.asset_dca_profiles (
  asset_id uuid primary key references public.assets(id) on delete cascade,
  dca_score smallint not null,
  min_horizon_months smallint not null,
  suggested_frequency text not null,
  beginner_tip text,
  drawdown_note text,
  updated_at timestamptz not null default now(),
  constraint asset_dca_profiles_dca_score_check check (dca_score between 0 and 100),
  constraint asset_dca_profiles_min_horizon_check check (min_horizon_months > 0),
  constraint asset_dca_profiles_frequency_check check (suggested_frequency in ('week', 'month'))
);

-- ============================================================
-- 5) Type-specific detail tables
-- ============================================================
create table if not exists public.stock_details (
  asset_id uuid primary key references public.assets(id) on delete cascade,
  exchange text not null,
  sector text,
  industry text,
  market_cap numeric(20, 2)
);

create table if not exists public.fund_certificate_details (
  asset_id uuid primary key references public.assets(id) on delete cascade,
  fund_house text,
  fund_type text,
  expense_ratio numeric(8, 4),
  benchmark text
);

create table if not exists public.gold_details (
  asset_id uuid primary key references public.assets(id) on delete cascade,
  gold_form text not null,
  unit text not null,
  spread_buy_sell numeric(8, 4),
  constraint gold_details_form_check check (gold_form in ('sjc', 'nhan_9999', 'etf_gold')),
  constraint gold_details_unit_check check (unit in ('chi', 'luong', 'gram'))
);

-- ============================================================
-- 6) Seed sample stock: ACB
-- ============================================================
with t as (
  select id as asset_type_id
  from public.asset_types
  where code = 'stock'
),
upsert_asset as (
  insert into public.assets (asset_type_id, symbol, name, risk_level, currency, is_active)
  select t.asset_type_id, 'ACB', 'Ngan hang A Chau', 'trung_binh', 'VND', true
  from t
  on conflict (symbol) do update
  set
    asset_type_id = excluded.asset_type_id,
    name = excluded.name,
    risk_level = excluded.risk_level,
    currency = excluded.currency,
    is_active = excluded.is_active,
    updated_at = now()
  returning id
)
insert into public.stock_details (asset_id, exchange, sector, industry, market_cap)
select id, 'HOSE', 'Tai chinh', 'Ngan hang', 0
from upsert_asset
on conflict (asset_id) do update
set
  exchange = excluded.exchange,
  sector = excluded.sector,
  industry = excluded.industry,
  market_cap = excluded.market_cap;

insert into public.asset_dca_profiles (asset_id, dca_score, min_horizon_months, suggested_frequency, beginner_tip, drawdown_note)
select a.id, 78, 36, 'month',
  'DCA dinh ky theo thang de giam tam ly FOMO.',
  'Khi giam manh, giu ky luat va khong tang don dot bien neu vuot ngan sach.'
from public.assets a
where a.symbol = 'ACB'
on conflict (asset_id) do update
set
  dca_score = excluded.dca_score,
  min_horizon_months = excluded.min_horizon_months,
  suggested_frequency = excluded.suggested_frequency,
  beginner_tip = excluded.beginner_tip,
  drawdown_note = excluded.drawdown_note,
  updated_at = now();

insert into public.asset_market_snapshots (
  asset_id, as_of_at, price, change_pct_1d, return_ytd, cagr_3y, cagr_5y, volatility_1y, source
)
select
  a.id,
  '2026-05-26 00:00:00+07'::timestamptz,
  0,
  0,
  0,
  0,
  0,
  0,
  'manual_seed'
from public.assets a
where a.symbol = 'ACB'
on conflict (asset_id, as_of_at) do update
set
  price = excluded.price,
  change_pct_1d = excluded.change_pct_1d,
  return_ytd = excluded.return_ytd,
  cagr_3y = excluded.cagr_3y,
  cagr_5y = excluded.cagr_5y,
  volatility_1y = excluded.volatility_1y,
  source = excluded.source;

commit;
