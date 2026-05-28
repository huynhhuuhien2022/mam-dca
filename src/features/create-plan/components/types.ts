import type { Allocation, Freq } from '@/lib/types'

export interface PlanDraft {
  name: string
  emoji: string
  amount: number
  freq: Freq
  freqDays: number[]
  duration: number | null
  allocation: Allocation[]
}
