import AssetLogo from '@/components/ui/AssetLogo'
import Button from '@/components/ui/Button'
import { fmtPct } from '@/lib/utils'
import type { Asset, AppAction } from '@/lib/types'

interface AssetRowProps {
  asset: Asset
  dispatch: (action: AppAction) => void
}

export default function AssetRow({ asset, dispatch }: AssetRowProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer hover:bg-canvas transition-colors"
      onClick={() => dispatch({ type: 'go', screen: 'detail', assetId: asset.id })}
    >
      <AssetLogo asset={asset} size={42} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-extrabold text-[14px]">{asset.id}</span>
          <span className="text-[11px] text-ink-3 font-bold truncate">· {asset.name}</span>
        </div>
        <div className="text-[11px] text-ink-3 truncate">{asset.sub}</div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="mono-num font-extrabold text-[11px] text-ink-3 whitespace-nowrap">
          5y · {asset.y5.toFixed(1)}%
        </div>
        <div className={`text-[12px] font-extrabold whitespace-nowrap ${asset.ytd >= 0 ? 'text-grass-600' : 'text-red-500'}`}>
          {fmtPct(asset.ytd)}
        </div>
      </div>

      <Button
        variant="soft"
        size="sm"
        className="flex-shrink-0"
        onClick={e => { e.stopPropagation(); dispatch({ type: 'go', screen: 'detail', assetId: asset.id }) }}
      >
        DCA →
      </Button>
    </div>
  )
}
