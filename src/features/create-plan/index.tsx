'use client'

import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Button from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import Stepper from './components/Stepper'
import StepGoal from './components/StepGoal'
import StepAssets from './components/StepAssets'
import StepReview from './components/StepReview'
import StepDone from './components/StepDone'
import type { PlanDraft } from './components/types'

export default function CreatePlan() {
  const { dispatch, auth, prefill, assets } = useAppStore(
    useShallow((s) => ({
      dispatch: s.dispatch,
      auth: s.auth,
      prefill: s.prefill,
      assets: s.assets,
    })),
  )
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
    (step === 1 && plan.allocation.length > 0 && Math.abs(plan.allocation.reduce((s, a) => s + a.pct, 0) - 100) < 0.01) ||
    step === 2

  function handleNext() {
    if (step === 2) {
      if (!auth) {
        dispatch({
          type: 'requireAuth',
          pending: {
            type: 'addPlan',
            plan: { ...plan, freqDays: plan.freqDays.length ? plan.freqDays : [1] },
          },
        })
        return
      }

      dispatch({ type: 'addPlan', plan: { ...plan, freqDays: plan.freqDays.length ? plan.freqDays : [1] } })
    }

    setStep((s) => Math.min(3, s + 1))
  }

  return (
    <div className="fade-up pb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'go', screen: 'dashboard' })}>
          ← Hủy
        </Button>
        <Stepper step={step} />
      </div>

      {step === 0 && <StepGoal plan={plan} setPlan={setPlan} />}
      {step === 1 && <StepAssets plan={plan} setPlan={setPlan} assets={assets} />}
      {step === 2 && <StepReview plan={plan} assets={assets} />}
      {step === 3 && <StepDone plan={plan} dispatch={dispatch} />}

      {step < 3 && (
        <div className="flex items-center justify-between mt-5 gap-2">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              ← Quay lại
            </Button>
          ) : (
            <span />
          )}
          <Button size="lg" disabled={!canNext} className={cn('flex-1', !canNext ? 'opacity-50 cursor-not-allowed' : '')} onClick={handleNext}>
            {step === 2 ? (auth ? 'Bắt đầu DCA ✨' : 'Đăng nhập để bắt đầu →') : 'Tiếp theo →'}
          </Button>
        </div>
      )}
    </div>
  )
}
