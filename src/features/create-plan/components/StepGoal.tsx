'use client'

import { useState } from 'react'
import Chip from '@/components/ui/Chip'
import { cn, fmtVND, freqHelpers } from '@/lib/utils'
import type { Freq } from '@/lib/types'
import { AMOUNTS, EMOJIS, YEARS } from './constants'
import type { PlanDraft } from './types'

export default function StepGoal({ plan, setPlan }: { plan: PlanDraft; setPlan: (p: PlanDraft) => void }) {
  const [showEmoji, setShowEmoji] = useState(false)

  const setFreqType = (id: Freq) => {
    if (id === 'day') setPlan({ ...plan, freq: 'day', freqDays: [] })
    else if (id === 'week') {
      setPlan({ ...plan, freq: 'week', freqDays: plan.freq === 'week' && plan.freqDays.length ? plan.freqDays : [1] })
    } else {
      setPlan({ ...plan, freq: 'month', freqDays: plan.freq === 'month' && plan.freqDays.length ? plan.freqDays : [1] })
    }
  }

  const toggleDay = (n: number) => {
    const cur = new Set(plan.freqDays)
    if (cur.has(n)) cur.delete(n)
    else cur.add(n)
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

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-3 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={cn('w-12 h-12 rounded-2xl grid place-items-center text-2xl flex-shrink-0 transition-colors', showEmoji ? 'bg-grass-50 ring-2 ring-grass-200' : 'bg-canvas hover:bg-grass-50')}
          >
            {plan.emoji}
          </button>
          <input
            className="flex-1 min-w-0 bg-transparent border-0 outline-0 font-extrabold text-[15.5px] placeholder:text-ink-4 placeholder:font-semibold"
            placeholder="Tên kế hoạch · vd: Quỹ học của con"
            value={plan.name}
            onChange={(e) => setPlan({ ...plan, name: e.target.value })}
          />
        </div>
        {showEmoji && (
          <div className="grid grid-cols-6 gap-1 p-2 bg-canvas border-t border-gray-100">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => {
                  setPlan({ ...plan, emoji: e })
                  setShowEmoji(false)
                }}
                className={cn('min-h-11 text-2xl p-2 rounded-xl transition-colors', plan.emoji === e ? 'bg-white shadow-sm' : 'hover:bg-white')}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Số tiền mỗi lần</div>
        <div className="flex items-baseline gap-1 mt-1.5">
          <input
            className="mono-num flex-1 min-w-0 bg-transparent border-0 outline-0 text-[34px] font-black tracking-tight text-ink-1"
            value={plan.amount.toLocaleString('vi-VN')}
            inputMode="numeric"
            onChange={(e) => setPlan({ ...plan, amount: parseInt(e.target.value.replace(/\D/g, '')) || 0 })}
          />
          <span className="text-[22px] font-black text-ink-4">₫</span>
        </div>
        <div className="flex gap-1.5 flex-wrap mt-3">
          {AMOUNTS.map((a) => (
            <Chip key={a} active={plan.amount === a} onClick={() => setPlan({ ...plan, amount: a })} className={cn('text-[12px]', plan.amount !== a && 'bg-canvas')}>
              {fmtVND(a)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-end justify-between">
          <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Tần suất</div>
          <span className="text-[11px] text-ink-3 font-bold mono-num">{freqHelpers.cadenceSummary({ freq: plan.freq, freqDays: plan.freqDays })}</span>
        </div>
        <div className="bg-canvas rounded-full p-1 flex mt-2.5">
          {(['day', 'week', 'month'] as Freq[]).map((f, i) => (
            <button key={f} onClick={() => setFreqType(f)} data-active={plan.freq === f} className="seg-option flex-1">
              {['Hằng ngày', 'Hằng tuần', 'Hằng tháng'][i]}
            </button>
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
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => toggleDay(n)}
                    className={cn('aspect-square min-h-11 rounded-full px-2 font-extrabold text-[13px] transition-all', plan.freqDays.includes(n) ? 'bg-ink-1 text-white shadow-sm' : 'bg-canvas text-ink-3')}
                  >
                    {freqHelpers.weekLabel(n)}
                  </button>
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
                {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => toggleDay(n)}
                    className={cn('aspect-square min-h-9 rounded-full px-1 mono-num font-extrabold text-[12px] transition-all', plan.freqDays.includes(n) ? 'bg-ink-1 text-white shadow-sm' : 'bg-canvas text-ink-3')}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-ink-4 mt-2 leading-snug">Ngày 29–31 nếu tháng không có sẽ chạy vào ngày cuối tháng.</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-end justify-between">
          <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">Thời gian</div>
          <span className="text-[11px] text-ink-3 font-bold mono-num">{plan.duration ? `${plan.duration} năm` : 'không giới hạn'}</span>
        </div>
        <div className="bg-canvas rounded-full p-1 flex mt-2.5">
          <button onClick={() => setPlan({ ...plan, duration: null })} data-active={plan.duration === null} className="seg-option flex-1">Liên tục</button>
          <button onClick={() => setPlan({ ...plan, duration: plan.duration || 5 })} data-active={plan.duration !== null} className="seg-option flex-1">Có thời hạn</button>
        </div>
        {plan.duration !== null && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setPlan({ ...plan, duration: y })}
                className={cn('min-h-11 rounded-full border-2 text-[12px] font-extrabold transition-all', plan.duration === y ? 'border-grass-500 bg-grass-50 text-grass-800 shadow-sm' : 'border-gray-200 bg-canvas text-ink-3 hover:border-grass-300 hover:bg-white')}
              >
                {y} năm
              </button>
            ))}
          </div>
        )}
        {plan.duration === null && <div className="mt-2.5 text-[11px] text-ink-4 leading-snug">DCA không giới hạn — bạn có thể dừng bất kỳ lúc nào trong app.</div>}
      </div>

      <div className="rounded-2xl p-4 relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #047857 0%, #064E3B 60%, #052e16 100%)' }}>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-6 right-12 h-px opacity-40" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }} />
        <div className="relative">
          <div className="text-[10px] font-extrabold tracking-[0.14em] uppercase opacity-75">{plan.duration ? `Tổng vốn ${plan.duration} năm` : 'Tổng vốn mỗi năm'}</div>
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
