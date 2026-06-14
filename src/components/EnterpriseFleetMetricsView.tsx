import {
  AlertTriangle,
  Download,
  ExternalLink,
  Fuel,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { EnterpriseTab } from '../data/metricsAccounts'
import { MiniSparkline } from './InfographicWidgets'

type RouteFilter = 'all' | 'Active' | 'Delayed' | 'Completed'
type AlertSeverity = 'all' | 'Critical' | 'Warning' | 'Info'

const fleetStats = [
  { title: 'Active vehicles', value: '84', change: '↑ 6 on road', sparkline: [72, 74, 76, 78, 80, 82, 84] },
  { title: 'On-time delivery', value: '94.2%', change: '↑ 2.1 pts', sparkline: [88, 89, 90, 91, 92, 93, 94] },
  { title: 'Miles today', value: '12,480', change: '↑ 8.4%', sparkline: [9800, 10200, 10800, 11100, 11500, 12000, 12480] },
  { title: 'Fuel efficiency', value: '7.2 mpg', change: '↑ 0.3 mpg', sparkline: [6.6, 6.7, 6.8, 6.9, 7.0, 7.1, 7.2] },
  { title: 'Avg. idle time', value: '18 min', change: '↓ 4 min', sparkline: [28, 26, 24, 22, 21, 19, 18] },
  { title: 'Driver score', value: '88/100', change: '↑ 3 pts', sparkline: [80, 82, 83, 84, 86, 87, 88] },
]

const liveRoutes = [
  { id: '1', name: 'Route 12 — Brooklyn loop', driver: 'Marcus T.', status: 'Active' as const, progress: 68, eta: '14:32', stops: '8/12' },
  { id: '2', name: 'Route 44 — Newark express', driver: 'Jen L.', status: 'Active' as const, progress: 42, eta: '15:10', stops: '4/9' },
  { id: '3', name: 'Route 88 — Queens pickup', driver: 'Alex R.', status: 'Delayed' as const, progress: 55, eta: '15:45', stops: '6/10' },
  { id: '4', name: 'Route 31 — Manhattan AM', driver: 'Sarah K.', status: 'Completed' as const, progress: 100, eta: 'Done', stops: '14/14' },
  { id: '5', name: 'Route 19 — Staten restock', driver: 'Mike T.', status: 'Active' as const, progress: 22, eta: '16:20', stops: '2/11' },
]

const vehicles = [
  { id: 'v1', unit: 'Unit 12', type: 'Box truck', status: 'On route', fuel: 72, miles: '842 mi', driver: 'Marcus T.', maintenance: false },
  { id: 'v2', unit: 'Unit 08', type: 'Van', status: 'On route', fuel: 45, miles: '612 mi', driver: 'Jen L.', maintenance: false },
  { id: 'v3', unit: 'Unit 22', type: 'Refrigerated', status: 'Idle', fuel: 88, miles: '1,204 mi', driver: '—', maintenance: true },
  { id: 'v4', unit: 'Unit 05', type: 'Box truck', status: 'On route', fuel: 31, miles: '978 mi', driver: 'Alex R.', maintenance: false },
  { id: 'v5', unit: 'Unit 17', type: 'Van', status: 'Maintenance', fuel: 60, miles: '445 mi', driver: '—', maintenance: true },
]

const fleetAlerts = [
  { id: '1', title: 'GPS sync delay — Unit 12', severity: 'Critical' as const, time: '8 min ago', ack: false },
  { id: '2', title: 'Route 88 running 22 min behind', severity: 'Warning' as const, time: '14 min ago', ack: false },
  { id: '3', title: 'Low fuel alert — Unit 05', severity: 'Warning' as const, time: '28 min ago', ack: false },
  { id: '4', title: 'Scheduled maintenance due — Unit 17', severity: 'Info' as const, time: '1 hr ago', ack: true },
  { id: '5', title: 'Temperature threshold — Unit 22', severity: 'Critical' as const, time: '2 hr ago', ack: false },
]

const routePerformance = [
  { name: 'Brooklyn loop', onTime: 96, distance: '48 mi', stops: 12, avgTime: '4.2h' },
  { name: 'Newark express', onTime: 91, distance: '62 mi', stops: 9, avgTime: '3.8h' },
  { name: 'Queens pickup', onTime: 78, distance: '35 mi', stops: 10, avgTime: '5.1h' },
  { name: 'Manhattan AM', onTime: 98, distance: '28 mi', stops: 14, avgTime: '3.2h' },
]

function StatCard({
  title,
  value,
  change,
  sparkline,
  active,
  onSelect,
}: {
  title: string
  value: string
  change: string
  sparkline: number[]
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border p-3 text-left transition-all sm:p-4 ${
        active
          ? 'border-[#0080ff]/40 bg-[#0080ff]/[0.08] glow-brand-blue'
          : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#0080ff]/20'
      }`}
    >
      <p className="text-[10px] uppercase tracking-wider text-white/35">{title}</p>
      <p className="mt-2 text-lg font-semibold text-white sm:text-xl">{value}</p>
      <p className="mt-1 text-xs text-[#ccff00]/80">{change}</p>
      <div className="mt-2 opacity-60">
        <MiniSparkline points={sparkline} color={active ? '#0080ff' : '#4f7cff'} />
      </div>
    </button>
  )
}

export default function EnterpriseFleetMetricsView({ activeTab }: { activeTab: EnterpriseTab }) {
  const [selectedStat, setSelectedStat] = useState(0)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [routeFilter, setRouteFilter] = useState<RouteFilter>('all')
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [alerts, setAlerts] = useState(fleetAlerts)
  const [alertFilter, setAlertFilter] = useState<AlertSeverity>('all')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const filteredRoutes = useMemo(() => {
    if (routeFilter === 'all') return liveRoutes
    return liveRoutes.filter((r) => r.status === routeFilter)
  }, [routeFilter])

  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'all') return alerts.filter((a) => !a.ack)
    return alerts.filter((a) => a.severity === alertFilter && !a.ack)
  }, [alerts, alertFilter])

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ack: true } : a)))
    showToast('Alert acknowledged — team notified')
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[#0080ff]/30 bg-[#0a0c10]/95 px-4 py-2.5 text-sm text-[#0080ff] shadow-lg backdrop-blur-md">
          {toast}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['today', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => showToast(`Date range: ${range}`)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium uppercase ${
                range === 'today'
                  ? 'bg-[#0080ff]/15 text-[#0080ff]'
                  : 'border border-white/[0.08] text-white/50 hover:text-white/80'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => showToast('Fleet report exported')}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 hover:border-[#0080ff]/30"
          >
            <Download size={13} />
            Export
          </button>
          <Link
            to="/request-demo"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#0080ff]/30 bg-[#0080ff]/10 px-3 py-1.5 text-xs text-[#0080ff] hover:bg-[#0080ff]/20"
          >
            <ExternalLink size={13} />
            Request custom build
          </Link>
        </div>
      </div>

      {(activeTab === 'live' || activeTab === 'routes') && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {fleetStats.map((stat, i) => (
            <StatCard
              key={stat.title}
              {...stat}
              active={selectedStat === i}
              onSelect={() => setSelectedStat(i)}
            />
          ))}
        </div>
      )}

      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-white">Live route map</h2>
                <button
                  type="button"
                  onClick={() => showToast('Full map view opened')}
                  className="text-xs text-[#0080ff] hover:underline"
                >
                  Expand map →
                </button>
              </div>
              <div className="relative h-48 overflow-hidden rounded-lg border border-[#0080ff]/15 bg-[#0080ff]/[0.03] sm:h-56">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,128,255,0.15)_0%,transparent_50%)]" />
                <svg viewBox="0 0 400 200" className="h-full w-full opacity-80">
                  <path d="M40,160 Q120,80 200,120 T360,60" fill="none" stroke="#0080ff" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
                  <path d="M60,140 L180,100 L280,130 L340,90" fill="none" stroke="#ccff00" strokeWidth="2.5" />
                  {[
                    { cx: 60, cy: 140, label: '12' },
                    { cx: 180, cy: 100, label: '44' },
                    { cx: 280, cy: 130, label: '88' },
                    { cx: 340, cy: 90, label: '31' },
                  ].map((p) => (
                    <g key={p.label}>
                      <circle cx={p.cx} cy={p.cy} r="8" fill="#0080ff" fillOpacity="0.3" stroke="#0080ff" />
                      <text x={p.cx} y={p.cy + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="600">
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
                <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] text-white/45">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-[#ccff00]" /> Active</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-amber-400" /> Delayed</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Fleet status</h2>
              <div className="space-y-3">
                {[
                  { label: 'On route', count: 62, pct: 74, color: '#0080ff' },
                  { label: 'Idle / depot', count: 14, pct: 17, color: '#4f7cff' },
                  { label: 'Maintenance', count: 8, pct: 9, color: '#ff6b6b' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-white/60">{item.label}</span>
                      <span className="text-white/45">{item.count} units</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <Fuel size={16} className="mx-auto text-[#0080ff]/70" />
                  <p className="mt-1 text-lg font-semibold text-white">$4,820</p>
                  <p className="text-[10px] text-white/35">Fuel spend today</p>
                </div>
                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <TrendingUp size={16} className="mx-auto text-[#ccff00]/70" />
                  <p className="mt-1 text-lg font-semibold text-white">94.2%</p>
                  <p className="text-[10px] text-white/35">On-time rate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-medium text-white">Active routes</h2>
            <div className="space-y-2">
              {liveRoutes.filter((r) => r.status !== 'Completed').map((route) => (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                  className={`flex w-full flex-col gap-2 rounded-lg border px-4 py-3 text-left transition-all sm:flex-row sm:items-center sm:justify-between ${
                    selectedRoute === route.id
                      ? 'border-[#0080ff]/35 bg-[#0080ff]/[0.06]'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Truck size={18} className="mt-0.5 shrink-0 text-[#0080ff]" />
                    <div>
                      <p className="text-sm font-medium text-white/90">{route.name}</p>
                      <p className="text-xs text-white/40">{route.driver} · ETA {route.eta} · {route.stops} stops</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-medium uppercase ${route.status === 'Delayed' ? 'text-amber-400' : 'text-[#ccff00]'}`}>
                      {route.status}
                    </span>
                    <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-white/10 sm:block">
                      <div className="h-full rounded-full bg-[#0080ff]" style={{ width: `${route.progress}%` }} />
                    </div>
                    <span className="text-xs text-white/40">{route.progress}%</span>
                  </div>
                </button>
              ))}
            </div>
            {selectedRoute && (
              <div className="mt-3 flex flex-wrap gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
                <button type="button" onClick={() => showToast('Route reassigned')} className="rounded-md bg-[#0080ff]/15 px-3 py-1.5 text-[10px] font-medium text-[#0080ff]">
                  Reassign driver
                </button>
                <button type="button" onClick={() => showToast('Customer notified')} className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/50 hover:text-white/80">
                  Notify customer
                </button>
                <button type="button" onClick={() => showToast('Route detail opened')} className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/50 hover:text-white/80">
                  View route detail
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'Active', 'Delayed', 'Completed'] as RouteFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setRouteFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  routeFilter === f ? 'bg-[#0080ff]/15 text-[#0080ff]' : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                }`}
              >
                {f === 'all' ? 'All routes' : f}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-white/[0.08]">
            <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.6fr] gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35 sm:px-5">
              <span>Route</span>
              <span>Driver</span>
              <span>Status</span>
              <span>Stops</span>
              <span className="text-right">Progress</span>
            </div>
            {filteredRoutes.map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                className={`grid w-full grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.6fr] gap-2 border-b border-white/[0.04] px-4 py-3 text-left text-xs last:border-0 hover:bg-white/[0.02] sm:px-5 ${
                  selectedRoute === route.id ? 'bg-[#0080ff]/[0.05]' : ''
                }`}
              >
                <span className="font-medium text-white/85">{route.name}</span>
                <span className="text-white/50">{route.driver}</span>
                <span className={route.status === 'Delayed' ? 'text-amber-400' : route.status === 'Completed' ? 'text-[#ccff00]' : 'text-[#0080ff]'}>
                  {route.status}
                </span>
                <span className="text-white/50">{route.stops}</span>
                <span className="text-right text-white/45">{route.progress}%</span>
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {routePerformance.map((route) => (
              <div key={route.name} className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4">
                <p className="text-xs font-medium text-white">{route.name}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{route.onTime}%</p>
                <p className="text-[10px] text-[#ccff00]/75">On-time rate</p>
                <p className="mt-2 text-[10px] text-white/40">{route.distance} · {route.stops} stops · avg {route.avgTime}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVehicle(selectedVehicle === v.id ? null : v.id)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  selectedVehicle === v.id
                    ? 'border-[#0080ff]/40 bg-[#0080ff]/[0.08]'
                    : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#0080ff]/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{v.unit}</p>
                    <p className="text-[10px] text-white/40">{v.type}</p>
                  </div>
                  {v.maintenance && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-400">
                      Service due
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs text-white/55">{v.status} · {v.driver}</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-white/35">
                    <span>Fuel</span>
                    <span>{v.fuel}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${v.fuel < 35 ? 'bg-amber-400' : 'bg-[#0080ff]'}`}
                      style={{ width: `${v.fuel}%` }}
                    />
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-white/35">{v.miles} this month</p>
              </button>
            ))}
          </div>
          {selectedVehicle && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-[#0080ff]/20 bg-[#0080ff]/[0.04] p-4">
              <button type="button" onClick={() => showToast('Maintenance scheduled')} className="rounded-md bg-[#0080ff]/15 px-3 py-1.5 text-xs text-[#0080ff]">
                Schedule service
              </button>
              <button type="button" onClick={() => showToast('Telematics log opened')} className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/50 hover:text-white/80">
                View telematics
              </button>
              <button type="button" onClick={() => showToast('Driver assigned')} className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/50 hover:text-white/80">
                Assign driver
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'Critical', 'Warning', 'Info'] as AlertSeverity[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setAlertFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  alertFilter === f ? 'bg-[#0080ff]/15 text-[#0080ff]' : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                }`}
              >
                {f === 'all' ? 'All open' : f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredAlerts.length === 0 ? (
              <div className="rounded-lg border border-white/[0.08] py-12 text-center text-sm text-white/35">
                No open alerts — fleet running smoothly
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                    alert.severity === 'Critical'
                      ? 'border-red-500/25 bg-red-500/[0.04]'
                      : alert.severity === 'Warning'
                        ? 'border-amber-500/25 bg-amber-500/[0.04]'
                        : 'border-white/[0.08] bg-[#080a0e]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={18}
                      className={
                        alert.severity === 'Critical'
                          ? 'text-red-400'
                          : alert.severity === 'Warning'
                            ? 'text-amber-400'
                            : 'text-[#0080ff]'
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-white/90">{alert.title}</p>
                      <p className="text-xs text-white/40">{alert.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="rounded-md bg-[#0080ff]/15 px-3 py-1.5 text-xs font-medium text-[#0080ff] hover:bg-[#0080ff]/25"
                    >
                      Acknowledge
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Escalated to dispatch lead')}
                      className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/50 hover:text-white/80"
                    >
                      Escalate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <Zap size={14} className="text-[#0080ff]/70" />
            <span className="text-xs text-white/45">Quick actions:</span>
            {['Mute non-critical', 'Export alert log', 'Configure thresholds'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => showToast(`${label} — saved`)}
                className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/55 hover:border-[#0080ff]/25 hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
