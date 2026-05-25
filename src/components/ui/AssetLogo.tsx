import { cn } from '@/lib/utils'
import { shade } from '@/lib/utils'
import type { Asset } from '@/lib/types'

interface AssetLogoProps {
  asset: Pick<Asset, 'id' | 'color'>
  size?: number
  className?: string
}

export default function AssetLogo({ asset, size = 40, className }: AssetLogoProps) {
  const txt = asset.id.length <= 4 ? asset.id : asset.id.slice(0, 3)
  return (
    <div
      className={cn('grid place-items-center font-black flex-shrink-0 text-white', className)}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: `linear-gradient(140deg, ${asset.color}, ${shade(asset.color, -25)})`,
        fontSize: size * 0.32,
        letterSpacing: '-0.02em',
        boxShadow: `0 4px 12px ${asset.color}44, inset 0 1px 0 rgba(255,255,255,0.3)`,
      }}
    >
      {txt}
    </div>
  )
}
