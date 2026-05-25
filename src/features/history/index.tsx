'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { fmtVND } from '@/lib/utils'
import { assetMap } from '@/lib/data'
import Icon3D from '@/components/icons/Icon3D'
import Button from '@/components/ui/Button'

const HEAT_COLORS = ['#F1F4F2', '#BBF7D0', '#4ADE80', '#16A34A']

interface TxRow {
  key: string
  planName: string
  planEmoji: string
  assetId: string
  assetColor: string
  amount: number
  date: Date
  status: 'success' | 'pending'
}

export default function History() {
  const { plans, streak } = useAppStore(useShallow(s => ({ plans: s.plans, streak: s.streak })))

  const txns = useMemo<TxRow[]>(() => {
    const out: TxRow[] = []
    const today = new Date()
    plans.forEach(plan => {
      for (let m = 0; m < plan.startMonth; m++) {
        const date = new Date(today.getFullYear(), today.getMonth() - m, 1)
        plan.allocation.forEach(a => {
          const asset = assetMap[a.id as keyof typeof assetMap]
          out.push({
            key: `${plan.id}-${m}-${a.id}`,
            planName: plan.name, planEmoji: plan.emoji,
            assetId: a.id, assetColor: asset?.color ?? '#ccc',
            amount: (plan.amount * a.pct) / 100,
            date, status: m === 0 ? 'pending' : 'success',
          })
        })
      }
    })
    return out.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [plans])

  const heat = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (27 - i))
      const seed = (d.getDate() * 7 + d.getMonth() * 13) % 10
      return { date: d, intensity: seed < 3 ? 0 : seed < 6 ? 1 : seed < 8 ? 2 : 3 }
    })
  }, [])

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
          <div className="mono-num font-black text-[14px] text-warm mt-1.5">{upcoming}</div>
          <div className="text-[10px] text-ink-3 mt-1">chờ thực hiện</div>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-ink-3 leading-tight">Streak</span>
            <Icon3D name="fire" size={22} />
          </div>
          <div className="mono-num font-black text-[14px] mt-1.5" style={{ color: '#EA580C' }}>{streak}</div>
          <div className="text-[10px] text-ink-3 mt-1">tháng liên tục</div>
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border flex-shrink-0 ${
                  t.status === 'success'
                    ? 'bg-grass-50 text-grass-800 border-grass-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {t.status === 'success' ? '✓ OK' : '⏳ Chờ'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
