import { fmtVND } from '@/lib/utils'

const TIERS = [
  { value: 1_000_000,     label: 'Đầu tiên 1 triệu',   icon: '🌱' },
  { value: 10_000_000,    label: '10 triệu chính thức', icon: '🌿' },
  { value: 50_000_000,    label: 'Nửa trăm triệu',      icon: '🌳' },
  { value: 100_000_000,   label: 'Cột mốc 100 triệu',   icon: '🏆' },
  { value: 500_000_000,   label: 'Nửa tỷ — nửa đường',  icon: '💎' },
  { value: 1_000_000_000, label: 'Tỷ phú trẻ',          icon: '👑' },
]

export default function MilestonePanel({ totalValue }: { totalValue: number }) {
  const next = TIERS.find(t => t.value > totalValue) ?? TIERS[TIERS.length - 1]
  const prev = [...TIERS].reverse().find(t => t.value <= totalValue)
  const base = prev ? prev.value : 0
  const progress = ((totalValue - base) / (next.value - base)) * 100

  return (
    <div
      className="rounded-3xl p-4 border border-amber-200 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.1em] font-bold text-amber-900">Cột mốc tiếp theo</div>
          <div className="text-lg font-black mt-1.5 text-amber-950">
            {next.icon} {next.label}
          </div>
          <div className="text-[12px] mt-1.5 font-bold text-amber-900">
            Còn {fmtVND(next.value - totalValue)} 🎯
          </div>
        </div>
        <span className="text-2xl">🏆</span>
      </div>

      <div className="mt-4">
        <div className="h-3 bg-amber-900/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, progress)}%`,
              background: 'linear-gradient(90deg, #F59E0B, #FB923C)',
              boxShadow: '0 0 12px rgba(251,146,60,0.6)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] font-bold text-amber-900">
          <span>{fmtVND(base)}</span>
          <span>{progress.toFixed(0)}%</span>
          <span>{fmtVND(next.value)}</span>
        </div>
      </div>

      <div className="mt-4 px-3.5 py-3 rounded-xl bg-white/60 border border-dashed border-amber-300">
        <div className="text-[12px] font-extrabold text-amber-950">💡 Mẹo nhỏ</div>
        <div className="text-[12px] mt-1.5 leading-snug text-amber-900">
          Cứ duy trì DCA đều đặn, cây non sẽ tự nó lớn lên! Đừng dừng giữa chừng nhé.
        </div>
      </div>
    </div>
  )
}
