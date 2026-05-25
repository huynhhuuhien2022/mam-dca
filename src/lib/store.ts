'use client'

import { create } from 'zustand'
import { samplePlans } from './data'
import type { AppAction, Plan, Screen, ToastPayload } from './types'

/* ============================================================
   App state — ported from App.jsx useReducer
   ============================================================ */
interface AppState {
  screen: Screen
  auth: boolean
  assetId: string | null
  plans: Plan[]
  totalValue: number
  totalInvested: number
  streak: number
  prefill: Partial<Plan> | null
  pendingAction: AppAction | null
  returnScreen: Screen | null
  toast: ToastPayload | null

  dispatch: (action: AppAction) => void
}

function derivePortfolio(plans: Plan[]) {
  return {
    totalValue:    plans.reduce((s, p) => s + p.currentValue, 0),
    totalInvested: plans.reduce((s, p) => s + p.totalInvested, 0),
  }
}

const { totalValue, totalInvested } = derivePortfolio(samplePlans)

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'dashboard',
  auth: false,
  assetId: null,
  plans: samplePlans,
  totalValue,
  totalInvested,
  streak: 14,
  prefill: null,
  pendingAction: null,
  returnScreen: null,
  toast: null,

  dispatch(action: AppAction) {
    set(state => reduce(state, action))
  },
}))

function reduce(state: AppState, action: AppAction): Partial<AppState> {
  switch (action.type) {
    case 'go':
      return {
        screen: action.screen,
        assetId: action.assetId ?? state.assetId,
        prefill: action.prefill ?? null,
      }

    case 'requireAuth': {
      const authScreens: Screen[] = ['login', 'signup']
      return {
        screen: 'login',
        returnScreen: authScreens.includes(state.screen)
          ? state.returnScreen
          : state.screen,
        pendingAction: action.pending ?? null,
      }
    }

    case 'login': {
      const pa = state.pendingAction
      const target: Screen = pa ? 'dashboard' : (state.returnScreen ?? 'dashboard')
      const base: Partial<AppState> = {
        auth: true,
        screen: target,
        returnScreen: null,
        pendingAction: null,
      }
      if (pa) {
        const extra = reduce({ ...state, ...base } as AppState, pa)
        return { ...base, ...extra }
      }
      return base
    }

    case 'logout':
      return { auth: false, screen: 'login', returnScreen: null, pendingAction: null }

    case 'addPlan': {
      const newPlan: Plan = {
        id: 'p' + (state.plans.length + 1),
        name: action.plan.name,
        emoji: action.plan.emoji,
        amount: action.plan.amount,
        freq: action.plan.freq,
        freqDays: action.plan.freqDays ?? [],
        duration: action.plan.duration ?? null,
        allocation: action.plan.allocation,
        startMonth: 0,
        totalInvested: 0,
        currentValue: 0,
      }
      const plans = [...state.plans, newPlan]
      return {
        plans, ...derivePortfolio(plans),
        toast: { message: `Đã tạo kế hoạch "${action.plan.name}" 🌱`, icon: '✓' },
      }
    }

    case 'showToast':
      return { toast: action.toast }

    case 'clearToast':
      return { toast: null }

    default:
      return {}
  }
}

/* ── Convenience selectors ── */
export const selectScreen  = (s: AppState) => s.screen
export const selectAuth    = (s: AppState) => s.auth
export const selectPlans   = (s: AppState) => s.plans
export const selectAssetId = (s: AppState) => s.assetId
