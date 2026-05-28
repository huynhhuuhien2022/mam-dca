'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import Button from '@/components/ui/Button'
import { getSupabaseClient } from '@/lib/supabase'

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
        } | null

        if (meta?.full_name) setName(meta.full_name)
        if (meta?.birthday) setBirthday(meta.birthday)
        if (meta?.gender && GENDERS.includes(meta.gender)) setGender(meta.gender)
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3.5" y="5.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 3.8V7M16 3.8V7M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
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
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
    </div>
  )
}
