/* ============================================================
   Domain types for Mầm DCA
   ============================================================ */

export type AssetCat = 'etf' | 'fund' | 'stock' | 'gold' | 'savings'
export type RiskLevel = 'Thấp' | 'Trung bình' | 'Cao'
export type Freq = 'day' | 'week' | 'month'

export interface Asset {
  id: 'ETF' | 'BLUE' | 'GROW' | 'FUND' | 'BAL' | 'BOND' | 'GOLD' | 'SAVE'
  name: string
  sub: string
  mgr: string
  cat: AssetCat
  risk: RiskLevel
  ytd: number
  y3: number
  y5: number
  color: string
  tags: string[]
  note: string
  logoUrl?: string
  spark: number[]
  day: number
}

export interface Allocation {
  id: Asset['id']
  pct: number
}

export interface Plan {
  id: string
  name: string
  emoji: string
  amount: number
  freq: Freq
  freqDays: number[]
  duration: number | null
  allocation: Allocation[]
  startMonth: number
  totalInvested: number
  currentValue: number
}

/* ── Route / screen ── */
export type Screen =
  | 'dashboard'
  | 'browse'
  | 'detail'
  | 'create'
  | 'calc'
  | 'history'
  | 'settings'
  | 'login'
  | 'signup'

export type LoginMode = 'login' | 'signup'

export interface ToastPayload {
  message: string
  icon?: string
}

/* ── Store actions ── */
export type AppAction =
  | { type: 'go'; screen: Screen; assetId?: string; prefill?: Partial<Plan> }
  | { type: 'requireAuth'; pending?: AppAction }
  | { type: 'login' }
  | { type: 'setAuth'; value: boolean }
  | { type: 'logout' }
  | { type: 'addPlan'; plan: Omit<Plan, 'id' | 'startMonth' | 'totalInvested' | 'currentValue'> }
  | { type: 'showToast'; toast: ToastPayload }
  | { type: 'clearToast' }
