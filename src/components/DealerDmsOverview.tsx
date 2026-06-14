import {
  Activity,
  ArrowUpRight,
  Circle,
  ExternalLink,
  Plug,
  Search,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import DealerVehicleCard from './DealerVehicleCard'
import {
  dealerActivityFeed,
  dealerAuctionPartners,
  dealerFloorPlanPartners,
  dealerIntegrations,
  dealerOverviewSparklines,
  formatPrice,
  statusLabels,
  type DealerPartnerRef,
  type DealerVehicle,
} from '../data/dealerDmsData'
import { MiniSparkline } from './InfographicWidgets'
import { PartnerLogo } from './DealerPartnerLogos'

function RingGauge({
  value,
  max,
  label,
  color,
  unit = '',
}: {
  value: number
  max: number
  label: string
  color: string
  unit?: string
}) {
  const pct = Math.min(value / max, 1)
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct)

  return (
    <div className="dealer-gauge flex flex-col items-center">
      <div className="relative">
        <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="dealer-gauge-ring transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-white">
            {value}
            {unit}
          </span>
        </div>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-white/40">{label}</p>
    </div>
  )
}

function StatusBar({
  vehicles,
  onFilter,
}: {
  vehicles: DealerVehicle[]
  onFilter?: (status: DealerVehicle['status']) => void
}) {
  const [hovered, setHovered] = useState<DealerVehicle['status'] | null>(null)

  const counts = useMemo(() => {
    const map: Record<DealerVehicle['status'], number> = {
      frontline: 0,
      recon: 0,
      listed: 0,
      pending: 0,
      photos: 0,
    }
    vehicles.forEach((v) => {
      map[v.status]++
    })
    return map
  }, [vehicles])

  const total = vehicles.length || 1
  const segments: { key: DealerVehicle['status']; color: string }[] = [
    { key: 'frontline', color: '#ccff00' },
    { key: 'listed', color: '#0080ff' },
    { key: 'recon', color: '#f59e0b' },
    { key: 'pending', color: '#a78bfa' },
    { key: 'photos', color: 'rgba(255,255,255,0.25)' },
  ]

  return (
    <div className="dealer-status-bar">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Lot mix</p>
        <span className="text-[10px] text-white/30">{total} units · click to filter</span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        {segments.map(({ key, color }) =>
          counts[key] > 0 ? (
            <button
              key={key}
              type="button"
              title={`Filter: ${statusLabels[key]}`}
              onClick={() => onFilter?.(key)}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              className="dealer-status-segment h-full transition-all duration-300 hover:brightness-125"
              style={{
                width: `${(counts[key] / total) * 100}%`,
                backgroundColor: color,
                opacity: hovered && hovered !== key ? 0.45 : 1,
              }}
            />
          ) : null,
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {segments.map(({ key, color }) =>
          counts[key] > 0 ? (
            <button
              key={key}
              type="button"
              onClick={() => onFilter?.(key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] text-white/55 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              {statusLabels[key]} · {counts[key]}
            </button>
          ) : null,
        )}
      </div>
    </div>
  )
}

function IntegrationHub() {
  const [activePartner, setActivePartner] = useState<string | null>(null)
  const orbit = dealerIntegrations.filter((p) => p.id !== 'frazer')
  const frazer = dealerIntegrations.find((p) => p.id === 'frazer')!

  return (
    <div className="dealer-hub relative flex aspect-square max-h-[280px] w-full items-center justify-center">
      <div className="dealer-hub-ring absolute inset-[8%] rounded-full border border-[#0080ff]/15" />
      <div className="dealer-hub-ring dealer-hub-ring--inner absolute inset-[22%] rounded-full border border-dashed border-white/[0.08]" />
      <div className="dealer-hub-pulse absolute inset-[38%] rounded-full bg-[#0080ff]/[0.06]" />

      <div className="dealer-hub-core relative z-10 flex flex-col items-center gap-2 rounded-2xl border border-[#0080ff]/30 bg-[var(--dealer-elevated)] px-5 py-4 shadow-[0_0_40px_rgba(0,128,255,0.12)]">
        <PartnerLogo src={frazer.logo} alt={frazer.name} className="h-8" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0080ff]">DMS Core</span>
        <span className="inline-flex items-center gap-1 text-[9px] text-[#ccff00]">
          <Circle size={5} className="fill-[#ccff00]" />
          Syncing
        </span>
      </div>

      {orbit.map((partner, i) => {
        const angle = (i / orbit.length) * 360 - 90
        const rad = (angle * Math.PI) / 180
        const x = 50 + Math.cos(rad) * 42
        const y = 50 + Math.sin(rad) * 42
        const active = activePartner === partner.id

        return (
          <a
            key={partner.id}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setActivePartner(partner.id)}
            onMouseLeave={() => setActivePartner(null)}
            className="dealer-hub-node absolute z-10 flex flex-col items-center gap-1"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            title={partner.name}
          >
            <span
              className={`flex items-center justify-center rounded-xl border px-2.5 py-2 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                active
                  ? 'scale-110 border-[#0080ff]/50 bg-[#0080ff]/10 shadow-[0_0_24px_rgba(0,128,255,0.2)]'
                  : 'border-white/[0.12] bg-[var(--dealer-elevated)] hover:scale-105 hover:border-[#0080ff]/30'
              }`}
            >
              <PartnerLogo src={partner.logo} alt={partner.name} className="h-5" lightTile={partner.lightTile} />
            </span>
            <span className={`text-[8px] transition ${active ? 'text-white/60' : 'text-white/30'}`}>
              {partner.lastSync}
            </span>
            {active && (
              <span className="dealer-hub-tooltip absolute -bottom-8 whitespace-nowrap rounded-md border border-white/10 bg-[var(--dealer-elevated)] px-2 py-1 text-[9px] text-white/70 shadow-lg">
                {partner.metric}
              </span>
            )}
          </a>
        )
      })}
    </div>
  )
}

interface DealerDmsOverviewProps {
  vehicles: DealerVehicle[]
  onVinSelect: (vin: string) => void
  onTabChange: (tab: 'inventory' | 'listings' | 'vin') => void
  onStatusFilter?: (status: DealerVehicle['status']) => void
}

export default function DealerDmsOverview({
  vehicles,
  onVinSelect,
  onTabChange,
  onStatusFilter,
}: DealerDmsOverviewProps) {
  const [activeKpi, setActiveKpi] = useState<number | null>(null)

  const stats = useMemo(() => {
    const listed = vehicles.filter((v) => v.listings.length > 0).length
    const avgDays = Math.round(vehicles.reduce((s, v) => s + v.daysOnLot, 0) / vehicles.length)
    const totalValue = vehicles.reduce((s, v) => s + v.price, 0)
    const syndicatedAds = vehicles.reduce((s, v) => s + v.listings.length, 0)
    const turnTarget = 30
    const turnPct = Math.round((turnTarget / Math.max(avgDays, 1)) * 100)
    return { total: vehicles.length, listed, avgDays, totalValue, syndicatedAds, turnPct, turnTarget }
  }, [vehicles])

  const kpis: {
    label: string
    value: string
    delta: string
    spark: number[]
    color: string
    tab: 'inventory' | 'listings' | 'vin'
    partners?: DealerPartnerRef[]
  }[] = [
    {
      label: 'Active inventory',
      value: String(stats.total),
      delta: '+4 vs last week',
      spark: dealerOverviewSparklines.inventory,
      color: '#0080ff',
      tab: 'inventory',
    },
    {
      label: 'Live marketplace ads',
      value: String(stats.syndicatedAds),
      delta: '3 channels',
      spark: dealerOverviewSparklines.syndication,
      color: '#ccff00',
      tab: 'listings',
    },
    {
      label: 'Digital leads (7d)',
      value: '34',
      delta: '+18% WoW',
      spark: dealerOverviewSparklines.leads,
      color: '#019ADE',
      tab: 'listings',
    },
    {
      label: 'Credit pulls today',
      value: '14',
      delta: '700Credit',
      spark: dealerOverviewSparklines.creditPulls,
      color: '#F58220',
      tab: 'vin',
    },
    {
      label: 'Auctions',
      value: '18',
      delta: '3 lanes this week',
      spark: dealerOverviewSparklines.auctions,
      color: '#00B140',
      tab: 'inventory',
      partners: dealerAuctionPartners,
    },
    {
      label: 'Floor plan',
      value: '$940K',
      delta: '2 lenders active',
      spark: dealerOverviewSparklines.floorPlan,
      color: '#E87722',
      tab: 'inventory',
      partners: dealerFloorPlanPartners,
    },
  ]

  return (
    <div className="dealer-overview space-y-5">
      <div className="dealer-hud dealer-glass-panel relative overflow-hidden rounded-2xl border border-[#0080ff]/25 px-4 py-4 sm:px-6 sm:py-5">
        <div className="dealer-hud-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ccff00]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#0080ff]/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#ccff00]/25 bg-[#ccff00]/10">
                <Zap size={13} className="text-[#ccff00]" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#0080ff]">
                Operations command
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {formatPrice(stats.totalValue)}
            </h2>
            <p className="text-sm text-white/40">lot retail value</p>
            <p className="mt-2 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
              <span>{stats.listed}/{stats.total} syndicated</span>
              <span className="text-white/20">·</span>
              <span>{stats.avgDays}d avg on lot</span>
              <span className="text-white/20">·</span>
              <span className="text-[#ccff00]">{stats.turnTarget}d turn target</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <RingGauge value={stats.turnPct} max={100} label="Turn pace" color="#ccff00" unit="%" />
            <RingGauge value={stats.listed} max={stats.total} label="Syndicated" color="#0080ff" />
            <RingGauge value={6} max={6} label="Integrations" color="#019ADE" />
          </div>
        </div>
      </div>

      <div className="dealer-kpi-tray rounded-2xl p-3 sm:p-3.5">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
        {kpis.map((kpi, i) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onTabChange(kpi.tab)}
            onMouseEnter={() => setActiveKpi(i)}
            onMouseLeave={() => setActiveKpi(null)}
            className={`dealer-kpi-glass group relative p-4 text-left ${activeKpi === i ? 'dealer-kpi-glass--active' : ''}`}
          >
            <div className="relative z-[1]">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] uppercase tracking-wider text-white/40">{kpi.label}</p>
              <ArrowUpRight
                size={12}
                className={`transition ${activeKpi === i ? 'text-[#0080ff]' : 'text-white/25 group-hover:text-[#0080ff]'}`}
              />
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{kpi.value}</p>
            <p className="inline-flex items-center gap-1 text-[11px] text-white/45">
              <TrendingUp size={10} className="text-[#ccff00]" />
              {kpi.delta}
            </p>
            {kpi.partners ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/[0.08] pt-2.5">
                {kpi.partners.map((p) => (
                  <span
                    key={p.id}
                    className="dealer-kpi-logo-chip inline-flex items-center rounded-md px-1.5 py-1"
                    title={p.name}
                  >
                    <PartnerLogo src={p.logo} alt={p.name} className="h-4" lightTile={p.lightTile} />
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-3 opacity-80">
                <MiniSparkline points={kpi.spark} color={kpi.color} />
              </div>
            )}
            {kpi.partners && (
              <div className="mt-2 opacity-70">
                <MiniSparkline points={kpi.spark} color={kpi.color} />
              </div>
            )}
            </div>
          </button>
        ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="dealer-glass-panel h-full rounded-2xl border border-white/[0.1] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Integration hub</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ccff00]/10 px-2 py-0.5 text-[10px] text-[#ccff00]">
                <Plug size={11} />
                All live
              </span>
            </div>
            <IntegrationHub />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="dealer-glass-panel rounded-2xl border border-white/[0.1] p-4 sm:p-5">
            <StatusBar vehicles={vehicles} onFilter={onStatusFilter} />
          </div>
          <div className="dealer-glass-panel flex-1 rounded-2xl border border-white/[0.08] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Partner stack</h3>
              <button
                type="button"
                onClick={() => onTabChange('listings')}
                className="text-[10px] font-medium text-[#0080ff] transition hover:text-white"
              >
                View syndication →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {dealerIntegrations.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dealer-logo-cell group flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[var(--dealer-inset)] px-2 py-3 transition hover:border-[#0080ff]/30 hover:bg-[#0080ff]/[0.06] hover:-translate-y-0.5"
                >
                  <PartnerLogo src={p.logo} alt={p.name} className="h-6" lightTile={p.lightTile} />
                  <span className="text-[8px] text-white/30 transition group-hover:text-white/50">
                    {p.metric.split(' ').slice(-2).join(' ')}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="dealer-glass-panel h-full rounded-2xl border border-white/[0.1] p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity size={14} className="text-[#0080ff]" />
              <h3 className="text-sm font-semibold text-white">Live feed</h3>
            </div>
            <ul className="space-y-1">
              {dealerActivityFeed.map((item, i) => {
                const partner = dealerIntegrations.find((p) => p.id === item.partner)!
                return (
                  <li
                    key={i}
                    className="dealer-feed-item group flex gap-3 rounded-lg border border-transparent px-2 py-2.5 transition hover:border-white/[0.06] hover:bg-white/[0.02]"
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-[10px] text-white/25">{item.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] leading-snug text-white/65 transition group-hover:text-white/85">
                        {item.event}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <PartnerLogo src={partner.logo} alt={partner.name} className="h-3" lightTile={partner.lightTile} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="dealer-vin-strip relative overflow-hidden rounded-2xl border border-[#019ADE]/30 bg-gradient-to-r from-[#019ADE]/[0.1] via-[var(--dealer-panel)] to-transparent p-4 sm:p-5">
        <div className="dealer-scan-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#019ADE]/80 to-transparent" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#019ADE]/30 bg-[#019ADE]/10 p-2">
              <PartnerLogo src="/partners/carfax.svg" alt="CARFAX" className="h-6" lightTile />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Quick VIN decode</p>
              <p className="text-[11px] text-white/40">Pull CARFAX history from any stock unit</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {vehicles.slice(0, 4).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onVinSelect(v.vin)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[var(--dealer-inset)] px-3 py-2 font-mono text-[10px] text-white/60 transition hover:border-[#019ADE]/50 hover:bg-[#019ADE]/10 hover:text-white"
              >
                <Search size={10} />
                {v.vin.slice(-8)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Recent inventory</h3>
          <button
            type="button"
            onClick={() => onTabChange('inventory')}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0080ff] transition hover:text-white"
          >
            Full inventory
            <ExternalLink size={12} />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {vehicles.slice(0, 4).map((v) => (
            <DealerVehicleCard key={v.id} vehicle={v} compact onClick={() => onVinSelect(v.vin)} />
          ))}
        </div>
      </div>
    </div>
  )
}
