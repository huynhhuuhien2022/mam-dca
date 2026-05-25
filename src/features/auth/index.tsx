'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
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

  const phoneDigits = phone.replace(/\D/g, '')
  const phoneValid  = phoneDigits.length >= 9

  const goBack = () => dispatch({ type: 'go', screen: 'dashboard' })
  const signIn = () => dispatch({ type: 'login' })

  return (
    <div className="flex flex-col h-full bg-canvas">

      {/* Status-bar spacer */}
      <div className="h-10 flex-shrink-0" />

      {/* Header */}
      <div className="px-4 pt-2 pb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-xl bg-white shadow-card grid place-items-center active:scale-95 transition-transform text-lg"
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
          {mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập'}
        </div>
        <div className="text-[26px] font-black text-ink-1 tracking-tight leading-tight mt-1.5">
          Số điện thoại
        </div>
        <div className="text-[13.5px] text-ink-3 font-semibold mt-1.5 leading-snug">
          {mode === 'signup'
            ? 'Tạo tài khoản nhanh để bắt đầu hành trình DCA.'
            : 'Đăng nhập để lưu kế hoạch và đồng bộ trên nhiều thiết bị.'}
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
            onKeyDown={e => { if (e.key === 'Enter' && phoneValid) signIn() }}
            className="flex-1 min-w-0 px-3 py-3.5 bg-transparent border-0 outline-none focus:outline-none font-extrabold text-[18px] mono-num text-ink-1 placeholder:text-ink-4 placeholder:font-semibold tracking-wide"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-line" />
          <span className="text-[10.5px] text-ink-4 font-bold uppercase tracking-[0.14em]">Hoặc</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Social buttons — full width, stacked */}
        <div className="flex flex-col gap-2">
          <button
            onClick={signIn}
            className="bg-white rounded-2xl shadow-card py-3 px-4 flex items-center justify-center gap-2.5 font-extrabold text-[14px] active:scale-[0.98] transition-transform text-ink-1"
          >
            <GoogleSVG />
            Tiếp tục với Google
          </button>
          <button
            onClick={signIn}
            className="bg-ink-1 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2.5 font-extrabold text-[14px] active:scale-[0.98] transition-transform"
          >
            <AppleSVG />
            Tiếp tục với Apple
          </button>
        </div>

        {/* Switch login / signup */}
        <div className="text-center text-[13px] font-semibold text-ink-3 mt-6">
          {mode === 'signup' ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
          <button
            onClick={() => dispatch({ type: 'go', screen: mode === 'signup' ? 'login' : 'signup' })}
            className="text-grass-600 font-extrabold underline underline-offset-2 active:opacity-70"
          >
            {mode === 'signup' ? 'Đăng nhập' : 'Tạo ngay'}
          </button>
        </div>

        {/* Terms */}
        <div className="text-center text-[10.5px] text-ink-4 font-semibold mt-4 leading-snug">
          Tiếp tục đồng nghĩa với chấp thuận{' '}
          <span className="underline">Điều khoản</span> ·{' '}
          <span className="underline">Quyền riêng tư</span>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="px-4 pb-5 pt-3 flex-shrink-0 bg-canvas">
        <button
          disabled={!phoneValid}
          onClick={signIn}
          className={`w-full rounded-2xl py-3.5 font-extrabold text-[15px] transition-all ${
            phoneValid
              ? 'bg-ink-1 text-white shadow-card active:scale-[0.98]'
              : 'bg-line text-ink-4 cursor-not-allowed'
          }`}
        >
          {mode === 'signup' ? 'Tạo tài khoản →' : 'Đăng nhập →'}
        </button>
      </div>
    </div>
  )
}

function GoogleSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6,20.1H42V20H24v8h11.3c-1.6,4.7-6.1,8-11.3,8c-6.6,0-12-5.4-12-12s5.4-12,12-12c3.1,0,5.8,1.2,7.9,3.1l5.7-5.7C34,6.1,29.3,4,24,4C12.9,4,4,12.9,4,24s8.9,20,20,20s20-8.9,20-20C44,22.7,43.9,21.4,43.6,20.1z"/>
      <path fill="#FF3D00" d="M6.3,14.7l6.6,4.8C14.6,15.1,18.9,12,24,12c3.1,0,5.8,1.2,7.9,3.1l5.7-5.7C34,6.1,29.3,4,24,4C16.3,4,9.7,8.3,6.3,14.7z"/>
      <path fill="#4CAF50" d="M24,44c5.2,0,9.9-2,13.4-5.3l-6.2-5.2c-2,1.5-4.6,2.5-7.2,2.5c-5.2,0-9.6-3.3-11.3-7.9l-6.5,5C9.5,39.6,16.2,44,24,44z"/>
      <path fill="#1976D2" d="M43.6,20.1H42V20H24v8h11.3c-0.8,2.2-2.2,4.2-4.1,5.5l6.2,5.2C37.1,39.2,44,34,44,24C44,22.7,43.9,21.4,43.6,20.1z"/>
    </svg>
  )
}

function AppleSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M17.05 20.28c-.98.95-2.05.86-3.08.4-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  )
}
