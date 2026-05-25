import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Plan } from './types'

/* ============================================================
   Tailwind class merge helper
   ============================================================ */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ============================================================
   Number formatters — ported from components.jsx
   ============================================================ */
export function fmtVND(n: number): string {
  if (!Number.isFinite(n)) return '0 ₫'
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tỷ ₫'
  if (Math.abs(n) >= 1_000_000)     return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tr ₫'
  if (Math.abs(n) >= 1_000)         return Math.round(n / 1000) + 'K ₫'
  return Math.round(n) + ' ₫'
}

export function fmtVNDfull(n: number): string {
  if (!Number.isFinite(n)) return '0 ₫'
  return Math.round(n).toLocaleString('vi-VN') + ' ₫'
}

export function fmtPct(n: number, withSign = true): string {
  const s = n >= 0 ? (withSign ? '+' : '') : ''
  return `${s}${n.toFixed(1)}%`
}

/* Hex color shade helper */
export function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  let r = (num >> 16) + Math.round(2.55 * percent)
  let g = ((num >> 8) & 0xff) + Math.round(2.55 * percent)
  let b = (num & 0xff) + Math.round(2.55 * percent)
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

/* ============================================================
   Sapling stage (portfolio value → 0..4)
   ============================================================ */
export function valueToStage(value: number): 0 | 1 | 2 | 3 | 4 {
  if (value < 1_000_000)   return 0
  if (value < 10_000_000)  return 1
  if (value < 50_000_000)  return 2
  if (value < 200_000_000) return 3
  return 4
}

export const STAGE_LABELS = ['Hạt giống', 'Mầm xanh', 'Cây nhỏ', 'Cây lớn', 'Đơm hoa'] as const

/* ============================================================
   Frequency helpers — ported from data.js freqHelpers
   ============================================================ */
const WEEK_SHORT: Record<number, string> = {
  1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 7: 'CN',
}
const WEEK_LONG: Record<number, string> = {
  1: 'thứ Hai', 2: 'thứ Ba', 3: 'thứ Tư', 4: 'thứ Năm',
  5: 'thứ Sáu', 6: 'thứ Bảy', 7: 'Chủ nhật',
}

function sortedDays(plan: Pick<Plan, 'freq' | 'freqDays'>): number[] {
  if (!plan.freqDays?.length) {
    return plan.freq === 'week' ? [1] : plan.freq === 'month' ? [1] : []
  }
  return [...plan.freqDays].sort((a, b) => a - b)
}

function joinVN(arr: string[]): string {
  if (arr.length <= 1) return arr[0] ?? ''
  if (arr.length === 2) return `${arr[0]} và ${arr[1]}`
  return `${arr.slice(0, -1).join(', ')} và ${arr[arr.length - 1]}`
}

export const freqHelpers = {
  days: sortedDays,

  timesPerCycle(plan: Pick<Plan, 'freq' | 'freqDays'>): number {
    if (plan.freq === 'day') return 1
    return sortedDays(plan).length || 1
  },

  periodsPerYear(plan: Pick<Plan, 'freq' | 'freqDays'>): number {
    if (plan.freq === 'day')   return 250
    if (plan.freq === 'week')  return freqHelpers.timesPerCycle(plan) * 52
    if (plan.freq === 'month') return freqHelpers.timesPerCycle(plan) * 12
    return 12
  },

  unitLabel(plan: Pick<Plan, 'freq'>): string {
    return { day: 'ngày', week: 'tuần', month: 'tháng' }[plan.freq] ?? 'kỳ'
  },

  unitLabelShort(plan: Pick<Plan, 'freq'>): string {
    return { day: 'ng', week: 'tu', month: 'th' }[plan.freq] ?? 'kỳ'
  },

  description(plan: Pick<Plan, 'freq' | 'freqDays'>): string {
    if (plan.freq === 'day') return 'Mỗi ngày làm việc (T2–T6)'
    const d = sortedDays(plan)
    if (plan.freq === 'week') {
      const labels = d.map(x => WEEK_LONG[x] ?? '')
      return d.length === 1 ? `Mỗi ${labels[0]} hàng tuần` : `Mỗi ${joinVN(labels)} hàng tuần`
    }
    if (plan.freq === 'month') {
      return d.length === 1 ? `Ngày ${d[0]} hằng tháng` : `Ngày ${joinVN(d.map(String))} hằng tháng`
    }
    return ''
  },

  cadenceSummary(plan: Pick<Plan, 'freq' | 'freqDays'>): string {
    const times = freqHelpers.timesPerCycle(plan)
    const unit  = freqHelpers.unitLabel(plan)
    const total = freqHelpers.periodsPerYear(plan)
    if (plan.freq === 'day') return `~${total} lần / năm`
    return `${times} lần / ${unit} · ~${total} lần / năm`
  },

  weekLabel:     (n: number) => WEEK_SHORT[n] ?? '',
  weekLabelLong: (n: number) => WEEK_LONG[n]  ?? '',
}

/* ============================================================
   DCA projection math
   ============================================================ */
export function projectValue(
  amountPerPeriod: number,
  periodsPerYear: number,
  years: number,
  annualReturn: number,
): number {
  const r = annualReturn / 100 / periodsPerYear
  const n = periodsPerYear * years
  if (r === 0) return amountPerPeriod * n
  return amountPerPeriod * ((Math.pow(1 + r, n) - 1) / r)
}
