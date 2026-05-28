begin;

insert into public.user_dca_transactions (plan_id, due_date, total_amount, status, created_at, updated_at)
select
  old_tx.plan_id,
  old_tx.due_date,
  sum(old_tx.amount)::numeric(20, 2) as total_amount,
  case
    when bool_and(old_tx.status = 'success') then 'success'
    when bool_or(old_tx.status = 'success') then 'partial'
    else 'pending'
  end as status,
  min(old_tx.created_at),
  now()
from public.user_plan_transactions old_tx
group by old_tx.plan_id, old_tx.due_date
on conflict (plan_id, due_date) do update
set
  total_amount = excluded.total_amount,
  status = excluded.status,
  updated_at = now();

insert into public.user_dca_transaction_items (
  transaction_id,
  asset_symbol,
  amount,
  status,
  executed_at,
  created_at,
  updated_at
)
select
  parent_tx.id,
  old_tx.asset_symbol,
  old_tx.amount,
  old_tx.status,
  old_tx.executed_at,
  old_tx.created_at,
  now()
from public.user_plan_transactions old_tx
join public.user_dca_transactions parent_tx
  on parent_tx.plan_id = old_tx.plan_id
 and parent_tx.due_date = old_tx.due_date
on conflict (transaction_id, asset_symbol) do update
set
  amount = excluded.amount,
  status = excluded.status,
  executed_at = excluded.executed_at,
  updated_at = now();

commit;
