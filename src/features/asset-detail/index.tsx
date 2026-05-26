'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { assets, sparkSeed } from '@/lib/data'
import { fmtVND, fmtPct, projectValue, freqHelpers, shade, cn } from '@/lib/utils'
import AssetLogo from '@/components/ui/AssetLogo'
import RiskBadge from '@/components/ui/RiskBadge'
import AreaChart from '@/components/charts/AreaChart'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Icon3D from '@/components/icons/Icon3D'
import type { Freq } from '@/lib/types'

const CAT_LABEL: Record<string, string> = {
  etf: 'ETF', fund: 'Quỹ mở', stock: 'Cổ phiếu', gold: 'Vàng', savings: 'Tiết kiệm',
}
const RANGES = [
  { id: '1M', label: '1M', len: 30,  trend: 0.005 },
  { id: '3M', label: '3M', len: 90,  trend: 0.005 },
  { id: '6M', label: '6M', len: 120, trend: 0.008 },
  { id: '1Y', label: '1Y', len: 250, trend: 0.01  },
  { id: '5Y', label: '5Y', len: 250, trend: 0.02  },
]
const AMOUNT_CHIPS = [500_000, 1_000_000, 2_000_000, 5_000_000]

function MiniStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-canvas rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-ink-3">{label}</div>
      <div className={cn('mono-num font-black text-[15px] mt-1 whitespace-nowrap',
        positive === true ? 'text-grass-600' : positive === false ? 'text-red-500' : 'text-ink-1'
      )}>{value}</div>
    </div>
  )
}

export default function AssetDetail() {
  const { assetId, dispatch, auth } = useAppStore(useShallow(s => ({ assetId: s.assetId, dispatch: s.dispatch, auth: s.auth })))

  const asset = useMemo(() => assets.find(a => a.id === assetId) ?? assets[0], [assetId])

  const [range, setRange]   = useState('1Y')
  const [amount, setAmount] = useState(1_000_000)
  const [freq, setFreq]     = useState<Freq>('month')

  const chartData = useMemo(() => {
    const r = RANGES.find(x => x.id === range) ?? RANGES[3]
    const seed = asset.id.charCodeAt(0) * 13
    const vol = asset.cat === 'stock' ? 0.04 : 0.02
    return sparkSeed(seed, r.len, vol, (asset.y5 / 100) * r.trend)
  }, [asset, range])

  const { fv, invested } = useMemo(() => {
    const periods = freqHelpers.periodsPerYear({ freq, freqDays: [1] })
    const fv = projectValue(amount, periods, 5, asset.y5)
    const invested = amount * periods * 5
    return { fv, invested }
  }, [amount, freq, asset.y5])

  function startDCA() {
    const prefill = { allocation: [{ id: asset.id, pct: 100 }], amount, freq }
    if (!auth) {
      dispatch({ type: 'requireAuth', pending: { type: 'go', screen: 'create', prefill } })
    } else {
      dispatch({ type: 'go', screen: 'create', prefill })
    }
  }

  return (
    <div className="fade-up pb-4">
      <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'go', screen: 'browse' })}>
        ← Quay lại
      </Button>

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-card p-5 mt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <AssetLogo asset={asset} size={64} />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="text-2xl font-black tracking-tight">{asset.id}</div>
                <RiskBadge risk={asset.risk} />
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-canvas text-ink-3 border border-gray-100">
                  {CAT_LABEL[asset.cat]}
                </span>
              </div>
              <div className="text-ink-3 mt-1 text-[13px]">{asset.name} · {asset.mgr}</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {asset.tags.map(t => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap"
                    style={{ background: asset.color + '18', borderColor: asset.color + '33', color: shade(asset.color, -30) }}
                  >{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-ink-3">Trung bình 5 năm</div>
            <div className="mono-num text-2xl font-black tracking-tight mt-1" style={{ color: shade(asset.color, -25) }}>
              {asset.y5.toFixed(1)}<span className="text-[15px] ml-0.5">% / năm</span>
            </div>
            <div className={cn('text-[13px] font-extrabold', asset.ytd >= 0 ? 'text-grass-600' : 'text-red-500')}>
              {asset.ytd >= 0 ? '↑' : '↓'} YTD {fmtPct(asset.ytd)}
            </div>
          </div>
        </div>

        {/* Range chips */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {RANGES.map(r => (
            <Chip key={r.id} active={range === r.id} onClick={() => setRange(r.id)}>{r.label}</Chip>
          ))}
        </div>

        <div className="mt-3">
          <AreaChart data={chartData} color={asset.color} height={200} />
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <MiniStat label="YTD" value={fmtPct(asset.ytd)} positive={asset.ytd >= 0} />
          <MiniStat label="3 năm CAGR" value={fmtPct(asset.y3, false)} positive={asset.y3 >= 0} />
          <MiniStat label="5 năm CAGR" value={fmtPct(asset.y5, false)} positive={asset.y5 >= 0} />
          <MiniStat label="Mức rủi ro" value={asset.risk} />
        </div>
      </div>

      {/* Quick DCA simulator */}
      <div className="bg-gradient-to-b from-white to-canvas rounded-2xl shadow-card p-5 mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[18px] font-bold tracking-tight">Mô phỏng nhanh DCA</div>
            <div className="text-ink-3 text-[12px] mt-1">Xem nếu bạn DCA mã này, sau 5 năm sẽ ra sao</div>
          </div>
          <Icon3D name="sparkle" size={36} />
        </div>

        <div className="grid grid-cols-1 gap-5 mt-5">
          <div>
            <label className="text-[12px] font-bold text-ink-2 mb-1.5 block">Số tiền mỗi kỳ</label>
            <input
              className="mono-num w-full bg-white border-2 border-gray-100 rounded-xl px-3.5 py-3 text-[18px] font-black outline-none focus:border-grass-500"
              value={amount.toLocaleString('vi-VN')}
              onChange={e => setAmount(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {AMOUNT_CHIPS.map(a => (
                <Chip key={a} active={amount === a} onClick={() => setAmount(a)}>{fmtVND(a)}</Chip>
              ))}
            </div>

            <label className="text-[12px] font-bold text-ink-2 mb-1.5 mt-4 block">Tần suất</label>
            <div className="flex gap-2 flex-wrap">
              {(['day','week','month'] as Freq[]).map(f => (
                <Chip key={f} active={freq === f} onClick={() => setFreq(f)}>
                  {{ day: 'Hằng ngày', week: 'Hằng tuần', month: 'Hằng tháng' }[f]}
                </Chip>
              ))}
            </div>

            <Button variant="magic" size="lg" className="w-full mt-5" onClick={startDCA}>
              + Tạo kế hoạch với {asset.id}
            </Button>
          </div>

          {/* Result panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-ink-3">Dự phóng sau 5 năm</div>
            <div className="mono-num text-3xl font-black tracking-tight mt-1" style={{ color: asset.color }}>{fmtVND(fv)}</div>
            <div className="text-[12px] text-ink-3 mt-1.5">Dựa trên CAGR 5 năm: {asset.y5.toFixed(1)}%</div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-canvas rounded-xl p-3">
                <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.1em]">Vốn gốc</div>
                <div className="mono-num font-black text-[15px] mt-1">{fmtVND(invested)}</div>
              </div>
              <div className="bg-grass-50 rounded-xl p-3">
                <div className="text-[10px] font-bold text-grass-700 uppercase tracking-[0.1em]">Lợi nhuận</div>
                <div className="mono-num font-black text-[15px] text-grass-800 mt-1">+{fmtVND(fv - invested)}</div>
              </div>
            </div>

            <div className="text-[11px] italic text-ink-4 mt-3">
              ⚠️ Lịch sử không đảm bảo tương lai. Dữ liệu dùng để tham khảo.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
