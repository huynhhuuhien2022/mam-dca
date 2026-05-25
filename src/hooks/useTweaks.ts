'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Tweaks {
  layout:      'A' | 'B'
  visualStyle: 'playful' | 'minimal' | 'premium'
  primaryColor: string
  showStreak:  boolean
  density:     'compact' | 'regular'
}

const DEFAULTS: Tweaks = {
  layout:       'A',
  visualStyle:  'playful',
  primaryColor: '#22C55E',
  showStreak:   true,
  density:      'regular',
}

const KEY = 'mam-tweaks'

function load(): Tweaks {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch { return DEFAULTS }
}

function shade(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + Math.round(2.55 * pct)))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + Math.round(2.55 * pct)))
  const b = Math.max(0, Math.min(255, (n & 0xff) + Math.round(2.55 * pct)))
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}

export function useTweaks() {
  const [tweaks, setTweaksState] = useState<Tweaks>(DEFAULTS)

  useEffect(() => { setTweaksState(load()) }, [])

  useEffect(() => {
    document.body.dataset.style   = tweaks.visualStyle !== 'playful' ? tweaks.visualStyle : ''
    document.body.dataset.density = tweaks.density === 'compact' ? 'compact' : ''
    const root = document.documentElement
    root.style.setProperty('--primary',      tweaks.primaryColor)
    root.style.setProperty('--primary-deep', shade(tweaks.primaryColor, -15))
    root.style.setProperty('--primary-ink',  shade(tweaks.primaryColor, -35))
  }, [tweaks.visualStyle, tweaks.density, tweaks.primaryColor])

  const setTweak = useCallback(<K extends keyof Tweaks>(key: K, val: Tweaks[K]) => {
    setTweaksState(prev => {
      const next = { ...prev, [key]: val }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { tweaks, setTweak }
}
