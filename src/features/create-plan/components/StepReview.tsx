'use client'

import AssetLogo from '@/components/ui/AssetLogo'
import { fmtVND, freqHelpers, projectValue } from '@/lib/utils'
import type { Asset } from '@/lib/types'
import type { PlanDraft } from './types'

export default function StepReview({ plan, assets }: { plan: PlanDraft; assets: Asset[] }) {
  const assetMap = Object.fromEntries(assets.map((a) => [a.id, a])) as Record<string, Asset>
  const cagr = plan.allocation.reduce((acc, a) => acc + ((assetMap[a.id]?.y5 ?? 7) * a.pct) / 100, 0)
  const years = plan.duration || 10
  const periods = freqHelpers.periodsPerYear({ freq: plan.freq, freqDays: plan.freqDays })
  const fv = projectValue(plan.amount, periods, years, cagr)
  const invested = plan.amount * periods * years
  const profit = fv - invested

  const proj = Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    invested: plan.amount * periods * y,
    value: y === 0 ? 0 : projectValue(plan.amount, periods, y, cagr),
  }))
  const maxV = proj[proj.length - 1].value || 1

  return (
    <div className="fade-up bg-white rounded-2xl shadow-card p-5">
      <div className="text-2xl font-black tracking-tight">Xem lại kế hoạch 👀</div>
      <div className="text-ink-3 mt-1.5 text-sm">Dự phóng dựa trên lịch sử 5 năm — không phải cam kết tương lai.</div>

      <div className="p-4 bg-canvas rounded-2xl mt-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-grass-50 grid place-items-center text-3xl">{plan.emoji}</div>
          <div>
            <div className="text-[16px] font-bold">{plan.name || 'Kế hoạch DCA'}</div>
            <div className="text-[12px] text-ink-3">{fmtVND(plan.amount)} · {freqHelpers.description({ freq: plan.freq, freqDays: plan.freqDays })}</div>
            <div className="text-[11px] text-ink-4 mt-0.5">{freqHelpers.cadenceSummary({ freq: plan.freq, freqDays: plan.freqDays })} · {plan.duration ? `${plan.duration} năm` : 'liên tục'}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {plan.allocation.map((a) => {
            const asset = assetMap[a.id]
            if (!asset) return null
            return (
              <div key={a.id} className="flex items-center gap-3">
                <AssetLogo asset={asset} size={32} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-bold text-[13px]">{asset.id}</div>
                    <div className="mono-num font-black text-[13px]">{a.pct}%</div>
                  </div>
                  <div className="text-[11px] text-ink-3">{fmtVND((plan.amount * a.pct) / 100)} / kỳ</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-3">Dự phóng sau {years} năm{!plan.duration && ' (mô phỏng)'}</div>
        <div className="mono-num text-3xl font-black text-grass-700 tracking-tight mt-1">{fmtVND(fv)}</div>
        <div className="text-[12px] text-ink-3 mt-1">CAGR dự kiến: {cagr.toFixed(1)}% / năm</div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-canvas rounded-xl p-3">
            <div className="text-[11px] text-ink-3 font-bold">Đã đầu tư</div>
            <div className="mono-num font-black text-[16px] mt-1">{fmtVND(invested)}</div>
          </div>
          <div className="bg-grass-50 rounded-xl p-3">
            <div className="text-[11px] text-grass-700 font-bold">Lợi nhuận</div>
            <div className="mono-num font-black text-[16px] text-grass-800 mt-1">+{fmtVND(profit)}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-3 mb-2.5">Tăng trưởng theo năm</div>
          <div className="flex items-end gap-1.5 h-24">
            {proj.map((p) => (
              <div key={p.year} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-20 flex flex-col justify-end">
                  <div
                    className="rounded-t-lg relative overflow-hidden"
                    style={{
                      height: `${(p.value / maxV) * 100}%`,
                      background: 'linear-gradient(180deg, #4ADE80, #16A34A)',
                      minHeight: p.value > 0 ? 4 : 0,
                      transformOrigin: 'bottom',
                      animation: `bar-grow 0.5s cubic-bezier(0.34,1.2,0.64,1) ${p.year * 0.08}s both`,
                    }}
                  >
                    {p.value > 0 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-b-sm"
                        style={{ height: `${(p.invested / p.value) * 100}%`, background: 'rgba(20,83,45,0.4)' }}
                      />
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-ink-3">Y{p.year}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-[11px] mt-2 text-ink-3 font-semibold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-grass-500 rounded-sm" /> Tăng trưởng</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(20,83,45,0.4)' }} /> Vốn gốc</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[12px] text-amber-900 font-semibold">
        ⚠️ <strong>Lưu ý:</strong> Đây là dự phóng dựa trên lịch sử, không đảm bảo. Chỉ DCA số tiền bạn sẵn sàng đầu tư dài hạn.
      </div>
    </div>
  )
}
