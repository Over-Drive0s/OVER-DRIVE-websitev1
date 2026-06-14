import { formatMoneyDisplay } from '../../lib/formatMoney'

type ProfileRevenueDonutProps = {
  totalBudget: number
  amountPaid: number
  size?: number
  centerLabel?: string
  metricLabel?: string
}

export default function ProfileRevenueDonut({
  totalBudget,
  amountPaid,
  size = 148,
  centerLabel = 'Collected',
  metricLabel = 'revenue',
}: ProfileRevenueDonutProps) {
  const balanceDue = Math.max(0, totalBudget - amountPaid)
  const total = totalBudget > 0 ? totalBudget : 1
  const collectedPercent =
    totalBudget > 0 ? Math.round((amountPaid / totalBudget) * 100) : 0

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
      className="relative isolate shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        totalBudget > 0
          ? `${formatMoneyDisplay(amountPaid)} ${centerLabel.toLowerCase()} of ${formatMoneyDisplay(totalBudget)} ${metricLabel}`
          : `No platform ${metricLabel} recorded`
      }
    >
      <svg
        viewBox="0 0 36 36"
        className="h-full w-full -rotate-90"
        aria-hidden
      >
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3.2"
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
              strokeWidth="3.2"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          )
          offset += dash
          return element
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <p
          className={`text-sm font-bold tabular-nums leading-tight ${
            totalBudget > 0 ? 'text-white' : 'text-slate-500'
          }`}
        >
          {totalBudget > 0 ? formatMoneyDisplay(amountPaid) : '—'}
        </p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
          {centerLabel}
        </p>
        {totalBudget > 0 && (
          <p className="mt-0.5 text-[8px] font-medium text-emerald-400/90">{collectedPercent}%</p>
        )}
      </div>
    </div>
  )
}
