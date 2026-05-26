'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { fmtVND, fmtPct, projectValue, freqHelpers, shade, cn } from '@/lib/utils'
import Confetti from '@/components/ui/Confetti'
import Sapling from '@/components/sapling/Sapling'
import DonutAllocation from '@/components/charts/DonutAllocation'
import AssetLogo from '@/components/ui/AssetLogo'
import RiskBadge from '@/components/ui/RiskBadge'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import type { Allocation, Asset, Freq } from '@/lib/types'

/* ── types ── */
interface PlanDraft {
  name: string
  emoji: string
  amount: number
  freq: Freq
  freqDays: number[]
  duration: number | null
  allocation: Allocation[]
}

const EMOJIS  = ['🌱','🎓','🏠','✈️','🚗','💍','👶','🎯','💰','🏖️','📚','💎']
const AMOUNTS = [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000]
const YEARS   = [1, 3, 5, 10, 15, 20]
const CAT_LABELS: Record<string, string> = {
  etf: 'ETF', fund: 'Quỹ mở', stock: 'Cổ phiếu', gold: 'Vàng', savings: 'Tiết kiệm',
}
const PRESETS = [
  { name: 'Người mới', emoji: '🌱', items: [{ id: 'BAL' as Asset['id'], pct: 60 }, { id: 'ETF' as Asset['id'], pct: 40 }] },
  { name: 'Năng động', emoji: '🚀', items: [{ id: 'ETF' as Asset['id'], pct: 40 }, { id: 'GROW' as Asset['id'], pct: 40 }, { id: 'FUND' as Asset['id'], pct: 20 }] },
  { name: 'Bảo thủ',  emoji: '🛡️', items: [{ id: 'BOND' as Asset['id'], pct: 60 }, { id: 'BAL' as Asset['id'], pct: 25 }, { id: 'GOLD' as Asset['id'], pct: 15 }] },
]
const CAT_FILTERS = [
  { id: 'all', label: 'Tất cả' }, { id: 'etf', label: 'ETF' },
  { id: 'fund', label: 'Quỹ mở' }, { id: 'stock', label: 'Cổ phiếu' },
  { id: 'gold', label: 'Vàng' }, { id: 'savings', label: 'Tiết kiệm' },
]

/* ── Stepper ── */
function Stepper({ step }: { step: number }) {
  const labels = ['Mục tiêu', 'Tài sản', 'Xác nhận', 'Xong']
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-extrabold text-ink-3 mono-num">{Math.min(step + 1, 4)}/4</span>
      <div className="flex items-center gap-1">
        {labels.map((_, i) => (
          <span key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-grass-500 w-5' : 'bg-gray-200 w-3'}`} />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   Step 0 — Goal
══════════════════════════════════════════════ */
function StepGoal({ plan, setPlan }: { plan: PlanDraft; setPlan: (p: PlanDraft) => void }) {
  const [showEmoji, setShowEmoji] = useState(false)

  const setFreqType = (id: Freq) => {
    if (id === 'day')   setPlan({ ...plan, freq: 'day',   freqDays: [] })
    else if (id === 'week')  setPlan({ ...plan, freq: 'week',  freqDays: plan.freq === 'week'  && plan.freqDays.length ? plan.freqDays : [1] })
    else  setPlan({ ...plan, freq: 'month', freqDays: plan.freq === 'month' && plan.freqDays.length ? plan.freqDays : [1] })
  }

  const toggleDay = (n: number) => {
    const cur = new Set(plan.freqDays)
    if (cur.has(n)) cur.delete(n); else cur.add(n)
    const arr = [...cur].sort((a, b) => a - b)
    setPlan({ ...plan, freqDays: arr.length ? arr : (plan.freqDays.length ? plan.freqDays : [1]) })
  }

  const totalCapital = plan.amount * freqHelpers.periodsPerYear({ freq: plan.freq, freqDays: plan.freqDays }) * (plan.duration || 1)

  return (
    <div className="fade-up flex flex-col gap-3">
      <div className="px-1">
        <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Bước 1 · Mục tiêu</div>
        <div className="text-[24px] font-black tracking-tight leading-tight mt-1">Bạn DCA vì điều gì?</div>
      </div>

      {/* Emoji + Name */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-3 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={cn('w-12 h-12 rounded-2xl grid place-items-center text-2xl flex-shrink-0 transition-colors',
              showEmoji ? 'bg-grass-50 ring-2 ring-grass-200' : 'bg-canvas hover:bg-grass-50'
            )}
          >
            {plan.emoji}
          </button>
          <input
            className="flex-1 min-w-0 bg-transparent border-0 outline-0 font-extrabold text-[15.5px] placeholder:text-ink-4 placeholder:font-semibold"
            placeholder="Tên kế hoạch · vd: Quỹ học của con"
            value={plan.name}
            onChange={e => setPlan({ ...plan, name: e.target.value })}
          />
        </div>
        {showEmoji && (
          <div className="grid grid-cols-6 gap-1 p-2 bg-canvas border-t border-gray-100">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { setPlan({ ...plan, emoji: e }); setShowEmoji(false) }}
                className={cn('min-h-11 text-2xl p-2 rounded-xl transition-colors', plan.emoji === e ? 'bg-white shadow-sm' : 'hover:bg-white')}
              >{e}</button>
            ))}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Số tiền mỗi lần</div>
        <div className="flex items-baseline gap-1 mt-1.5">
          <input
            className="mono-num flex-1 min-w-0 bg-transparent border-0 outline-0 text-[34px] font-black tracking-tight text-ink-1"
            value={plan.amount.toLocaleString('vi-VN')}
            inputMode="numeric"
            onChange={e => setPlan({ ...plan, amount: parseInt(e.target.value.replace(/\D/g, '')) || 0 })}
          />
          <span className="text-[22px] font-black text-ink-4">₫</span>
        </div>
        <div className="flex gap-1.5 flex-wrap mt-3">
          {AMOUNTS.map(a => (
            <Chip
              key={a}
              active={plan.amount === a}
              onClick={() => setPlan({ ...plan, amount: a })}
              className={cn('text-[12px]', plan.amount !== a && 'bg-canvas')}
            >
              {fmtVND(a)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-end justify-between">
          <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Tần suất</div>
          <span className="text-[11px] text-ink-3 font-bold mono-num">{freqHelpers.cadenceSummary({ freq: plan.freq, freqDays: plan.freqDays })}</span>
        </div>
        <div className="bg-canvas rounded-xl p-1 flex mt-2.5">
          {(['day','week','month'] as Freq[]).map((f, i) => (
            <button
              key={f}
              onClick={() => setFreqType(f)}
              data-active={plan.freq === f}
              className="seg-option flex-1"
            >{['Hằng ngày','Hằng tuần','Hằng tháng'][i]}</button>
          ))}
        </div>

        <div className="mt-3.5">
          {plan.freq === 'day' && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-grass-50 rounded-xl">
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-extrabold text-[13px] text-grass-800">Mỗi ngày làm việc</div>
                <div className="text-[11px] text-grass-700 font-semibold mt-0.5">Bỏ qua T7, CN và ngày lễ</div>
              </div>
            </div>
          )}
          {plan.freq === 'week' && (
            <div>
              <div className="text-[11px] font-bold text-ink-4 mb-2">Chọn ngày trong tuần · multi-select</div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => toggleDay(n)}
                    className={cn('aspect-square min-h-11 rounded-xl px-2 font-extrabold text-[13px] transition-all',
                      plan.freqDays.includes(n) ? 'bg-ink-1 text-white shadow-sm' : 'bg-canvas text-ink-3'
                    )}
                  >{freqHelpers.weekLabel(n)}</button>
                ))}
              </div>
            </div>
          )}
          {plan.freq === 'month' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold text-ink-4">Chọn ngày trong tháng</div>
                <span className="text-[11px] font-extrabold text-grass-700 mono-num">{plan.freqDays.length} ngày</span>
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => toggleDay(n)}
                    className={cn('aspect-square min-h-9 rounded-lg px-1 mono-num font-extrabold text-[12px] transition-all',
                      plan.freqDays.includes(n) ? 'bg-ink-1 text-white shadow-sm' : 'bg-canvas text-ink-3'
                    )}
                  >{n}</button>
                ))}
              </div>
              <div className="text-[10px] text-ink-4 mt-2 leading-snug">
                Ngày 29–31 nếu tháng không có sẽ chạy vào ngày cuối tháng.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-end justify-between">
          <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Thời gian</div>
          <span className="text-[11px] text-ink-3 font-bold mono-num">{plan.duration ? `${plan.duration} năm` : 'không giới hạn'}</span>
        </div>
        <div className="bg-canvas rounded-xl p-1 flex mt-2.5">
          <button
            onClick={() => setPlan({ ...plan, duration: null })}
            data-active={plan.duration === null}
            className="seg-option flex-1"
          >Liên tục</button>
          <button
            onClick={() => setPlan({ ...plan, duration: plan.duration || 5 })}
            data-active={plan.duration !== null}
            className="seg-option flex-1"
          >Có thời hạn</button>
        </div>
        {plan.duration !== null && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {YEARS.map(y => (
              <button
                key={y}
                onClick={() => setPlan({ ...plan, duration: y })}
                className={cn(
                  'min-h-11 rounded-xl border-2 text-[12px] font-extrabold transition-all',
                  plan.duration === y
                    ? 'border-grass-500 bg-grass-50 text-grass-800 shadow-sm'
                    : 'border-gray-200 bg-canvas text-ink-3 hover:border-grass-300 hover:bg-white'
                )}
              >
                {y} năm
              </button>
            ))}
          </div>
        )}
        {plan.duration === null && (
          <div className="mt-2.5 text-[11px] text-ink-4 leading-snug">
            DCA không giới hạn — bạn có thể dừng bất kỳ lúc nào trong app.
          </div>
        )}
      </div>

      {/* Dark emerald forecast tile */}
      <div className="rounded-2xl p-4 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #047857 0%, #064E3B 60%, #052e16 100%)' }}
      >
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-6 right-12 h-px opacity-40"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }} />
        <div className="relative">
          <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase opacity-75">
            {plan.duration ? `Tổng vốn ${plan.duration} năm` : 'Tổng vốn mỗi năm'}
          </div>
          <div className="mono-num text-[28px] font-black tracking-tight mt-1 leading-none">{fmtVND(totalCapital)}</div>
          <div className="text-[12px] mt-1.5 opacity-85 font-semibold">{freqHelpers.description({ freq: plan.freq, freqDays: plan.freqDays })}</div>
          <div className="text-[11px] mt-0.5 opacity-65 font-semibold">
            {fmtVND(plan.amount)} × {freqHelpers.periodsPerYear({ freq: plan.freq, freqDays: plan.freqDays })} lần / năm
            {plan.duration ? ` × ${plan.duration} năm` : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   Step 1 — Assets
══════════════════════════════════════════════ */
function StepAssets({ plan, setPlan, assets }: { plan: PlanDraft; setPlan: (p: PlanDraft) => void; assets: Asset[] }) {
  const [catFilter, setCatFilter] = useState('all')
  const selectedIds = new Set(plan.allocation.map(a => a.id))
  const totalPct = plan.allocation.reduce((s, a) => s + a.pct, 0)
  const isFull = totalPct === 100
  const available = assets.filter(a => !selectedIds.has(a.id) && (catFilter === 'all' || a.cat === catFilter))
  const assetMap = Object.fromEntries(assets.map(a => [a.id, a])) as Record<string, Asset>

  function rebalance(alloc: Allocation[]): Allocation[] {
    if (!alloc.length) return alloc
    const even = Math.floor(100 / alloc.length)
    const rem  = 100 - even * (alloc.length - 1)
    return alloc.map((a, i) => ({ ...a, pct: i === 0 ? rem : even }))
  }

  function toggle(asset: typeof assets[0]) {
    if (selectedIds.has(asset.id)) {
      const next = plan.allocation.filter(a => a.id !== asset.id)
      setPlan({ ...plan, allocation: next.length ? rebalance(next) : next })
    } else {
      setPlan({ ...plan, allocation: rebalance([...plan.allocation, { id: asset.id, pct: 0 }]) })
    }
  }

  function setPct(id: string, pct: number) {
    setPlan({ ...plan, allocation: plan.allocation.map(a => a.id === id ? { ...a, pct } : a) })
  }

  return (
    <div className="fade-up flex flex-col gap-3">
      <div className="px-1">
        <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Bước 2 · Tài sản</div>
        <div className="text-[24px] font-black tracking-tight leading-tight mt-1">Phân bổ vốn DCA</div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Donut / empty */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Phân bổ</div>
            <span className={cn('text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mono-num',
              isFull ? 'bg-grass-50 text-grass-800' : totalPct > 0 ? 'bg-amber-50 text-amber-700' : 'bg-canvas text-ink-3'
            )}>{totalPct}%</span>
          </div>
          {plan.allocation.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-canvas grid place-items-center text-2xl mb-2">🌿</div>
              <div className="text-[13px] font-extrabold text-ink-2">Chưa có tài sản</div>
              <div className="text-[11px] text-ink-4 mt-0.5">Chọn combo nhanh hoặc thêm từ danh sách bên dưới</div>
            </div>
          ) : (
            <div className="flex justify-center my-2">
              <DonutAllocation
                items={plan.allocation.map(a => ({ pct: a.pct, color: assetMap[a.id]?.color ?? '#ccc' }))}
                size={140} stroke={18}
              />
            </div>
          )}
        </div>

        {/* Combo nhanh */}
        <div className="px-4 pb-3 border-t border-gray-50 pt-3">
          <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase mb-2">Combo nhanh</div>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map(r => (
              <button key={r.name} onClick={() => setPlan({ ...plan, allocation: r.items })}
                className="min-h-[74px] bg-canvas rounded-xl py-3 px-2 text-center active:scale-95 active:bg-grass-50 transition-all"
              >
                <div className="text-xl leading-none">{r.emoji}</div>
                <div className="font-extrabold text-[11px] text-ink-1 mt-1">{r.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected with sliders */}
        {plan.allocation.length > 0 && (
          <div className="border-t border-gray-50 px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Đã chọn · {plan.allocation.length}</div>
              {!isFull && (
                <span className="text-[10px] text-amber-600 font-extrabold">
                  {100 - totalPct > 0 ? `thiếu ${100 - totalPct}%` : `dư ${totalPct - 100}%`}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {plan.allocation.map(a => {
                const asset = assetMap[a.id]
                if (!asset) return null
                return (
                  <div key={a.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: asset.color }} />
                        <span className="font-extrabold text-[13px] flex-shrink-0">{asset.id}</span>
                        <span className="text-[11px] text-ink-3 truncate">· {asset.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="mono-num font-black text-[14px]" style={{ color: shade(asset.color, -15) }}>{a.pct}%</span>
                        <button onClick={() => toggle(asset)} className="w-8 h-8 rounded-full grid place-items-center text-ink-4 active:text-red-500 text-lg leading-none hover:bg-red-50">×</button>
                      </div>
                    </div>
                    <input type="range" min="0" max="100" value={a.pct}
                      onChange={e => setPct(a.id, parseInt(e.target.value))}
                      className="w-full"
                      style={{ accentColor: asset.color }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add section */}
        {available.length > 0 && (
          <div className="border-t border-gray-50 px-4 py-3.5 bg-canvas">
            <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase mb-2">Thêm tài sản</div>
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2" style={{ scrollbarWidth: 'none' }}>
              {CAT_FILTERS.map(c => (
                <Chip
                  key={c.id}
                  active={catFilter === c.id}
                  onClick={() => setCatFilter(c.id)}
                  className="flex-shrink-0 text-[11px]"
                >
                  {c.label}
                </Chip>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              {available.map(a => (
                <button key={a.id} onClick={() => toggle(a)}
                  className="min-h-[56px] bg-white rounded-xl px-3 py-2.5 flex items-center gap-3 active:scale-[0.98] active:bg-grass-50 transition-all border border-gray-100"
                >
                  <AssetLogo asset={a} size={32} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-extrabold text-[13px]">{a.id}</span>
                      <span className="text-[10px] text-ink-3 truncate">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <RiskBadge risk={a.risk} />
                      <span className={cn('text-[10px] font-extrabold', a.ytd >= 0 ? 'text-grass-600' : 'text-red-500')}>
                        YTD {fmtPct(a.ytd)}
                      </span>
                    </div>
                  </div>
                  <span className="text-grass-500 text-2xl font-black leading-none flex-shrink-0 w-7 text-center">+</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   Step 2 — Review
══════════════════════════════════════════════ */
function StepReview({ plan, assets }: { plan: PlanDraft; assets: Asset[] }) {
  const assetMap = Object.fromEntries(assets.map(a => [a.id, a])) as Record<string, Asset>
  const cagr = plan.allocation.reduce((acc, a) => acc + (assetMap[a.id]?.y5 ?? 7) * a.pct / 100, 0)
  const years = plan.duration || 10
  const periods = freqHelpers.periodsPerYear({ freq: plan.freq, freqDays: plan.freqDays })
  const fv = projectValue(plan.amount, periods, years, cagr)
  const invested = plan.amount * periods * years
  const profit = fv - invested

  const proj = Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    invested: plan.amount * periods * y,
    value: y === 0 ? 0 : projectValue(plan.amount, periods, y, cagr),
  }))
  const maxV = proj[proj.length - 1].value || 1

  return (
    <div className="fade-up bg-white rounded-2xl shadow-card p-5">
      <div className="text-2xl font-black tracking-tight">Xem lại kế hoạch 👀</div>
      <div className="text-ink-3 mt-1.5 text-sm">Dự phóng dựa trên lịch sử 5 năm — không phải cam kết tương lai.</div>

      {/* Summary */}
      <div className="p-4 bg-canvas rounded-2xl mt-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-grass-50 grid place-items-center text-3xl">{plan.emoji}</div>
          <div>
            <div className="text-[16px] font-bold">{plan.name || 'Kế hoạch DCA'}</div>
            <div className="text-[12px] text-ink-3">{fmtVND(plan.amount)} · {freqHelpers.description({ freq: plan.freq, freqDays: plan.freqDays })}</div>
            <div className="text-[11px] text-ink-4 mt-0.5">{freqHelpers.cadenceSummary({ freq: plan.freq, freqDays: plan.freqDays })} · {plan.duration ? `${plan.duration} năm` : 'liên tục'}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {plan.allocation.map(a => {
            const asset = assetMap[a.id]
            if (!asset) return null
            return (
              <div key={a.id} className="flex items-center gap-3">
                <AssetLogo asset={asset} size={32} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-bold text-[13px]">{asset.id}</div>
                    <div className="mono-num font-black text-[13px]">{a.pct}%</div>
                  </div>
                  <div className="text-[11px] text-ink-3">{fmtVND(plan.amount * a.pct / 100)} / kỳ</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Projection */}
      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-3">Dự phóng sau {years} năm{!plan.duration && ' (mô phỏng)'}</div>
        <div className="mono-num text-3xl font-black text-grass-700 tracking-tight mt-1">{fmtVND(fv)}</div>
        <div className="text-[12px] text-ink-3 mt-1">CAGR dự kiến: {cagr.toFixed(1)}% / năm</div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-canvas rounded-xl p-3">
            <div className="text-[11px] text-ink-3 font-bold">Đã đầu tư</div>
            <div className="mono-num font-black text-[16px] mt-1">{fmtVND(invested)}</div>
          </div>
          <div className="bg-grass-50 rounded-xl p-3">
            <div className="text-[11px] text-grass-700 font-bold">Lợi nhuận</div>
            <div className="mono-num font-black text-[16px] text-grass-800 mt-1">+{fmtVND(profit)}</div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-3 mb-2.5">Tăng trưởng theo năm</div>
          <div className="flex items-end gap-1.5 h-24">
            {proj.map(p => (
              <div key={p.year} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-20 flex flex-col justify-end">
                  <div className="rounded-t-lg relative overflow-hidden"
                    style={{ height: `${(p.value / maxV) * 100}%`, background: 'linear-gradient(180deg, #4ADE80, #16A34A)', minHeight: p.value > 0 ? 4 : 0, transformOrigin: 'bottom', animation: `bar-grow 0.5s cubic-bezier(0.34,1.2,0.64,1) ${p.year * 0.08}s both` }}
                  >
                    {p.value > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 rounded-b-sm"
                        style={{ height: `${(p.invested / p.value) * 100}%`, background: 'rgba(20,83,45,0.4)' }} />
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-ink-3">Y{p.year}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-[11px] mt-2 text-ink-3 font-semibold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-grass-500 rounded-sm" /> Tăng trưởng</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(20,83,45,0.4)' }} /> Vốn gốc</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[12px] text-amber-900 font-semibold">
        ⚠️ <strong>Lưu ý:</strong> Đây là dự phóng dựa trên lịch sử, không đảm bảo. Chỉ DCA số tiền bạn sẵn sàng đầu tư dài hạn.
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   Step 3 — Done
══════════════════════════════════════════════ */
function StepDone({ plan, dispatch }: { plan: PlanDraft; dispatch: (a: import('@/lib/types').AppAction) => void }) {
  return (
    <>
      <Confetti />
      <div className="fade-up bg-gradient-to-b from-grass-50 to-white rounded-2xl shadow-card p-8 text-center">
        <div className="inline-block" style={{ animation: 'pop 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <Sapling stage={1} size={140} animated />
        </div>
        <div className="text-3xl font-black text-grass-800 tracking-tight mt-2">Tuyệt vời! 🎉</div>
        <div className="text-[15px] text-ink-3 mt-3 leading-relaxed">
          Bạn vừa gieo hạt giống <strong className="text-ink-1">"{plan.name || 'DCA mới'}"</strong>.{' '}
          Cứ chăm sóc đều đặn, cây sẽ lớn dần theo tháng năm.
        </div>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Button size="lg" onClick={() => dispatch({ type: 'go', screen: 'dashboard' })}>Về Dashboard</Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'go', screen: 'history' })}>Xem lịch sử →</Button>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════
   Main CreatePlan
══════════════════════════════════════════════ */
export default function CreatePlan() {
  const { dispatch, auth, prefill, assets } = useAppStore(useShallow(s => ({ dispatch: s.dispatch, auth: s.auth, prefill: s.prefill, assets: s.assets })))
  const initial = prefill ?? {}

  const [step, setStep] = useState(0)
  const [plan, setPlan] = useState<PlanDraft>({
    name: '',
    emoji: '🌱',
    amount: (initial as PlanDraft).amount || 2_000_000,
    freq: (initial as PlanDraft).freq || 'month',
    freqDays: (initial as PlanDraft).freqDays || [1],
    duration: (initial as PlanDraft).duration ?? 5,
    allocation: (initial as PlanDraft).allocation || [],
  })

  const canNext =
    (step === 0 && plan.name.trim().length > 0 && plan.amount > 0) ||
    (step === 1 && plan.allocation.length > 0 && plan.allocation.reduce((s, a) => s + a.pct, 0) === 100) ||
    step === 2

  function handleNext() {
    if (step === 2) {
      if (!auth) {
        dispatch({ type: 'requireAuth', pending: { type: 'addPlan', plan: { ...plan, freqDays: plan.freqDays.length ? plan.freqDays : [1] } } })
        return
      }
      dispatch({ type: 'addPlan', plan: { ...plan, freqDays: plan.freqDays.length ? plan.freqDays : [1] } })
    }
    setStep(s => Math.min(3, s + 1))
  }

  return (
    <div className="fade-up pb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'go', screen: 'dashboard' })}>← Hủy</Button>
        <Stepper step={step} />
      </div>

      {step === 0 && <StepGoal plan={plan} setPlan={setPlan} />}
      {step === 1 && <StepAssets plan={plan} setPlan={setPlan} assets={assets} />}
      {step === 2 && <StepReview plan={plan} assets={assets} />}
      {step === 3 && <StepDone plan={plan} dispatch={dispatch} />}

      {step < 3 && (
        <div className="flex items-center justify-between mt-5 gap-2">
          {step > 0
            ? <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))}>← Quay lại</Button>
            : <span />
          }
          <Button size="lg" disabled={!canNext}
            className={cn('flex-1', !canNext ? 'opacity-50 cursor-not-allowed' : '')}
            onClick={handleNext}
          >
            {step === 2 ? (auth ? 'Bắt đầu DCA ✨' : 'Đăng nhập để bắt đầu →') : 'Tiếp theo →'}
          </Button>
        </div>
      )}
    </div>
  )
}
