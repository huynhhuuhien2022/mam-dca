'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { fmtVND, fmtVNDfull } from '@/lib/utils'
import Icon3D from '@/components/icons/Icon3D'
import Button from '@/components/ui/Button'
import { getSupabaseClient } from '@/lib/supabase'
import type { Plan } from '@/lib/types'

const HEAT_COLORS = ['#F1F4F2', '#BBF7D0', '#4ADE80', '#16A34A']

interface TxItem {
  id: string
  assetId: string
  assetColor: string
  amount: number
  status: 'success' | 'pending'
  executedPrice: number | null
  quantity: number | null
}

interface TxRow {
  id: string
  key: string
  planId: string
  planName: string
  planEmoji: string
  amount: number
  date: Date
  status: 'success' | 'partial' | 'pending'
  items: TxItem[]
}

type ConfirmTarget =
  | { type: 'single'; tx: TxRow; item: TxItem }
  | { type: 'quick'; entries: Array<{ tx: TxRow; item: TxItem }> }

function toDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fmtDateShort(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function isDueDate(plan: Plan, d: Date): boolean {
  if (plan.freq === 'day') {
    const dow = d.getDay()
    return dow >= 1 && dow <= 5
  }

  if (plan.freq === 'week') {
    const target = plan.freqDays.length ? plan.freqDays : [1]
    const dow = d.getDay() === 0 ? 7 : d.getDay()
    return target.includes(dow)
  }

  const target = plan.freqDays.length ? plan.freqDays : [1]
  return target.includes(d.getDate())
}

function buildDueTransactions(plans: Plan[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return plans.flatMap((plan) => {
    if (!plan.allocation.length) return []
    const created = new Date(plan.createdAt ?? Date.now())
    created.setHours(0, 0, 0, 0)
    const minStart = new Date(today)
    minStart.setDate(today.getDate() - 365)
    const start = created < minStart ? minStart : created

    const out: Array<{
      planId: string
      dueDate: string
      totalAmount: number
      items: Array<{ assetSymbol: string; amount: number }>
    }> = []

    const cursor = new Date(start)
    while (cursor <= today) {
      if (isDueDate(plan, cursor)) {
        out.push({
          planId: plan.id,
          dueDate: toDateKey(cursor),
          totalAmount: plan.amount,
          items: plan.allocation.map((a) => ({
            assetSymbol: a.id,
            amount: Math.round((plan.amount * a.pct) / 100),
          })),
        })
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    return out
  })
}

function resolveTransactionStatus(items: TxItem[]): TxRow['status'] {
  if (items.length > 0 && items.every((i) => i.status === 'success')) return 'success'
  if (items.some((i) => i.status === 'success')) return 'partial'
  return 'pending'
}

function itemProgress(items: TxItem[]) {
  const done = items.filter((i) => i.status === 'success').length
  return { done, total: items.length }
}

async function fetchLatestPrice(assetSymbol: string): Promise<number | null> {
  const supabase = getSupabaseClient()
  const { data: asset } = await supabase
    .from('assets')
    .select('id')
    .eq('symbol', assetSymbol)
    .maybeSingle()

  if (!asset?.id) return null

  const { data: snap } = await supabase
    .from('asset_market_snapshots')
    .select('price')
    .eq('asset_id', asset.id)
    .order('as_of_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const price = Number(snap?.price ?? 0)
  return price > 0 ? price : null
}

interface HistoryProps {
  planId?: string | null
}

export default function History({ planId = null }: HistoryProps) {
  const { plans, streak, assets, auth, dispatch } = useAppStore(useShallow(s => ({ plans: s.plans, streak: s.streak, assets: s.assets, auth: s.auth, dispatch: s.dispatch })))
  const assetMap = useMemo(() => Object.fromEntries(assets.map(a => [a.id, a])), [assets])
  const activePlans = useMemo(() => (planId ? plans.filter((p) => p.id === planId) : plans), [planId, plans])
  const activePlan = activePlans[0] ?? null
  const [txns, setTxns] = useState<TxRow[]>([])
  const [syncing, setSyncing] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let active = true
    if (!auth || activePlans.length === 0) {
      setTxns([])
      return () => {
        active = false
      }
    }

    ;(async () => {
      try {
        setSyncing(true)
        const supabase = getSupabaseClient()
        const dueRows = buildDueTransactions(activePlans)

        for (const due of dueRows) {
          const { data: tx } = await supabase
            .from('user_dca_transactions')
            .upsert(
              {
                plan_id: due.planId,
                due_date: due.dueDate,
                total_amount: due.totalAmount,
                status: 'pending',
              },
              { onConflict: 'plan_id,due_date', ignoreDuplicates: true },
            )
            .select('id')
            .single()

          if (!tx?.id) {
            const { data: existing } = await supabase
              .from('user_dca_transactions')
              .select('id')
              .eq('plan_id', due.planId)
              .eq('due_date', due.dueDate)
              .single()
            if (!existing?.id) continue
            await supabase
              .from('user_dca_transaction_items')
              .upsert(
                due.items.map((item) => ({
                  transaction_id: existing.id,
                  asset_symbol: item.assetSymbol,
                  amount: item.amount,
                  status: 'pending',
                })),
                { onConflict: 'transaction_id,asset_symbol', ignoreDuplicates: true },
              )
            continue
          }

          await supabase
            .from('user_dca_transaction_items')
            .upsert(
              due.items.map((item) => ({
                transaction_id: tx.id,
                asset_symbol: item.assetSymbol,
                amount: item.amount,
                status: 'pending',
              })),
              { onConflict: 'transaction_id,asset_symbol', ignoreDuplicates: true },
            )
        }

        let query = supabase
          .from('user_dca_transactions')
          .select(`
            id, plan_id, due_date, total_amount, status,
            user_plans(name, emoji),
            user_dca_transaction_items(id, asset_symbol, amount, status, executed_price, quantity)
          `)
          .order('due_date', { ascending: false })
          .limit(200)
        if (planId) query = query.eq('plan_id', planId)

        const { data, error } = await query

        if (error || !data || !active) return

        const mapped: TxRow[] = data.map((r) => {
          const items = ((r as { user_dca_transaction_items?: Array<{
            id: string
            asset_symbol: string
            amount: number
            status: 'success' | 'pending'
            executed_price: number | null
            quantity: number | null
          }> }).user_dca_transaction_items ?? []).map((item) => {
            const asset = assetMap[item.asset_symbol as keyof typeof assetMap]
            return {
              id: item.id,
              assetId: item.asset_symbol,
              assetColor: asset?.color ?? '#ccc',
              amount: Number(item.amount ?? 0),
              status: item.status,
              executedPrice: item.executed_price == null ? null : Number(item.executed_price),
              quantity: item.quantity == null ? null : Number(item.quantity),
            }
          })

          return {
            id: r.id,
            key: r.id,
            planId: r.plan_id,
            planName: (r as { user_plans?: { name?: string } | null }).user_plans?.name ?? 'Kế hoạch',
            planEmoji: (r as { user_plans?: { emoji?: string } | null }).user_plans?.emoji ?? '🌱',
            amount: Number(r.total_amount ?? 0),
            date: new Date(r.due_date),
            status: resolveTransactionStatus(items),
            items,
          }
        })

        setTxns(mapped)
      } catch {
        // ignore in demo/local mode
      } finally {
        if (active) setSyncing(false)
      }
    })()

    return () => {
      active = false
    }
  }, [auth, activePlans, assetMap, planId])

  async function refreshMonthlyStreak(txDate: Date) {
    const supabase = getSupabaseClient()
    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes.user) return

    await supabase
      .from('user_streak_months')
      .upsert(
        {
          user_id: userRes.user.id,
          success_month: monthKey(txDate),
          first_success_date: toDateKey(txDate),
        },
        { onConflict: 'user_id,success_month' },
      )

    const { data: monthsRows } = await supabase
      .from('user_streak_months')
      .select('success_month')
      .order('success_month', { ascending: false })
      .limit(120)

    if (!monthsRows) return

    const monthSet = new Set(monthsRows.map((r) => r.success_month).filter((m): m is string => Boolean(m)))
    let nextStreak = 0
    const cursor = new Date()
    cursor.setDate(1)
    cursor.setHours(0, 0, 0, 0)
    while (true) {
      const key = monthKey(cursor)
      if (!monthSet.has(key)) break
      nextStreak += 1
      cursor.setMonth(cursor.getMonth() - 1)
    }
    dispatch({ type: 'setStreak', streak: nextStreak })
  }

  async function approveItem(tx: TxRow, item: TxItem, silent = false): Promise<boolean> {
    if (item.status !== 'pending') return false

    try {
      const supabase = getSupabaseClient()
      const price = await fetchLatestPrice(item.assetId)
      const quantity = price ? item.amount / price : 0
      const executedAt = new Date().toISOString()

      const { error: itemErr } = await supabase
        .from('user_dca_transaction_items')
        .update({
          status: 'success',
          executed_price: price,
          quantity,
          executed_at: executedAt,
        })
        .eq('id', item.id)
        .eq('status', 'pending')

      if (itemErr) {
        if (!silent) {
          dispatch({ type: 'showToast', toast: { message: 'Không thể duyệt sản phẩm', icon: '!' } })
        }
        return false
      }

      const { data: holding } = await supabase
        .from('user_plan_holdings')
        .select('quantity,total_invested')
        .eq('plan_id', tx.planId)
        .eq('asset_symbol', item.assetId)
        .maybeSingle()

      if (holding) {
        await supabase
          .from('user_plan_holdings')
          .update({
            quantity: Number(holding.quantity ?? 0) + quantity,
            total_invested: Number(holding.total_invested ?? 0) + item.amount,
            updated_at: executedAt,
          })
          .eq('plan_id', tx.planId)
          .eq('asset_symbol', item.assetId)
      } else {
        await supabase
          .from('user_plan_holdings')
          .insert({
            plan_id: tx.planId,
            asset_symbol: item.assetId,
            quantity,
            total_invested: item.amount,
          })
      }

      const { data: planTotals } = await supabase
        .from('user_plans')
        .select('total_invested,current_value')
        .eq('id', tx.planId)
        .single()

      if (planTotals) {
        const nextInvested = Number(planTotals.total_invested ?? 0) + item.amount
        const nextValue = Number(planTotals.current_value ?? 0) + item.amount
        await supabase
          .from('user_plans')
          .update({ total_invested: nextInvested, current_value: nextValue })
          .eq('id', tx.planId)

        dispatch({
          type: 'setPlans',
          plans: plans.map((p) =>
            p.id === tx.planId ? { ...p, totalInvested: nextInvested, currentValue: nextValue } : p,
          ),
        })
      }

      const { data: latestItems } = await supabase
        .from('user_dca_transaction_items')
        .select('id, asset_symbol, amount, status, executed_price, quantity')
        .eq('transaction_id', tx.id)

      const nextItems = latestItems
        ? latestItems.map((latest) => {
            const asset = assetMap[latest.asset_symbol as keyof typeof assetMap]
            return {
              id: latest.id,
              assetId: latest.asset_symbol,
              assetColor: asset?.color ?? '#ccc',
              amount: Number(latest.amount ?? 0),
              status: latest.status as TxItem['status'],
              executedPrice: latest.executed_price == null ? null : Number(latest.executed_price),
              quantity: latest.quantity == null ? null : Number(latest.quantity),
            }
          })
        : tx.items.map((i) =>
            i.id === item.id ? { ...i, status: 'success' as const, executedPrice: price, quantity } : i,
          )
      const nextStatus = resolveTransactionStatus(nextItems)
      await supabase
        .from('user_dca_transactions')
        .update({ status: nextStatus, updated_at: executedAt })
        .eq('id', tx.id)

      setTxns((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: nextStatus, items: nextItems } : t)),
      )
      await refreshMonthlyStreak(tx.date)
      if (!silent) {
        dispatch({ type: 'showToast', toast: { message: 'Đã duyệt sản phẩm DCA', icon: '✓' } })
      }
      return true
    } catch {
      if (!silent) {
        dispatch({ type: 'showToast', toast: { message: 'Không thể duyệt sản phẩm', icon: '!' } })
      }
      return false
    }
  }

  async function confirmApprove() {
    if (!confirmTarget) return

    try {
      setConfirming(true)
      if (confirmTarget.type === 'single') {
        const ok = await approveItem(confirmTarget.tx, confirmTarget.item)
        if (!ok) return
      } else {
        let approvedCount = 0
        for (const entry of confirmTarget.entries) {
          const ok = await approveItem(entry.tx, entry.item, true)
          if (ok) approvedCount += 1
        }

        if (approvedCount === 0) {
          dispatch({ type: 'showToast', toast: { message: 'Không có sản phẩm nào được duyệt', icon: '!' } })
          return
        }

        dispatch({
          type: 'showToast',
          toast: {
            message: `Đã duyệt ${approvedCount} sản phẩm DCA`,
            icon: '✓',
          },
        })
      }
      setConfirmTarget(null)
    } finally {
      setConfirming(false)
    }
  }

  const heat = useMemo(() => {
    const today = new Date()
    const successSet = new Set(
      txns
        .filter((t) => t.status === 'success' || t.status === 'partial')
        .map((t) => toDateKey(t.date)),
    )
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (27 - i))
      const key = toDateKey(d)
      return { date: d, intensity: successSet.has(key) ? 3 : 0 }
    })
  }, [txns])

  const totalSuccess = txns
    .flatMap((t) => t.items)
    .filter((i) => i.status === 'success')
    .reduce((s, i) => s + i.amount, 0)
  const upcoming = txns.filter((t) => t.status !== 'success').length
  const pendingEntries = txns.flatMap((tx) =>
    tx.items
      .filter((item) => item.status === 'pending')
      .map((item) => ({ tx, item })),
  )
  const confirmTotal =
    confirmTarget?.type === 'single'
      ? confirmTarget.item.amount
      : confirmTarget?.entries.reduce((sum, entry) => sum + entry.item.amount, 0) ?? 0

  if (planId) {
    const doneTxns = txns.filter((t) => t.status === 'success').length
    const incompleteTxns = txns.filter((t) => t.status !== 'success').length

    return (
      <div className="fade-up px-4 pb-4 pt-3">
        <section className="overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#0F3D25_0%,#1F8A4C_62%,#6EE7A8_100%)] p-4 text-white shadow-cta">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-white/16 text-[26px] shadow-sm">
              {activePlan?.emoji ?? '🌱'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[19px] font-black leading-tight tracking-tight">
                {activePlan?.name ?? 'Kế hoạch DCA'}
              </div>
              <div className="mt-1 text-[11px] font-semibold leading-snug text-white/75">
                Theo dõi từng kỳ DCA đã phát sinh của kế hoạch này
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/65">Tổng đã ghi nhận</div>
            <div className="mono-num mt-1 text-[25px] font-black tracking-tight">{fmtVNDfull(totalSuccess)}</div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/14 p-2.5 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white/65">
                <span className="text-[13px]">📅</span>
                <span>Tổng kỳ</span>
              </div>
              <div className="mono-num mt-1 text-[15px] font-black">{txns.length}</div>
            </div>
            <div className="rounded-2xl bg-white/14 p-2.5 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white/65">
                <span className="text-[13px]">✓</span>
                <span>Hoàn tất</span>
              </div>
              <div className="mono-num mt-1 text-[15px] font-black">{doneTxns}</div>
            </div>
            <div className="rounded-2xl bg-white/14 p-2.5 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white/65">
                <span className="text-[13px]">⏳</span>
                <span>Đang chờ</span>
              </div>
              <div className="mono-num mt-1 text-[15px] font-black">{syncing ? '...' : incompleteTxns}</div>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <div className="text-[17px] font-black">Giao dịch DCA</div>
              <div className="mt-0.5 text-[12px] font-semibold text-ink-3">
                {txns.length ? `${txns.length} kỳ gần nhất` : 'Chưa có kỳ nào'}
              </div>
            </div>
          </div>

          {txns.length === 0 ? (
            <div className="rounded-[24px] bg-white px-5 py-8 text-center shadow-card">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-grass-50 text-2xl">🌱</div>
              <div className="mt-3 text-[15px] font-black">Chưa có lịch sử giao dịch</div>
              <div className="mt-1 text-[12px] font-semibold text-ink-3">
                Khi đến ngày DCA, app sẽ tạo kỳ giao dịch ở đây.
              </div>
            </div>
          ) : (
            <div className="relative pl-4">
              <div className="absolute bottom-6 left-[7px] top-5 w-px bg-grass-100" />
              <div className="flex flex-col gap-3">
                {txns.slice(0, 30).map((t) => {
                  const progress = itemProgress(t.items)
                  const isDone = t.status === 'success'
                  const isPartial = t.status === 'partial'
                  const statusLabel = isDone ? 'Hoàn tất' : isPartial ? 'Một phần' : 'Chờ xử lý'
                  const statusClass = isDone
                    ? 'bg-grass-50 text-grass-800 border-grass-100'
                    : isPartial
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-gray-50 text-ink-3 border-gray-100'

                  return (
                    <article key={t.id} className="relative">
                      <div
                        className={`absolute -left-4 top-5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                          isDone ? 'bg-grass-600' : isPartial ? 'bg-amber-400' : 'bg-gray-300'
                        }`}
                      />

                      <div className="rounded-[24px] bg-white p-4 shadow-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-3">
                              {fmtDateShort(t.date)}
                            </div>
                            <div className="mono-num mt-1 text-[21px] font-black tracking-tight text-ink-1">
                              {fmtVNDfull(t.amount)}
                            </div>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${isDone ? 'bg-grass-600' : isPartial ? 'bg-amber-400' : 'bg-gray-300'}`}
                              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="mono-num text-[11px] font-black text-ink-3">
                            {progress.done}/{progress.total}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                          {t.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-canvas px-3 py-2.5">
                              <span className="h-9 w-1.5 flex-shrink-0 rounded-full" style={{ background: item.assetColor }} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-black text-ink-1">{item.assetId}</span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                      item.status === 'success'
                                        ? 'bg-grass-50 text-grass-700'
                                        : 'bg-white text-ink-3'
                                    }`}
                                  >
                                    {item.status === 'success' ? 'Đã ghi nhận' : 'Chờ'}
                                  </span>
                                </div>
                                <div className="mono-num mt-0.5 text-[11px] font-semibold text-ink-3">
                                  {fmtVNDfull(item.amount)}
                                  {item.quantity != null && item.quantity > 0 ? ` · ${item.quantity.toFixed(4)} cp/ccq` : ''}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="fade-up pb-4">
      <div className="mb-5">
        <div className="text-2xl font-black tracking-tight">
          {planId ? 'Lịch sử kế hoạch' : 'Lịch sử giao dịch'}
        </div>
        <div className="text-ink-3 mt-1.5 text-sm">
          {planId && activePlan
            ? `${activePlan.name} · mỗi kỳ DCA gom các mã trong cùng một giao dịch`
            : 'Mỗi kỳ DCA gom các mã trong cùng một giao dịch'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl shadow-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-ink-3 leading-tight">Tổng đã DCA</span>
            <Icon3D name="coin" size={22} />
          </div>
          <div className="mono-num font-black text-[14px] mt-1.5">{fmtVND(totalSuccess)}</div>
          <div className="text-[10px] text-ink-3 mt-1">{txns.filter(t => t.status === 'success').length} kỳ</div>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-ink-3 leading-tight">Sắp tới</span>
            <Icon3D name="sparkle" size={22} />
          </div>
          <div className="mono-num font-black text-[14px] text-warm mt-1.5">{syncing ? '...' : upcoming}</div>
          <div className="text-[10px] text-ink-3 mt-1">kỳ chờ duyệt</div>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-ink-3 leading-tight">Streak</span>
            <Icon3D name="fire" size={22} />
          </div>
          <div className="mono-num font-black text-[14px] mt-1.5" style={{ color: '#EA580C' }}>{streak}</div>
          <div className="text-[10px] text-ink-3 mt-1">tháng đã DCA</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4 mt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[15px] font-bold">28 ngày qua</div>
            <div className="text-[11px] text-ink-3 mt-0.5">Đậm hơn = ngày có kỳ DCA được duyệt</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-ink-3 font-bold">Ít</span>
            {HEAT_COLORS.map((c, i) => <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background: c }} />)}
            <span className="text-[10px] text-ink-3 font-bold">Nhiều</span>
          </div>
        </div>
        <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 6 }}>
          {heat.map((d, i) => (
            <div key={i}
              className="aspect-square rounded transition-transform hover:scale-110"
              style={{ background: HEAT_COLORS[d.intensity] }}
              title={d.date.toLocaleDateString('vi-VN')}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        <div className="flex items-center justify-between p-4">
          <div className="text-[15px] font-bold">Tất cả giao dịch</div>
          <Button
            variant="ghost"
            size="sm"
            disabled={pendingEntries.length === 0}
            onClick={() => setConfirmTarget({ type: 'quick', entries: pendingEntries })}
          >
            Duyệt nhanh
          </Button>
        </div>

        {txns.length === 0 ? (
          <div className="px-4 pb-6 text-center text-[13px] text-ink-3 font-semibold pt-2">
            Chưa có giao dịch nào. Hãy tạo kế hoạch đầu tiên!
          </div>
        ) : (
          <div className="stagger">
            {txns.slice(0, 20).map((t, i) => (
              <div key={t.key} className={`px-4 py-3 ${i < Math.min(txns.length, 20) - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-grass-50 grid place-items-center text-[18px] flex-shrink-0">
                    {t.planEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-[13px] leading-snug break-words">{t.planName}</div>
                    <div className="mono-num font-black text-[15px] text-grass-700 mt-0.5 tracking-tight">
                      {fmtVNDfull(t.amount)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-[11px] text-ink-3 whitespace-nowrap">
                      {fmtDateShort(t.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      {t.items.map((item) => (
                        <span
                          key={item.id}
                          className={`w-1.5 h-1.5 rounded-full ${item.status === 'success' ? 'bg-grass-600' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold text-ink-3 mono-num">
                      {itemProgress(t.items).done}/{itemProgress(t.items).total}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-col gap-1.5 pl-12">
                  {t.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-xl bg-canvas px-2.5 py-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.assetColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-black text-ink-1">{item.assetId}</div>
                        <div className="text-[10px] text-ink-3 mono-num">
                          {fmtVND(item.amount)}
                          {item.quantity != null && item.quantity > 0 ? ` · ${item.quantity.toFixed(4)} cp/ccq` : ''}
                        </div>
                      </div>
                      {item.status === 'success' ? (
                        <span
                          className="w-8 h-8 rounded-full bg-grass-600 text-white grid place-items-center flex-shrink-0 shadow-sm"
                          aria-label="Đã duyệt"
                          title="Đã duyệt"
                        >
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
                            <path d="M4.5 10.2L8.1 13.8L15.5 6.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmTarget({ type: 'single', tx: t, item })}
                          className="w-8 h-8 rounded-full bg-white text-amber-600 border border-amber-200 grid place-items-center flex-shrink-0 active:scale-95 shadow-sm"
                          aria-label={`Duyệt ${item.assetId}`}
                          title="Duyệt"
                        >
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
                            <path d="M10 4.2V10L13.6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17 10A7 7 0 1 1 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmTarget ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-1/45 px-5 backdrop-blur-[3px]"
          onClick={() => {
            if (!confirming) setConfirmTarget(null)
          }}
        >
          <div
            className="w-full max-w-[360px] rounded-[28px] bg-white p-5 shadow-[0_24px_80px_rgba(8,24,18,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-grass-50 text-grass-700">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M7 11.5L10.4 15L17.5 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 12A8 8 0 1 1 12 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="text-center">
              <div className="text-[20px] font-black tracking-tight">
                {confirmTarget.type === 'single' ? 'Xác nhận duyệt' : 'Duyệt nhanh'}
              </div>
              <div className="mt-2 text-[13px] font-semibold leading-relaxed text-ink-3">
                {confirmTarget.type === 'single'
                  ? `Duyệt mã ${confirmTarget.item.assetId} cho kỳ DCA này?`
                  : `Duyệt ${confirmTarget.entries.length} sản phẩm đang chờ trong lịch sử?`}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-canvas p-3 text-center">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-3">Số tiền ghi nhận</div>
              <div className="mono-num mt-1 text-[22px] font-black text-grass-700">
                {fmtVNDfull(confirmTotal)}
              </div>
              <div className="mt-1 text-[11px] font-semibold text-ink-3">
                App sẽ tính số lượng theo giá mới nhất khi duyệt.
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={confirming}
                onClick={() => setConfirmTarget(null)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="w-full"
                disabled={confirming}
                onClick={confirmApprove}
              >
                {confirming ? 'Đang duyệt...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
