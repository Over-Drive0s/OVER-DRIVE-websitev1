import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'
import {
  dealerVehicles,
  formatVehiclePrice,
  statusLabels,
  vehicleLabel,
  type DealerVehicle,
} from '../data/dealerDmsData'
import {
  Activity,
  ArrowUpRight,
  Car,
  Clock,
  ExternalLink,
  Filter,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react'

interface AutomotiveRetailPopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'metrics' | 'inventory' | 'sales'

const tabs: { id: TabId; label: string; icon: typeof Car }[] = [
  { id: 'overview', label: 'Overview', icon: Car },
  { id: 'metrics', label: 'Metrics', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory', icon: Activity },
  { id: 'sales', label: 'Sales & Service', icon: Wrench },
]

const inventoryCount = dealerVehicles.length
const avgDaysOnLot = Math.round(
  dealerVehicles.reduce((sum, v) => sum + v.daysOnLot, 0) / dealerVehicles.length,
)

const headlineStats = [
  { label: 'Active Inventory', value: String(inventoryCount), accent: 'text-[#0080ff]' },
  { label: 'Leads This Week', value: '428', accent: 'text-[#ccff00]' },
  { label: 'Open Deals', value: '74', accent: 'text-white' },
  { label: 'Monthly Gross', value: '$284K', accent: 'text-[#ccff00]' },
]

const dealershipStats = [
  { title: 'Active Inventory', value: String(inventoryCount), trend: `${avgDaysOnLot} day avg turn` },
  { title: 'Leads This Week', value: '428', trend: '↑ 18% vs last week' },
  { title: 'Open Deals', value: '74', trend: '$10.9M pipeline' },
  { title: 'Service Appointments', value: '39', trend: 'Today scheduled' },
  { title: 'Follow-Ups Due', value: '112', trend: 'Due this week' },
  { title: 'Monthly Gross', value: '$284K', trend: '↑ 9.4% vs last month' },
]

const salesPipeline = [
  { stage: 'New Lead', count: '128', value: '$3.8M' },
  { stage: 'Contacted', count: '94', value: '$2.7M' },
  { stage: 'Appointment Set', count: '46', value: '$1.4M' },
  { stage: 'Test Drive', count: '22', value: '$760K' },
  { stage: 'Finance', count: '18', value: '$620K' },
  { stage: 'Closed', count: '31', value: '$1.1M' },
]

const serviceSchedule = [
  { time: '9:00 AM', customer: 'M. Rivera', service: 'Oil Change + Inspection', advisor: 'Team A' },
  { time: '10:30 AM', customer: 'J. Carter', service: 'Brake Diagnosis', advisor: 'Team B' },
  { time: '12:00 PM', customer: 'A. Singh', service: 'Tire Rotation', advisor: 'Team A' },
  { time: '2:15 PM', customer: 'L. Brooks', service: 'Check Engine Light', advisor: 'Team C' },
]

const dealerCapabilities = [
  'Inventory Management',
  'Sales Pipeline Tracking',
  'Lead Follow-Up',
  'Service Scheduling',
  'Customer History',
  'Vehicle Recon Status',
  'Pricing Updates',
  'Performance Reporting',
]

const activityFeed = [
  { event: '2021 Lamborghini Huracan EVO Coupe moved to Pending Sale', time: '12 min ago' },
  { event: '46 appointments scheduled from active leads', time: '34 min ago' },
  { event: 'Service Team B completed 8 repair orders today', time: '1 hr ago' },
  { event: '112 customer follow-ups are due this week', time: '2 hr ago' },
  { event: 'Mercedes-Benz G-Class G550 flagged for missing photos', time: '3 hr ago' },
]

const retailPerformance = [
  { name: 'Inventory Turn', value: '34 Days' as const },
  { name: 'Lead Response', value: '8 min avg' as const },
  { name: 'Close Rate', value: '18.6%' as const },
  { name: 'Service Capacity', value: 'High Load' as const },
]

const popupStatusStyles: Record<DealerVehicle['status'], string> = {
  frontline: 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
  recon: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  listed: 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
  pending: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  photos: 'border-white/20 bg-white/[0.06] text-white/50',
}

function InventoryStatusBadge({ status }: { status: DealerVehicle['status'] }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${popupStatusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}

function RetailInventoryCard({ vehicle }: { vehicle: DealerVehicle }) {
  const meta = [vehicle.color, `${vehicle.mileage.toLocaleString()} mi`, vehicle.drive].filter(Boolean).join(' · ')

  return (
    <div className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#080a0e]/60 transition hover:border-[#0080ff]/25">
      <div className="relative h-36 overflow-hidden border-b border-white/[0.06]">
        {vehicle.image ? (
          <>
            <img
              src={vehicle.image}
              alt={vehicleLabel(vehicle)}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0080ff]/15 to-[#222832]">
            <Car size={28} className="text-[#0080ff]/50" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 pb-2.5">
          <span className="font-mono text-[10px] font-semibold tracking-wide text-[#0080ff] drop-shadow-sm">
            {vehicle.stock}
          </span>
          <InventoryStatusBadge status={vehicle.status} />
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-sm font-medium leading-snug text-white">{vehicleLabel(vehicle)}</p>
        {meta ? <p className="mt-1 text-[11px] text-white/40">{meta}</p> : null}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-white/40">{vehicle.daysOnLot} days in stock</span>
          <span className="font-semibold text-[#ccff00]">{formatVehiclePrice(vehicle)}</span>
        </div>
      </div>
    </div>
  )
}

function PerformanceValue({ value }: { value: string }) {
  const isWarning = value === 'High Load'
  return (
    <span className={`text-xs font-medium ${isWarning ? 'text-amber-300' : 'text-[#ccff00]'}`}>
      {value}
    </span>
  )
}

const overviewFilters = ['all', 'Inventory', 'Sales Pipeline', 'Service Bay', 'BDC Follow-Up'] as const
type OverviewFilter = (typeof overviewFilters)[number]

const inventoryStatusFilters: { id: 'all' | DealerVehicle['status']; label: string }[] = [
  { id: 'all', label: 'All' },
  ...(
    Object.entries(statusLabels) as [DealerVehicle['status'], string][]
  ).map(([id, label]) => ({ id, label })),
]

const BROOKLYN_AS_URL = 'https://brooklynas.vercel.app/'

export default function AutomotiveRetailPopup({ onClose }: AutomotiveRetailPopupProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [overviewFilter, setOverviewFilter] = useState<OverviewFilter>('all')
  const [inventoryFilter, setInventoryFilter] = useState<'all' | DealerVehicle['status']>('all')
  useScrollToTopOnMount()

  const filteredInventory = useMemo(
    () =>
      inventoryFilter === 'all'
        ? dealerVehicles
        : dealerVehicles.filter((unit) => unit.status === inventoryFilter),
    [inventoryFilter],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="automotive-retail-title"
    >
      <div
        className="flex h-[min(920px,calc(100%-1rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#06080c] shadow-[0_0_0_1px_rgba(0,128,255,0.12),0_32px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-white/[0.08]">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-[#0080ff]/10 blur-[80px]" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-32 w-32 rounded-full bg-[#ccff00]/[0.06] blur-[60px]" />

          <div className="relative px-6 pb-0 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0080ff]/30 bg-[#0080ff]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0080ff]">
                    <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
                    Dealerships
                  </span>
                  <span className="text-[11px] text-white/35">{inventoryCount} units in stock · 74 open deals</span>
                </div>

                <h1 id="automotive-retail-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Automotive <span className="text-[#0080ff]">RETAIL</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Inventory management, sales pipeline dashboards, service scheduling, and customer
                  follow-up built for automotive retail operations.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Automotive Retail"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/50 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex gap-1 overflow-x-auto border-b border-white/[0.06]">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
                    activeTab === id ? 'text-[#0080ff]' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  {label}
                  {activeTab === id && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0080ff]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-5 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Filter size={12} className="mr-0.5 text-white/30" />
                  {overviewFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setOverviewFilter(filter)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                        overviewFilter === filter
                          ? 'bg-[#0080ff]/20 text-[#0080ff] ring-1 ring-[#0080ff]/30'
                          : 'bg-white/[0.04] text-white/45 hover:bg-white/[0.08] hover:text-white/70'
                      }`}
                    >
                      {filter === 'all' ? 'All' : filter}
                    </button>
                  ))}
                </div>
                <a
                  href={BROOKLYN_AS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-[#0080ff]/30 bg-[#0080ff]/10 px-3 py-1.5 text-[11px] font-medium text-[#0080ff] transition hover:bg-[#0080ff]/20 hover:text-white sm:self-auto"
                >
                  <ExternalLink size={12} />
                  Launch website
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {headlineStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/80 px-4 py-3.5 transition-colors hover:border-[#0080ff]/25"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      {stat.label}
                    </p>
                    <p className={`mt-1 text-2xl font-semibold ${stat.accent}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center gap-2 text-[#0080ff]">
                    <Car size={16} strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                      Dealership Operations Layer
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-white/50">
                    Automotive Retail gives dealerships one operating view for inventory, sales activity,
                    service schedules, customer follow-up, and performance reporting — from vehicle
                    acquisition through sale, service, and retention.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['Inventory', 'Sales Pipeline', 'Service Bay', 'BDC Follow-Up'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/45"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#0080ff]/20 bg-[#0080ff]/[0.06] p-5">
                  <h2 className="text-sm font-semibold text-white">Dealership Command Center</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Manage vehicle inventory, track sales opportunities, monitor service activity, and
                    organize customer follow-up from one dashboard.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to="/dealers"
                      onClick={onClose}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Open Dealer View
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveTab('inventory')}
                      className="inline-flex flex-1 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      Manage Inventory
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">Dealer Capabilities</h2>
                <div className="flex flex-wrap gap-2">
                  {dealerCapabilities.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/55"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Dealership Metrics</h2>
                <p className="mt-1 text-xs text-white/40">Live retail performance across sales and service</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dealershipStats.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5 transition hover:border-[#0080ff]/25"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      {item.title}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-xs text-[#ccff00]/70">{item.trend}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">Retail Performance</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {retailPerformance.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                    >
                      <span className="text-sm text-white/50">{item.name}</span>
                      <PerformanceValue value={item.value} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Inventory Snapshot</h2>
                <p className="mt-1 text-xs text-white/40">
                  {inventoryCount} active units synced from{' '}
                  <a
                    href={BROOKLYN_AS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0080ff] hover:text-white"
                  >
                    Brooklyn Auto Sales
                  </a>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Filter size={12} className="mr-0.5 text-white/30" />
                {inventoryStatusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setInventoryFilter(filter.id)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                      inventoryFilter === filter.id
                        ? 'bg-[#0080ff]/20 text-[#0080ff] ring-1 ring-[#0080ff]/30'
                        : 'bg-white/[0.04] text-white/45 hover:bg-white/[0.08] hover:text-white/70'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {filteredInventory.length === 0 ? (
                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-6 py-12 text-center">
                  <Car size={24} className="mx-auto text-white/20" strokeWidth={1.5} />
                  <p className="mt-3 text-sm text-white/45">No vehicles match this filter</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredInventory.map((vehicle) => (
                    <RetailInventoryCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-5 p-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-base font-semibold text-white">Sales Pipeline</h2>
                  <p className="mt-1 mb-4 text-xs text-white/40">$10.9M total pipeline value</p>
                  <div className="space-y-2">
                    {salesPipeline.map((stage) => (
                      <div
                        key={stage.stage}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3 transition hover:border-[#0080ff]/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{stage.stage}</span>
                          <span className="text-sm font-semibold text-[#0080ff]">{stage.count}</span>
                        </div>
                        <p className="mt-1 text-xs text-white/35">Pipeline value: {stage.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">Service Schedule</h2>
                  <p className="mt-1 mb-4 text-xs text-white/40">39 appointments today</p>
                  <div className="space-y-2">
                    {serviceSchedule.map((appt) => (
                      <div
                        key={`${appt.time}-${appt.customer}`}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                            <Clock size={12} className="text-[#0080ff]" />
                            {appt.time}
                          </span>
                          <span className="text-xs text-[#ccff00]">{appt.advisor}</span>
                        </div>
                        <p className="mt-2 text-sm text-white/60">{appt.customer}</p>
                        <p className="mt-0.5 text-xs text-white/35">{appt.service}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Dealer Activity</h2>
                  <button type="button" className="text-xs font-medium text-[#0080ff] hover:text-white">
                    View Logs
                  </button>
                </div>
                <div className="space-y-3">
                  {activityFeed.map((item, index) => (
                    <div
                      key={item.event}
                      className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                    >
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0080ff]" />
                      <div>
                        <p className="text-sm text-white/60">{item.event}</p>
                        <p className="mt-0.5 text-[11px] text-white/30">{item.time}</p>
                      </div>
                      {index === 4 && (
                        <span className="ml-auto shrink-0 text-[10px] font-medium uppercase tracking-wider text-amber-300">
                          Flag
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/[0.08] bg-[#050607]/80 px-6 py-3">
          <p className="text-[11px] text-white/30">
            Press <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/45">Esc</kbd> to close
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
          >
            Back to Solutions
          </button>
        </div>
      </div>
    </div>
  )
}
