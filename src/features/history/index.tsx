'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { fmtVND } from '@/lib/utils'
import Icon3D from '@/components/icons/Icon3D'
import Button from '@/components/ui/Button'
import { getSupabaseClient } from '@/lib/supabase'
import type { Plan } from '@/lib/types'

const HEAT_COLORS = ['#F1F4F2', '#BBF7D0', '#4ADE80', '#16A34A']

interface TxRow {
  id: string
  key: string
  planId: string
  planName: string
  planEmoji: string
  assetId: string
  assetColor: string
  amount: number
  date: Date
  status: 'success' | 'pending'
}

function toDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

    const out: Array<{ plan_id: string; asset_symbol: string; amount: number; due_date: string; status: 'pending' }> = []
    const cursor = new Date(start)
    while (cursor <= today) {
      if (isDueDate(plan, cursor)) {
        const dueDate = toDateKey(cursor)
        for (const a of plan.allocation) {
          out.push({
            plan_id: plan.id,
            asset_symbol: a.id,
            amount: Math.round((plan.amount * a.pct) / 100),
            due_date: dueDate,
            status: 'pending',
          })
        }
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    return out
  })
}

export default function History() {
  const { plans, streak, assets, auth, dispatch } = useAppStore(useShallow(s => ({ plans: s.plans, streak: s.streak, assets: s.assets, auth: s.auth, dispatch: s.dispatch })))
  const assetMap = useMemo(() => Object.fromEntries(assets.map(a => [a.id, a])), [assets])
  const [txns, setTxns] = useState<TxRow[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let active = true
    if (!auth || plans.length === 0) {
      setTxns([])
      return () => {
        active = false
      }
    }

    ;(async () => {
      try {
        setSyncing(true)
        const supabase = getSupabaseClient()
        const dueRows = buildDueTransactions(plans)
        if (dueRows.length) {
          await supabase
            .from('user_plan_transactions')
            .upsert(dueRows, { onConflict: 'plan_id,asset_symbol,due_date', ignoreDuplicates: true })
        }

        const { data, error } = await supabase
          .from('user_plan_transactions')
          .select(`
            id, plan_id, asset_symbol, amount, due_date, status, executed_at,
            user_plans(name, emoji)
          `)
          .order('due_date', { ascending: false })
          .limit(500)

        if (error || !data || !active) return
        const mapped: TxRow[] = data.map((r) => {
          const asset = assetMap[r.asset_symbol as keyof typeof assetMap]
          return {
            id: r.id,
            key: r.id,
            planId: r.plan_id,
            planName: (r as { user_plans?: { name?: string } | null }).user_plans?.name ?? 'Kế hoạch',
            planEmoji: (r as { user_plans?: { emoji?: string } | null }).user_plans?.emoji ?? '🌱',
            assetId: r.asset_symbol,
            assetColor: asset?.color ?? '#ccc',
            amount: Number(r.amount ?? 0),
            date: new Date(r.due_date),
            status: r.status,
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
  }, [auth, plans, assetMap])

  async function markSuccess(tx: TxRow) {
    if (tx.status !== 'pending') return
    try {
      const supabase = getSupabaseClient()
      const { error: txErr } = await supabase
        .from('user_plan_transactions')
        .update({ status: 'success', executed_at: new Date().toISOString() })
        .eq('id', tx.id)
        .eq('status', 'pending')

      if (txErr) return

      const plan = plans.find((p) => p.id === tx.planId)
      if (plan) {
        const nextInvested = plan.totalInvested + tx.amount
        const nextValue = plan.currentValue + tx.amount
        await supabase
          .from('user_plans')
          .update({ total_invested: nextInvested, current_value: nextValue })
          .eq('id', tx.planId)

        const updatedPlans = plans.map((p) =>
          p.id === tx.planId
            ? { ...p, totalInvested: nextInvested, currentValue: nextValue }
            : p,
        )
        dispatch({ type: 'setPlans', plans: updatedPlans })
      }

      const { data: userRes } = await supabase.auth.getUser()
      if (userRes.user) {
        const month = monthKey(tx.date)
        await supabase
          .from('user_streak_months')
          .upsert(
            {
              user_id: userRes.user.id,
              success_month: month,
              first_success_date: toDateKey(tx.date),
            },
            { onConflict: 'user_id,success_month' },
          )

        const { data: monthsRows } = await supabase
          .from('user_streak_months')
          .select('success_month')
          .order('success_month', { ascending: false })
          .limit(120)

        if (monthsRows) {
          const monthSet = new Set(
            monthsRows
              .map((r) => r.success_month)
              .filter((m): m is string => Boolean(m)),
          )
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
      }

      setTxns((prev) => prev.map((t) => (t.id === tx.id ? { ...t, status: 'success' } : t)))
      dispatch({ type: 'showToast', toast: { message: 'Đã xác nhận giao dịch ✓', icon: '✓' } })
    } catch {
      // ignore
    }
  }

  const heat = useMemo(() => {
    const today = new Date()
    const successSet = new Set(
      txns
        .filter((t) => t.status === 'success')
        .map((t) => toDateKey(t.date)),
    )
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (27 - i))
      const key = toDateKey(d)
      return { date: d, intensity: successSet.has(key) ? 3 : 0 }
    })
  }, [txns])

  const totalSuccess = txns.filter(t => t.status === 'success').reduce((s, t) => s + t.amount, 0)
  const upcoming     = txns.filter(t => t.status === 'pending').length

  return (
    <div className="fade-up pb-4">
      <div className="mb-5">
        <div className="text-2xl font-black tracking-tight">Lịch sử giao dịch 📋</div>
        <div className="text-ink-3 mt-1.5 text-sm">Mỗi giao dịch là 1 bước đi đến mục tiêu</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl shadow-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-ink-3 leading-tight">Tổng đã DCA</span>
            <Icon3D name="coin" size={22} />
          </div>
          <div className="mono-num font-black text-[14px] mt-1.5">{fmtVND(totalSuccess)}</div>
          <div className="text-[10px] text-ink-3 mt-1">{txns.filter(t => t.status === 'success').length} GD</div>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-ink-3 leading-tight">Sắp tới</span>
            <Icon3D name="sparkle" size={22} />
          </div>
          <div className="mono-num font-black text-[14px] text-warm mt-1.5">{syncing ? '...' : upcoming}</div>
          <div className="text-[10px] text-ink-3 mt-1">chờ thực hiện</div>
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

      {/* Heatmap */}
      <div className="bg-white rounded-2xl shadow-card p-4 mt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[15px] font-bold">28 ngày qua 🌱</div>
            <div className="text-[11px] text-ink-3 mt-0.5">Đậm hơn = ngày bạn có DCA</div>
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

      {/* Transaction list */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        <div className="flex items-center justify-between p-4">
          <div className="text-[15px] font-bold">Tất cả giao dịch</div>
          <Button variant="ghost" size="sm">Xuất CSV ↓</Button>
        </div>

        {txns.length === 0 ? (
          <div className="px-4 pb-6 text-center text-[13px] text-ink-3 font-semibold pt-2">
            Chưa có giao dịch nào. Hãy tạo kế hoạch đầu tiên!
          </div>
        ) : (
          <div className="stagger">
            {txns.slice(0, 20).map((t, i) => (
              <div key={t.key}
                className={`flex items-center gap-3 px-4 py-3 ${i < Math.min(txns.length, 20) - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-grass-50 grid place-items-center text-[18px] flex-shrink-0">
                  {t.planEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[13px] truncate">{t.planName}</div>
                  <div className="text-[11px] text-ink-3 truncate">
                    {t.date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })} ·{' '}
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm" style={{ background: t.assetColor }} />
                      {t.assetId}
                    </span>
                  </div>
                </div>
                <div className="mono-num font-black text-[13px] text-right whitespace-nowrap">{fmtVND(t.amount)}</div>
                {t.status === 'success' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border flex-shrink-0 bg-grass-50 text-grass-800 border-grass-200">
                    ✓ Thành công
                  </span>
                ) : (
                  <button
                    onClick={() => markSuccess(t)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border flex-shrink-0 bg-amber-50 text-amber-700 border-amber-200 active:scale-95"
                  >
                    ⏳ Pending
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
