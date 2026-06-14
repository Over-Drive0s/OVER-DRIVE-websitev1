import {
  Car,
  Circle,
  ExternalLink,
  Filter,
  Globe,
  LayoutGrid,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import AddDealerVehicleModal from './AddDealerVehicleModal'
import DealerDmsOverview from './DealerDmsOverview'
import DealerVehicleCard from './DealerVehicleCard'
import { PartnerLogo } from './DealerPartnerLogos'
import {
  dealerIntegrations,
  dealerVehicles,
  formatPrice,
  formatVehiclePrice,
  listingPlatformMeta,
  statusLabels,
  vehicleLabel,
  type DealerVehicle,
  type ListingPlatform,
} from '../data/dealerDmsData'

type TabId = 'overview' | 'inventory' | 'listings' | 'vin'

const tabs: { id: TabId; label: string; icon: typeof Car; desc: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, desc: '' },
  { id: 'inventory', label: 'Inventory', icon: Car, desc: 'Lot & stock' },
  { id: 'listings', label: 'Listings', icon: Globe, desc: 'Marketplace ads' },
  { id: 'vin', label: 'VIN / CARFAX', icon: ShieldCheck, desc: 'History reports' },
]

const platformAccent: Record<ListingPlatform, string> = {
  carscom: '#65299d',
  autotrader: '#F26522',
  carvana: '#00AED9',
}

function CarfaxPanel({ vehicle }: { vehicle: DealerVehicle }) {
  return (
    <div className="dealer-carfax-panel animate-fade-up overflow-hidden rounded-2xl border border-[#019ADE]/30 bg-gradient-to-br from-[#019ADE]/[0.1] via-[var(--dealer-panel)] to-[#F58220]/[0.06]">
      <div className="border-b border-white/[0.08] bg-[var(--dealer-elevated)]/50 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#019ADE]/30 bg-[#019ADE]/10 p-2">
              <PartnerLogo src="/partners/carfax.svg" alt="CARFAX" className="h-6" lightTile />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Vehicle History Report</p>
              <p className="text-[11px] text-white/40">Last updated {vehicle.carfax.lastReport}</p>
            </div>
          </div>
          <a
            href="https://www.carfax.com"
            target="_blank"
            rel="noopener noreferrer"
            className="dealer-btn-ghost inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-[#019ADE] transition hover:border-[#019ADE]/40 hover:bg-[#019ADE]/10 hover:text-white"
          >
            View on CARFAX
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 rounded-xl border border-white/[0.1] bg-[var(--dealer-inset)] px-4 py-3">
          <p className="font-mono text-xs tracking-[0.2em] text-white/70">{vehicle.vin}</p>
          <p className="mt-1 text-base font-medium text-white">{vehicleLabel(vehicle)}</p>
          <p className="mt-0.5 text-xs text-white/40">{vehicle.stock} · {vehicle.color}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Owners', value: vehicle.carfax.owners, color: 'text-white' },
            {
              label: 'Accidents',
              value: vehicle.carfax.accidents,
              color: vehicle.carfax.accidents ? 'text-amber-400' : 'text-[#ccff00]',
            },
            { label: 'Service records', value: vehicle.carfax.serviceRecords, color: 'text-white' },
            { label: 'Title', value: vehicle.carfax.title, color: 'text-[#019ADE]' },
          ].map((item) => (
            <div
              key={item.label}
              className="dealer-stat-tile rounded-xl border border-white/[0.1] bg-[var(--dealer-elevated)] p-3 transition hover:border-[#019ADE]/25"
            >
              <p className="text-[10px] uppercase tracking-wider text-white/35">{item.label}</p>
              <p className={`mt-1 text-xl font-semibold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <ul className="mt-4 space-y-2.5">
          {[
            'No open recalls reported for this VIN',
            'Odometer reading consistent with CARFAX timeline',
            `Dealer service history on file — ${vehicle.carfax.serviceRecords} records`,
          ].map((text, i) => (
            <li key={text} className="flex items-start gap-2.5 text-xs text-white/55">
              <ShieldCheck size={14} className={`mt-0.5 shrink-0 ${i === 2 ? 'text-[#ccff00]' : 'text-[#019ADE]'}`} />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function DealerDmsDashboard() {
  const [tab, setTab] = useState<TabId>('overview')
  const [search, setSearch] = useState('')
  const [vinQuery, setVinQuery] = useState('')
  const [vehicles, setVehicles] = useState<DealerVehicle[]>(() => [...dealerVehicles])
  const [selectedVin, setSelectedVin] = useState(dealerVehicles[0].vin)
  const [statusFilter, setStatusFilter] = useState<DealerVehicle['status'] | 'all'>('all')
  const [hoveredPlatform, setHoveredPlatform] = useState<ListingPlatform | null>(null)
  const [addCarOpen, setAddCarOpen] = useState(false)

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase()
    return vehicles.filter((v) => {
      const matchesSearch =
        !q ||
        v.vin.toLowerCase().includes(q) ||
        v.stock.toLowerCase().includes(q) ||
        vehicleLabel(v).toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, vehicles])

  const vinVehicle = useMemo(() => {
    const q = (vinQuery || selectedVin).trim().toUpperCase()
    return vehicles.find((v) => v.vin.toUpperCase() === q || v.vin.toUpperCase().includes(q))
  }, [vinQuery, selectedVin, vehicles])

  const headerStats = useMemo(() => {
    const syndicated = vehicles.filter((v) => v.listings.length > 0).length
    const totalValue = vehicles.reduce((s, v) => s + v.price, 0)
    return { units: vehicles.length, syndicated, totalValue }
  }, [vehicles])

  const handleVinSearch = () => {
    if (vinVehicle) setSelectedVin(vinVehicle.vin)
  }

  const openVin = (vin: string) => {
    setSelectedVin(vin)
    setVinQuery(vin)
    setTab('vin')
  }

  return (
    <div className="dealer-dms dealer-dms-shell overflow-hidden rounded-2xl border border-white/[0.12] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
      {/* Top command strip */}
      <div className="dealer-dms-top relative overflow-hidden border-b border-white/[0.08] px-4 py-3 sm:px-6">
        <div className="dealer-dms-top-glow pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-3 py-1">
              <span className="dealer-live-dot h-1.5 w-1.5 rounded-full bg-[#ccff00]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]">Live DMS</span>
            </div>
            <div className="hidden h-4 w-px bg-white/10 sm:block" />
            <div className="flex flex-wrap gap-4 text-[11px]">
              <span className="text-white/45">
                <strong className="font-semibold text-white">{headerStats.units}</strong> units
              </span>
              <span className="text-white/45">
                <strong className="font-semibold text-[#0080ff]">{headerStats.syndicated}</strong> syndicated
              </span>
              <span className="text-white/45">
                Lot value <strong className="font-semibold text-white">{formatPrice(headerStats.totalValue)}</strong>
              </span>
            </div>
          </div>
          <a
            href="https://brooklynas.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="dealer-sync-btn inline-flex items-center gap-2 self-start rounded-lg border border-[#0080ff]/30 bg-[#0080ff]/10 px-3 py-1.5 text-[11px] font-medium text-[#0080ff] transition hover:bg-[#0080ff]/20 hover:text-white lg:self-auto"
          >
            <ExternalLink size={12} />
            Launch website
          </a>
        </div>
      </div>

      {/* Tab bar + search */}
      <div className="dealer-dms-header border-b border-white/[0.08] px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="dealer-dms-tab-bar dealer-tab-bar relative flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.1] p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`dealer-tab relative z-10 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  tab === t.id
                    ? 'dealer-tab--active text-white'
                    : 'text-white/45 hover:bg-white/[0.04] hover:text-white/75'
                }`}
              >
                <t.icon size={15} className={tab === t.id ? 'text-[#0080ff]' : ''} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
                {tab === t.id && t.desc ? (
                  <span className="hidden text-[9px] font-normal text-white/40 lg:inline">{t.desc}</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px] flex-1 xl:max-w-sm">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search VIN, stock, make…"
              className="dealer-search w-full rounded-lg border border-white/[0.1] bg-[var(--dealer-inset)] py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-white/35 outline-none transition focus:border-[#0080ff]/50 focus:shadow-[0_0_0_3px_rgba(0,128,255,0.12)]"
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {tab === 'overview' && (
          <div key="overview" className="animate-fade-up">
            <DealerDmsOverview
              vehicles={vehicles}
              onVinSelect={openVin}
              onTabChange={(next) => setTab(next)}
              onStatusFilter={(status) => {
                setStatusFilter(status)
                setTab('inventory')
              }}
            />
          </div>
        )}

        {tab === 'inventory' && (
          <div key="inventory" className="animate-fade-up space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Lot inventory</h3>
                  <p className="text-[11px] text-white/40">{filteredVehicles.length} vehicles · click any unit for CARFAX</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddCarOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#ccff00]/30 bg-[#ccff00]/10 px-3 py-1.5 text-[11px] font-medium text-[#ccff00] transition hover:bg-[#ccff00]/20 hover:text-white"
                >
                  <Plus size={14} />
                  Add car to inventory
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Filter size={12} className="mr-1 text-white/30" />
                {(['all', 'frontline', 'listed', 'recon', 'pending', 'photos'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                      statusFilter === s
                        ? 'bg-[#0080ff]/20 text-[#0080ff] ring-1 ring-[#0080ff]/30'
                        : 'bg-[var(--dealer-inset)] text-white/45 hover:bg-[var(--dealer-elevated)] hover:text-white/70'
                    }`}
                  >
                    {s === 'all' ? 'All' : statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-6 py-16 text-center">
                <Car size={28} className="mx-auto text-white/20" />
                <p className="mt-3 text-sm text-white/45">No vehicles match your filters</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVehicles.map((v) => (
                  <DealerVehicleCard
                    key={v.id}
                    vehicle={v}
                    active={selectedVin === v.vin}
                    onClick={() => openVin(v.vin)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'listings' && (
          <div key="listings" className="animate-fade-up space-y-6">
            <div className="dealer-glass-panel relative overflow-hidden rounded-2xl border border-[#0080ff]/25 p-4 sm:p-5">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#0080ff]/10 blur-3xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#0080ff]">
                    <Zap size={11} />
                    Advertising syndication
                  </div>
                  <p className="text-base font-semibold text-white">One inventory feed → three marketplaces</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    Frazer DMS pushes listings to Cars.com, AutoTrader, and Carvana. 700Credit handles desking pulls.
                    CARFAX attaches to every VIN automatically.
                  </p>
                </div>
                <PartnerLogo src="/partners/frazer.png" alt="Frazer" className="h-9" />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {(['carscom', 'autotrader', 'carvana'] as ListingPlatform[]).map((platformId) => {
                const meta = listingPlatformMeta[platformId]
                const listed = vehicles.filter((v) => v.listings.includes(platformId))
                const integration = dealerIntegrations.find((p) => p.id === platformId)!
                const accent = platformAccent[platformId]
                const pct = Math.round((listed.length / vehicles.length) * 100)
                const hovered = hoveredPlatform === platformId

                return (
                  <div
                    key={platformId}
                    onMouseEnter={() => setHoveredPlatform(platformId)}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    className={`dealer-platform-card group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                      hovered
                        ? 'border-white/20 bg-[var(--dealer-elevated)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] -translate-y-1'
                        : 'border-white/[0.1] bg-[var(--dealer-panel)]'
                    }`}
                    style={{ boxShadow: hovered ? `0 0 40px ${accent}18` : undefined }}
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-0.5 transition-opacity duration-300"
                      style={{ background: accent, opacity: hovered ? 1 : 0.4 }}
                    />
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <PartnerLogo src={meta.logo} alt={meta.label} className="h-8" lightTile={meta.lightTile} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ccff00]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ccff00]">
                        <Circle size={5} className="fill-[#ccff00]" />
                        Live
                      </span>
                    </div>
                    <p className="text-3xl font-semibold tabular-nums text-white">{listed.length}</p>
                    <p className="text-[11px] text-white/40">vehicles advertised · {pct}% of lot</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="dealer-sync-bar h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: accent }}
                      />
                    </div>
                    <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
                      {listed.slice(0, 3).map((v) => (
                        <li key={v.id}>
                          <button
                            type="button"
                            onClick={() => openVin(v.vin)}
                            className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-[11px] transition hover:bg-white/[0.04]"
                          >
                            <span className="truncate text-white/65">{vehicleLabel(v)}</span>
                            <span className="shrink-0 tabular-nums text-white/40">{formatVehiclePrice(v)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={integration.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium transition hover:gap-2"
                      style={{ color: accent }}
                    >
                      Open {meta.label}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dealerIntegrations
                .filter((p) => p.category === 'credit' || p.category === 'dms' || p.category === 'history')
                .map((partner) => (
                  <div
                    key={partner.id}
                    className="dealer-partner-row flex items-center gap-4 rounded-xl border border-white/[0.1] bg-[var(--dealer-panel)] p-4 transition hover:border-[#0080ff]/25 hover:bg-[#0080ff]/[0.04]"
                  >
                    <PartnerLogo src={partner.logo} alt={partner.name} className="h-8 w-28" lightTile={partner.lightTile} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{partner.name}</p>
                      <p className="text-[11px] text-white/40">{partner.metric}</p>
                    </div>
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/55 transition hover:border-[#0080ff]/30 hover:text-white"
                    >
                      Open
                    </a>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'vin' && (
          <div key="vin" className="animate-fade-up space-y-5">
            <div className="dealer-vin-scanner relative overflow-hidden rounded-2xl border border-[#019ADE]/30 bg-gradient-to-br from-[#019ADE]/[0.08] to-[var(--dealer-panel)] p-4 sm:p-5">
              <div className="dealer-scan-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#019ADE] to-transparent opacity-60" />
              <label htmlFor="vin-search" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#019ADE]">
                <ShieldCheck size={14} />
                VIN decode & CARFAX pull
              </label>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  id="vin-search"
                  type="text"
                  value={vinQuery}
                  onChange={(e) => setVinQuery(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleVinSearch()}
                  placeholder="Enter 17-character VIN…"
                  maxLength={17}
                  className="flex-1 rounded-xl border border-white/[0.1] bg-[var(--dealer-inset)] px-4 py-3 font-mono text-sm tracking-widest text-white placeholder:text-white/30 outline-none transition focus:border-[#019ADE]/60 focus:shadow-[0_0_0_3px_rgba(1,154,222,0.15)]"
                />
                <button
                  type="button"
                  onClick={handleVinSearch}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#019ADE] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  <Search size={15} />
                  Decode VIN
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] text-white/35">Quick select:</span>
                {vehicles.slice(0, 4).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => openVin(v.vin)}
                    className={`rounded-md border px-2 py-1 font-mono text-[10px] transition ${
                      selectedVin === v.vin
                        ? 'border-[#019ADE]/50 bg-[#019ADE]/15 text-white'
                        : 'border-white/10 bg-[var(--dealer-inset)] text-white/50 hover:border-[#019ADE]/30 hover:text-white'
                    }`}
                  >
                    {v.vin.slice(-8)}
                  </button>
                ))}
              </div>
            </div>

            {vinVehicle ? (
              <CarfaxPanel vehicle={vinVehicle} />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
                <PartnerLogo src="/partners/carfax.svg" alt="CARFAX" className="mx-auto h-10" lightTile />
                <p className="mt-4 text-sm font-medium text-white/70">Enter a valid VIN to pull CARFAX history</p>
                <p className="mt-1 text-xs text-white/35">Powered by Frazer DMS + CARFAX integration</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dealer-dms-footer border-t border-white/[0.08] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/35">
          <span className="flex items-center gap-2">
            <Circle size={8} className="fill-[#ccff00] text-[#ccff00]" />
            Simulator data — Frazer · 700Credit · Cars.com · AutoTrader · Carvana · CARFAX
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#0080ff]" />
            Dealer DMS preview
          </span>
        </div>
      </div>

      <AddDealerVehicleModal
        open={addCarOpen}
        onClose={() => setAddCarOpen(false)}
        onAdd={(vehicle) => {
          setVehicles((prev) => [vehicle, ...prev])
          setSelectedVin(vehicle.vin)
          setStatusFilter('all')
        }}
      />
    </div>
  )
}
