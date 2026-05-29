'use client'

import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Button from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Stepper from './components/Stepper'
import StepGoal from './components/StepGoal'
import StepAssets from './components/StepAssets'
import StepReview from './components/StepReview'
import StepDone from './components/StepDone'
import type { PlanDraft } from './components/types'

export default function CreatePlan() {
  const { dispatch, auth, prefill, assets, planId } = useAppStore(
    useShallow((s) => ({
      dispatch: s.dispatch,
      auth: s.auth,
      prefill: s.prefill,
      assets: s.assets,
      planId: s.planId,
    })),
  )
  const initial = prefill ?? {}
  const initialDraft = initial as Partial<PlanDraft>
  const editPlanId = initial.id ?? planId ?? undefined
  const isEditing = Boolean(initial.id)
  const initialDuration = Object.prototype.hasOwnProperty.call(initial, 'duration')
    ? initialDraft.duration ?? null
    : 5

  const [step, setStep] = useState(0)
  const [savingPlan, setSavingPlan] = useState(false)
  const [plan, setPlan] = useState<PlanDraft>({
    name: initialDraft.name ?? '',
    emoji: initialDraft.emoji ?? '🌱',
    amount: initialDraft.amount ?? 2_000_000,
    freq: initialDraft.freq ?? 'month',
    freqDays: initialDraft.freqDays ?? [1],
    duration: initialDuration,
    allocation: initialDraft.allocation ?? [],
  })

  const canNext =
    (step === 0 && plan.name.trim().length > 0 && plan.amount > 0) ||
    (step === 1 && plan.allocation.length > 0 && Math.abs(plan.allocation.reduce((s, a) => s + a.pct, 0) - 100) < 0.01) ||
    step === 2

  async function handleNext() {
    if (step === 2) {
      if (!auth) {
        if (isEditing) {
          dispatch({ type: 'showToast', toast: { message: 'Vui lòng đăng nhập để chỉnh sửa kế hoạch', icon: '!' } })
          return
        }

        dispatch({
          type: 'requireAuth',
          pending: {
            type: 'addPlan',
            plan: { ...plan, freqDays: plan.freqDays.length ? plan.freqDays : [1] },
          },
        })
        return
      }

      try {
        setSavingPlan(true)
        const safePlan = { ...plan, freqDays: plan.freqDays.length ? plan.freqDays : [1] }
        const supabase = getSupabaseClient()
        const { data: userRes, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userRes.user) {
          dispatch({ type: 'showToast', toast: { message: 'Phiên đăng nhập không hợp lệ', icon: '!' } })
          return
        }

        if (isEditing) {
          if (!editPlanId) {
            dispatch({ type: 'showToast', toast: { message: 'Không tìm thấy kế hoạch để cập nhật', icon: '!' } })
            return
          }

          const { data: updatedPlan, error: planErr } = await supabase
            .from('user_plans')
            .update({
              name: safePlan.name,
              emoji: safePlan.emoji,
              amount: safePlan.amount,
              freq: safePlan.freq,
              freq_days: safePlan.freqDays,
              duration_years: safePlan.duration,
              updated_at: new Date().toISOString(),
            })
            .eq('id', editPlanId)
            .select('id')
            .single()

          if (planErr || !updatedPlan) {
            dispatch({ type: 'showToast', toast: { message: 'Không thể cập nhật kế hoạch', icon: '!' } })
            return
          }

          const allocations = safePlan.allocation.map((a, i) => ({
            plan_id: editPlanId,
            asset_symbol: a.id,
            pct: a.pct,
            position: i,
          }))

          const { error: upsertErr } = await supabase
            .from('user_plan_allocations')
            .upsert(allocations, { onConflict: 'plan_id,asset_symbol' })

          if (upsertErr) {
            dispatch({ type: 'showToast', toast: { message: 'Không thể lưu phân bổ kế hoạch', icon: '!' } })
            return
          }

          const keepSymbols = safePlan.allocation.map((a) => a.id)
          const { error: deleteErr } = await supabase
            .from('user_plan_allocations')
            .delete()
            .eq('plan_id', editPlanId)
            .not('asset_symbol', 'in', `(${keepSymbols.join(',')})`)

          if (deleteErr) {
            dispatch({ type: 'showToast', toast: { message: 'Không thể xoá phân bổ cũ', icon: '!' } })
            return
          }

          dispatch({ type: 'updatePlan', id: editPlanId, plan: safePlan })
          setStep((s) => Math.min(3, s + 1))
          return
        }

        const { data: planRow, error: planErr } = await supabase
          .from('user_plans')
          .insert({
            user_id: userRes.user.id,
            name: safePlan.name,
            emoji: safePlan.emoji,
            amount: safePlan.amount,
            freq: safePlan.freq,
            freq_days: safePlan.freqDays,
            duration_years: safePlan.duration,
          })
          .select('id')
          .single()

        if (planErr || !planRow) {
          dispatch({ type: 'showToast', toast: { message: 'Không thể tạo kế hoạch', icon: '!' } })
          return
        }

        const allocations = safePlan.allocation.map((a, i) => ({
          plan_id: planRow.id,
          asset_symbol: a.id,
          pct: a.pct,
          position: i,
        }))

        const { error: allocErr } = await supabase
          .from('user_plan_allocations')
          .insert(allocations)

        if (allocErr) {
          await supabase.from('user_plans').delete().eq('id', planRow.id)
          dispatch({ type: 'showToast', toast: { message: 'Không thể lưu phân bổ kế hoạch', icon: '!' } })
          return
        }

        dispatch({ type: 'addPlan', id: planRow.id, plan: safePlan })
      } catch {
        dispatch({ type: 'showToast', toast: { message: isEditing ? 'Không thể cập nhật kế hoạch' : 'Không thể tạo kế hoạch', icon: '!' } })
        return
      } finally {
        setSavingPlan(false)
      }
    }

    setStep((s) => Math.min(3, s + 1))
  }

  return (
    <div className="fade-up px-4 pt-4 pb-6">
      <div className="mb-4 flex justify-end">
        <Stepper step={step} />
      </div>

      {step === 0 && <StepGoal plan={plan} setPlan={setPlan} />}
      {step === 1 && <StepAssets plan={plan} setPlan={setPlan} assets={assets} />}
      {step === 2 && <StepReview plan={plan} assets={assets} />}
      {step === 3 && <StepDone plan={plan} dispatch={dispatch} isEditing={isEditing} planId={editPlanId} />}

      {step < 3 && (
        <div className="flex items-center justify-between mt-5 gap-2">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              ← Quay lại
            </Button>
          ) : (
            <span />
          )}
          <Button size="lg" disabled={!canNext || savingPlan} className={cn('flex-1', (!canNext || savingPlan) ? 'opacity-50 cursor-not-allowed' : '')} onClick={handleNext}>
            {step === 2
              ? (savingPlan ? (isEditing ? 'Đang lưu...' : 'Đang tạo...') : isEditing ? 'Lưu thay đổi' : auth ? 'Bắt đầu DCA ✨' : 'Đăng nhập để bắt đầu →')
              : 'Tiếp theo →'}
          </Button>
        </div>
      )}
    </div>
  )
}
