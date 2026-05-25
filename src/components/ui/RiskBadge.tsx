import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/lib/types'

const styles: Record<RiskLevel, string> = {
  'Cao':       'bg-red-50 text-red-600 border-red-200',
  'Thấp':      'bg-sky-50 text-sky-700 border-sky-200',
  'Trung bình': 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap',
      styles[risk],
    )}>
      {risk}
    </span>
  )
}
