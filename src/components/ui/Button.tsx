import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'soft' | 'ghost' | 'dark' | 'white'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-grass-500 text-white shadow-cta hover:bg-grass-600 hover:-translate-y-px',
  soft:    'bg-grass-50 text-grass-800 hover:bg-grass-100',
  ghost:   'bg-white text-ink-1 border border-line hover:border-grass-500 hover:text-grass-600',
  dark:    'bg-ink-1 text-white hover:bg-ink-2',
  white:   'bg-white text-grass-800 shadow-cta hover:-translate-y-px',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-[13px]',
  md: 'px-5    py-2.5 text-[14.5px]',
  lg: 'px-6    py-3.5 text-[15px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all whitespace-nowrap active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
