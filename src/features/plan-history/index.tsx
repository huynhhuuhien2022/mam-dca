'use client'

import History from '@/features/history'
import { useAppStore } from '@/lib/store'

export default function PlanHistory() {
  const planId = useAppStore((s) => s.planId)
  return <History planId={planId} />
}
