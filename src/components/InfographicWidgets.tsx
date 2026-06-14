import { ArrowRight, CheckCircle2, Link2, TrendingUp, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface WidgetProps {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  color: 'blue' | 'lime' | 'green' | 'amber'
  className?: string
}

const colorMap = {
  blue: {
    border: 'border-[#0080ff]/30',
    bg: 'bg-[#0080ff]/[0.06]',
    icon: 'text-[#0080ff]',
    glow: 'glow-brand-blue',
  },
  lime: {
    border: 'border-[#ccff00]/25',
    bg: 'bg-[#ccff00]/[0.05]',
    icon: 'text-[#ccff00]',
    glow: 'glow-brand-lime',
  },
  green: {
    border: 'border-[#ccff00]/25',
    bg: 'bg-[#ccff00]/[0.05]',
    icon: 'text-[#ccff00]',
    glow: 'glow-brand-lime',
  },
  amber: {
    border: 'border-[#0080ff]/20',
    bg: 'bg-[#0080ff]/[0.04]',
    icon: 'text-[#0080ff]/80',
    glow: 'shadow-[0_0_20px_rgba(0,128,255,0.12)]',
  },
}

export function FloatingWidget({
  icon: Icon,
  label,
  value,
  detail,
  color,
  className = '',
}: WidgetProps) {
  const c = colorMap[color]

  return (
    <div
      className={`absolute hidden rounded-xl border ${c.border} ${c.bg} ${c.glow} backdrop-blur-md lg:block ${className}`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className={`mt-0.5 rounded-md border ${c.border} p-1.5 ${c.bg}`}>
          <Icon size={14} className={c.icon} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
          <p className="text-sm font-semibold text-white">{value}</p>
          <p className="text-[11px] text-white/45">{detail}</p>
        </div>
      </div>
    </div>
  )
}

export function MiniSparkline({ points, color = '#4f7cff' }: { points: number[]; color?: string }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * 100
      const y = 35 - ((v - min) / range) * 25
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 40" className="h-8 w-full" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={coords} />
    </svg>
  )
}

export function MiniBarGraph({
  values,
  color = '#0080ff',
  height = 40,
  className = '',
}: {
  values: number[]
  color?: string
  height?: number
  className?: string
}) {
  const max = Math.max(...values, 1)

  return (
    <div
      className={`flex w-full items-end gap-1 ${className}`}
      style={{ height }}
      role="img"
      aria-label="Bar chart"
    >
      {values.map((value, index) => {
        const pct = Math.max(14, (value / max) * 100)
        return (
          <div
            key={index}
            className="api-bar-graph-col min-w-0 flex-1 rounded-sm"
            style={{
              height: `${pct}%`,
              background: `linear-gradient(to top, ${color}44, ${color})`,
              animationDelay: `${index * 0.07}s`,
            }}
          />
        )
      })}
    </div>
  )
}

interface ScenarioCardProps {
  title: string
  metric: string
  metricLabel: string
  sparkline: number[]
  active?: boolean
  onClick?: () => void
}

export function ScenarioCard({
  title,
  metric,
  metricLabel,
  sparkline,
  active = false,
  onClick,
}: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-xl border p-5 text-left transition-all duration-300 ${
        active
          ? 'border-blue-500/40 bg-blue-500/[0.06] glow-blue-sm'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <ArrowRight
          size={14}
          className={`text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400 ${
            active ? 'text-blue-400' : ''
          }`}
        />
      </div>
      <div className="mb-2">
        <span className="text-2xl font-semibold text-white">{metric}</span>
        <span className="ml-2 text-xs text-white/40">{metricLabel}</span>
      </div>
      <MiniSparkline points={sparkline} color={active ? '#4f7cff' : 'rgba(255,255,255,0.25)'} />
    </button>
  )
}

export function PipelineStep({
  step,
  title,
  description,
  active,
}: {
  step: string
  title: string
  description: string
  active?: boolean
}) {
  return (
    <div
      className={`relative rounded-xl border p-5 transition-all duration-300 ${
        active
          ? 'border-blue-500/35 bg-blue-500/[0.05] glow-blue-sm'
          : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-widest ${
          active ? 'text-blue-400' : 'text-white/35'
        }`}
      >
        {step}
      </span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-6 text-white/45">{description}</p>
      {active && (
        <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
      )}
    </div>
  )
}

export function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="text-xs font-medium text-emerald-400">Live platform preview</span>
    </div>
  )
}

export const widgetPresets = {
  automation: {
    icon: Zap,
    label: 'Automation',
    value: '847 runs today',
    detail: 'Last: Invoice sync · 2s ago',
    color: 'blue' as const,
  },
  integration: {
    icon: Link2,
    label: 'Integration',
    value: '12 systems connected',
    detail: 'CRM ↔ Inventory synced',
    color: 'lime' as const,
  },
  alert: {
    icon: CheckCircle2,
    label: 'Alert resolved',
    value: 'SLA restored',
    detail: 'Dispatch queue cleared',
    color: 'lime' as const,
  },
  growth: {
    icon: TrendingUp,
    label: 'Performance',
    value: '+18.2% throughput',
    detail: 'vs. last quarter',
    color: 'blue' as const,
  },
}
