import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type ChipVariant = 'default' | 'success' | 'danger' | 'warn' | 'info' | 'primary'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  variant?: ChipVariant
}

const variantActive: Record<ChipVariant, string> = {
  default: 'bg-grass-500 text-white border-grass-500',
  primary: 'bg-grass-500 text-white border-grass-500',
  success: 'bg-grass-50 text-grass-800 border-grass-200',
  danger:  'bg-red-50 text-red-600 border-red-200',
  warn:    'bg-amber-50 text-amber-700 border-amber-200',
  info:    'bg-sky-50 text-sky-700 border-sky-200',
}

const variantInactive: Record<ChipVariant, string> = {
  default: 'bg-white text-ink-2 border-line hover:border-grass-300',
  primary: 'bg-white text-ink-2 border-line hover:border-grass-300',
  success: 'bg-grass-50 text-grass-800 border-grass-200',
  danger:  'bg-red-50 text-red-600 border-red-200',
  warn:    'bg-amber-50 text-amber-700 border-amber-200',
  info:    'bg-sky-50 text-sky-700 border-sky-200',
}

export default function Chip({
  children,
  variant = 'default',
  active = false,
  className,
  ...props
}: ChipProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-9 items-center justify-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] font-extrabold whitespace-nowrap transition-colors cursor-pointer active:scale-95',
        active ? variantActive[variant] : variantInactive[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
