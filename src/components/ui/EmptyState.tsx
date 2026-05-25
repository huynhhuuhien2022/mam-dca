import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  sub?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, sub, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6">
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <div className="text-xl font-bold text-ink-1">{title}</div>
      {sub && <div className="text-ink-3 mt-1.5 max-w-sm mx-auto text-sm">{sub}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
