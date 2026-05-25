'use client'

import { useMemo, useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { assets, sparkSeed } from '@/lib/data'
import { fmtVND, fmtPct, valueToStage } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { HeroLayoutA, HeroLayoutB } from './components/HeroCard'
import StatGrid from './components/StatGrid'
import PlanRow from './components/PlanRow'
import MilestonePanel from './components/MilestonePanel'
import AssetRow from './components/AssetRow'
import { HeroSkeleton } from '@/components/ui/Skeleton'

export default function Dashboard({ layout = 'A' }: { layout?: 'A' | 'B' }) {
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])
  const { plans, totalValue, totalInvested, streak, dispatch } = useAppStore(useShallow(s => ({
    plans: s.plans,
    totalValue: s.totalValue,
    totalInvested: s.totalInvested,
    streak: s.streak,
    dispatch: s.dispatch,
  })))

  const profit    = totalValue - totalInvested
  const profitPct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0
  const stage     = valueToStage(totalValue)

  const chartData = useMemo(() => sparkSeed(42, 60, 0.025, 0.008), [])
  const movers    = useMemo(() => [...assets].sort((a, b) => b.ytd - a.ytd).slice(0, 4), [])

  const heroProps = { totalValue, profit, profitPct, stage, chartData, dispatch }

  return (
    <div className="fade-up">
      {loading
        ? <HeroSkeleton />
        : layout === 'A'
          ? <HeroLayoutA {...heroProps} />
          : <HeroLayoutB {...heroProps} />}

      <StatGrid
        totalInvested={totalInvested}
        profit={profit}
        profitPct={profitPct}
        streak={streak}
        fmtVND={fmtVND}
        fmtPct={fmtPct}
      />

      {/* Plans + Milestone */}
      <div className="flex flex-col gap-4 mt-5">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-3">
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight">Kế hoạch DCA</div>
              <div className="text-[13px] text-ink-3 truncate">
                Bạn đang gieo {plans.length} hạt giống 🌱
              </div>
            </div>
            <Button variant="soft" size="sm" onClick={() => dispatch({ type: 'go', screen: 'create' })}>
              + Thêm
            </Button>
          </div>
          <div className="px-2 pb-2 stagger">
            {plans.map(p => <PlanRow key={p.id} plan={p} dispatch={dispatch} />)}
          </div>
        </div>

        <MilestonePanel totalValue={totalValue} />
      </div>

      {/* Top movers */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight">📈 Top tăng trưởng YTD</div>
            <div className="text-[13px] text-ink-3 truncate">Các mã dẫn đầu năm nay</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'go', screen: 'browse' })}>
            Tất cả →
          </Button>
        </div>
        <div className="px-2 pb-2">
          {movers.map(a => <AssetRow key={a.id} asset={a} dispatch={dispatch} />)}
        </div>
      </div>
    </div>
  )
}
