const PERIOD_LABELS = ['W01', 'W02', 'W03', 'W04', 'W05', 'W06', 'W07', 'W08', 'W09', 'W10']

interface InboundOutboundChartProps {
  inbound: number[]
  outbound: number[]
}

function scaleY(value: number, min: number, max: number, height: number, padding: number) {
  const range = max - min || 1
  return height - padding - ((value - min) / range) * (height - padding * 2)
}

export default function InboundOutboundChart({ inbound, outbound }: InboundOutboundChartProps) {
  const all = [...inbound, ...outbound]
  const min = Math.floor(Math.min(...all) / 50) * 50 - 20
  const max = Math.ceil(Math.max(...all) / 50) * 50 + 20
  const w = 520
  const h = 200
  const padX = 36
  const padY = 24
  const chartW = w - padX * 2
  const step = chartW / (inbound.length - 1)

  const inboundPoints = inbound.map((v, i) => `${padX + i * step},${scaleY(v, min, max, h, padY)}`)
  const outboundPoints = outbound.map((v, i) => `${padX + i * step},${scaleY(v, min, max, h, padY)}`)
  const inboundArea = `${padX},${h - padY} ${inboundPoints.join(' ')} ${padX + (inbound.length - 1) * step},${h - padY}`
  const outboundArea = `${padX},${h - padY} ${outboundPoints.join(' ')} ${padX + (outbound.length - 1) * step},${h - padY}`

  const gridSteps = 4
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const y = padY + ((h - padY * 2) / gridSteps) * i
    const val = max - ((max - min) / gridSteps) * i
    return { y, val: Math.round(val) }
  })

  const lastInbound = inbound[inbound.length - 1] ?? 0
  const prevInbound = inbound[inbound.length - 2] ?? lastInbound
  const lastOutbound = outbound[outbound.length - 1] ?? 0
  const prevOutbound = outbound[outbound.length - 2] ?? lastOutbound
  const inboundDelta = prevInbound ? ((lastInbound - prevInbound) / prevInbound) * 100 : 0
  const outboundDelta = prevOutbound ? ((lastOutbound - prevOutbound) / prevOutbound) * 100 : 0

  return (
    <div className="inv-panel inv-panel-pad lg:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white">Inbound vs outbound</h3>
          <p className="mt-1 text-[11px] text-white/40">Weekly unit volume · warehouse simulator</p>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded bg-[var(--inv-chart-accent)]" />
            <span className="text-white/50">Inbound</span>
            <span className={`font-semibold tabular-nums ${inboundDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {inboundDelta >= 0 ? '+' : ''}{inboundDelta.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded bg-[var(--inv-chart-outbound)]" />
            <span className="text-white/50">Outbound</span>
            <span className={`font-semibold tabular-nums ${outboundDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {outboundDelta >= 0 ? '+' : ''}{outboundDelta.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="inv-metric-tile border-[#ccff00]/20 bg-[#ccff00]/[0.04]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]/90">Inbound this week</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{lastInbound.toLocaleString()}</p>
          <p className="text-[10px] text-white/35">units received</p>
        </div>
        <div className="inv-metric-tile border-[#0080ff]/20 bg-[#0080ff]/[0.04]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0080ff]/90">Outbound this week</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{lastOutbound.toLocaleString()}</p>
          <p className="text-[10px] text-white/35">units shipped</p>
        </div>
      </div>

      <div className="inv-chart-surface mt-4">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Inbound vs outbound weekly chart">
          {gridLines.map((line) => (
            <g key={line.y}>
              <line x1={padX} y1={line.y} x2={w - padX} y2={line.y} stroke="var(--inv-chart-grid)" strokeWidth="1" />
              <text x={padX - 6} y={line.y + 3} textAnchor="end" fill="var(--inv-chart-axis)" fontSize="8" fontFamily="ui-monospace, monospace">
                {line.val}
              </text>
            </g>
          ))}

          <polygon points={inboundArea} fill="var(--inv-chart-accent-fill)" />
          <polygon points={outboundArea} fill="var(--inv-chart-outbound-fill)" />

          <polyline fill="none" stroke="var(--inv-chart-accent)" strokeWidth="2.5" strokeLinejoin="round" points={inboundPoints.join(' ')} />
          <polyline fill="none" stroke="var(--inv-chart-outbound)" strokeWidth="2.5" strokeLinejoin="round" points={outboundPoints.join(' ')} />

          {inbound.map((v, i) => (
            <g key={`in-${i}`}>
              <circle cx={padX + i * step} cy={scaleY(v, min, max, h, padY)} r="3.5" fill="var(--inv-chart-accent)" stroke="var(--inv-chart-point-stroke)" strokeWidth="1.5" />
            </g>
          ))}
          {outbound.map((v, i) => (
            <g key={`out-${i}`}>
              <circle cx={padX + i * step} cy={scaleY(v, min, max, h, padY)} r="3.5" fill="var(--inv-chart-outbound)" stroke="var(--inv-chart-point-stroke)" strokeWidth="1.5" />
            </g>
          ))}

          {PERIOD_LABELS.map((label, i) => (
            <text
              key={label}
              x={padX + i * step}
              y={h - 6}
              textAnchor="middle"
              fill="var(--inv-chart-axis-secondary)"
              fontSize="8"
              fontFamily="ui-monospace, monospace"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-[10px] text-white/35">
        <span>Net flow: <strong className="text-white">+{(lastInbound - lastOutbound).toLocaleString()} units</strong> this week</span>
        <span className="font-mono">Y-axis: units · X-axis: fiscal weeks</span>
      </div>
    </div>
  )
}
