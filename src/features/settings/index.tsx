'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { fmtVND } from '@/lib/utils'
import Button from '@/components/ui/Button'

const NOTIF_ITEMS = [
  { id: 'dca',       label: 'Nhắc đến hạn DCA',      sub: 'Nhắc trước 1 ngày' },
  { id: 'market',    label: 'Biến động thị trường',   sub: 'Khi tăng/giảm >5%' },
  { id: 'milestone', label: 'Cột mốc danh mục',       sub: 'Khi đạt mục tiêu mới' },
  { id: 'weekly',    label: 'Tóm tắt tuần',           sub: 'Mỗi thứ 2 lúc 8:00' },
  { id: 'tips',      label: 'Mẹo DCA hàng tháng',    sub: 'Kiến thức đầu tư' },
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${on ? 'bg-grass-500' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

export default function Settings() {
  const { auth, plans, dispatch } = useAppStore(useShallow(s => ({
    auth: s.auth,
    plans: s.plans,
    dispatch: s.dispatch,
  })))
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    dca: true, market: false, milestone: true, weekly: true, tips: false,
  })

  return (
    <div className="fade-up py-4 flex flex-col gap-4">
      {/* Profile / Guest card */}
      {auth ? (
        <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-grass-400 to-grass-600 grid place-items-center text-2xl flex-shrink-0">
            🌱
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-[15px] text-ink-1">Người dùng Mầm</div>
            <div className="text-[12px] text-ink-3 font-semibold truncate">Đã đăng nhập</div>
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={() => dispatch({ type: 'logout' })}
            className="flex-shrink-0 rounded-xl bg-red-50 px-4 text-[12px] text-red-500 hover:bg-red-100"
          >
            Đăng xuất
          </Button>
        </div>
      ) : (
        <div
          className="rounded-2xl p-4 text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)' }}
        >
          <div className="absolute right-2 top-1 text-7xl opacity-10 leading-none select-none pointer-events-none">🌱</div>
          <div className="font-black text-[17px] mb-1">Chưa đăng nhập</div>
          <p className="text-[12px] text-white/70 mb-3 leading-snug">
            Đăng nhập để lưu kế hoạch và theo dõi danh mục trên mọi thiết bị.
          </p>
          <Button
            variant="white"
            size="sm"
            onClick={() => dispatch({ type: 'go', screen: 'login' })}
            className="rounded-xl px-5 text-[13px] text-emerald-800 shadow-none"
          >
            Đăng nhập / Tạo tài khoản
          </Button>
        </div>
      )}

      {/* Mầm là gì? */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="font-extrabold text-[14px] text-ink-1 mb-3">🌱 Mầm là gì?</div>
        <div className="flex flex-col gap-2">
          {[
            { ok: true,  text: 'Công cụ tư vấn & giáo dục DCA' },
            { ok: true,  text: 'Mô phỏng kế hoạch đầu tư dài hạn' },
            { ok: true,  text: 'Theo dõi tiến độ danh mục cá nhân' },
            { ok: false, text: 'Không thực hiện giao dịch thay bạn' },
            { ok: false, text: 'Không quản lý tiền thực của bạn' },
            { ok: false, text: 'Không phải tư vấn tài chính chuyên nghiệp' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className={`text-[14px] flex-shrink-0 mt-0.5 font-bold ${item.ok ? 'text-grass-600' : 'text-red-500'}`}>
                {item.ok ? '✓' : '✕'}
              </span>
              <span className={`text-[12px] font-semibold ${item.ok ? 'text-ink-2' : 'text-ink-3'}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <div className="font-extrabold text-[14px] text-ink-1">🔔 Thông báo</div>
        </div>
        {NOTIF_ITEMS.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 ${i < NOTIF_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[13px] text-ink-1">{item.label}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">{item.sub}</div>
            </div>
            <Toggle
              on={notifs[item.id]}
              onChange={v => setNotifs(p => ({ ...p, [item.id]: v }))}
            />
          </div>
        ))}
      </div>

      {/* Plans summary */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="font-extrabold text-[14px] text-ink-1 mb-3">📋 Kế hoạch DCA</div>
        {plans.length === 0 ? (
          <div className="text-[12px] text-ink-3 font-semibold text-center py-3">
            Chưa có kế hoạch nào.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mb-3">
            {plans.map(p => {
              const ret = p.currentValue - p.totalInvested
              return (
                <div key={p.id} className="flex items-center gap-2.5">
                  <span className="text-lg">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] text-ink-1 truncate">{p.name}</div>
                    <div className="text-[11px] text-ink-3">{fmtVND(p.currentValue)}</div>
                  </div>
                  <div className={`text-[11px] font-bold flex-shrink-0 ${ret >= 0 ? 'text-grass-600' : 'text-red-500'}`}>
                    {ret >= 0 ? '+' : ''}{((ret / (p.totalInvested || 1)) * 100).toFixed(1)}%
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <Button
          variant="soft"
          size="md"
          onClick={() => dispatch({ type: 'go', screen: 'create' })}
          className="w-full rounded-xl text-[13px]"
        >
          + Thêm kế hoạch mới
        </Button>
      </div>

      {/* Danger zone — auth only */}
      {auth && (
        <div className="bg-white rounded-2xl shadow-card p-4 border border-red-100">
          <div className="font-extrabold text-[14px] text-red-500 mb-2">⚠️ Vùng nguy hiểm</div>
          <button className="inline-flex min-h-9 items-center rounded-full px-2 text-[13px] font-bold text-red-500 underline underline-offset-2">
            Xoá tài khoản và dữ liệu
          </button>
        </div>
      )}

      <div className="text-center text-[11px] text-ink-4 pb-2">
        Mầm v1.0.0 · Made with 🌱 in Việt Nam
      </div>
    </div>
  )
}
