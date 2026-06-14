import {
  ArrowUpRight,
  Globe,
  LayoutDashboard,
  Monitor,
  PanelsTopLeft,
  Rocket,
  Shield,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PlatformBackground from '../components/PlatformBackground'
import SystemsSimulationsDeckSection from '../components/SystemsSimulationsDeckSection'
import { linkedSystems, upcomingSystems } from '../data/systemsPortfolio'

const heroStats = [
  { value: '7', label: 'Live systems', color: 'text-[#ccff00]' },
  { value: '3', label: 'Dashboard builds', color: 'text-[#0080ff]' },
  { value: '3', label: 'Website builds', color: 'text-[#0080ff]' },
  { value: '99.9%', label: 'Uptime SLA', color: 'text-[#ccff00]' },
]

const systemCategories = [
  { icon: LayoutDashboard, label: 'Dashboards', count: 3, accent: 'blue' as const },
  { icon: Globe, label: 'Websites', count: 3, accent: 'lime' as const },
  { icon: Shield, label: 'Admin panels', count: 1, accent: 'blue' as const },
]

const displaySystems = [...linkedSystems, ...upcomingSystems]

function SystemsHeroPanel() {
  return (
    <div className="relative w-full">
      <div className="absolute -inset-6 rounded-full bg-[#0080ff]/[0.07] blur-[60px]" />
      <div className="absolute -right-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#ccff00]/[0.05] blur-[70px]" />

      <div className="glow-brand relative overflow-hidden rounded-2xl border border-white/10 bg-[#080a0f]/90 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-25" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,128,255,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-25" />

        <div className="relative border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#0080ff]/30 bg-[#0080ff]/10">
                <Monitor size={16} className="text-[#0080ff]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Systems control
                </p>
                <p className="text-sm font-semibold text-white">Production library</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2.5 py-1 text-[10px] font-medium text-[#ccff00]">
              <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
              All systems online
            </span>
          </div>
        </div>

        <div className="relative space-y-3 p-5">
          {systemCategories.map(({ icon: Icon, label, count, accent }) => (
            <div
              key={label}
              className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 transition-colors hover:border-[#0080ff]/30 hover:bg-[#0080ff]/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    accent === 'lime'
                      ? 'border-[#ccff00]/25 bg-[#ccff00]/10'
                      : 'border-[#0080ff]/25 bg-[#0080ff]/10'
                  }`}
                >
                  <Icon
                    size={15}
                    className={accent === 'lime' ? 'text-[#ccff00]' : 'text-[#0080ff]'}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-[10px] text-white/35">Deployed & maintained</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold ${
                    accent === 'lime' ? 'text-[#ccff00]' : 'text-[#0080ff]'
                  }`}
                >
                  {count}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-white/30">active</p>
              </div>
            </div>
          ))}

          <div className="mt-1 rounded-xl border border-[#0080ff]/20 bg-[#0080ff]/[0.06] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0080ff]/80">
                  Simulations deck
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">
                  Launch live simulators below — dashboards, metrics, trading, inventory, and
                  more built on Overdrive IO.
                </p>
              </div>
              <PanelsTopLeft size={18} className="shrink-0 text-[#0080ff]/50" strokeWidth={1.5} />
            </div>
            <div className="mt-3 flex gap-1">
              {displaySystems.map((s) => (
                <span
                  key={s.id}
                  className={`h-1.5 flex-1 rounded-full ${
                    s.accent === 'lime' ? 'bg-[#ccff00]/40' : 'bg-[#0080ff]/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Systems() {
  return (
    <div data-scroll-root className="relative flex min-h-full flex-col bg-[#050607]">
      <div className="relative flex min-h-0 shrink-0 flex-col border-b border-white/[0.06] lg:min-h-[46%]">
        <PlatformBackground />

        <section className="relative mx-auto grid h-full min-h-0 max-w-7xl gap-8 px-6 pb-8 pt-6 lg:grid-cols-[44%_56%] lg:items-center lg:gap-10 lg:pb-10 lg:pt-10">
          <div className="z-10 flex flex-col justify-center">
            <div className="mb-5">
              <div className="mb-3 h-px w-8 bg-[#0080ff]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
                Systems
              </p>
            </div>

            <h1 className="max-w-lg text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white lg:text-[2.75rem]">
              Dashboards, websites &{' '}
              <span className="text-[#0080ff]">admin panels</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-[1.7] text-white/50">
              Production-ready systems we've designed and deployed — from operational
              dashboards to client websites and internal control panels.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/request-demo"
                className="group inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
              >
                <Rocket size={15} />
                Request a system
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <Link
                to="/deployments"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                View deployments
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/[0.08] bg-[#080a0e]/80 px-3 py-2.5 backdrop-blur-sm transition-colors hover:border-[#0080ff]/30"
                >
                  <p className={`text-base font-semibold lg:text-lg ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex min-h-0 items-center">
            <SystemsHeroPanel />
          </div>
        </section>
      </div>

      <SystemsSimulationsDeckSection />
    </div>
  )
}
