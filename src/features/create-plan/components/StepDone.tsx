'use client'

import Confetti from '@/components/ui/Confetti'
import Sapling from '@/components/sapling/Sapling'
import Button from '@/components/ui/Button'
import type { AppAction } from '@/lib/types'
import type { PlanDraft } from './types'

export default function StepDone({
  plan,
  dispatch,
  isEditing = false,
  planId,
}: {
  plan: PlanDraft
  dispatch: (a: AppAction) => void
  isEditing?: boolean
  planId?: string
}) {
  return (
    <>
      <Confetti />
      <div className="fade-up bg-gradient-to-b from-grass-50 to-white rounded-2xl shadow-card p-8 text-center">
        <div className="inline-block" style={{ animation: 'pop 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <Sapling stage={1} size={140} animated />
        </div>
        <div className="text-3xl font-black text-grass-800 tracking-tight mt-2">
          {isEditing ? 'Đã cập nhật!' : 'Tuyệt vời! 🎉'}
        </div>
        <div className="text-[15px] text-ink-3 mt-3 leading-relaxed">
          {isEditing ? (
            <>
              Kế hoạch <strong className="text-ink-1">"{plan.name || 'DCA mới'}"</strong> đã được lưu với thông tin mới.
            </>
          ) : (
            <>
              Bạn vừa gieo hạt giống <strong className="text-ink-1">"{plan.name || 'DCA mới'}"</strong>. Cứ chăm sóc đều đặn, cây sẽ lớn dần theo tháng năm.
            </>
          )}
        </div>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={() => dispatch({ type: 'go', screen: isEditing ? 'planDetail' : 'dashboard', planId })}
          >
            {isEditing ? 'Xem chi tiết' : 'Về Dashboard'}
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'go', screen: 'history' })}>Xem lịch sử →</Button>
        </div>
      </div>
    </>
  )
}
