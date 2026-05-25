'use client'

import { useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Header from './Header'
import BottomNav from './BottomNav'
import StreakBanner from './StreakBanner'

interface AppShellProps {
  children: React.ReactNode
  showStreak?: boolean
}

export default function AppShell({ children, showStreak = true }: AppShellProps) {
  const screen = useAppStore(s => s.screen)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [screen])

  return (
    <div className="flex flex-col h-full bg-canvas">
      <Header />

      {showStreak && screen === 'dashboard' && <StreakBanner />}

      {/* Scrollable content */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-1 pb-6"
      >
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
