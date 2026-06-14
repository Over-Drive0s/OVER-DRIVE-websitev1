import { ArrowLeft, Car, Radio, Sparkles, TrendingUp } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import DealerDmsDashboard from '../components/DealerDmsDashboard'
import { PartnerLogo } from '../components/DealerPartnerLogos'
import PlatformBackground from '../components/PlatformBackground'
import { dealerIntegrations } from '../data/dealerDmsData'

export default function Dealers() {
  const location = useLocation()
  const fromSystems = Boolean(
    (location.state as { fromSystems?: boolean } | null)?.fromSystems,
  )

  return (
    <div data-scroll-root className="dealer-page relative flex min-h-full flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
        <PlatformBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--dealer-page)]/40 to-[var(--dealer-page)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="mb-8">
          <Link
            to={fromSystems ? '/systems' : '/solutions'}
            className="mb-5 inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            {fromSystems ? 'Back to systems' : 'Back to solutions'}
          </Link>

          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
                Dealer DMS
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0080ff]/25 bg-[#0080ff]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0080ff]">
                <Sparkles size={10} />
                Live simulator
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ccff00]/20 bg-[#ccff00]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#ccff00]">
                <Radio size={10} />
                Real-time sync
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Dealership command center
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/45 sm:text-base">
              Inventory, VIN decode, CARFAX history, and marketplace syndication — Frazer, 700Credit,
              Cars.com, AutoTrader, and Carvana in one interactive ops view.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 text-[11px] text-white/40">
              <Car size={12} className="text-[#0080ff]" />
              Powered by Frazer DMS
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#ccff00]">
              <TrendingUp size={12} />
              +18% digital leads this week
            </span>
            <span className="hidden h-3 w-px bg-white/10 sm:block" aria-hidden />
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[var(--dealer-panel)] px-3 py-2">
              {dealerIntegrations.map((p) => (
                <PartnerLogo key={p.id} src={p.logo} alt={p.name} className="h-4" lightTile={p.lightTile} />
              ))}
            </div>
          </div>
        </div>

        <DealerDmsDashboard />
      </div>
    </div>
  )
}
