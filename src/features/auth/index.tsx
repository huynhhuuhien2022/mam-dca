'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import Button from '@/components/ui/Button'
import { getSupabaseClient } from '@/lib/supabase'
import type { LoginMode } from '@/lib/types'

function fmtPhone(s: string): string {
  const d = s.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

export default function Login({ mode = 'login' }: { mode?: LoginMode }) {
  const dispatch = useAppStore(s => s.dispatch)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const phoneDigits = phone.replace(/\D/g, '')
  const phoneE164 = `+84${phoneDigits.replace(/^0/, '')}`
  const phoneValid = phoneDigits.length >= 9 && phoneDigits.length <= 10
  const passValid = password.length >= 6
  const canSubmit = phoneValid && passValid && !busy

  const goBack = () => dispatch({ type: 'go', screen: 'dashboard' })

  async function signInEmail() {
    setError('')
    setBusy(true)
    try {
      const supabase = getSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        phone: phoneE164,
        password,
      })
      if (authError) throw authError
      dispatch({ type: 'login' })
      dispatch({ type: 'showToast', toast: { icon: '✓', message: 'Đăng nhập thành công' } })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Đăng nhập thất bại'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-canvas">

      {/* Status-bar spacer */}
      <div className="h-10 flex-shrink-0" />

      {/* Header */}
      <div className="px-4 pt-2 pb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-2xl bg-white shadow-card grid place-items-center active:scale-95 transition-transform text-lg"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg brand-gradient grid place-items-center shadow-cta">
            <svg width="14" height="14" viewBox="0 0 32 32">
              <path d="M 16 28 L 16 14" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="10" cy="12" rx="6" ry="4" fill="white" transform="rotate(-22 10 12)" />
              <ellipse cx="22" cy="12" rx="6" ry="4" fill="white" transform="rotate(22 22 12)" />
            </svg>
          </div>
          <div className="font-black text-[15px] text-grass-500">Mầm</div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
        <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">
          Đăng nhập
        </div>
        <div className="text-[26px] font-black text-ink-1 tracking-tight leading-tight mt-1.5">
          Số điện thoại
        </div>
        <div className="text-[13.5px] text-ink-3 font-semibold mt-1.5 leading-snug">
          Đăng nhập để lưu kế hoạch và đồng bộ trên nhiều thiết bị.
        </div>

        {/* Phone input */}
        <div className="bg-white rounded-2xl shadow-card mt-5 flex items-center overflow-hidden">
          <div className="px-3.5 py-3.5 flex items-center gap-2 border-r border-line-soft flex-shrink-0">
            <span className="text-base leading-none">🇻🇳</span>
            <span className="font-extrabold text-[15px] mono-num">+84</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            autoFocus
            placeholder="9xx xxx xxxx"
            value={phone}
            onChange={e => setPhone(fmtPhone(e.target.value))}
            className="flex-1 min-w-0 px-3.5 py-3.5 bg-transparent border-0 outline-none focus:outline-none font-extrabold text-[18px] mono-num text-ink-1 placeholder:text-ink-4 placeholder:font-semibold tracking-wide"
          />
        </div>
        <div className="bg-white rounded-2xl shadow-card mt-2.5 flex items-center overflow-hidden">
          <input
            type="password"
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && canSubmit) {
                signInEmail()
              }
            }}
            className="flex-1 min-w-0 px-3.5 py-3.5 bg-transparent border-0 outline-none focus:outline-none font-extrabold text-[16px] text-ink-1 placeholder:text-ink-4 placeholder:font-semibold tracking-wide"
          />
        </div>
        {error && (
          <div className="mt-2 text-[12px] text-red-500 font-bold">{error}</div>
        )}

        {/* Terms */}
        <div className="text-center text-[10.5px] text-ink-4 font-semibold mt-6 leading-snug">
          Tiếp tục đồng nghĩa với chấp thuận{' '}
          <span className="underline">Điều khoản</span> ·{' '}
          <span className="underline">Quyền riêng tư</span>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="px-4 pb-5 pt-3 flex-shrink-0 bg-canvas">
        <Button
          variant={canSubmit ? 'magic' : 'soft'}
          size="lg"
          disabled={!canSubmit}
          onClick={signInEmail}
          className="w-full rounded-2xl"
        >
          {busy ? 'Đang xử lý...' : 'Đăng nhập →'}
        </Button>
      </div>
    </div>
  )
}
