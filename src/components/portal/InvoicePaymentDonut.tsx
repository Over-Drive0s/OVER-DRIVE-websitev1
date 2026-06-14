type InvoicePaymentDonutProps = {
  totalBudget: number
  balanceDue: number
  size?: number
}

export default function InvoicePaymentDonut({
  totalBudget,
  balanceDue,
  size = 76,
}: InvoicePaymentDonutProps) {
  const amountPaid = Math.max(0, totalBudget - balanceDue)
  const total = totalBudget > 0 ? totalBudget : 1
  const paidPercent = totalBudget > 0 ? Math.round((amountPaid / totalBudget) * 100) : 0

  const segments =
    totalBudget > 0
      ? [
          { value: amountPaid, color: '#39ff14' },
          { value: balanceDue, color: '#f87171' },
        ].filter((segment) => segment.value > 0)
      : []

  const radius = 15.9
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden={totalBudget <= 0}
    >
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3.4"
        />
        {segments.map((segment, index) => {
          const pct = segment.value / total
          const dash = pct * circumference
          const element = (
            <circle
              key={`${segment.color}-${index}`}
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="3.4"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{
                filter:
                  segment.color === '#39ff14'
                    ? 'drop-shadow(0 0 4px rgba(57,255,20,0.55))'
                    : 'drop-shadow(0 0 4px rgba(248,113,113,0.45))',
              }}
            />
          )
          offset += dash
          return element
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p
          className={`text-sm font-bold tabular-nums leading-none ${
            totalBudget > 0 ? 'text-white' : 'text-slate-500'
          }`}
        >
          {totalBudget > 0 ? `${paidPercent}%` : '—'}
        </p>
        <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-slate-500">
          Paid
        </p>
      </div>
    </div>
  )
}
