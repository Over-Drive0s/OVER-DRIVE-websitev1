import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Globe,
  Link2,
  Mail,
  RefreshCw,
  Server,
} from 'lucide-react'
import {
  categoryLabels,
  initialConnections,
  jitterMetric,
  type ApiConnection,
  type ConnectionCategory,
  type ConnectionStatus,
} from '../../data/apiManagerData'

type FilterCategory = 'all' | ConnectionCategory

const filterTabs: { id: FilterCategory; label: string; icon: typeof Link2 }[] = [
  { id: 'all', label: 'All', icon: Activity },
  { id: 'api', label: 'API', icon: Link2 },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'portal', label: 'Portal', icon: Globe },
  { id: 'third-party', label: 'Third Party', icon: Server },
]

const statusLabel: Record<ConnectionStatus, string> = {
  online: 'Operational',
  degraded: 'Degraded',
  offline: 'Offline',
}

const statusDot: Record<ConnectionStatus, string> = {
  online: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  offline: 'bg-red-500',
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`api-panel ${className}`}>
      <header className="api-panel-header">
        <div>
          <h2 className="api-panel-title">{title}</h2>
          {subtitle && <p className="api-panel-subtitle">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

function DigitalMetricChart({
  values,
  variant = 'blue',
}: {
  values: number[]
  variant?: 'blue' | 'cyan' | 'violet' | 'emerald'
}) {
  const max = Math.max(...values, 1)
  const palette = {
    blue: { base: '#2563eb', peak: '#60a5fa', dim: 'rgba(37,99,235,0.15)' },
    cyan: { base: '#0891b2', peak: '#22d3ee', dim: 'rgba(8,145,178,0.15)' },
    violet: { base: '#7c3aed', peak: '#a78bfa', dim: 'rgba(124,58,237,0.15)' },
    emerald: { base: '#059669', peak: '#34d399', dim: 'rgba(5,150,105,0.15)' },
  }[variant]

  const barWidth = 100 / values.length
  const gap = 1.2

  return (
    <div className="api-digital-chart">
      <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`api-digital-${variant}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={palette.base} stopOpacity="0.35" />
            <stop offset="100%" stopColor={palette.peak} stopOpacity="1" />
          </linearGradient>
        </defs>
        {[9, 18, 27].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {values.map((value, index) => {
          const h = Math.max(3, (value / max) * 28)
          const x = index * barWidth + gap / 2
          const w = Math.max(1.5, barWidth - gap)
          return (
            <g key={index}>
              <rect
                x={x}
                y={36 - h}
                width={w}
                height={h}
                fill={palette.dim}
                rx="0.4"
              />
              <rect
                x={x}
                y={36 - h}
                width={w}
                height={h}
                fill={`url(#api-digital-${variant})`}
                rx="0.4"
              />
              <rect
                x={x}
                y={36 - h}
                width={w}
                height={1.2}
                fill={palette.peak}
                opacity="0.9"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function MetricTile({
  label,
  value,
  detail,
  values,
  variant = 'blue',
  valueClass = '',
}: {
  label: string
  value: string
  detail: string
  values: number[]
  variant?: 'blue' | 'cyan' | 'violet' | 'emerald'
  valueClass?: string
}) {
  return (
    <div className={`api-metric-tile api-metric-tile-${variant}`}>
      <p className="api-metric-label">{label}</p>
      <p className={`api-metric-value ${valueClass}`}>{value}</p>
      <p className="api-metric-detail">{detail}</p>
      <div className="api-metric-chart">
        <DigitalMetricChart values={values} variant={variant} />
      </div>
    </div>
  )
}

function NetworkTopology({
  connections,
  selectedId,
  onSelect,
}: {
  connections: ApiConnection[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const cx = 200
  const cy = 200
  const radius = 168

  return (
    <div className="api-topology">
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-label="Integration topology">
        <defs>
          <pattern id="apiGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#apiGrid)" />

        {[88, 122, 156].map((r) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="1"
          />
        ))}

        {connections.map((conn) => {
          const rad = (conn.meshAngle * Math.PI) / 180
          const x = cx + Math.cos(rad) * radius
          const y = cy + Math.sin(rad) * radius
          const active = selectedId === conn.id

          return (
            <line
              key={`line-${conn.id}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={active ? 'rgba(59,130,246,0.55)' : 'rgba(148,163,184,0.22)'}
              strokeWidth={active ? 1.5 : 1}
            />
          )
        })}

        <circle cx={cx} cy={cy} r="28" fill="#0f1419" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(226,232,240,0.85)" fontSize="10" fontWeight="500">
          Hub
        </text>

        {connections.map((conn) => {
          const rad = (conn.meshAngle * Math.PI) / 180
          const x = cx + Math.cos(rad) * radius
          const y = cy + Math.sin(rad) * radius
          const active = selectedId === conn.id

          return (
            <g
              key={`node-${conn.id}`}
              className="cursor-pointer"
              onClick={() => onSelect(conn.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onSelect(conn.id)
              }}
              role="button"
              tabIndex={0}
            >
              <rect
                x={x - 22}
                y={y - 22}
                width="44"
                height="44"
                rx="8"
                fill={active ? '#111827' : '#0c1016'}
                stroke={active ? 'rgba(59,130,246,0.7)' : 'rgba(148,163,184,0.25)'}
                strokeWidth="1"
                className="api-topology-node"
              />
              <image
                href={conn.logo}
                x={x - 14}
                y={y - 14}
                width="28"
                height="28"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function PerformanceRow({
  label,
  value,
  unit,
  max,
  theme,
}: {
  label: string
  value: number
  unit: string
  max: number
  theme: 'cyan' | 'blue' | 'violet' | 'emerald'
}) {
  const pct = Math.min(100, (value / max) * 100)
  const colors = {
    cyan: { fill: 'linear-gradient(90deg, #0891b2, #22d3ee)', value: 'text-cyan-300', track: 'rgba(8,145,178,0.2)' },
    blue: { fill: 'linear-gradient(90deg, #2563eb, #60a5fa)', value: 'text-blue-300', track: 'rgba(37,99,235,0.2)' },
    violet: { fill: 'linear-gradient(90deg, #7c3aed, #a78bfa)', value: 'text-violet-300', track: 'rgba(124,58,237,0.2)' },
    emerald: { fill: 'linear-gradient(90deg, #059669, #34d399)', value: 'text-emerald-300', track: 'rgba(5,150,105,0.2)' },
  }[theme]

  return (
    <div className={`api-perf-row api-perf-row-${theme}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="api-perf-label">{label}</span>
        <span className={`api-perf-value tabular-nums ${colors.value}`}>
          {value}
          <span className="api-perf-unit">{unit}</span>
        </span>
      </div>
      <div className="api-perf-track" style={{ background: colors.track }}>
        <div className="api-perf-fill" style={{ width: `${pct}%`, background: colors.fill }} />
      </div>
    </div>
  )
}

function heatmapColor(intensity: number, degraded: boolean): string {
  if (degraded) {
    if (intensity < 0.35) return '#78350f'
    if (intensity < 0.65) return '#d97706'
    return '#ef4444'
  }
  if (intensity < 0.2) return '#1e293b'
  if (intensity < 0.4) return '#1d4ed8'
  if (intensity < 0.6) return '#0891b2'
  if (intensity < 0.8) return '#059669'
  return '#34d399'
}

function VolumeHeatmapBar({
  values,
  status,
}: {
  values: number[]
  status: ConnectionStatus
}) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values)
  const range = max - min || 1
  const latest = values[values.length - 1] ?? 0
  const loadPct = Math.round((latest / max) * 100)
  const degraded = status === 'degraded'

  return (
    <div className="api-heatmap-wrap">
      <div className="api-heatmap-bar" role="img" aria-label={`Volume load ${loadPct}%`}>
        {values.map((value, index) => {
          const intensity = (value - min) / range
          return (
            <span
              key={index}
              className="api-heatmap-segment"
              style={{ backgroundColor: heatmapColor(intensity, degraded) }}
              title={`${value.toLocaleString()} req/min`}
            />
          )
        })}
      </div>
      <div className="api-heatmap-progress">
        <div
          className={`api-heatmap-progress-fill ${degraded ? 'api-heatmap-progress-warn' : ''}`}
          style={{ width: `${loadPct}%` }}
        />
      </div>
      <span className="api-heatmap-pct tabular-nums">{loadPct}%</span>
    </div>
  )
}

function ConnectionsTable({
  rows,
  selectedId,
  enabledMap,
  onSelect,
  onToggle,
}: {
  rows: ApiConnection[]
  selectedId: string | null
  enabledMap: Record<string, boolean>
  onSelect: (id: string) => void
  onToggle: (id: string) => void
}) {
  return (
    <div className="api-table-wrap">
      <table className="api-table">
        <thead>
          <tr>
            <th>Integration</th>
            <th>Type</th>
            <th>Status</th>
            <th className="text-right">Latency</th>
            <th className="text-right">Throughput</th>
            <th className="text-right">Req/min</th>
            <th>Volume load</th>
            <th className="text-center">Enabled</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((conn) => {
            const selected = selectedId === conn.id
            const enabled = enabledMap[conn.id] ?? true

            return (
              <tr
                key={conn.id}
                className={selected ? 'api-table-row-selected' : undefined}
                onClick={() => onSelect(conn.id)}
              >
                <td>
                  <div className="flex items-center gap-3">
                    <span className="api-logo-chip">
                      <img src={conn.logo} alt={conn.provider} />
                    </span>
                    <span>
                      <span className="block text-[12px] font-medium text-slate-100">{conn.name}</span>
                      <span className="block text-[10px] text-slate-500">{conn.provider}</span>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="api-type-chip">{categoryLabels[conn.category]}</span>
                </td>
                <td>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[conn.status]}`} />
                    {statusLabel[conn.status]}
                  </span>
                </td>
                <td className="text-right tabular-nums text-slate-200">{conn.latencyMs} ms</td>
                <td className="text-right tabular-nums text-slate-200">{conn.throughputMbps} Mb/s</td>
                <td className="text-right tabular-nums text-slate-200">
                  {conn.requestsPerMin.toLocaleString()}
                </td>
                <td className="min-w-[148px]">
                  <VolumeHeatmapBar values={conn.sparkline} status={conn.status} />
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`Toggle ${conn.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onToggle(conn.id)
                    }}
                    className={`api-toggle ${enabled ? 'api-toggle-on' : ''}`}
                  >
                    <span className="api-toggle-knob" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function ApiManagerDashboard() {
  const [connections, setConnections] = useState<ApiConnection[]>(initialConnections)
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialConnections.map((c) => [c.id, true])),
  )
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [selectedId, setSelectedId] = useState<string | null>('openclaw')
  const [tick, setTick] = useState(0)
  const [lastSync, setLastSync] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setConnections((prev) =>
        prev.map((conn) => ({
          ...conn,
          latencyMs: jitterMetric(conn.latencyMs, 8, 12),
          throughputMbps: jitterMetric(conn.throughputMbps, 12, 20),
          requestsPerMin: Math.round(jitterMetric(conn.requestsPerMin, 120, 100)),
          sparkline: [...conn.sparkline.slice(1), conn.requestsPerMin],
        })),
      )
      setTick((t) => t + 1)
      setLastSync(new Date())
    }, 3000)

    return () => window.clearInterval(interval)
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return connections
    return connections.filter((c) => c.category === filter)
  }, [connections, filter])

  const meshConnections = useMemo(
    () => connections.filter((c) => enabledMap[c.id] && c.category !== 'email'),
    [connections, enabledMap],
  )

  const aggregate = useMemo(() => {
    const active = connections.filter((c) => enabledMap[c.id])
    const avgLatency = active.reduce((sum, c) => sum + c.latencyMs, 0) / (active.length || 1)
    const totalThroughput = active.reduce((sum, c) => sum + c.throughputMbps, 0)
    const totalRequests = active.reduce((sum, c) => sum + c.requestsPerMin, 0)
    const avgUptime = active.reduce((sum, c) => sum + c.uptime, 0) / (active.length || 1)
    const degraded = active.filter((c) => c.status === 'degraded').length

    return {
      activeCount: active.length,
      avgLatency: Math.round(avgLatency),
      totalThroughput: Math.round(totalThroughput),
      totalRequests,
      avgUptime: avgUptime.toFixed(1),
      degraded,
    }
  }, [connections, enabledMap, tick])

  const selected = connections.find((c) => c.id === selectedId) ?? connections[0]

  const toggleConnection = useCallback((id: string) => {
    setEnabledMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const trafficBars = useMemo(() => {
    const raw = Array.from({ length: 32 }, (_, i) => {
      return 18 + Math.sin((i + tick) * 0.42) * 14 + ((i * 5 + tick * 2) % 18)
    })
    const min = Math.min(...raw)
    const max = Math.max(...raw)
    const range = max - min || 1
    return raw.map((value) => 10 + ((value - min) / range) * 90)
  }, [tick])

  const syncTime = lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="api-manager-shell min-h-full text-slate-200">
      <div className="api-manager-header">
        <div className="api-manager-container api-manager-header-inner">
          <div>
            <nav className="api-breadcrumb">
              <Link to="/platform">Platform</Link>
              <ChevronRight size={11} className="opacity-50" />
              <span className="text-slate-400">Integrations</span>
              <ChevronRight size={11} className="opacity-50" />
              <span>API Connection Manager</span>
            </nav>
            <div className="api-title-row">
              <h1 className="api-page-title">API Connection Manager</h1>
              <span className="api-env-badge">Production</span>
            </div>
          </div>

          <div className="api-header-actions">
            <Link to="/platform" className="api-ghost-btn">
              <ArrowLeft size={12} />
              Back to Platform
            </Link>
            <span className="api-status-chip">
              <span className="api-status-dot" />
              {aggregate.activeCount} active · {aggregate.degraded} degraded
            </span>
            <span className="api-sync-chip tabular-nums">Synced {syncTime}</span>
            <button type="button" className="api-ghost-btn">
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="api-manager-container api-manager-body">
        <div className="api-metric-grid">
          <MetricTile
            label="Active connections"
            value={String(aggregate.activeCount)}
            detail={`${connections.length} configured endpoints`}
            values={[6, 7, 7, 8, 8, 8, aggregate.activeCount]}
            variant="blue"
            valueClass="text-blue-300"
          />
          <MetricTile
            label="Mean latency"
            value={`${aggregate.avgLatency} ms`}
            detail="P50 across enabled routes"
            values={[78, 74, 72, 70, 69, 68, aggregate.avgLatency]}
            variant="cyan"
            valueClass="text-cyan-300"
          />
          <MetricTile
            label="Aggregate throughput"
            value={`${aggregate.totalThroughput} Mb/s`}
            detail="Combined egress bandwidth"
            values={[520, 540, 560, 580, 600, 610, aggregate.totalThroughput]}
            variant="violet"
            valueClass="text-violet-300"
          />
          <MetricTile
            label="Service availability"
            value={`${aggregate.avgUptime}%`}
            detail={`${aggregate.totalRequests.toLocaleString()} requests / min`}
            values={[99.2, 99.3, 99.4, 99.5, 99.5, 99.6, Number(aggregate.avgUptime)]}
            variant="emerald"
            valueClass="text-emerald-300"
          />
        </div>

        <div className="api-toolbar">
          <div className="api-filter-tabs">
            {filterTabs.map(({ id, label, icon: Icon }) => {
              const active = filter === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={active ? 'api-filter-tab api-filter-tab-active' : 'api-filter-tab'}
                >
                  <Icon size={13} />
                  {label}
                </button>
              )
            })}
          </div>
          <p className="api-toolbar-meta">
            Showing {filtered.length} of {connections.length} integrations
          </p>
        </div>

        <div className="api-cards-grid">
            <Panel
              className="api-card-registry"
              title="Integration registry"
              subtitle="Operational status, throughput, and routing controls"
            >
              <ConnectionsTable
                rows={filtered}
                selectedId={selectedId}
                enabledMap={enabledMap}
                onSelect={setSelectedId}
                onToggle={toggleConnection}
              />
            </Panel>

            <Panel
              className="api-card-ingress"
              title="Ingress volume"
              subtitle="Last 60 seconds — aggregate request load"
            >
              <div className="api-ingress-panel">
                <div className="api-traffic-chart">
                  {trafficBars.map((h, i) => (
                    <div
                      key={i}
                      className="api-traffic-col flex-1"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="api-traffic-axis">
                  <span>-60s</span>
                  <span className="text-slate-400">Live</span>
                  <span>Now</span>
                </div>
              </div>
            </Panel>

            <Panel
              className="api-card-topology"
              title="Topology map"
              subtitle="Active integration paths from central hub"
            >
              <NetworkTopology
                connections={meshConnections}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              {selected && (
                <div className="api-detail-strip">
                  <img src={selected.logo} alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-100">{selected.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{selected.description}</p>
                  </div>
                </div>
              )}
            </Panel>

            <Panel
              className="api-card-performance"
              title="Performance summary"
              subtitle="Live service-level indicators"
            >
              <div className="api-perf-stack">
                <PerformanceRow
                  label="Response time"
                  value={aggregate.avgLatency}
                  unit="ms"
                  max={200}
                  theme="cyan"
                />
                <PerformanceRow
                  label="Throughput"
                  value={aggregate.totalThroughput}
                  unit="Mb/s"
                  max={800}
                  theme="blue"
                />
                <PerformanceRow
                  label="Request rate"
                  value={Math.round(aggregate.totalRequests / 100) / 10}
                  unit="K/min"
                  max={12}
                  theme="violet"
                />
                <PerformanceRow
                  label="Availability"
                  value={Number(aggregate.avgUptime)}
                  unit="%"
                  max={100}
                  theme="emerald"
                />
              </div>
            </Panel>
        </div>
      </div>
    </div>
  )
}
