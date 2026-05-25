import Icon3D from '@/components/icons/Icon3D'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: string
  label: string
  value: string
  sub?: string
  positive?: boolean
}

function StatCard({ icon, label, value, sub, positive }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-ink-3 whitespace-nowrap">{label}</span>
        <Icon3D name={icon} size={26} />
      </div>
      <div className="mono-num font-black text-[18px] text-ink-1 tracking-tight whitespace-nowrap">{value}</div>
      {sub && (
        <div className={cn(
          'text-[11px] font-bold whitespace-nowrap',
          positive === true ? 'text-grass-600' : positive === false ? 'text-red-500' : 'text-ink-3',
        )}>
          {sub}
        </div>
      )}
    </div>
  )
}

interface StatGridProps {
  totalInvested: number
  profit: number
  profitPct: number
  streak: number
  fmtVND: (n: number) => string
  fmtPct: (n: number) => string
}

export default function StatGrid({ totalInvested, profit, profitPct, streak, fmtVND, fmtPct }: StatGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-5">
      <StatCard icon="coin"   label="Đã đầu tư" value={fmtVND(totalInvested)} sub="Tổng vốn vào" />
      <StatCard icon="growth" label="Lợi nhuận" value={fmtVND(profit)} sub={fmtPct(profitPct)} positive={profit >= 0} />
      <StatCard icon="fire"   label="Streak"    value={`${streak} tháng`} sub="Liên tục DCA" />
      <StatCard icon="trophy" label="Milestone" value="3 / 8" sub="Đã đạt" />
    </div>
  )
}
