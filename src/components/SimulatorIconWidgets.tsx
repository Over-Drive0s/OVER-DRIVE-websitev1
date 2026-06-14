import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export type SimulatorWidgetId =
  | 'dashboard-systems'
  | 'tracking-metrics'
  | 'trading-systems'
  | 'inventory-solutions'
  | 'dealer-dms'
  | 'admin-panels'
  | 'api-manager'

export interface SimulatorWidgetMeta {
  id: SimulatorWidgetId
  name: string
  type: string
  accent: 'blue' | 'lime'
  externalUrl?: string
  status: 'live' | 'soon'
}

export const simulatorWidgets: SimulatorWidgetMeta[] = [
  {
    id: 'dashboard-systems',
    name: 'Dashboard Systems',
    type: 'KPI views & operational dashboards',
    accent: 'blue',
    externalUrl: '/dashboards',
    status: 'live',
  },
  {
    id: 'tracking-metrics',
    name: 'Tracking Metrics',
    type: 'Performance monitoring & scoreboards',
    accent: 'lime',
    externalUrl: '/metrics',
    status: 'live',
  },
  {
    id: 'trading-systems',
    name: 'Trading Systems',
    type: 'Live charts & signal terminals',
    accent: 'blue',
    externalUrl: '/tradingsystems',
    status: 'live',
  },
  {
    id: 'inventory-solutions',
    name: 'Inventory Solutions',
    type: 'Stock, catalog & asset tracking',
    accent: 'lime',
    externalUrl: '/inventory',
    status: 'live',
  },
  {
    id: 'dealer-dms',
    name: 'Dealer DMS',
    type: 'Lot inventory, VIN & syndication',
    accent: 'blue',
    externalUrl: '/dealers',
    status: 'live',
  },
  {
    id: 'admin-panels',
    name: 'Admin Panels',
    type: 'Back-office controls & management',
    accent: 'blue',
    externalUrl: 'https://brooklynas.vercel.app',
    status: 'live',
  },
  {
    id: 'api-manager',
    name: 'API Manager',
    type: 'Integrations, endpoints & sync',
    accent: 'lime',
    status: 'soon',
  },
]

function accentColors(accent: 'blue' | 'lime') {
  return accent === 'lime'
    ? {
        primary: '#ccff00',
        glow: 'rgba(204,255,0,0.55)',
        soft: 'rgba(204,255,0,0.18)',
        blur: 'bg-[#ccff00]/25',
      }
    : {
        primary: '#0080ff',
        glow: 'rgba(0,128,255,0.6)',
        soft: 'rgba(0,128,255,0.2)',
        blur: 'bg-[#0080ff]/30',
      }
}

function SimulatorGlyph({ id, accent }: { id: SimulatorWidgetId; accent: 'blue' | 'lime' }) {
  const { primary, soft } = accentColors(accent)

  const glyphs: Record<SimulatorWidgetId, ReactNode> = {
    'dashboard-systems': (
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
        <rect x="6" y="6" width="15" height="15" rx="3" fill={soft} stroke={primary} strokeWidth="1.5" />
        <rect x="27" y="6" width="15" height="15" rx="3" fill={primary} fillOpacity="0.85" />
        <rect x="6" y="27" width="15" height="15" rx="3" fill={primary} fillOpacity="0.45" />
        <rect x="27" y="27" width="15" height="15" rx="3" fill={soft} stroke={primary} strokeWidth="1.5" />
        <path d="M30 14h9M30 17h6" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M9 33l4 4 7-7" stroke={primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'tracking-metrics': (
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
        <path
          d="M9 30a15 15 0 0 1 30 0"
          stroke={soft}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M9 30a15 15 0 0 1 30 0"
          stroke={primary}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="52 95"
        />
        <path
          d="M13 30a11 11 0 0 1 22 0"
          stroke={soft}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M13 30a11 11 0 0 1 22 0"
          stroke={primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="38 70"
          opacity="0.75"
        />
        <line x1="24" y1="30" x2="31" y2="19" stroke={primary} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="24" cy="30" r="3.5" fill={primary} />
        <circle cx="24" cy="30" r="1.5" fill="#06080c" />
        <circle cx="31" cy="19" r="2.5" fill={primary} fillOpacity="0.9" />
        <path
          d="M29.5 19.5l1.5-2.5 2.5 1.5"
          stroke="white"
          strokeOpacity="0.85"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="14" y="36" width="20" height="6" rx="3" fill={soft} stroke={primary} strokeWidth="1.2" />
        <rect x="16" y="38" width="5" height="2" rx="1" fill={primary} fillOpacity="0.45" />
        <rect x="22.5" y="38" width="7" height="2" rx="1" fill={primary} fillOpacity="0.75" />
        <rect x="31" y="38" width="2" height="2" rx="1" fill={primary} />
      </svg>
    ),
    'trading-systems': (
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
        <rect x="6" y="9" width="36" height="30" rx="4" fill={soft} stroke={primary} strokeWidth="1.5" />
        <line x1="6" y1="15" x2="42" y2="15" stroke={primary} strokeOpacity="0.22" strokeWidth="1" />
        <circle cx="10.5" cy="12" r="1.2" fill={primary} fillOpacity="0.55" />
        <circle cx="14.5" cy="12" r="1.2" fill={primary} fillOpacity="0.35" />
        <circle cx="18.5" cy="12" r="1.2" fill={primary} fillOpacity="0.35" />
        <line x1="6" y1="26" x2="42" y2="26" stroke={primary} strokeOpacity="0.1" strokeWidth="1" />
        <line x1="6" y1="32" x2="42" y2="32" stroke={primary} strokeOpacity="0.1" strokeWidth="1" />
        <line x1="13" y1="30" x2="13" y2="35" stroke={primary} strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="11" y="31" width="4" height="3" rx="0.5" fill={primary} fillOpacity="0.45" />
        <line x1="21" y1="23" x2="21" y2="37" stroke={primary} strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="19" y="25" width="4" height="9" rx="0.5" fill={primary} fillOpacity="0.85" />
        <line x1="29" y1="27" x2="29" y2="37" stroke={primary} strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="27" y="29" width="4" height="5" rx="0.5" stroke={primary} strokeWidth="1.2" fill={soft} />
        <line x1="37" y1="19" x2="37" y2="35" stroke={primary} strokeWidth="1.2" strokeLinecap="round" />
        <rect x="35" y="21" width="4" height="11" rx="0.5" fill={primary} />
        <path
          d="M11 33l7-5 7 2 9-11"
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="36" cy="18" r="3" fill={primary} />
        <path
          d="M36 20.5V15.5M33.5 18L36 15.5L38.5 18"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="14" y="40" width="20" height="3" rx="1.5" fill={primary} fillOpacity="0.35" />
      </svg>
    ),
    'inventory-solutions': (
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
        <path
          d="M8 18l16-8 16 8v18l-16 8-16-8V18z"
          fill={soft}
          stroke={primary}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M24 10v18M8 18l16 8 16-8" stroke={primary} strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="18" y="24" width="12" height="8" rx="1.5" fill={primary} fillOpacity="0.85" />
        <path d="M20 27h8M20 29.5h5" stroke="black" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
    'dealer-dms': (
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
        <ellipse cx="24" cy="37" rx="15" ry="1.8" fill={primary} fillOpacity="0.14" />
        <path
          d="M6 30.5c0-1.4 1-2.5 2.3-2.7l4-1.1 4.2-8.3c.5-1 1.5-1.6 2.6-1.6h11.8c1.1 0 2.1.6 2.6 1.6l4.2 8.3 4 1.1c1.3.2 2.3 1.3 2.3 2.7V33H6v-2.5z"
          fill={soft}
          stroke={primary}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15 20.5h18l-3.2-6.2H18.2L15 20.5z"
          fill={primary}
          fillOpacity="0.2"
          stroke={primary}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M15 20.5h7.2l1.2 3.8H15V20.5z"
          fill={primary}
          fillOpacity="0.55"
        />
        <path
          d="M25.8 20.5H33l-1.2 3.8H24.6L25.8 20.5z"
          fill={primary}
          fillOpacity="0.4"
        />
        <path d="M24.2 20.2v4.1" stroke={primary} strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />
        <circle cx="8.5" cy="29.5" r="1.3" fill={primary} fillOpacity="0.95" />
        <path d="M7 29.5h3" stroke={primary} strokeWidth="1.6" strokeLinecap="round" />
        <rect x="37" y="28.2" width="3" height="2.2" rx="0.6" fill={primary} fillOpacity="0.9" />
        <circle cx="14" cy="32.5" r="4.2" fill="#06080c" stroke={primary} strokeWidth="1.8" />
        <circle cx="34" cy="32.5" r="4.2" fill="#06080c" stroke={primary} strokeWidth="1.8" />
        <circle cx="14" cy="32.5" r="1.7" fill={primary} fillOpacity="0.75" />
        <circle cx="34" cy="32.5" r="1.7" fill={primary} fillOpacity="0.75" />
        <path
          d="M18 33h12"
          stroke={primary}
          strokeOpacity="0.2"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    ),
    'admin-panels': (
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
        <path
          d="M24 6l14 5v11c0 9-6 16-14 20-8-4-14-11-14-20V11l14-5z"
          fill={soft}
          stroke={primary}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M17 24l5 5 9-10" stroke={primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'api-manager': (
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="7" fill={primary} fillOpacity="0.9" />
        <circle cx="24" cy="24" r="11" stroke={primary} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 3" />
        {[
          { x1: 24, y1: 13, x2: 24, y2: 6 },
          { x1: 35, y1: 24, x2: 42, y2: 24 },
          { x1: 24, y1: 35, x2: 24, y2: 42 },
          { x1: 13, y1: 24, x2: 6, y2: 24 },
        ].map((line, i) => (
          <g key={i}>
            <line {...line} stroke={primary} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx={line.x2} cy={line.y2} r="2.5" fill={primary} fillOpacity="0.65" />
          </g>
        ))}
      </svg>
    ),
  }

  return glyphs[id]
}

function StreamDeckSimulatorKey({
  meta,
  compact = false,
  linkState,
}: {
  meta: SimulatorWidgetMeta
  compact?: boolean
  linkState?: Record<string, boolean>
}) {
  const isLime = meta.accent === 'lime'
  const isLive = meta.status === 'live'
  const colors = accentColors(meta.accent)

  const keyClassName = [
    'stream-deck-key group relative mx-auto flex aspect-square w-full flex-col overflow-hidden rounded-[14px] outline-none',
    compact
      ? 'max-w-[118px] sm:max-w-[128px] lg:max-w-[136px]'
      : 'max-w-[128px] sm:max-w-[140px] lg:max-w-[156px]',
    'focus-visible:ring-2 focus-visible:ring-[#0080ff]/60',
    isLime ? 'stream-deck-key-lime' : '',
    !isLive ? 'stream-deck-key-soon cursor-default' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const keyContent = (
    <>
      <div className="scanlines pointer-events-none absolute inset-0 z-[1] opacity-[0.35]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative z-[3] flex flex-1 items-center justify-center px-3 py-2">
        <div
          className={`pointer-events-none absolute h-[72%] w-[72%] rounded-full blur-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-100 ${colors.blur}`}
        />
        <div
          className="relative h-[58%] w-[58%] transition-transform duration-300 group-hover:scale-[1.08] group-active:scale-[0.96]"
          style={{ filter: `drop-shadow(0 0 10px ${colors.glow})` }}
        >
          <SimulatorGlyph id={meta.id} accent={meta.accent} />
        </div>
      </div>

      <div className="relative z-[4] shrink-0 border-t border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-black/60 px-2 py-1.5">
        <p className="truncate text-center text-[8px] font-bold uppercase leading-tight tracking-[0.08em] text-white/90 sm:text-[9px]">
          {meta.name}
        </p>
      </div>

      <span
        className={`pointer-events-none absolute right-2 top-2 z-[5] h-1.5 w-1.5 rounded-full transition-all duration-300 ${
          isLive
            ? isLime
              ? 'bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.9)] group-hover:animate-pulse-brand'
              : 'bg-[#0080ff] shadow-[0_0_8px_rgba(0,128,255,0.9)] group-hover:animate-pulse-brand'
            : 'bg-white/20'
        }`}
      />
    </>
  )

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      {meta.externalUrl?.startsWith('/') ? (
        <Link
          to={meta.externalUrl}
          state={linkState}
          aria-label={`${meta.name} — ${meta.type}`}
          className={keyClassName}
        >
          {keyContent}
        </Link>
      ) : meta.externalUrl ? (
        <a
          href={meta.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${meta.name} — ${meta.type} (opens in new tab)`}
          className={keyClassName}
        >
          {keyContent}
        </a>
      ) : (
        <div aria-disabled className={keyClassName}>
          {keyContent}
        </div>
      )}

      <p
        className={`text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px] ${
          compact ? 'mt-3 sm:mt-3.5' : 'mt-5 sm:mt-6 lg:mt-7'
        } ${
          isLive
            ? isLime
              ? 'text-[#ccff00]/80'
              : 'text-[#0080ff]/80'
            : 'text-white/30'
        }`}
      >
        {isLive ? 'Live' : 'Soon'}
      </p>
    </div>
  )
}

export function SimulatorWidgetCard({
  meta,
  compact = false,
  linkState,
}: {
  meta: SimulatorWidgetMeta
  compact?: boolean
  linkState?: Record<string, boolean>
}) {
  return <StreamDeckSimulatorKey meta={meta} compact={compact} linkState={linkState} />
}
