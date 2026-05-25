interface MiniStatProps {
  label: string
  value: string
  sub?: string
}

export default function MiniStat({ label, value, sub }: MiniStatProps) {
  return (
    <div className="bg-grass-50 border border-grass-100 rounded-xl p-3 flex flex-col gap-1">
      <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-ink-3">{label}</div>
      <div className="mono-num font-black text-[16px] text-ink-1">{value}</div>
      {sub && <div className="text-[11px] font-semibold text-ink-4">{sub}</div>}
    </div>
  )
}
