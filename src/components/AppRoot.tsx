'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase'
import AppShell from './shell/AppShell'
import Dashboard   from '@/features/dashboard'
import Browse      from '@/features/browse'
import AssetDetail from '@/features/asset-detail'
import CreatePlan  from '@/features/create-plan'
import Calculator  from '@/features/calculator'
import History     from '@/features/history'
import Settings    from '@/features/settings'
import Login       from '@/features/auth'
import Toast       from '@/components/ui/Toast'
import type { Screen } from '@/lib/types'

const AUTH_SCREENS: Screen[] = ['login', 'signup']

export default function AppRoot() {
  const screen = useAppStore(s => s.screen)
  const dispatch = useAppStore(s => s.dispatch)

  useEffect(() => {
    let mounted = true
    let unsubscribe = () => {}

    try {
      const supabase = getSupabaseClient()

      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return
        dispatch({ type: 'setAuth', value: Boolean(data.session) })
      })

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        dispatch({ type: 'setAuth', value: Boolean(session) })
      })
      unsubscribe = () => listener.subscription.unsubscribe()
    } catch {
      // Env not configured yet; keep demo auth flow.
    }

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [dispatch])

  if (AUTH_SCREENS.includes(screen)) {
    return (
      <>
        <div className="h-full">
          <Login mode="login" />
        </div>
        <Toast />
      </>
    )
  }

  const Page = getPage(screen, 'A')

  return (
    <>
      <AppShell showStreak>
        <Page key={screen} />
      </AppShell>
      <Toast />
    </>
  )
}

function getPage(screen: Screen, layout: 'A' | 'B') {
  switch (screen) {
    case 'dashboard': return () => <Dashboard layout={layout} />
    case 'browse':    return Browse
    case 'detail':    return AssetDetail
    case 'create':    return CreatePlan
    case 'calc':      return Calculator
    case 'history':   return History
    case 'settings':  return Settings
    default:          return () => <Dashboard layout={layout} />
  }
}
