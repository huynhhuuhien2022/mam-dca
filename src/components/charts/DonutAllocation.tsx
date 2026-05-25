interface DonutSlice {
  color: string
  pct: number
}

interface DonutAllocationProps {
  items: DonutSlice[]
  size?: number
  stroke?: number
}

export default function DonutAllocation({ items, size = 180, stroke = 22 }: DonutAllocationProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let acc = 0

  return (
    <svg width={size} height={size}>
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F4F2" strokeWidth={stroke} />
      {/* Slices */}
      {items.map((it, i) => {
        const len = (it.pct / 100) * c
        const rot = (acc / 100) * 360 - 90
        acc += it.pct
        return (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={it.color}
            strokeWidth={stroke}
            strokeDasharray={`${len.toFixed(2)} ${(c - len).toFixed(2)}`}
            strokeLinecap="butt"
            transform={`rotate(${rot} ${size / 2} ${size / 2})`}
          />
        )
      })}
    </svg>
  )
}
