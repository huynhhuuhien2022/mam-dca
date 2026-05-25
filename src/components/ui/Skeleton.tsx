interface SkeletonProps {
  className?: string
  height?: number | string
  width?: number | string
  rounded?: string
}

export default function Skeleton({ className = '', height = 16, width = '100%', rounded = 'rounded-xl' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded} ${className}`}
      style={{ height, width }}
      aria-hidden
    />
  )
}

export function HeroSkeleton() {
  return (
    <div className="rounded-3xl p-4 bg-grass-900 relative overflow-hidden" style={{ minHeight: 200 }}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Skeleton height={10} width="60%" rounded="rounded-full" className="mb-3" />
          <Skeleton height={30} width="80%" rounded="rounded-xl" className="mb-2" />
          <Skeleton height={22} width="50%" rounded="rounded-full" />
        </div>
        <Skeleton height={104} width={80} rounded="rounded-2xl" />
      </div>
      <Skeleton height={56} rounded="rounded-xl" className="mt-4" />
      <div className="flex gap-2 mt-3">
        <Skeleton height={36} rounded="rounded-full" className="flex-1" />
        <Skeleton height={36} width={36} rounded="rounded-full" />
      </div>
    </div>
  )
}
