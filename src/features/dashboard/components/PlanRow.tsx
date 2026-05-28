import { useAppStore } from '@/lib/store'
import { fmtVND, fmtPct, freqHelpers } from '@/lib/utils'
import type { Plan, AppAction } from '@/lib/types'

interface PlanRowProps {
  plan: Plan
  dispatch: (action: AppAction) => void
}

export default function PlanRow({ plan, dispatch }: PlanRowProps) {
  const assets = useAppStore(s => s.assets)
  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]))
  const ret = plan.currentValue - plan.totalInvested
  const retPct = plan.totalInvested > 0 ? (ret / plan.totalInvested) * 100 : 0
  const allocAssets = plan.allocation
    .map(a => assetMap[a.id])
    .filter(Boolean)

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer hover:bg-canvas transition-colors"
      onClick={() => dispatch({ type: 'go', screen: 'planDetail', planId: plan.id })}
    >
      {/* Emoji */}
      <div className="w-12 h-12 rounded-2xl brand-soft grid place-items-center text-2xl flex-shrink-0">
        {plan.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-[14px] truncate">{plan.name}</div>
        <div className="flex items-center gap-1.5 mt-1 text-[12px] text-ink-3 font-bold">
          <span className="whitespace-nowrap">
            {fmtVND(plan.amount)}
            {(() => {
              const c = freqHelpers.timesPerCycle(plan)
              return c > 1 ? ` × ${c}` : ''
            })()}/{freqHelpers.unitLabelShort(plan)}
          </span>
          <span className="text-ink-4">·</span>
          <div className="flex" style={{ gap: 2 }}>
            {allocAssets.slice(0, 4).map((a, i) => (
              <div key={a.id} className="w-4 h-4 rounded-md border-2 border-white"
                style={{ background: a.color, marginLeft: i ? -6 : 0 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="text-right flex-shrink-0">
        <div className="mono-num font-black text-[13px] text-ink-1 whitespace-nowrap">
          {fmtVND(plan.currentValue)}
        </div>
        <div className={`text-[11px] font-bold whitespace-nowrap ${ret >= 0 ? 'text-grass-600' : 'text-red-500'}`}>
          {ret >= 0 ? '↑' : '↓'} {fmtPct(retPct)}
        </div>
      </div>
    </div>
  )
}
