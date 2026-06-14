import type { CSSProperties, ReactNode } from 'react'
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Layers,
  Settings,
  TrendingUp,
} from 'lucide-react'

const metrics = [
  { label: 'Active simulators', value: '6', change: '↑ 2 live' },
  { label: 'Ops health', value: '98%', change: '↑ 2.1%' },
  { label: 'Deployments', value: '24', change: 'All synced' },
  { label: 'Uptime', value: '99.9%', change: 'Stable' },
]

function Panel({
  className = '',
  style,
  children,
}: {
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-[#080a0f]/95 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export default function IndexHeroDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-8 rounded-full bg-[#0080ff]/10 blur-[80px] animate-pulse-glow" />
      <div className="absolute right-0 top-1/4 h-40 w-40 rounded-full bg-[#ccff00]/[0.08] blur-[60px]" />

      <div
        className="relative mx-auto w-full"
        style={{ perspective: '1400px' }}
      >
        <div
          className="relative transition-transform duration-700 hover:scale-[1.02]"
          style={{ transform: 'rotateY(-14deg) rotateX(8deg) rotateZ(-1deg)' }}
        >
          <Panel
            className="absolute -left-4 top-8 z-0 hidden w-[78%] opacity-55 sm:block"
            style={{ transform: 'translateZ(-80px) scale(0.92)' }}
          >
            <div className="border-b border-white/[0.06] px-3 py-2">
              <div className="flex items-center gap-2">
                <Layers size={12} className="text-white/30" />
                <span className="text-[10px] text-white/35">Simulator registry</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-md bg-white/[0.04]" />
              ))}
            </div>
          </Panel>

          <Panel
            className="absolute -right-2 top-4 z-[1] hidden w-[72%] opacity-70 md:block"
            style={{ transform: 'translateZ(-40px) scale(0.96)' }}
          >
            <div className="border-b border-white/[0.06] px-3 py-2">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-[#0080ff]/70" />
                <span className="text-[10px] text-white/40">Runtime monitor</span>
              </div>
            </div>
            <div className="space-y-2 p-3">
              {[72, 54, 88].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${w}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="relative z-10 glow-brand">
            <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-30" />

            <div className="flex border-b border-white/[0.08]">
              <div className="hidden w-10 shrink-0 flex-col items-center gap-2.5 border-r border-white/[0.06] bg-white/[0.02] py-3 sm:flex">
                {[LayoutDashboard, BarChart3, TrendingUp, Settings].map((Icon, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-1.5 ${
                      i === 0
                        ? 'bg-[#0080ff]/15 text-[#0080ff]'
                        : 'text-white/25'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                ))}
              </div>

              <div className="min-w-0 flex-1 p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/35">Command center</p>
                    <p className="text-sm font-semibold text-white">Simulator Dashboard</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2 py-0.5 text-[9px] font-medium text-[#ccff00]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ccff00]" />
                    Live
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-2"
                    >
                      <p className="truncate text-[8px] uppercase tracking-wider text-white/35">{m.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{m.value}</p>
                      <p className="mt-0.5 text-[8px] text-[#ccff00]/80">{m.change}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <p className="mb-2 text-[10px] font-medium text-white/55">Throughput</p>
                    <div className="relative h-24">
                      <div className="absolute inset-0 grid grid-rows-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="border-t border-white/[0.05]" />
                        ))}
                      </div>
                      <svg viewBox="0 0 400 120" className="relative h-full w-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="indexHeroFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0080ff" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#ccff00" stopOpacity="0.04" />
                          </linearGradient>
                          <linearGradient id="indexHeroLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#0080ff" />
                            <stop offset="100%" stopColor="#ccff00" />
                          </linearGradient>
                        </defs>
                        <polygon
                          fill="url(#indexHeroFill)"
                          points="0,85 60,78 120,92 180,62 240,68 300,42 360,48 400,28 400,120 0,120"
                        />
                        <polyline
                          fill="none"
                          stroke="url(#indexHeroLine)"
                          strokeWidth="2.5"
                          points="0,85 60,78 120,92 180,62 240,68 300,42 360,48 400,28"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <p className="mb-2 text-[10px] font-medium text-white/55">System load</p>
                    <div className="flex h-24 items-end gap-1">
                      {[38, 62, 48, 78, 55, 84, 44, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-brand-gradient opacity-70"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <div
            className="absolute -bottom-3 left-1/2 z-0 h-8 w-[70%] -translate-x-1/2 rounded-[100%] bg-[#0080ff]/20 blur-2xl"
            style={{ transform: 'translateX(-50%) translateZ(-20px)' }}
          />
        </div>
      </div>
    </div>
  )
}
