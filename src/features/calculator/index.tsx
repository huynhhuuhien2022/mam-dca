'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { fmtVND, fmtPct, cn } from '@/lib/utils'
import AssetLogo from '@/components/ui/AssetLogo'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Icon3D from '@/components/icons/Icon3D'
import type { Freq } from '@/lib/types'

const AMOUNT_CHIPS = [500_000, 1_000_000, 2_000_000, 5_000_000]

function calcFV(amount: number, freq: Freq, years: number, cagr: number) {
  const ppy = freq === 'day' ? 250 : freq === 'week' ? 52 : 12
  const r = cagr / 100 / ppy
  const n = ppy * years
  if (r === 0) return amount * n
  return amount * ((Math.pow(1 + r, n) - 1) / r)
}

export default function Calculator() {
  const dispatch = useAppStore(s => s.dispatch)
  const assets = useAppStore(s => s.assets)
  const [amount, setAmount] = useState(2_000_000)
  const [years, setYears]   = useState(5)
  const [freq, setFreq]     = useState<Freq>('month')
  const [assetId, setAssetId] = useState('')

  const asset = assets.find(a => a.id === assetId) ?? assets[0]
  if (!asset) return <div className="py-8 text-center text-ink-3 font-semibold">Chưa có dữ liệu tài sản từ Supabase</div>
  const ppy = freq === 'day' ? 250 : freq === 'week' ? 52 : 12

  const { fv, invested, profit, multiple, snapshots } = useMemo(() => {
    const fv = calcFV(amount, freq, years, asset.y5)
    const invested = amount * ppy * years
    const profit = fv - invested
    const multiple = invested > 0 ? fv / invested : 0
    const snapshots = Array.from({ length: years }, (_, i) => {
      const y = i + 1
      return { year: y, invested: amount * ppy * y, value: calcFV(amount, freq, y, asset.y5) }
    })
    return { fv, invested, profit, multiple, snapshots }
  }, [amount, freq, years, asset, ppy])

  const top4 = useMemo(() => [...assets].sort((a, b) => b.y5 - a.y5).slice(0, 4), [])

  return (
    <div className="fade-up pb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-black tracking-tight">Mô phỏng FOMO ✨</div>
          <div className="text-ink-3 mt-1 text-sm">"Giá như hồi đó mình DCA..." — xem hôm nay bạn sẽ có bao nhiêu</div>
        </div>
        <Icon3D name="sparkle" size={44} />
      </div>

      <div className="flex flex-col gap-4 mt-5">
        {/* Input card */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="text-[15px] font-bold">Nếu hồi đó bạn DCA...</div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-ink-2 mb-1.5 block">Số tiền mỗi kỳ</label>
            <input
              className="mono-num w-full bg-white border-2 border-gray-100 rounded-2xl px-3.5 py-3 text-xl font-black outline-none focus:border-grass-500"
              value={amount.toLocaleString('vi-VN')}
              onChange={e => setAmount(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
            />
            <div className="flex gap-1.5 flex-wrap mt-2">
              {AMOUNT_CHIPS.map(a => (
                <Chip key={a} active={amount === a} onClick={() => setAmount(a)}>{fmtVND(a)}</Chip>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-ink-2 mb-1.5 block">Tần suất</label>
            <div className="flex gap-1.5 flex-wrap">
              {(['day','week','month'] as Freq[]).map(f => (
                <Chip key={f} active={freq === f} onClick={() => setFreq(f)}>
                  {{ day: 'Ngày', week: 'Tuần', month: 'Tháng' }[f]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-ink-2 mb-1.5 block">Trong vòng (năm)</label>
            <input type="range" min="1" max="10" value={years}
              onChange={e => setYears(parseInt(e.target.value))}
              className="w-full accent-grass-500"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-ink-3 font-semibold">1 năm</span>
              <span className="mono-num text-2xl font-black text-grass-500">{years} năm</span>
              <span className="text-[11px] text-ink-3 font-semibold">10 năm</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-ink-2 mb-1.5 block">Vào tài sản nào?</label>
            <select value={assetId} onChange={e => setAssetId(e.target.value)}
              className="w-full bg-white border-2 border-gray-100 rounded-2xl px-3.5 py-3 font-semibold outline-none focus:border-grass-500"
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.id} — {a.name} ({a.y5.toFixed(1)}%/y)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Output hero card */}
        <div className="rounded-3xl p-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #052e16 0%, #064E3B 40%, #047857 100%)' }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)' }} />

          <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-grass-300">Hôm nay bạn sẽ có</div>
          <div className="mono-num text-4xl font-black tracking-tight mt-2 break-all">{fmtVND(fv)}</div>

          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-grass-300/25 border border-grass-300/35 text-grass-200 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap">
              ↑ {fmtVND(profit)} lãi
            </span>
            <span className="inline-flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/40 text-yellow-100 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap">
              ×{multiple.toFixed(2)} vốn
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-3">
              <div className="text-[11px] text-grass-300 font-bold">Đã đầu tư</div>
              <div className="mono-num font-black text-[18px] text-white mt-1">{fmtVND(invested)}</div>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-3">
              <div className="text-[11px] text-grass-300 font-bold">CAGR sử dụng</div>
              <div className="mono-num font-black text-[18px] text-white mt-1">{asset.y5.toFixed(1)}%/y</div>
            </div>
          </div>

          {/* Year bars */}
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-grass-300 mb-3">Tăng trưởng theo năm</div>
            <div className="flex items-end gap-1.5 h-20">
              {snapshots.map(s => {
                const max = snapshots[snapshots.length - 1].value || 1
                return (
                  <div key={s.year} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-md relative overflow-hidden"
                      style={{ height: `${(s.value / max) * 100}%`, background: 'linear-gradient(180deg, #86EFAC, #22C55E)', minHeight: 4, transformOrigin: 'bottom', animation: `bar-grow 0.5s cubic-bezier(0.34,1.2,0.64,1) ${s.year * 0.07}s both` }}
                    >
                      <div className="absolute bottom-0 inset-x-0 bg-white/20 rounded-b-sm"
                        style={{ height: `${(s.invested / s.value) * 100}%` }} />
                    </div>
                    <div className="text-[10px] text-grass-300 font-bold">Y{s.year}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <Button variant="magic" size="lg" className="w-full mt-5"
            onClick={() => dispatch({ type: 'go', screen: 'create', prefill: { amount, freq, allocation: [{ id: asset.id as import('@/lib/types').Asset['id'], pct: 100 }] } })}
          >
            Bắt đầu DCA ngay 🚀
          </Button>
        </div>

        {/* Comparison grid */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="text-[15px] font-bold">So sánh tài sản khác</div>
          <div className="text-[12px] text-ink-3 mt-1">
            Cùng {fmtVND(amount)} / {{ day: 'ngày', week: 'tuần', month: 'tháng' }[freq]} trong {years} năm
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {top4.map(a => {
              const fv2 = calcFV(amount, freq, years, a.y5)
              return (
                <button key={a.id} onClick={() => setAssetId(a.id)}
                  className={cn('min-h-[74px] p-3.5 rounded-2xl border-2 text-left transition-all',
                    assetId === a.id ? 'border-grass-500 bg-grass-50' : 'border-gray-100 bg-white hover:border-grass-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <AssetLogo asset={a} size={28} />
                    <div className="min-w-0">
                      <div className="font-extrabold text-[13px]">{a.id}</div>
                      <div className="text-[10px] text-ink-3">{a.y5.toFixed(1)}%/y</div>
                    </div>
                  </div>
                  <div className="mono-num font-black text-[15px] text-grass-700 mt-2">{fmtVND(fv2)}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
