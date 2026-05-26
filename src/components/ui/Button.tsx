'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold',
    'whitespace-nowrap transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-grass-500/20',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-grass-500 text-white shadow-cta hover:bg-grass-600',
        soft: 'bg-grass-50 text-grass-800 hover:bg-grass-100',
        ghost: 'border border-line bg-white text-ink-1 hover:border-grass-500 hover:text-grass-600',
        dark: 'bg-ink-1 text-white shadow-card hover:bg-ink-2',
        white: 'bg-white text-grass-800 shadow-cta hover:bg-grass-50',
        magic: 'magic-shimmer bg-[linear-gradient(135deg,#16A34A_0%,#22C55E_52%,#86EFAC_100%)] text-white shadow-cta',
      },
      size: {
        sm: 'min-h-9 gap-2 px-4.5 py-2 text-[13px]',
        md: 'min-h-11 gap-2.5 px-5.5 py-2.5 text-[14.5px]',
        lg: 'min-h-12 gap-3 px-6 py-3.5 text-[15px]',
        icon: 'h-11 w-11 gap-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode
}

export default function Button({
  variant,
  size,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.5 }}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export { buttonVariants }
