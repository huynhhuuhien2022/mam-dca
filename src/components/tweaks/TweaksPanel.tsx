'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { Tweaks } from '@/hooks/useTweaks'

interface TweaksPanelProps {
  tweaks: Tweaks
  setTweak: <K extends keyof Tweaks>(key: K, val: Tweaks[K]) => void
}

const COLOR_OPTS = ['#22C55E', '#10B981', '#16A34A', '#84CC16']

function Seg({ options, value, onChange }: {
  options: { id: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.07)', borderRadius: 8, padding: 2 }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          flex: 1,
          padding: '4px 0',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          transition: 'all 0.15s',
          background: value === o.id ? 'white' : 'transparent',
          color: value === o.id ? '#0F1A14' : 'rgba(41,38,27,0.5)',
          boxShadow: value === o.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          border: 0,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>{o.label}</button>
      ))}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(41,38,27,0.65)' }}>{label}</div>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'rgba(41,38,27,0.4)',
      paddingBottom: 4, borderBottom: '1px solid rgba(0,0,0,0.07)',
    }}>{children}</div>
  )
}

function TweakToggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'rgba(41,38,27,0.65)', fontWeight: 500 }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10, border: 0, cursor: 'pointer',
        background: value ? '#22C55E' : '#d1d5db',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
          background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s',
          transform: `translateX(${value ? 18 : 2}px)`,
        }} />
      </button>
    </div>
  )
}

export default function TweaksPanel({ tweaks, setTweak }: TweaksPanelProps) {
  const [open, setOpen] = useState(false)
  const dispatch = useAppStore(s => s.dispatch)

  return (
    <div style={{
      position: 'fixed', right: 16, bottom: 16, zIndex: 9999,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      {open && (
        <div style={{
          width: 272,
          marginBottom: 8,
          background: 'rgba(250,249,247,0.92)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '0.5px solid rgba(255,255,255,0.7)',
          borderRadius: 14,
          boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 12px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 10px 14px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#29261b' }}>⚙ Tweaks · Mầm</span>
            <button onClick={() => setOpen(false)} style={{
              width: 22, height: 22, borderRadius: 6, fontSize: 13,
              background: 'transparent', border: 0, cursor: 'pointer',
              color: 'rgba(41,38,27,0.45)', lineHeight: 1,
            }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            <SectionLabel>Visual Style</SectionLabel>
            <Row label="Theme">
              <Seg
                options={[
                  { id: 'playful', label: 'Playful' },
                  { id: 'minimal', label: 'Minimal' },
                  { id: 'premium', label: 'Premium' },
                ]}
                value={tweaks.visualStyle}
                onChange={v => setTweak('visualStyle', v as Tweaks['visualStyle'])}
              />
            </Row>

            <SectionLabel>Dashboard</SectionLabel>
            <Row label="Layout">
              <Seg
                options={[{ id: 'A', label: 'Hero rộng' }, { id: 'B', label: 'Chia đôi' }]}
                value={tweaks.layout}
                onChange={v => setTweak('layout', v as 'A' | 'B')}
              />
            </Row>

            <SectionLabel>Màu primary</SectionLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLOR_OPTS.map(c => (
                <button key={c} onClick={() => setTweak('primaryColor', c)} style={{
                  width: 28, height: 28, borderRadius: 8, background: c, border: 0,
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: tweaks.primaryColor === c
                    ? `0 0 0 2px white, 0 0 0 4px ${c}`
                    : '0 1px 3px rgba(0,0,0,0.15)',
                  transition: 'box-shadow 0.15s',
                }} />
              ))}
            </div>

            <SectionLabel>Streak banner</SectionLabel>
            <TweakToggle
              value={tweaks.showStreak}
              onChange={v => setTweak('showStreak', v)}
              label="Hiện banner streak ở Tổng quan"
            />

            <SectionLabel>Mật độ</SectionLabel>
            <Seg
              options={[{ id: 'regular', label: 'Regular' }, { id: 'compact', label: 'Compact' }]}
              value={tweaks.density}
              onChange={v => setTweak('density', v as 'compact' | 'regular')}
            />

            {/* Quick test */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(41,38,27,0.4)' }}>Quick test</div>
              <button
                onClick={() => { dispatch({ type: 'login' }); setOpen(false) }}
                style={{
                  width: '100%', padding: '6px 10px', borderRadius: 8, border: 0,
                  background: 'rgba(34,197,94,0.12)', color: '#16A34A',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                }}
              >
                Login bypass → Dashboard
              </button>
            </div>

            <div style={{ fontSize: 10, color: 'rgba(41,38,27,0.35)', lineHeight: 1.5 }}>
              Dev-only · không hiện trong production
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: 40, height: 40, borderRadius: '50%',
        background: open ? '#22C55E' : 'rgba(250,249,247,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(255,255,255,0.6)',
        boxShadow: open ? '0 4px 14px rgba(34,197,94,0.4)' : '0 4px 14px rgba(0,0,0,0.15)',
        fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', marginLeft: 'auto',
        color: open ? 'white' : '#29261b',
      }}>
        {open ? '✕' : '⚙'}
      </button>
    </div>
  )
}
