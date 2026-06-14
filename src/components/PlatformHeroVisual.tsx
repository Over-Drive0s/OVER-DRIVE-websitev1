import { useState } from 'react'
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Link2,
  Settings,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import type { IllustrationType } from './ModuleIllustrations'

const moduleTabs: { id: IllustrationType; label: string; icon: typeof Boxes }[] = [
  { id: 'systems', label: 'Systems', icon: Boxes },
  { id: 'dashboard', label: 'Dashboards', icon: BarChart3 },
  { id: 'automation', label: 'Automations', icon: Zap },
  { id: 'integration', label: 'Integrations', icon: Link2 },
]

const tabMetrics: Record<IllustrationType, { label: string; value: string; change: string }[]> = {
  systems: [
    { label: 'Tools Connected', value: '12', change: '↑ 2 this month' },
    { label: 'Data Sources', value: '8', change: 'All synced' },
    { label: 'Uptime', value: '99.9%', change: '↑ 0.1%' },
    { label: 'API Calls', value: '24K', change: '↑ 18% today' },
  ],
  dashboard: [
    { label: 'Operations Health', value: '98%', change: '↑ 2.1% this week' },
    { label: 'Active Views', value: '24', change: '6 roles configured' },
    { label: 'Revenue', value: '$2.84M', change: '↑ 12.6%' },
    { label: 'On Time', value: '92%', change: '↑ 6.7%' },
  ],
  automation: [
    { label: 'Runs Today', value: '847', change: '↑ 124 vs yesterday' },
    { label: 'Success Rate', value: '99.4%', change: '↑ 0.2%' },
    { label: 'Time Saved', value: '38h', change: 'Est. this week' },
    { label: 'Active Flows', value: '24', change: '3 running now' },
  ],
  integration: [
    { label: 'Integrations', value: '12', change: 'All operational' },
    { label: 'Sync Latency', value: '<2s', change: '↓ 0.4s improved' },
    { label: 'Records Synced', value: '1.2M', change: '↑ 8% this week' },
    { label: 'Error Rate', value: '0.02%', change: '↓ 0.01%' },
  ],
}

function FloatingIcon({
  icon: Icon,
  className,
  accent = 'blue',
}: {
  icon: typeof Boxes
  className: string
  accent?: 'blue' | 'lime'
}) {
  return (
    <div
      className={`absolute flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border bg-[#0c1018]/95 backdrop-blur-sm transition-all duration-300 hover:scale-110 ${className} ${
        accent === 'blue'
          ? 'border-[#0080ff]/30 shadow-[0_0_20px_rgba(0,128,255,0.2)] hover:glow-brand-blue'
          : 'border-[#ccff00]/25 shadow-[0_0_20px_rgba(204,255,0,0.12)] hover:glow-brand-lime'
      }`}
    >
      <Icon size={18} className={accent === 'blue' ? 'text-[#0080ff]' : 'text-[#ccff00]'} strokeWidth={1.5} />
    </div>
  )
}

interface PlatformHeroVisualProps {
  activeModule?: IllustrationType
  onModuleChange?: (module: IllustrationType) => void
  compact?: boolean
}

export default function PlatformHeroVisual({
  activeModule = 'systems',
  onModuleChange,
  compact = false,
}: PlatformHeroVisualProps) {
  const [hoveredStat, setHoveredStat] = useState(0)

  const metrics = tabMetrics[activeModule]

  return (
    <div className="relative w-full">
      <div className="absolute -inset-6 rounded-full bg-[#0080ff]/[0.05] blur-[60px] animate-pulse-glow" />
      <div className="absolute -inset-3 rounded-full bg-[#ccff00]/[0.03] blur-[40px]" />

      <FloatingIcon icon={Boxes} className="-left-1 top-6 z-20 animate-float" accent="blue" />
      <FloatingIcon icon={BarChart3} className="-right-1 top-12 z-20 animate-float-delayed" accent="lime" />
      <FloatingIcon icon={Zap} className="-left-3 bottom-20 z-20 animate-float-slow" accent="lime" />
      <FloatingIcon icon={Link2} className="-right-3 bottom-12 z-20 animate-float" accent="blue" />

      <div
        className="glow-brand relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-[#080a0f]/95 shadow-[0_24px_80px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.01]"
        style={{ transform: 'perspective(1200px) rotateY(-6deg) rotateX(3deg)' }}
      >
        <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-40" />

        <div className="flex">
          <div className="hidden w-11 shrink-0 flex-col items-center gap-3 border-r border-white/10 bg-white/[0.02] py-4 sm:flex">
            {[LayoutDashboard, Workflow, Users, Settings].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className={`rounded-lg p-1.5 transition-all duration-200 ${
                  i === 0
                    ? 'bg-[#0080ff]/15 text-[#0080ff] shadow-[0_0_12px_rgba(0,128,255,0.2)]'
                    : 'text-white/30 hover:bg-white/5 hover:text-white/60'
                }`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>

          <div className={`min-w-0 flex-1 ${compact ? 'p-3' : 'p-4'}`}>
            <div className="mb-3 flex flex-wrap gap-1">
              {moduleTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onModuleChange?.(tab.id)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium transition-all duration-200 ${
                    activeModule === tab.id
                      ? 'bg-[#0080ff]/15 text-[#0080ff] shadow-[0_0_12px_rgba(0,128,255,0.15)]'
                      : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                  }`}
                >
                  <tab.icon size={11} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {metrics.map((m, i) => (
                <button
                  key={m.label}
                  type="button"
                  onMouseEnter={() => setHoveredStat(i)}
                  className={`rounded-lg border px-2.5 py-2 text-left transition-all duration-200 ${
                    hoveredStat === i
                      ? 'border-[#0080ff]/40 bg-[#0080ff]/[0.08] glow-brand-blue'
                      : 'border-white/10 bg-white/[0.03] hover:border-[#ccff00]/20'
                  }`}
                >
                  <p className="truncate text-[8px] uppercase tracking-wider text-white/35">{m.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{m.value}</p>
                  <p className="mt-0.5 text-[8px] text-[#ccff00]/80">{m.change}</p>
                </button>
              ))}
            </div>

            <div className="animate-fade-up grid gap-2.5 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="mb-2 text-[10px] font-medium text-white/60">Performance Overview</p>
                <div className="relative h-28">
                  <div className="absolute inset-0 grid grid-rows-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-white/5" />
                    ))}
                  </div>
                  <svg viewBox="0 0 400 120" className="relative h-full w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0080ff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ccff00" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="heroChartLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0080ff" />
                        <stop offset="100%" stopColor="#ccff00" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#heroChartFill)"
                      points="0,80 50,90 100,70 150,75 200,50 250,55 300,35 350,40 400,20 400,120 0,120"
                    />
                    <polyline
                      className="animate-draw-line"
                      fill="none"
                      stroke="url(#heroChartLine)"
                      strokeWidth="2"
                      points="0,80 50,90 100,70 150,75 200,50 250,55 300,35 350,40 400,20"
                    />
                  </svg>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="mb-2 text-[10px] font-medium text-white/60">Live Status</p>
                <div className="space-y-2">
                  {['Processing', 'Syncing', 'Idle'].map((status, i) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-brand-gradient animate-data-pulse"
                          style={{
                            width: i === 0 ? '85%' : i === 1 ? '60%' : '20%',
                            animationDelay: `${i * 0.4}s`,
                          }}
                        />
                      </div>
                      <span className="w-14 text-[9px] text-white/40">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2.5 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-white/60">System Pulse</p>
                <span className="flex items-center gap-1.5 text-[9px] text-[#ccff00]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ccff00]" />
                  Live
                </span>
              </div>
              <div className={`mt-2 flex items-end gap-0.5 ${compact ? 'h-6' : 'h-8'}`}>
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-brand-gradient opacity-60 transition-all duration-200 hover:opacity-100"
                    style={{
                      height: `${20 + Math.sin(i * 0.8) * 15 + Math.cos(i * 0.5) * 10}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
