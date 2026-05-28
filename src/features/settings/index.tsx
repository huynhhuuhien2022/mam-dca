'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import Button from '@/components/ui/Button'
import { getSupabaseClient } from '@/lib/supabase'
import { getAvatarPreset } from '@/lib/avatar-presets'

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
      type="button"
      role="switch"
      aria-checked={on}
      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 border border-white/70"
      style={{ backgroundColor: on ? '#15803D' : '#BBF7D0' }}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

export default function Settings() {
  const { auth, dispatch } = useAppStore(useShallow(s => ({
    auth: s.auth,
    dispatch: s.dispatch,
  })))
  const [displayName, setDisplayName] = useState('Người dùng Mầm')
  const [avatarId, setAvatarId] = useState('sprout')
  const [joinedDays, setJoinedDays] = useState(1)
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    dca: true, market: false, milestone: true, weekly: true, tips: false,
  })

  useEffect(() => {
    let active = true
    if (!auth) {
      setDisplayName('Người dùng Mầm')
      setAvatarId('sprout')
      setJoinedDays(1)
      return () => {
        active = false
      }
    }

    ;(async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getUser()
        if (error || !data.user || !active) return
        const meta = data.user.user_metadata as { full_name?: string; avatar_id?: string } | null
        const safeName = meta?.full_name?.trim() || 'Người dùng Mầm'
        const createdAt = data.user.created_at ? new Date(data.user.created_at).getTime() : Date.now()
        const diffMs = Math.max(0, Date.now() - createdAt)
        const days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
        setDisplayName(safeName)
        setAvatarId(meta?.avatar_id ?? 'sprout')
        setJoinedDays(days)
      } catch {
        if (active) {
          setDisplayName('Người dùng Mầm')
          setAvatarId('sprout')
          setJoinedDays(1)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [auth])

  return (
    <div className="fade-up py-4 flex flex-col gap-4">
      {/* Profile / Guest card */}
      {auth ? (
        <div className="flex flex-col gap-2.5">
          <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 relative">
            <div
              className="w-12 h-12 rounded-2xl grid place-items-center text-2xl flex-shrink-0 shadow-sm"
              style={{ background: getAvatarPreset(avatarId).gradient }}
            >
              {getAvatarPreset(avatarId).emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[15px] text-ink-1 truncate">{displayName}</div>
              <div className="text-[12px] text-ink-3 font-semibold truncate">Đã tham gia: {joinedDays} ngày</div>
            </div>
            <button
              onClick={() => dispatch({ type: 'go', screen: 'profileEdit' })}
              className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-grass-50 text-grass-700 grid place-items-center border border-grass-100 active:scale-95"
              aria-label="Cập nhật hồ sơ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 20h4l10-10a2.2 2.2 0 1 0-3.1-3.1L4.8 16.9 4 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
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
            className={`flex items-center gap-3 px-4 py-3.5 min-h-[62px] ${i < NOTIF_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[13px] leading-tight text-ink-1">{item.label}</div>
              <div className="text-[11px] leading-tight text-ink-3 mt-1">{item.sub}</div>
            </div>
            <Toggle
              on={notifs[item.id]}
              onChange={v => setNotifs(p => ({ ...p, [item.id]: v }))}
            />
          </div>
        ))}
      </div>

      {/* Danger zone — auth only */}
      {auth && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <div className="font-extrabold text-[14px] text-red-500">⚠️ Vùng nguy hiểm</div>
          </div>
          <div className="px-3 pb-3 flex flex-col gap-2">
            <button
              onClick={() => dispatch({ type: 'logout' })}
              className="w-full flex items-center gap-3 px-3.5 py-3.5 min-h-[62px] rounded-xl border border-red-100 active:bg-red-50/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 grid place-items-center flex-shrink-0">↩</div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-bold text-[13px] leading-tight text-red-600">Đăng xuất</div>
                <div className="text-[11px] leading-tight text-ink-3 mt-1">Thoát tài khoản trên thiết bị này</div>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-3.5 min-h-[62px] rounded-xl border border-red-100 active:bg-red-50/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 grid place-items-center flex-shrink-0">🗑</div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-bold text-[13px] leading-tight text-red-600">Xoá tài khoản và dữ liệu</div>
                <div className="text-[11px] leading-tight text-ink-3 mt-1">Hành động vĩnh viễn, không thể hoàn tác</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-[11px] text-ink-4 pb-2">
        Mầm v1.0.0 · Made with 🌱 in Việt Nam
      </div>
    </div>
  )
}
