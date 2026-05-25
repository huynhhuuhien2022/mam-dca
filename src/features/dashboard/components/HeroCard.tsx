'use client'

import Sparkline from '@/components/charts/Sparkline'
import Sapling from '@/components/sapling/Sapling'
import Button from '@/components/ui/Button'
import Icon3D from '@/components/icons/Icon3D'
import { fmtVNDfull, fmtVND, fmtPct, STAGE_LABELS } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'
import type { AppAction } from '@/lib/types'

interface HeroLayoutAProps {
  totalValue: number
  profit: number
  profitPct: number
  stage: 0 | 1 | 2 | 3 | 4
  chartData: number[]
  dispatch: (action: AppAction) => void
}

export function HeroLayoutA({ totalValue, profit, profitPct, stage, chartData, dispatch }: HeroLayoutAProps) {
  const animValue  = useCountUp(totalValue, 1000)
  const animProfit = useCountUp(Math.abs(profit), 1000, 120)
  return (
    <div className="hero-gradient text-white rounded-3xl p-4 relative overflow-hidden">
      {/* Gold halo */}
      <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)' }} />
      {/* Top specular */}
      <div className="absolute top-0 left-8 right-16 h-px opacity-40 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }} />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] font-extrabold text-grass-300">
              Tổng giá trị danh mục
            </div>
            <div className="mono-num text-[26px] font-black tracking-tight mt-1 leading-none">
              {fmtVNDfull(animValue)}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="inline-flex items-center gap-1 bg-white/[0.12] border border-white/[0.15] px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                style={{ color: profit >= 0 ? '#86EFAC' : '#FCA5A5' }}>
                {profit >= 0 ? '↑' : '↓'} {fmtVND(animProfit)} · {fmtPct(profitPct)}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 -mt-2 -mr-1 text-center">
            <div className="rounded-2xl px-1.5 py-1"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(4px)' }}>
              <Sapling stage={stage} size={104} />
            </div>
            <div className="text-[9px] font-extrabold text-grass-300 tracking-[0.12em] uppercase mt-1">
              {STAGE_LABELS[stage]}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="-mx-1 mt-3 -mb-1">
          <Sparkline data={chartData} color="#86EFAC" width={600} height={56} fill />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button variant="white" size="md"
            onClick={() => dispatch({ type: 'go', screen: 'create' })}
            className="flex-1 min-w-0">
            <Icon3D name="plus" size={18} /> <span className="truncate">Tạo kế hoạch</span>
          </Button>
          <Button size="md"
            onClick={() => dispatch({ type: 'go', screen: 'calc' })}
            className="bg-white/[0.15] text-white border border-white/20 hover:bg-white/20 shadow-none rounded-full">
            <Icon3D name="sparkle" size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function HeroLayoutB({ totalValue, profit, profitPct, stage, chartData, dispatch }: HeroLayoutAProps) {
  const animValue = useCountUp(totalValue, 1000)
  return (
    <div className="grid grid-cols-[1.5fr_1fr] gap-2">
      <div className="hero-gradient text-white rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)' }} />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.14em] font-extrabold text-grass-300">Tổng danh mục</div>
          <div className="mono-num text-[22px] font-black tracking-tight mt-1 leading-none">
            {fmtVNDfull(animValue)}
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 bg-white/[0.12] border border-white/[0.15] px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{ color: profit >= 0 ? '#86EFAC' : '#FCA5A5' }}>
              {profit >= 0 ? '↑' : '↓'} {fmtPct(profitPct)}
            </span>
          </div>
          <div className="mt-2 -mx-1 -mb-1">
            <Sparkline data={chartData} color="#86EFAC" width={300} height={48} fill />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-3 flex flex-col items-center justify-center text-center"
        style={{ background: 'linear-gradient(180deg, #F0FDF4, #DCFCE7)' }}>
        <Sapling stage={stage} size={64} />
        <div className="text-[9px] font-extrabold text-grass-700 tracking-[0.12em] uppercase mt-1">
          {STAGE_LABELS[stage]}
        </div>
      </div>
    </div>
  )
}
