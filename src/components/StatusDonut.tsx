interface DonutSegment {
  label: string
  value: number
  color: string
}

interface StatusDonutProps {
  title: string
  subtitle: string
  segments: DonutSegment[]
  centerValue: string
  centerLabel: string
  size?: number
}

export default function StatusDonut({
  title,
  subtitle,
  segments,
  centerValue,
  centerLabel,
  size = 128,
}: StatusDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const radius = 15.9
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="inv-panel inv-panel-pad flex h-full flex-col">
      <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-1 text-[11px] text-white/40">{subtitle}</p>

      <div className="relative mx-auto my-4 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--inv-chart-track)" strokeWidth="3.2" />
          {segments.map((seg) => {
            const pct = seg.value / total
            const dash = pct * circumference
            const el = (
              <circle
                key={seg.label}
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="3.2"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )
            offset += dash
            return el
          })}
        </svg>
        <div className="absolute text-center">
          <p className="text-xl font-semibold tabular-nums tracking-tight text-white">{centerValue}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">{centerLabel}</p>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-2 text-[11px]">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: seg.color }} />
              <span className="truncate text-white/55">{seg.label}</span>
            </div>
            <span className="shrink-0 font-semibold tabular-nums text-white">
              {seg.value.toLocaleString()}
              <span className="ml-1 text-white/35">({((seg.value / total) * 100).toFixed(0)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
