'use client'

import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { valueToStage } from '@/lib/utils'
import Sapling from '@/components/sapling/Sapling'

export default function StreakBanner() {
  const { streak, totalValue } = useAppStore(useShallow(s => ({
    streak: s.streak,
    totalValue: s.totalValue,
  })))

  return (
    <div className="px-4 pb-2">
      <div
        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 border"
        style={{
          background: 'linear-gradient(135deg, #FFF4E5, #FFE3CC)',
          borderColor: '#FFD7B2',
        }}
      >
        <span className="text-xl">🔥</span>
        <div className="flex-1">
          <div className="font-black text-[15px]" style={{ color: '#C2410C' }}>
            {streak} tháng streak
          </div>
          <div className="text-[11px] font-bold" style={{ color: '#9A3412' }}>
            Cứ đều đặn nhé!
          </div>
        </div>
        <Sapling stage={valueToStage(totalValue)} size={44} withPot />
      </div>
    </div>
  )
}
