import { useMemo } from 'react'

interface AreaChartProps {
  data: number[]
  color?: string
  height?: number
  showAxis?: boolean
  animate?: boolean
}

export default function AreaChart({
  data,
  color = '#22C55E',
  height = 240,
  showAxis = true,
  animate = true,
}: AreaChartProps) {
  const uid = useMemo(() => 'ac' + Math.random().toString(36).slice(2, 7), [])

  if (!data?.length) return null

  const width = 600
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 16
  const h = height - pad * 2
  const step = width / (data.length - 1)

  const points = data.map((v, i) => [
    i * step,
    pad + h - ((v - min) / range) * h,
  ] as [number, number])

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${path} L ${width} ${height} L 0 ${height} Z`
  const last = points[points.length - 1]

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.32" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        {animate && (
          <clipPath id={`${uid}-clip`}>
            <rect x="0" y="0" width={width} height={height}>
              <animate attributeName="width" from="0" to={width} dur="0.9s" calcMode="spline"
                keySplines="0.4 0 0.2 1" keyTimes="0;1" fill="freeze" />
            </rect>
          </clipPath>
        )}
      </defs>

      {showAxis && [0, 0.25, 0.5, 0.75, 1].map(t => (
        <line
          key={t}
          x1="0" y1={pad + h * t}
          x2={width} y2={pad + h * t}
          stroke="#E6EBE7" strokeDasharray="3 4" strokeWidth="1"
        />
      ))}

      <g clipPath={animate ? `url(#${uid}-clip)` : undefined}>
        <path d={area} fill={`url(#${uid})`} />
        <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Dot fades in after line draws */}
      <circle cx={last[0]} cy={last[1]} r={4} fill="white" stroke={color} strokeWidth="2.5"
        style={animate ? { opacity: 0, animation: 'fadeUp 0.3s ease 0.85s forwards' } : undefined} />
    </svg>
  )
}
