'use client'

import { useAppStore } from '@/lib/store'
import { useTweaks } from '@/hooks/useTweaks'
import AppShell from './shell/AppShell'
import TweaksPanel from './tweaks/TweaksPanel'
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
  const { tweaks, setTweak } = useTweaks()

  if (AUTH_SCREENS.includes(screen)) {
    return (
      <>
        <div className="h-full">
          <Login mode={screen === 'signup' ? 'signup' : 'login'} />
        </div>
        <Toast />
        <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
      </>
    )
  }

  const Page = getPage(screen, tweaks.layout)

  return (
    <>
      <AppShell showStreak={tweaks.showStreak}>
        <Page key={screen} />
      </AppShell>
      <Toast />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
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
