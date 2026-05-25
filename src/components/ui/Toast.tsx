'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

export default function Toast() {
  const { toast, dispatch } = useAppStore(useShallow(s => ({ toast: s.toast, dispatch: s.dispatch })))

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => dispatch({ type: 'clearToast' }), 3000)
    return () => clearTimeout(t)
  }, [toast, dispatch])

  if (!toast) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9998,
        background: '#0F1A14',
        color: 'white',
        borderRadius: 14,
        padding: '10px 18px',
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        animation: 'fadeUp 0.25s ease both',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span>{toast.icon ?? '✓'}</span>
      {toast.message}
    </div>
  )
}
