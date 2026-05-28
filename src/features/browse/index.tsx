'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { fmtPct, cn } from '@/lib/utils'
import AssetLogo from '@/components/ui/AssetLogo'
import RiskBadge from '@/components/ui/RiskBadge'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/Button'
import type { AssetCat } from '@/lib/types'

const CAT_LABEL: Record<string, string> = {
  etf: 'ETF', fund: 'Quỹ mở', stock: 'Cổ phiếu', gold: 'Vàng', savings: 'Tiết kiệm',
}

const cats = [
  { id: 'all',     label: 'Tất cả' },
  { id: 'etf',     label: 'ETF' },
  { id: 'fund',    label: 'Quỹ mở' },
  { id: 'stock',   label: 'Cổ phiếu' },
  { id: 'gold',    label: 'Vàng' },
  { id: 'savings', label: 'Tiết kiệm' },
]

export default function Browse() {
  const dispatch = useAppStore(s => s.dispatch)
  const assets = useAppStore(s => s.assets)
  const [filter, setFilter] = useState('all')
  const [risk, setRisk]     = useState('all')
  const [sort, setSort]     = useState('ytd')
  const [q, setQ]           = useState('')

  const list = useMemo(() => {
    return assets
      .filter(a => filter === 'all' || a.cat === filter)
      .filter(a => risk === 'all' || a.risk === risk)
      .filter(a => !q || a.id.toLowerCase().includes(q.toLowerCase()) || a.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) =>
        sort === 'ytd'  ? b.ytd - a.ytd :
        sort === 'y5'   ? b.y5 - a.y5 :
        sort === 'risk' ? ({'Thấp':0,'Trung bình':1,'Cao':2}[a.risk] ?? 3) - ({'Thấp':0,'Trung bình':1,'Cao':2}[b.risk] ?? 3) :
        0
      )
  }, [filter, risk, sort, q])

  const marketRows = useMemo(() => {
    return list.filter(a => a.cat === 'stock' || a.cat === 'fund' || a.cat === 'gold')
  }, [list])

  return (
    <div className="fade-up pb-4">
      <div className="mb-5">
        <div className="text-2xl font-black tracking-tight">Loại tài sản 🔍</div>
        <div className="text-ink-3 mt-1.5 text-sm">Tham khảo các nhóm tài sản phổ biến để DCA</div>
      </div>

      {/* Filters card */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-wrap gap-2">
          {cats.map(c => {
            const count = c.id === 'all' ? assets.length : assets.filter(a => a.cat === c.id).length
            return (
              <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
                {c.label} <span className="opacity-60">{count}</span>
              </Chip>
            )
          })}
        </div>
        <div className="flex gap-2 mt-3">
          <select value={risk} onChange={e => setRisk(e.target.value)}
            className="flex-1 bg-white border border-gray-100 rounded-xl px-3 py-2 font-semibold text-[12px] text-ink-2 outline-none focus:border-grass-500"
          >
            <option value="all">Mọi mức rủi ro</option>
            <option value="Thấp">Rủi ro thấp</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Cao">Rủi ro cao</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="flex-1 bg-white border border-gray-100 rounded-xl px-3 py-2 font-semibold text-[12px] text-ink-2 outline-none focus:border-grass-500"
          >
            <option value="ytd">YTD ↓</option>
            <option value="y5">5 năm ↓</option>
            <option value="risk">Rủi ro ↑</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2.5 mt-3 focus-within:border-grass-500">
          <span>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Tìm theo loại tài sản (ETF, vàng, trái phiếu...)"
            className="flex-1 min-w-0 border-0 outline-0 bg-transparent font-semibold text-[13px]"
          />
          {q && (
            <button onClick={() => setQ('')} className="w-8 h-8 rounded-full grid place-items-center text-ink-3 hover:bg-canvas">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        {assets.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-ink-3 font-semibold">
            Chưa có dữ liệu tài sản từ Supabase
          </div>
        ) : list.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-ink-3 font-semibold">
            Không tìm thấy — thử bộ lọc khác nhé
          </div>
        ) : (
          <div className="stagger">
            {list.map((asset, i) => (
              <div key={asset.id}
                onClick={() => dispatch({ type: 'go', screen: 'detail', assetId: asset.id })}
                className={cn('flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-canvas transition-colors',
                  i < list.length - 1 ? 'border-b border-gray-50' : ''
                )}
              >
                <AssetLogo asset={asset} size={42} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-extrabold text-[14px]">{asset.id}</span>
                    <RiskBadge risk={asset.risk} />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-canvas text-ink-3 border border-gray-100">
                      {CAT_LABEL[asset.cat]}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-3 truncate mt-0.5">{asset.name} · {asset.sub}</div>
                </div>
                <div className={cn('w-[55px] text-right font-extrabold text-[14px] whitespace-nowrap flex-shrink-0',
                  asset.ytd >= 0 ? 'text-grass-600' : 'text-red-500'
                )}>
                  {fmtPct(asset.ytd)}
                </div>
                <Button variant="soft" size="sm" className="flex-shrink-0"
                  onClick={e => { e.stopPropagation(); dispatch({ type: 'go', screen: 'detail', assetId: asset.id }) }}
                >
                  DCA →
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market data table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-[14px] font-extrabold">Bảng dữ liệu Cổ phiếu · Quỹ · Vàng</div>
          <div className="text-[11px] text-ink-3 mt-0.5">Nguồn tham chiếu trong app, dùng để mô phỏng DCA.</div>
        </div>

        {marketRows.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-ink-3 font-semibold">
            Không có dữ liệu phù hợp bộ lọc hiện tại
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead>
                <tr className="bg-canvas text-ink-3">
                  <th className="text-left px-3 py-2 font-extrabold">Mã</th>
                  <th className="text-left px-3 py-2 font-extrabold">Tên</th>
                  <th className="text-left px-3 py-2 font-extrabold">Nhóm</th>
                  <th className="text-right px-3 py-2 font-extrabold">YTD</th>
                  <th className="text-right px-3 py-2 font-extrabold">3 năm</th>
                  <th className="text-right px-3 py-2 font-extrabold">5 năm</th>
                  <th className="text-left px-3 py-2 font-extrabold">Rủi ro</th>
                </tr>
              </thead>
              <tbody>
                {marketRows.map((asset, i) => (
                  <tr key={`${asset.id}-table`} className={cn(i < marketRows.length - 1 ? 'border-b border-gray-50' : '')}>
                    <td className="px-3 py-2.5 font-black">{asset.id}</td>
                    <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{asset.name}</td>
                    <td className="px-3 py-2.5">{CAT_LABEL[asset.cat]}</td>
                    <td className={cn('px-3 py-2.5 text-right font-extrabold', asset.ytd >= 0 ? 'text-grass-600' : 'text-red-500')}>
                      {fmtPct(asset.ytd)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold">{fmtPct(asset.y3)}</td>
                    <td className="px-3 py-2.5 text-right font-bold">{fmtPct(asset.y5)}</td>
                    <td className="px-3 py-2.5">
                      <RiskBadge risk={asset.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
