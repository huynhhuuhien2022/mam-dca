import { useMemo } from 'react'

interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  fill?: boolean
}

export default function Sparkline({
  data,
  color = '#22C55E',
  width = 100,
  height = 32,
  fill = true,
}: SparklineProps) {
  const uid = useMemo(() => 'sp' + Math.random().toString(36).slice(2, 7), [])

  if (!data?.length) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)

  const points = data.map((v, i) => [
    i * step,
    height - ((v - min) / range) * height * 0.85 - height * 0.075,
  ] as [number, number])

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${path} L ${width} ${height} L 0 ${height} Z`
  const last = points[points.length - 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${uid})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  )
}
