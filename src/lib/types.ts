/* ============================================================
   Domain types for Mầm DCA
   ============================================================ */

export type AssetCat = 'etf' | 'fund' | 'stock' | 'gold' | 'savings'
export type RiskLevel = 'Thấp' | 'Trung bình' | 'Cao'
export type Freq = 'day' | 'week' | 'month'

export interface Asset {
  id: string
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
  id: string
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
  createdAt?: string
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
  | 'planDetail'
  | 'planHistory'
  | 'create'
  | 'calc'
  | 'history'
  | 'profile'
  | 'profileEdit'
  | 'login'
  | 'signup'

export type LoginMode = 'login' | 'signup'

export interface ToastPayload {
  message: string
  icon?: string
}

/* ── Store actions ── */
export type AppAction =
  | { type: 'go'; screen: Screen; assetId?: string; planId?: string; prefill?: Partial<Plan> }
  | { type: 'setAssets'; assets: Asset[] }
  | { type: 'setPlans'; plans: Plan[] }
  | { type: 'setStreak'; streak: number }
  | { type: 'requireAuth'; pending?: AppAction }
  | { type: 'login' }
  | { type: 'setAuth'; value: boolean }
  | { type: 'logout' }
  | { type: 'addPlan'; plan: Omit<Plan, 'id' | 'startMonth' | 'totalInvested' | 'currentValue'>; id?: string }
  | { type: 'updatePlan'; id: string; plan: Omit<Plan, 'id' | 'startMonth' | 'totalInvested' | 'currentValue'> }
  | { type: 'showToast'; toast: ToastPayload }
  | { type: 'clearToast' }
