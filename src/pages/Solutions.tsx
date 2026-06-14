import {
  ArrowUpRight,
  Building2,
  Car,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Package,
  Users,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import AutomotiveRetailPopup from '../components/AutomotiveRetailPopup'
import DispatchFieldOpsPopup from '../components/DispatchFieldOpsPopup'
import JobTrackingMetricsPopup from '../components/JobTrackingMetricsPopup'
import ApprovalsReportingPopup from '../components/ApprovalsReportingPopup'
import StockWarehousePopup from '../components/StockWarehousePopup'
import PlatformBackground from '../components/PlatformBackground'

const audiences = [
  {
    id: 'operations',
    icon: Users,
    title: 'Operations Teams',
    tag: 'Job tracking & metrics',
    description:
      'Centralize job tracking, resource allocation, and performance metrics. Give ops leaders real-time visibility across every active workflow.',
    highlights: ['Live job boards', 'Resource allocation', 'Ops KPI dashboards'],
    heroMetric: { value: '98%', label: 'Visibility score' },
  },
  {
    id: 'dealerships',
    icon: Car,
    title: 'Dealerships',
    tag: 'Automotive retail',
    description:
      'Inventory management, sales pipeline dashboards, service scheduling, and customer follow-up — built for automotive retail operations.',
    highlights: ['Inventory + sales sync', 'Service scheduling', 'Customer follow-up'],
    heroMetric: { value: '12+', label: 'Dealer integrations' },
  },
  {
    id: 'field-service',
    icon: Wrench,
    title: 'Field Service Companies',
    tag: 'Dispatch & field ops',
    description:
      'Dispatch boards, technician tracking, job completion workflows, and customer communication — optimized for teams in the field.',
    highlights: ['Dispatch boards', 'Technician GPS tracking', 'Job completion flows'],
    heroMetric: { value: '847', label: 'Jobs routed / day' },
  },
  {
    id: 'inventory',
    icon: Package,
    title: 'Inventory-Driven Businesses',
    tag: 'Stock & warehouse',
    description:
      'Stock levels, reorder triggers, supplier integrations, and warehouse visibility for businesses where inventory is the core operation.',
    highlights: ['Stock level alerts', 'Reorder automation', 'Supplier sync'],
    heroMetric: { value: '99.4%', label: 'Inventory accuracy' },
  },
  {
    id: 'admin',
    icon: ClipboardList,
    title: 'Internal Admin Teams',
    tag: 'Approvals & reporting',
    description:
      'Custom admin panels, approval workflows, document management, and reporting tools for teams managing internal business processes.',
    highlights: ['Approval workflows', 'Document management', 'Admin reporting'],
    heroMetric: { value: '38h', label: 'Saved weekly' },
  },
] as const

const heroStats = [
  { id: 'industries', value: '5+', label: 'Industries served', color: 'text-[#ccff00]' },
  { id: 'builds', value: '40+', label: 'Custom builds', color: 'text-[#0080ff]' },
  { id: 'uptime', value: '99.9%', label: 'Uptime SLA', color: 'text-[#ccff00]' },
] as const

type AudienceId = (typeof audiences)[number]['id']
type SolutionPopupId = 'operations' | 'dealerships' | 'field-service' | 'inventory' | 'admin'

const POPUP_AUDIENCES: SolutionPopupId[] = ['operations', 'dealerships', 'field-service', 'inventory', 'admin']

function isPopupAudience(id: AudienceId): id is SolutionPopupId {
  return POPUP_AUDIENCES.includes(id as SolutionPopupId)
}

function SolutionsHeroExplorer({
  activeAudience,
  onAudienceChange,
  onExploreIndustries,
  onOpenProfile,
}: {
  activeAudience: AudienceId
  onAudienceChange: (id: AudienceId) => void
  onExploreIndustries: () => void
  onOpenProfile: () => void
}) {
  const selected = audiences.find((a) => a.id === activeAudience) ?? audiences[0]
  const Icon = selected.icon

  return (
    <div className="relative w-full">
      <div className="absolute -inset-4 rounded-full bg-[#0080ff]/[0.06] blur-[50px]" />
      <div className="glow-brand relative overflow-hidden rounded-2xl border border-white/10 bg-[#080a0f]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,128,255,0.12),transparent_55%)]" />

        <div className="relative p-5 lg:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Interactive explorer
            </p>
            <span className="flex items-center gap-1.5 rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2.5 py-1 text-[10px] font-medium text-[#ccff00]">
              <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
              Live preview
            </span>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {audiences.map((audience) => {
              const TabIcon = audience.icon
              const isActive = activeAudience === audience.id

              return (
                <button
                  key={audience.id}
                  type="button"
                  onClick={() => onAudienceChange(audience.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-[#0080ff]/40 bg-[#0080ff]/15 text-[#0080ff] shadow-[0_0_16px_rgba(0,128,255,0.15)]'
                      : 'border-white/[0.08] bg-white/[0.03] text-white/45 hover:border-[#0080ff]/25 hover:text-white'
                  }`}
                >
                  <TabIcon size={13} strokeWidth={1.5} />
                  <span className="hidden sm:inline">{audience.title.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>

          <div key={selected.id} className="animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0080ff]/30 bg-[#0080ff]/10">
                <Icon size={22} className="text-[#0080ff]" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]/70">
                  {selected.tag}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-white">{selected.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{selected.description}</p>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {selected.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-white/55">
                  <ChevronRight size={12} className="shrink-0 text-[#0080ff]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <div>
                <p className={`text-xl font-semibold ${selected.id === 'operations' || selected.id === 'inventory' ? 'text-[#ccff00]' : 'text-[#0080ff]'}`}>
                  {selected.heroMetric.value}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  {selected.heroMetric.label}
                </p>
              </div>
              <button
                type="button"
                onClick={isPopupAudience(activeAudience) ? onOpenProfile : onExploreIndustries}
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#0080ff] transition hover:text-white"
              >
                Full profile
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Solutions() {
  const [activeAudience, setActiveAudience] = useState<AudienceId>(audiences[0].id)
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const [activePopup, setActivePopup] = useState<SolutionPopupId | null>(null)

  const handleAudienceClick = (id: AudienceId) => {
    setActiveAudience(id)
    if (isPopupAudience(id)) {
      setActivePopup(id)
    } else {
      setActivePopup(null)
    }
  }

  const openProfile = () => {
    if (isPopupAudience(activeAudience)) {
      setActivePopup(activeAudience)
    } else {
      openIndustries()
    }
  }

  const openIndustries = () => {
    document.getElementById('industries-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleStatClick = (id: (typeof heroStats)[number]['id']) => {
    if (id === 'industries') openIndustries()
  }

  return (
    <div
      data-scroll-root
      className="relative flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden bg-[#050607]"
    >
      {/* Hero */}
      <section className="relative shrink-0 border-b border-white/[0.06]">
        <PlatformBackground />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 pb-10 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10 lg:pb-12 lg:pt-10">
          <div className="z-10">
            <div className="mb-5">
              <div className="mb-3 h-px w-8 bg-[#0080ff]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
                Solutions
              </p>
            </div>

            <h1 className="max-w-xl text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white lg:text-[2.75rem]">
              Built for the teams that{' '}
              <span className="text-[#0080ff]">run the business</span>
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/50 lg:text-base">
              Overdrive IO serves operations-driven organizations that need reliable systems — not
              off-the-shelf software that almost fits.
            </p>

            <div className="mt-7">
              <button
                type="button"
                onClick={openIndustries}
                className="group inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98]"
              >
                Browse Industries
                <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2.5">
              {heroStats.map((stat) => (
                <button
                  key={stat.id}
                  type="button"
                  onClick={() => handleStatClick(stat.id)}
                  onMouseEnter={() => setHoveredStat(stat.id)}
                  onMouseLeave={() => setHoveredStat(null)}
                  disabled={stat.id !== 'industries'}
                  className={`rounded-lg border px-3 py-2.5 text-left backdrop-blur-sm transition-all duration-200 ${
                    stat.id === 'industries' ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'
                  } ${
                    hoveredStat === stat.id
                      ? 'border-[#0080ff]/40 bg-[#080a0e] glow-brand-blue'
                      : 'border-white/[0.08] bg-[#080a0e]/80 hover:border-[#0080ff]/30'
                  }`}
                >
                  <p className={`text-base font-semibold lg:text-lg ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">{stat.label}</p>
                  {stat.id === 'industries' && hoveredStat === stat.id && (
                    <p className="mt-1 text-[10px] text-[#0080ff]">Click to explore →</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <SolutionsHeroExplorer
              activeAudience={activeAudience}
              onAudienceChange={setActiveAudience}
              onExploreIndustries={openIndustries}
              onOpenProfile={openProfile}
            />
          </div>
        </div>
      </section>

      {activePopup === 'operations' && (
        <JobTrackingMetricsPopup onClose={() => setActivePopup(null)} />
      )}
      {activePopup === 'dealerships' && (
        <AutomotiveRetailPopup onClose={() => setActivePopup(null)} />
      )}
      {activePopup === 'field-service' && (
        <DispatchFieldOpsPopup onClose={() => setActivePopup(null)} />
      )}
      {activePopup === 'inventory' && (
        <StockWarehousePopup onClose={() => setActivePopup(null)} />
      )}
      {activePopup === 'admin' && (
        <ApprovalsReportingPopup onClose={() => setActivePopup(null)} />
      )}

      <section id="industries-section" className="relative shrink-0 border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-cross-pattern opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6">
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ccff00]/70">
              Industries & teams
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white lg:text-[1.75rem]">
              Who we help
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/40">
              Select a profile to explore how Overdrive IO maps to your operations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((audience) => {
              const Icon = audience.icon
              const isActive = activeAudience === audience.id

              return (
                <button
                  key={audience.id}
                  type="button"
                  onClick={() => handleAudienceClick(audience.id)}
                  className={`group rounded-xl border p-5 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-[#0080ff]/40 bg-[#080a0e] glow-brand-blue'
                      : 'border-white/[0.08] bg-[#080a0e]/60 hover:border-[#0080ff]/25 hover:bg-[#080a0e]'
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                        isActive
                          ? 'border-[#0080ff]/30 bg-[#0080ff]/10'
                          : 'border-white/[0.08] bg-white/[0.03] group-hover:border-[#0080ff]/20'
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        className={isActive ? 'text-[#0080ff]' : 'text-white/50 group-hover:text-[#0080ff]'}
                      />
                    </div>
                    {isActive && (
                      <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
                    )}
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]/65">
                    {audience.tag}
                  </span>
                  <h3
                    className={`mt-1.5 text-sm font-semibold transition-colors ${
                      isActive ? 'text-[#0080ff]' : 'text-white group-hover:text-[#0080ff]'
                    }`}
                  >
                    {audience.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">{audience.description}</p>
                </button>
              )
            })}

            <Link
              to="/request-demo"
              className="group flex flex-col justify-between rounded-xl border border-dashed border-[#ccff00]/25 bg-[#ccff00]/[0.04] p-5 transition-all hover:border-[#ccff00]/40 hover:bg-[#ccff00]/[0.07]"
            >
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#ccff00]/20 bg-[#ccff00]/10">
                  <Building2 size={18} className="text-[#ccff00]" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]/70">
                  Custom fit
                </span>
                <h3 className="mt-1.5 text-sm font-semibold text-white">Your Industry</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/45">
                  We build operational systems for any industry with complex workflows and fragmented
                  tooling.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#ccff00] transition group-hover:gap-2">
                Talk to us
                <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
