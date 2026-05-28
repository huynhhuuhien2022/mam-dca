export default function Stepper({ step }: { step: number }) {
  const labels = ['Mục tiêu', 'Tài sản', 'Xác nhận', 'Xong']

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-extrabold text-ink-3 mono-num">{Math.min(step + 1, 4)}/4</span>
      <div className="flex items-center gap-1">
        {labels.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-grass-500 w-5' : 'bg-gray-200 w-3'}`}
          />
        ))}
      </div>
    </div>
  )
}
