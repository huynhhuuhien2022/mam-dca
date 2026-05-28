'use client'

import { useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
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
  const isSubpage = screen === 'profileEdit' || screen === 'planDetail' || screen === 'planHistory'

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [screen])

  return (
    <div className={cn('flex flex-col h-full', isSubpage ? 'bg-white' : 'bg-canvas')}>
      <Header />

      {showStreak && screen === 'dashboard' && <StreakBanner />}

      {/* Scrollable content */}
      <main
        ref={mainRef}
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden pb-6',
          isSubpage ? 'px-0 pt-0 bg-white' : 'px-3 pt-1',
        )}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
