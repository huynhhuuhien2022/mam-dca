'use client'

import { useMemo } from 'react'

const COLORS = ['#22C55E', '#FB923C', '#FACC15', '#F472B6', '#38BDF8', '#A78BFA']

export default function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 40 }).map(() => ({
    left:  Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size:  6 + Math.random() * 8,
    delay: Math.random() * 0.6,
    dx:    (Math.random() - 0.5) * 200,
    dur:   1.6 + Math.random() * 1.2,
  })), [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute -top-5"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: 2,
            animation: `confetti-fall ${p.dur}s cubic-bezier(.2,.7,.2,1) ${p.delay}s forwards`,
            // @ts-expect-error CSS custom property
            '--dx': `${p.dx}px`,
          }}
        />
      ))}
    </div>
  )
}
