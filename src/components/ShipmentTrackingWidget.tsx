import { CheckCircle2, ChevronDown, ChevronUp, Circle, MapPin, Package, Radio, Search, Truck, Zap } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { CarrierLogo, type CarrierId } from './ShippingCarrierLogos'

export type ShipmentStatus = 'label_created' | 'in_transit' | 'delivered'

export interface TrackableShipment {
  id: string
  orderId: string
  sku: string
  itemName: string
  qty: number
  carrier: CarrierId
  tracking: string
  status: ShipmentStatus
  createdAt: string
}

interface ShipmentTrackingWidgetProps {
  shipments: TrackableShipment[]
  variant?: 'compact' | 'full'
  leftColumnFooter?: ReactNode
}

const TRACKING_STEPS = [
  { key: 'packed', label: 'Packed', location: 'Newark, NJ', code: '01' },
  { key: 'label', label: 'Label created', location: 'Newark, NJ', code: '02' },
  { key: 'transit', label: 'In transit', location: 'Memphis, TN hub', code: '03' },
  { key: 'out', label: 'Out for delivery', location: 'Local facility', code: '04' },
  { key: 'delivered', label: 'Delivered', location: 'Destination', code: '05' },
] as const

const statusStepIndex: Record<ShipmentStatus, number> = {
  label_created: 1,
  in_transit: 2,
  delivered: 4,
}

const statusStyles = {
  label_created: 'bg-[#0080ff]/15 text-[#0080ff] border-[#0080ff]/30',
  in_transit: 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/30',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

const statusLabel = {
  label_created: 'Label created',
  in_transit: 'In transit',
  delivered: 'Delivered',
}

function normalizeTracking(value: string) {
  return value.replace(/\s+/g, '').toLowerCase()
}

function etaForStatus(status: ShipmentStatus) {
  if (status === 'delivered') return 'Delivered'
  if (status === 'in_transit') return 'Est. tomorrow by 8 PM'
  return 'Est. 2–3 business days'
}

function scanCountForStatus(status: ShipmentStatus) {
  if (status === 'delivered') return 14
  if (status === 'in_transit') return 9
  return 3
}

function DigitalTrackingId({ tracking }: { tracking: string }) {
  const chars = tracking.replace(/\s/g, '').split('')

  return (
    <div className="inv-tracking-id">
      <span className="inv-tracking-id-label">Tracking ID</span>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {chars.map((char, i) => (
          <span key={`${char}-${i}`} className="inv-tracking-id-char">
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}

function delayForecastForStatus(status: ShipmentStatus): number[] {
  if (status === 'delivered') return [0, 0, 0, 0, 0, 0, 0, 0]
  if (status === 'in_transit') return [0, 0.2, 0.4, 0.8, 1.1, 1.4, 1.2, 0.9]
  return [0, 0.1, 0.3, 0.6, 1.2, 2.1, 3.4, 4.8]
}

function RouteMap({ status, orderId }: { status: ShipmentStatus; orderId: string }) {
  const progress = statusStepIndex[status] / (TRACKING_STEPS.length - 1)
  const truckX = 48 + progress * 252
  const truckY = 44 + Math.sin(progress * Math.PI) * -18
  const delaySeries = delayForecastForStatus(status)
  const maxDelay = Math.max(...delaySeries, 1)
  const w = 340
  const graphH = 52
  const graphPad = 8
  const graphW = w - graphPad * 2
  const step = graphW / (delaySeries.length - 1)

  const hubs = [
    { x: 48, y: 44, code: 'EWR', label: 'NEWARK', lat: '40.7357°N', lon: '74.1724°W', pct: 0 },
    { x: 170, y: 26, code: 'MEM', label: 'MEMPHIS', lat: '35.0424°N', lon: '89.9767°W', pct: 0.5 },
    { x: 300, y: 44, code: 'AUS', label: 'AUSTIN', lat: '30.2672°N', lon: '97.7431°W', pct: 1 },
  ]

  const delayPoints = delaySeries
    .map((v, i) => `${graphPad + i * step},${graphH - graphPad - (v / maxDelay) * (graphH - graphPad * 2)}`)
    .join(' ')

  const groundSpeed = status === 'delivered' ? 0 : status === 'in_transit' ? 68 : 12
  const bearing = status === 'delivered' ? '270°' : status === 'in_transit' ? '238° SW' : '—'
  const routeId = orderId.replace('ORD-', 'RT-')

  return (
    <div className="inv-route-map inv-route-map-tech">
      <div className="inv-route-map-header">
        <div className="flex items-center gap-2">
          <span className="inv-route-map-badge">RTM-01</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50">Route telemetry</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[8px] uppercase tracking-wider">
          <span className="text-[#ccff00]/90">
            <span className="text-white/30">SIG </span>LIVE
          </span>
          <span className="text-white/30">|</span>
          <span className="text-[#0080ff]/90">{routeId}</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5 font-mono text-[8px]">
        {[
          { k: 'BRG', v: bearing },
          { k: 'GS', v: `${groundSpeed} mph` },
          { k: 'DIST', v: status === 'delivered' ? '1,842 mi' : status === 'in_transit' ? '1,204 mi' : '0 mi' },
          { k: 'ETAΔ', v: status === 'delivered' ? '+0.0h' : status === 'in_transit' ? '+1.2h' : '+4.8h' },
        ].map((row) => (
          <div key={row.k} className="inv-route-readout">
            <span className="text-white/30">{row.k}</span>
            <span className="mt-0.5 block font-semibold text-white/85">{row.v}</span>
          </div>
        ))}
      </div>

      <div className="inv-route-map-canvas relative mt-3">
        <svg viewBox="0 0 340 110" className="h-auto w-full" aria-hidden>
          <defs>
            <linearGradient id="routeGradTech" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0080ff" stopOpacity="1" />
              <stop offset="55%" stopColor="#66ccff" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--inv-accent-lime)" stopOpacity="1" />
            </linearGradient>
            <pattern id="routeGrid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(0,128,255,0.08)" strokeWidth="0.5" />
            </pattern>
            <filter id="routeGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="340" height="88" fill="url(#routeGrid)" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={48 + i * 63} y1="8" x2={48 + i * 63} y2="80" stroke="var(--inv-route-vgrid)" strokeWidth="1" />
          ))}

          <path
            d="M 48 44 Q 108 18, 170 26 T 300 44"
            fill="none"
            stroke="var(--inv-route-path-muted)"
            strokeWidth="2"
            strokeDasharray="3 5"
          />
          <path
            d="M 48 44 Q 108 18, 170 26 T 300 44"
            fill="none"
            stroke="url(#routeGradTech)"
            strokeWidth="2.5"
            strokeDasharray={`${progress * 320} 320`}
            strokeLinecap="round"
            filter="url(#routeGlow)"
          />

          {hubs.map((hub) => {
            const active = progress >= hub.pct - 0.05
            return (
              <g key={hub.code}>
                <polygon
                  points={`${hub.x},${hub.y - 7} ${hub.x + 6},${hub.y} ${hub.x},${hub.y + 7} ${hub.x - 6},${hub.y}`}
                  fill={active ? (hub.pct === 1 && status === 'delivered' ? 'var(--inv-status-healthy)' : 'var(--inv-accent-lime)') : 'var(--inv-route-hub-inactive)'}
                  stroke="var(--inv-route-hub-stroke)"
                  strokeWidth="1"
                  opacity={active ? 1 : 0.6}
                />
                <text x={hub.x} y={hub.y + 18} textAnchor="middle" fill="var(--inv-route-label)" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                  {hub.code}
                </text>
                <text x={hub.x} y={hub.y + 26} textAnchor="middle" fill="var(--inv-route-label-muted)" fontSize="5.5" fontFamily="ui-monospace, monospace">
                  {hub.label}
                </text>
              </g>
            )
          })}

          <g transform={`translate(${truckX}, ${truckY - 10})`} filter="url(#routeGlow)">
            <rect x="-10" y="0" width="20" height="11" rx="2" fill="var(--inv-accent-lime)" opacity="0.95" />
            <rect x="-6" y="-3" width="12" height="4" rx="1" fill="#0080ff" opacity="0.8" />
            <circle cx="-5" cy="13" r="2.5" fill="rgba(255,255,255,0.45)" />
            <circle cx="5" cy="13" r="2.5" fill="rgba(255,255,255,0.45)" />
            <line x1="0" y1="-6" x2="0" y2="-12" stroke="var(--inv-accent-lime)" strokeWidth="1" />
            <circle cx="0" cy="-13" r="2" fill="none" stroke="var(--inv-accent-lime)" strokeWidth="1" />
          </g>

          <line x1={truckX} y1={truckY + 16} x2={truckX} y2="82" stroke="var(--inv-accent-lime-soft)" strokeWidth="0.75" strokeDasharray="2 2" />
          <rect x={truckX - 28} y="84" width="56" height="10" rx="2" fill="var(--inv-route-tooltip-bg)" stroke="var(--inv-accent-lime-faint)" strokeWidth="0.5" />
          <text x={truckX} y="91.5" textAnchor="middle" fill="var(--inv-accent-lime)" fontSize="5.5" fontFamily="ui-monospace, monospace">
            {status === 'in_transit' ? '40.812°N 96.702°W' : status === 'delivered' ? '30.267°N 97.743°W' : '40.736°N 74.172°W'}
          </text>
        </svg>

        <div className="border-t border-[#0080ff]/10 bg-black/40 px-2 py-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[7px] font-semibold uppercase tracking-widest text-[#0080ff]/70">
              Predictive delay index
            </span>
            <span className="font-mono text-[7px] text-white/30">T+0 → T+7 · hrs</span>
          </div>
          <svg viewBox={`0 0 ${w} ${graphH}`} className="mt-1 h-12 w-full" aria-hidden>
            <line x1={graphPad} y1={graphH - graphPad} x2={w - graphPad} y2={graphH - graphPad} stroke="var(--inv-route-graph-axis)" strokeWidth="0.75" />
            {[0.25, 0.5, 0.75].map((pct) => (
              <line
                key={pct}
                x1={graphPad}
                y1={graphH - graphPad - pct * (graphH - graphPad * 2)}
                x2={w - graphPad}
                y2={graphH - graphPad - pct * (graphH - graphPad * 2)}
                stroke="var(--inv-route-graph-grid)"
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />
            ))}
            <polygon
              points={`${graphPad},${graphH - graphPad} ${delayPoints} ${graphPad + (delaySeries.length - 1) * step},${graphH - graphPad}`}
              fill="rgba(248,113,113,0.12)"
            />
            <polyline
              fill="none"
              stroke="#f87171"
              strokeWidth="1.5"
              strokeLinejoin="round"
              points={delayPoints}
            />
            {delaySeries.map((v, i) => (
              <circle
                key={i}
                cx={graphPad + i * step}
                cy={graphH - graphPad - (v / maxDelay) * (graphH - graphPad * 2)}
                r="2"
                fill="#f87171"
                stroke="var(--inv-chart-point-stroke)"
                strokeWidth="0.75"
              />
            ))}
            <text x={graphPad} y="8" fill="rgba(248,113,113,0.7)" fontSize="6" fontFamily="ui-monospace, monospace">
              +{delaySeries[delaySeries.length - 1]?.toFixed(1)}h projected
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 font-mono text-[7px] text-white/35">
        {hubs.map((hub) => (
          <div key={hub.code} className="inv-route-hub-meta">
            <span className="font-semibold text-[#0080ff]/80">{hub.code}</span>
            <span className="block">{hub.lat}</span>
            <span className="block">{hub.lon}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HorizontalStepRail({ status }: { status: ShipmentStatus }) {
  const activeIndex = statusStepIndex[status]

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-white/35">
        <span>Shipment pipeline</span>
        <span className="font-mono text-white/50">
          STEP {String(activeIndex + 1).padStart(2, '0')}/{String(TRACKING_STEPS.length).padStart(2, '0')}
        </span>
      </div>
      <div className="relative mt-3">
        <div className="absolute left-0 right-0 top-[13px] h-px inv-progress-track" />
        <div
          className="absolute left-0 top-[13px] h-px bg-gradient-to-r from-[#0080ff] to-[#ccff00] transition-all duration-700"
          style={{ width: `${(activeIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {TRACKING_STEPS.map((step, index) => {
            const done = index <= activeIndex
            const current = index === activeIndex

            return (
              <div key={step.key} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / TRACKING_STEPS.length}%` }}>
                <div
                  className={`relative z-[1] flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[9px] font-bold font-mono transition-all ${
                    current && status !== 'delivered'
                      ? 'border-[#ccff00] bg-[#ccff00]/20 text-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.35)]'
                      : done
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                        : 'border-white/10 text-[var(--inv-timeline-node-inactive)]'
                  }`}
                  style={!done && !current ? { background: 'var(--inv-timeline-node-bg)' } : undefined}
                >
                  {done ? <CheckCircle2 size={12} /> : step.code}
                  {current && status !== 'delivered' && (
                    <span className="absolute -inset-1 animate-ping rounded-full border border-[#ccff00]/40" />
                  )}
                </div>
                <p className={`max-w-[56px] text-center text-[8px] leading-tight ${done ? 'text-white/70' : 'text-white/25'}`}>
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TrackingTimeline({ status }: { status: ShipmentStatus }) {
  const activeIndex = statusStepIndex[status]

  return (
    <div className="relative mt-4 rounded-lg border border-white/[0.06] bg-black/30 p-3">
      <div className="absolute left-[21px] top-5 bottom-5 w-px bg-white/[0.08]" />
      <ul className="space-y-3">
        {TRACKING_STEPS.map((step, index) => {
          const done = index <= activeIndex
          const current = index === activeIndex

          return (
            <li key={step.key} className="relative flex gap-3">
              <div className="relative z-[1] mt-0.5 shrink-0">
                {done ? (
                  <CheckCircle2
                    size={18}
                    className={current && status !== 'delivered' ? 'text-[#ccff00]' : 'text-emerald-400'}
                  />
                ) : (
                  <Circle size={18} className="text-white/20" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[9px] text-white/30">{step.code}</span>
                  <p className={`text-xs font-medium ${done ? 'text-white' : 'text-white/35'}`}>{step.label}</p>
                  {current && status !== 'delivered' && (
                    <span className="inv-tracking-pulse-chip">Active scan</span>
                  )}
                </div>
                <p className="text-[10px] text-white/35">{step.location}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ShipmentRow({
  shipment,
  selected,
  onSelect,
}: {
  shipment: TrackableShipment
  selected: boolean
  onSelect: () => void
}) {
  const progress = ((statusStepIndex[shipment.status] + 1) / TRACKING_STEPS.length) * 100
  const stepIdx = statusStepIndex[shipment.status]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`inv-tracking-row ${selected ? 'inv-tracking-row-active' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <div className="rounded border border-white/10 bg-white px-1.5 py-1">
            <CarrierLogo carrier={shipment.carrier} className="h-5 w-14" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-mono text-[10px] text-[#ccff00]/80">{shipment.orderId}</p>
              <span className="font-mono text-[9px] text-white/25">· STEP {String(stepIdx + 1).padStart(2, '0')}</span>
            </div>
            <p className="truncate text-[10px] text-white/45">
              {shipment.qty}× {shipment.itemName}
            </p>
            <p className="mt-0.5 truncate font-mono text-[9px] tracking-wider text-white/30">{shipment.tracking}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded border px-2 py-0.5 text-[9px] font-semibold ${statusStyles[shipment.status]}`}>
          {statusLabel[shipment.status]}
        </span>
      </div>
      <div className="mt-2.5">
        <div className="mb-1 flex justify-between text-[8px] font-mono uppercase tracking-wider text-white/25">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="inv-tracking-progress">
          <div className="inv-tracking-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </button>
  )
}

export default function ShipmentTrackingWidget({
  shipments,
  variant = 'full',
  leftColumnFooter,
}: ShipmentTrackingWidgetProps) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const collapsible = variant === 'compact'
  const [expanded, setExpanded] = useState(false)

  const normalizedQuery = normalizeTracking(query)

  const filtered = useMemo(() => {
    if (!normalizedQuery) return shipments
    return shipments.filter(
      (s) =>
        normalizeTracking(s.tracking).includes(normalizedQuery) ||
        s.orderId.toLowerCase().includes(query.trim().toLowerCase()),
    )
  }, [shipments, normalizedQuery, query])

  const activeShipments = useMemo(
    () => shipments.filter((s) => s.status !== 'delivered'),
    [shipments],
  )

  const selected = useMemo(() => {
    if (selectedId) {
      return shipments.find((s) => s.id === selectedId) ?? filtered[0] ?? shipments[0]
    }
    return (
      filtered.find((s) => s.status === 'in_transit') ??
      filtered[0] ??
      shipments.find((s) => s.status === 'in_transit') ??
      shipments[0]
    )
  }, [filtered, selectedId, shipments])

  const list = variant === 'compact' ? activeShipments.slice(0, 3) : filtered

  const trackingHeader = (
    <div className={`relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${collapsible ? 'sm:items-center' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <div className="inv-tracking-hud-icon">
            <Radio size={14} className="text-[#ccff00]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight text-white">Package tracking</h3>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#0080ff]/80">Digital logistics HUD</p>
          </div>
          {variant === 'compact' && activeShipments.length > 0 && (
            <span className="inv-stat-chip text-[#ccff00]">
              {activeShipments.length} active
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-white/40">
          {!shipments.length
            ? 'No shipments yet. Create a label to start tracking.'
            : variant === 'compact'
              ? collapsible && !expanded
                ? `${activeShipments.length} active shipment${activeShipments.length === 1 ? '' : 's'} · expand to view telemetry`
                : 'Live shipment telemetry · simulator'
              : 'Track by order ID or tracking number'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {(!collapsible || expanded) && shipments.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0080ff]/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tracking # or order ID…"
              className="inv-input inv-input-search inv-tracking-search !mt-0 w-full font-mono"
            />
          </div>
        )}
        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="inv-tracking-collapse-btn"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse package tracking' : 'Expand package tracking'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
    </div>
  )

  const leftColumn = (
    <div className={variant === 'full' ? 'space-y-2 lg:col-span-2' : 'grid gap-2 sm:grid-cols-3'}>
      {list.map((shipment) => (
        <ShipmentRow
          key={shipment.id}
          shipment={shipment}
          selected={selected?.id === shipment.id}
          onSelect={() => setSelectedId(shipment.id)}
        />
      ))}
      {variant === 'full' && filtered.length === 0 && shipments.length > 0 && (
        <p className="text-xs text-white/35">No shipments match that tracking number.</p>
      )}
      {variant === 'full' && leftColumnFooter && (
        <div className="mt-4 space-y-4 border-t border-white/[0.08] pt-4">
          {leftColumnFooter}
        </div>
      )}
    </div>
  )

  if (!shipments.length) {
    return (
      <div className="inv-tracking-panel inv-tracking-digital">
        <div className="inv-tracking-scanline" aria-hidden />
        {trackingHeader}

        {(!collapsible || expanded) && (
          variant === 'full' && leftColumnFooter ? (
            <div className="relative mt-4 grid gap-4 lg:grid-cols-5">
              <div className="space-y-4 lg:col-span-2">{leftColumnFooter}</div>
              <div className="inv-tracking-detail flex items-center justify-center lg:col-span-3">
                <p className="text-center text-sm text-white/40">Shipment telemetry will appear here after your first label.</p>
              </div>
            </div>
          ) : (
            !collapsible && (
              <p className="relative mt-4 text-xs text-white/40">No shipments yet. Create a label to start tracking.</p>
            )
          )
        )}
      </div>
    )
  }

  return (
    <div className="inv-tracking-panel inv-tracking-digital">
      <div className="inv-tracking-scanline" aria-hidden />

      {trackingHeader}

      {(!collapsible || expanded) && (
        <div className={`relative mt-4 grid gap-4 ${variant === 'full' ? 'lg:grid-cols-5' : ''}`}>
          {leftColumn}

          {selected && (
            <div className={`inv-tracking-detail ${variant === 'full' ? 'lg:col-span-3' : 'mt-2'}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border border-white/[0.08] bg-white px-2 py-2">
                  <CarrierLogo carrier={selected.carrier} className="h-7 w-20" />
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold text-white">{selected.orderId}</p>
                  <p className="text-[11px] text-white/50">
                    {selected.qty}× {selected.itemName} · {selected.sku}
                  </p>
                  <DigitalTrackingId tracking={selected.tracking} />
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className={`inline-flex rounded border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyles[selected.status]}`}>
                  {statusLabel[selected.status]}
                </span>
                <p className="mt-1 font-mono text-[10px] text-white/35">{selected.createdAt}</p>
                <p className="text-[10px] font-medium text-[#ccff00]/90">{etaForStatus(selected.status)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: Package, label: 'Scans', value: String(scanCountForStatus(selected.status)), color: '#0080ff' },
                { icon: Zap, label: 'Miles', value: selected.status === 'delivered' ? '1,842' : selected.status === 'in_transit' ? '1,204' : '0', color: 'var(--inv-accent-lime)' },
                { icon: Truck, label: 'Hubs', value: selected.status === 'delivered' ? '3' : selected.status === 'in_transit' ? '2' : '1', color: '#66ccff' },
              ].map((stat) => (
                <div key={stat.label} className="inv-tracking-telemetry" style={{ borderColor: `${stat.color}33` }}>
                  <stat.icon size={11} style={{ color: stat.color }} />
                  <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-white/35">{stat.label}</p>
                  <p className="font-mono text-sm font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <RouteMap status={selected.status} orderId={selected.orderId} />

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="inv-tracking-node border-[#0080ff]/25 bg-[#0080ff]/[0.05]">
                <div className="flex items-center gap-1.5 text-[#0080ff]">
                  <Package size={12} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider">Origin</span>
                </div>
                <p className="mt-1 font-mono text-xs text-white">Newark, NJ 07102</p>
              </div>
              <div className="inv-tracking-node border-[#ccff00]/25 bg-[#ccff00]/[0.05]">
                <div className="flex items-center gap-1.5 text-[#ccff00]">
                  <Truck size={12} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider">Last scan</span>
                </div>
                <p className="mt-1 font-mono text-xs text-white">
                  {selected.status === 'delivered'
                    ? 'Austin, TX — Delivered'
                    : selected.status === 'in_transit'
                      ? 'Memphis, TN — In transit'
                      : 'Newark, NJ — Label created'}
                </p>
              </div>
              <div className="inv-tracking-node border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center gap-1.5 text-white/50">
                  <MapPin size={12} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider">Destination</span>
                </div>
                <p className="mt-1 font-mono text-xs text-white">Austin, TX 78701</p>
              </div>
            </div>

            {variant === 'full' && (
              <>
                <HorizontalStepRail status={selected.status} />
                <TrackingTimeline status={selected.status} />
              </>
            )}

            {variant === 'compact' && (
              <div className="mt-3">
                <HorizontalStepRail status={selected.status} />
              </div>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  )
}
