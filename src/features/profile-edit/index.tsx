'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import Button from '@/components/ui/Button'
import { getSupabaseClient } from '@/lib/supabase'
import { AVATAR_PRESETS, getAvatarPreset } from '@/lib/avatar-presets'
import { CalendarDays, Camera, ChevronDown } from 'lucide-react'

const GENDERS = ['Nam', 'Nữ', 'Khác'] as const

function toLocalPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '')
  if (cleaned.startsWith('+84')) return `0${cleaned.slice(3)}`
  if (cleaned.startsWith('84')) return `0${cleaned.slice(2)}`
  return cleaned
}

export default function ProfileEdit() {
  const dispatch = useAppStore(s => s.dispatch)
  const auth = useAppStore(s => s.auth)

  const [name, setName] = useState('Người dùng Mầm')
  const [birthday, setBirthday] = useState('1998-01-01')
  const [gender, setGender] = useState<(typeof GENDERS)[number]>('Nam')
  const [phone, setPhone] = useState('')
  const [avatarId, setAvatarId] = useState('sprout')
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getUser()
        if (error || !data.user || !active) return

        const meta = data.user.user_metadata as {
          full_name?: string
          birthday?: string
          gender?: (typeof GENDERS)[number]
          avatar_id?: string
        } | null

        if (meta?.full_name) setName(meta.full_name)
        if (meta?.birthday) setBirthday(meta.birthday)
        if (meta?.gender && GENDERS.includes(meta.gender)) setGender(meta.gender)
        if (meta?.avatar_id && AVATAR_PRESETS.some((avatar) => avatar.id === meta.avatar_id)) {
          setAvatarId(meta.avatar_id)
        }
        setPhone(data.user.phone ? toLocalPhone(data.user.phone) : '')
      } catch {
        // ignore and keep local defaults in demo mode
      }
    })()

    return () => {
      active = false
    }
  }, [])

  if (!auth) {
    return (
      <div className="fade-up py-4">
        <div className="bg-white rounded-2xl shadow-card p-5 text-center">
          <div className="text-[15px] font-black">Bạn chưa đăng nhập</div>
          <div className="text-[12px] text-ink-3 mt-1">Đăng nhập để cập nhật hồ sơ cá nhân.</div>
          <Button
            size="md"
            className="w-full mt-4"
            onClick={() => dispatch({ type: 'go', screen: 'login' })}
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up px-4 py-4 flex flex-col gap-4 bg-white min-h-full">
      <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3">
        <div className="flex flex-col items-center py-2">
          <div className="relative">
            <div
              className="grid h-24 w-24 place-items-center rounded-full text-[46px] shadow-cta ring-4 ring-white"
              style={{ background: getAvatarPreset(avatarId).gradient }}
            >
              {getAvatarPreset(avatarId).emoji}
            </div>
            <button
              type="button"
              onClick={() => setAvatarPickerOpen(true)}
              className="absolute -bottom-1 -right-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-grass-100 bg-white leading-none shadow-[0_6px_14px_rgba(6,95,70,0.22)] ring-2 ring-white transition-transform active:scale-95"
              aria-label="Chọn avatar"
            >
              <Camera size={20} strokeWidth={2.5} className="block text-grass-600" aria-hidden />
            </button>
          </div>
          <div className="mt-3 text-[13px] font-black text-ink-1">{getAvatarPreset(avatarId).label}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-ink-3">Bấm icon để chọn avatar có sẵn</div>
        </div>

        <div>
          <label className="text-[11px] font-extrabold text-ink-3 uppercase tracking-[0.12em]">Tên</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập họ tên"
            className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-[14px] font-semibold"
          />
        </div>

        <div>
          <label className="text-[11px] font-extrabold text-ink-3 uppercase tracking-[0.12em]">Số điện thoại</label>
          <input
            value={phone || 'Chưa cập nhật'}
            readOnly
            className="mt-1 w-full h-11 rounded-xl border border-gray-200 bg-canvas px-3 text-[14px] font-semibold text-ink-3"
          />
        </div>

        <div>
          <label className="text-[11px] font-extrabold text-ink-3 uppercase tracking-[0.12em]">Birthday</label>
          <div className="relative mt-1">
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="calendar-input w-full h-11 rounded-xl border border-gray-200 pl-3 pr-10 text-[14px] font-semibold bg-white"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grass-700">
              <CalendarDays size={16} strokeWidth={2.1} aria-hidden />
            </span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-extrabold text-ink-3 uppercase tracking-[0.12em]">Giới tính</label>
          <div className="relative mt-1">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as (typeof GENDERS)[number])}
              className="w-full h-11 rounded-xl border border-gray-200 pl-3 pr-10 text-[14px] font-semibold bg-white appearance-none"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grass-700">
              <ChevronDown size={16} strokeWidth={2.3} aria-hidden />
            </span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full mt-2"
          disabled={saving}
          onClick={async () => {
            try {
              setSaving(true)
              const supabase = getSupabaseClient()
              const { error } = await supabase.auth.updateUser({
                data: {
                  full_name: name.trim(),
                  birthday,
                  gender,
                  avatar_id: avatarId,
                },
              })

              if (error) {
                dispatch({ type: 'showToast', toast: { message: 'Không thể cập nhật hồ sơ', icon: '!' } })
                return
              }

              dispatch({ type: 'showToast', toast: { message: 'Đã cập nhật hồ sơ ✓' } })
              dispatch({ type: 'go', screen: 'profile' })
            } catch {
              dispatch({ type: 'showToast', toast: { message: 'Không thể cập nhật hồ sơ', icon: '!' } })
            } finally {
              setSaving(false)
            }
          }}
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>

      {avatarPickerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-ink-1/45 px-4 pb-4 backdrop-blur-[3px]"
          onClick={() => setAvatarPickerOpen(false)}
        >
          <div
            className="w-full rounded-[28px] bg-white p-4 shadow-[0_24px_80px_rgba(8,24,18,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-200" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[18px] font-black tracking-tight">Chọn avatar</div>
                <div className="mt-1 text-[12px] font-semibold text-ink-3">
                  Chọn một hình đại diện có sẵn cho hồ sơ Mầm.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAvatarPickerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-[18px] font-black text-ink-2"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {AVATAR_PRESETS.map((avatar) => {
                const active = avatar.id === avatarId
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      setAvatarId(avatar.id)
                      setAvatarPickerOpen(false)
                    }}
                    className={`relative rounded-[22px] p-1.5 transition-all active:scale-95 ${
                      active ? 'bg-grass-50 ring-2 ring-grass-500' : 'bg-canvas ring-1 ring-gray-100'
                    }`}
                    aria-label={`Chọn avatar ${avatar.label}`}
                  >
                    <span
                      className="grid aspect-square w-full place-items-center rounded-[18px] text-3xl shadow-sm"
                      style={{ background: avatar.gradient }}
                    >
                      {avatar.emoji}
                    </span>
                    <span className="mt-1 block truncate text-[10px] font-extrabold text-ink-3">
                      {avatar.label}
                    </span>
                    {active ? (
                      <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-grass-600 text-[10px] font-black text-white ring-2 ring-white">
                        ✓
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
