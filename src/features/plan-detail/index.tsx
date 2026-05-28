'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { fmtPct, fmtVND, fmtVNDfull, freqHelpers, projectValue } from '@/lib/utils'
import AssetLogo from '@/components/ui/AssetLogo'
import Button from '@/components/ui/Button'
import DonutAllocation from '@/components/charts/DonutAllocation'
import RiskBadge from '@/components/ui/RiskBadge'
import type { Plan } from '@/lib/types'

function findNextDueDate(plan: Plan): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)

  for (let i = 0; i < 370; i++) {
    const dow = d.getDay() === 0 ? 7 : d.getDay()
    const days = plan.freqDays.length ? plan.freqDays : [1]
    const ok =
      plan.freq === 'day'
        ? dow >= 1 && dow <= 5
        : plan.freq === 'week'
          ? days.includes(dow)
          : days.includes(d.getDate())

    if (ok) return new Date(d)
    d.setDate(d.getDate() + 1)
  }

  return new Date()
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function PlanDetail() {
  const { planId, plans, assets, dispatch } = useAppStore(useShallow((s) => ({
    planId: s.planId,
    plans: s.plans,
    assets: s.assets,
    dispatch: s.dispatch,
  })))

  const plan = useMemo(() => plans.find((p) => p.id === planId) ?? null, [planId, plans])
  const assetMap = useMemo(() => Object.fromEntries(assets.map((a) => [a.id, a])), [assets])

  if (!plan) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-grass-50 text-3xl">🌱</div>
        <div className="mt-4 text-[18px] font-black">Không tìm thấy kế hoạch</div>
        <div className="mt-1 text-[13px] font-semibold text-ink-3">
          Kế hoạch có thể đã được xoá hoặc dữ liệu chưa tải xong.
        </div>
        <Button className="mt-5" onClick={() => dispatch({ type: 'go', screen: 'dashboard' })}>
          Về tổng quan
        </Button>
      </div>
    )
  }

  const allocations = plan.allocation.map((a) => ({
    ...a,
    asset: assetMap[a.id],
    amount: Math.round((plan.amount * a.pct) / 100),
  }))
  const ret = plan.currentValue - plan.totalInvested
  const retPct = plan.totalInvested > 0 ? (ret / plan.totalInvested) * 100 : 0
  const periods = freqHelpers.periodsPerYear(plan)
  const weightedReturn = allocations.reduce((sum, item) => sum + (((item.asset?.y5 ?? 7) * item.pct) / 100), 0)
  const horizonYears = plan.duration ?? 10
  const projected = projectValue(plan.amount, periods, horizonYears, weightedReturn)
  const nextDue = findNextDueDate(plan)
  const createdAt = plan.createdAt ? new Date(plan.createdAt) : null

  return (
    <div className="px-4 pb-6 pt-4">
      <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0F3D25_0%,#1F8A4C_62%,#6EE7A8_100%)] p-5 text-white shadow-cta">
        <div className="flex items-start gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/16 text-3xl shadow-sm">
            {plan.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[22px] font-black leading-tight tracking-tight">{plan.name}</div>
            <div className="mt-1 text-[12px] font-semibold text-white/75">
              {freqHelpers.description(plan)}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/65">Giá trị hiện tại</div>
          <div className="mono-num mt-1 text-[30px] font-black tracking-tight">{fmtVNDfull(plan.currentValue)}</div>
          <div className="mt-1 inline-flex rounded-full bg-white/14 px-3 py-1 text-[12px] font-extrabold">
            {ret >= 0 ? '↑' : '↓'} {fmtVND(ret)} · {fmtPct(retPct)}
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-3">DCA mỗi kỳ</div>
          <div className="mono-num mt-1 text-[18px] font-black">{fmtVNDfull(plan.amount)}</div>
          <div className="mt-1 text-[11px] font-semibold text-ink-3">{freqHelpers.cadenceSummary(plan)}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-3">Đã đầu tư</div>
          <div className="mono-num mt-1 text-[18px] font-black">{fmtVNDfull(plan.totalInvested)}</div>
          <div className="mt-1 text-[11px] font-semibold text-ink-3">Kỳ tới {formatDate(nextDue)}</div>
        </div>
      </section>

      <section className="mt-4 rounded-[24px] bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[17px] font-black">Phân bổ tài sản</div>
            <div className="mt-1 text-[12px] font-semibold text-ink-3">
              {allocations.length} mã trong kế hoạch này
            </div>
          </div>
          <div className="relative grid h-[92px] w-[92px] place-items-center">
            <DonutAllocation
              size={92}
              stroke={13}
              items={allocations.map((item) => ({
                pct: item.pct,
                color: item.asset?.color ?? '#16A34A',
              }))}
            />
            <div className="absolute text-[11px] font-black text-grass-700">100%</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {allocations.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => dispatch({ type: 'go', screen: 'detail', assetId: item.id })}
              className="flex items-center gap-3 rounded-2xl bg-canvas p-3 text-left active:scale-[0.99]"
            >
              {item.asset ? (
                <AssetLogo asset={item.asset} size={42} />
              ) : (
                <div className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-grass-100 font-black text-grass-700">
                  {item.id.slice(0, 3)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-black text-[13px]">{item.id}</div>
                  {item.asset ? <RiskBadge risk={item.asset.risk} /> : null}
                </div>
                <div className="mt-0.5 truncate text-[11px] font-semibold text-ink-3">
                  {item.asset?.name ?? 'Tài sản'} · {fmtVNDfull(item.amount)} / kỳ
                </div>
              </div>
              <div className="mono-num text-right text-[14px] font-black text-grass-700">
                {item.pct}%
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[24px] bg-white p-4 shadow-card">
        <div className="text-[17px] font-black">Thông tin vận hành</div>
        <div className="mt-3 divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3">
            <span className="text-[13px] font-bold text-ink-3">Ngày tạo</span>
            <span className="text-[13px] font-black">{createdAt ? formatDate(createdAt) : 'Chưa có'}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[13px] font-bold text-ink-3">Thời hạn</span>
            <span className="text-[13px] font-black">{plan.duration ? `${plan.duration} năm` : 'Liên tục'}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[13px] font-bold text-ink-3">Số kỳ/năm</span>
            <span className="mono-num text-[13px] font-black">{periods}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[13px] font-bold text-ink-3">Dự phóng {horizonYears} năm</span>
            <span className="mono-num text-[13px] font-black text-grass-700">{fmtVND(projected)}</span>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <Button
          variant="soft"
          className="w-full"
          onClick={() => dispatch({ type: 'go', screen: 'planHistory', planId: plan.id })}
        >
          Lịch sử
        </Button>
      </div>
    </div>
  )
}
