'use client'

import Image from 'next/image'
import { icons, type IconName } from '@/assets'

interface ImgIconProps {
  name: IconName
  size?: number
  className?: string
}

export default function ImgIcon({ name, size = 32, className }: ImgIconProps) {
  const src = icons[name]
  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    />
  )
}
