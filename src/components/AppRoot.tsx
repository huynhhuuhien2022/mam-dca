'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { Asset, RiskLevel } from '@/lib/types'
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

const CAT_COLOR: Record<Asset['cat'], string> = {
  etf: '#22C55E',
  fund: '#10B981',
  stock: '#3B82F6',
  gold: '#FBBF24',
  savings: '#94A3B8',
}

function toRiskLevel(value: string | null | undefined): RiskLevel {
  if (value === 'thap') return 'Thấp'
  if (value === 'cao') return 'Cao'
  return 'Trung bình'
}

function mapTypeToCat(typeCode: string | null | undefined): Asset['cat'] {
  if (typeCode === 'stock') return 'stock'
  if (typeCode === 'fund_certificate') return 'fund'
  if (typeCode === 'gold') return 'gold'
  return 'fund'
}

export default function AppRoot() {
  const screen = useAppStore(s => s.screen)
  const dispatch = useAppStore(s => s.dispatch)

  useEffect(() => {
    let mounted = true
    let unsubscribe = () => {}

    try {
      const supabase = getSupabaseClient()

      supabase
        .from('assets')
        .select(`
          id,
          symbol,
          name,
          risk_level,
          logo_url,
          asset_type:asset_types!inner(code),
          stock_details(exchange, sector),
          fund_certificate_details(fund_type),
          gold_details(gold_form)
        `)
        .eq('is_active', true)
        .then(async ({ data: baseRows, error }) => {
          if (error || !baseRows) return
          const ids = baseRows.map(r => r.id)
          const { data: snaps } = await supabase
            .from('asset_market_snapshots')
            .select('asset_id, as_of_at, return_ytd, cagr_3y, cagr_5y')
            .in('asset_id', ids)
            .order('as_of_at', { ascending: false })

          const snapMap = new Map<string, { ytd: number; y3: number; y5: number }>()
          for (const s of snaps ?? []) {
            if (snapMap.has(s.asset_id)) continue
            snapMap.set(s.asset_id, {
              ytd: Number(s.return_ytd ?? 0),
              y3: Number(s.cagr_3y ?? 0),
              y5: Number(s.cagr_5y ?? 0),
            })
          }

          const mapped: Asset[] = baseRows.map((row, i) => {
            const typeCode = (row as { asset_type?: { code?: string } }).asset_type?.code
            const cat = mapTypeToCat(typeCode)
            const snap = snapMap.get(row.id)
            const ytd = snap?.ytd ?? 0
            const y3 = snap?.y3 ?? 0
            const y5 = snap?.y5 ?? 0
            const spark = Array.from({ length: 30 }, (_, idx) => 100 + (i + 1) * 0.4 * idx + ytd * 0.02)
            const sub =
              cat === 'stock'
                ? ((row as { stock_details?: { exchange?: string } | null }).stock_details?.exchange ?? 'Cổ phiếu')
                : cat === 'fund'
                  ? ((row as { fund_certificate_details?: { fund_type?: string } | null }).fund_certificate_details?.fund_type ?? 'Chứng chỉ quỹ')
                  : ((row as { gold_details?: { gold_form?: string } | null }).gold_details?.gold_form ?? 'Vàng')

            return {
              id: row.symbol,
              name: row.name,
              sub,
              mgr: 'Loại tài sản',
              cat,
              risk: toRiskLevel(row.risk_level),
              ytd,
              y3,
              y5,
              color: CAT_COLOR[cat],
              tags: cat === 'stock' ? ['DCA dài hạn', 'Biến động'] : cat === 'fund' ? ['Đa dạng', 'Quản lý quỹ'] : ['Phòng ngừa', 'Lạm phát'],
              note: 'Dữ liệu tham khảo cho mô phỏng DCA, không phải khuyến nghị đầu tư.',
              logoUrl: row.logo_url ?? undefined,
              spark,
              day: Math.max(-3, Math.min(3, ytd / 10)),
            }
          })
          dispatch({ type: 'setAssets', assets: mapped })
        })

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
