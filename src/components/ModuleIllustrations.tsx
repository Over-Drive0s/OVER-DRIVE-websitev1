export function SystemsIllustration({ active = false }: { active?: boolean }) {
  const blue = active ? '#0080ff' : '#0080ff'
  const lime = active ? '#ccff00' : '#a8d900'
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sys-glow" x1="160" y1="140" x2="160" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={blue} stopOpacity={active ? 0.45 : 0.25} />
          <stop offset="1" stopColor={lime} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sys-face" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={blue} stopOpacity="0.6" />
          <stop offset="1" stopColor={lime} stopOpacity="0.2" />
        </linearGradient>
        <filter id="sys-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <ellipse cx="160" cy="120" rx="80" ry="20" fill="url(#sys-glow)" filter="url(#sys-blur)" />
      {/* isometric stack */}
      <g transform="translate(160,88)">
        <path d="M-44 8 L0 -16 L44 8 L0 32 Z" fill="url(#sys-face)" stroke={blue} strokeOpacity="0.6" strokeWidth="1" />
        <path d="M-44 8 L0 32 L0 56 L-44 32 Z" fill="#003366" fillOpacity="0.4" stroke={blue} strokeOpacity="0.3" strokeWidth="1" />
        <path d="M44 8 L0 32 L0 56 L44 32 Z" fill={blue} fillOpacity="0.2" stroke={blue} strokeOpacity="0.3" strokeWidth="1" />
        <path d="M-44 -16 L0 -40 L44 -16 L0 8 Z" fill="url(#sys-face)" stroke={lime} strokeOpacity={active ? 0.8 : 0.5} strokeWidth="1" />
        <path d="M-44 -16 L0 8 L0 32 L-44 8 Z" fill="#003366" fillOpacity="0.35" stroke={blue} strokeOpacity="0.3" strokeWidth="1" />
        <path d="M44 -16 L0 8 L0 32 L44 8 Z" fill={blue} fillOpacity="0.15" stroke={blue} strokeOpacity="0.3" strokeWidth="1" />
        <path d="M-44 -40 L0 -64 L44 -40 L0 -16 Z" fill="url(#sys-face)" stroke={lime} strokeOpacity={active ? 0.9 : 0.6} strokeWidth="1" />
        <path d="M-44 -40 L0 -16 L0 8 L-44 -16 Z" fill="#003366" fillOpacity="0.3" stroke={blue} strokeOpacity="0.25" strokeWidth="1" />
        <path d="M44 -40 L0 -16 L0 8 L44 -16 Z" fill={blue} fillOpacity="0.12" stroke={blue} strokeOpacity="0.25" strokeWidth="1" />
      </g>
    </svg>
  )
}

export function DashboardIllustration({ active = false }: { active?: boolean }) {
  const stroke = active ? '#ccff00' : '#0080ff'
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dash-bg" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#131820" />
          <stop offset="1" stopColor="#0a0c10" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="130" rx="90" ry="18" fill="#0080ff" fillOpacity={active ? 0.18 : 0.1} />
      {/* back screen */}
      <rect x="72" y="36" width="100" height="72" rx="6" fill="url(#dash-bg)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="80" y="44" width="40" height="4" rx="1" fill="rgba(255,255,255,0.15)" />
      <polyline points="80,88 95,78 110,82 125,68 140,72 155,58" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* middle screen */}
      <rect x="108" y="28" width="104" height="76" rx="6" fill="url(#dash-bg)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect x="116" y="36" width="36" height="4" rx="1" fill={active ? '#ccff00' : '#0080ff'} fillOpacity="0.5" />
      <rect x="116" y="48" width="24" height="16" rx="2" fill="rgba(79,140,255,0.1)" stroke="rgba(79,140,255,0.2)" strokeWidth="0.5" />
      <rect x="144" y="48" width="24" height="16" rx="2" fill="rgba(79,140,255,0.1)" stroke="rgba(79,140,255,0.2)" strokeWidth="0.5" />
      <rect x="172" y="48" width="24" height="16" rx="2" fill="rgba(79,140,255,0.1)" stroke="rgba(79,140,255,0.2)" strokeWidth="0.5" />
      <polyline points="116,88 130,76 148,80 164,64 180,68 196,52" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* front screen */}
      <rect x="148" y="44" width="108" height="80" rx="6" fill="url(#dash-bg)" stroke={active ? '#ccff00' : '#0080ff'} strokeOpacity="0.35" strokeWidth="1" />
      <rect x="156" y="52" width="44" height="4" rx="1" fill="rgba(255,255,255,0.2)" />
      <rect x="156" y="64" width="32" height="20" rx="2" fill="rgba(79,140,255,0.15)" stroke="rgba(79,140,255,0.3)" strokeWidth="0.5" />
      <rect x="192" y="64" width="32" height="20" rx="2" fill="rgba(79,140,255,0.15)" stroke="rgba(79,140,255,0.3)" strokeWidth="0.5" />
      <rect x="228" y="64" width="20" height="20" rx="2" fill="rgba(79,140,255,0.15)" stroke="rgba(79,140,255,0.3)" strokeWidth="0.5" />
      <polyline points="156,108 172,94 188,98 204,82 220,86 240,68" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function AutomationIllustration({ active = false }: { active?: boolean }) {
  const blue = '#0080ff'
  const lime = active ? '#ccff00' : '#a8d900'
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="auto-glow" cx="160" cy="80" r="60" gradientUnits="userSpaceOnUse">
          <stop stopColor={blue} stopOpacity={active ? 0.3 : 0.15} />
          <stop offset="1" stopColor={lime} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill="url(#auto-glow)" />
      {/* connections */}
      {[
        [160, 80, 160, 30],
        [160, 80, 90, 55],
        [160, 80, 230, 55],
        [160, 80, 110, 125],
        [160, 80, 210, 125],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={active ? lime : blue} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="4 3" />
      ))}
      {/* nodes */}
      {[
        [160, 30], [90, 55], [230, 55], [110, 125], [210, 125],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="14" fill="#0c1018" stroke={blue} strokeOpacity="0.4" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="4" fill={lime} fillOpacity="0.8" />
        </g>
      ))}
      {/* center hub */}
      <circle cx="160" cy="80" r="28" fill="#0c1018" stroke={lime} strokeWidth="1.5" strokeOpacity={active ? 0.8 : 0.5} />
      <circle cx="160" cy="80" r="20" fill={blue} fillOpacity={active ? 0.2 : 0.1} />
      <path d="M160 68 L160 76 M160 84 L160 92 M152 80 L144 80 M168 80 L176 80" stroke={lime} strokeWidth="2" strokeLinecap="round" />
      <path d="M154 74 L160 68 L166 74 M166 86 L160 92 L154 86" stroke={blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IntegrationIllustration({ active = false }: { active?: boolean }) {
  const blue = '#0080ff'
  const lime = active ? '#ccff00' : '#a8d900'
  const apps = [
    { cx: 160, cy: 32, label: 'SF' },
    { cx: 88, cy: 72, label: 'SL' },
    { cx: 232, cy: 72, label: 'HS' },
    { cx: 100, cy: 128, label: 'QB' },
    { cx: 220, cy: 128, label: 'API' },
  ]

  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="int-glow" cx="160" cy="80" r="70" gradientUnits="userSpaceOnUse">
          <stop stopColor={blue} stopOpacity={active ? 0.2 : 0.12} />
          <stop offset="1" stopColor={lime} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill="url(#int-glow)" />
      {apps.map(({ cx, cy }) => (
        <line key={`l-${cx}`} x1="160" y1="80" x2={cx} y2={cy} stroke={active ? lime : blue} strokeOpacity="0.3" strokeWidth="1" />
      ))}
      {apps.map(({ cx, cy, label }) => (
        <g key={label}>
          <rect x={cx - 18} y={cy - 14} width="36" height="28" rx="6" fill="#0c1018" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="600" fontFamily="Inter,sans-serif">{label}</text>
        </g>
      ))}
      <circle cx="160" cy="80" r="26" fill="#0c1018" stroke={lime} strokeWidth="1.5" strokeOpacity={active ? 0.7 : 0.45} />
      <circle cx="160" cy="80" r="18" fill={blue} fillOpacity={active ? 0.18 : 0.1} />
      <path d="M148 80 C148 74 154 70 160 70 C166 70 172 74 172 80 C172 86 166 90 160 90 C154 90 148 86 148 80" stroke={blue} strokeWidth="1.5" fill="none" />
      <path d="M152 80 L148 80 M168 80 L172 80" stroke={lime} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export type IllustrationType = 'systems' | 'dashboard' | 'automation' | 'integration'

const map = {
  systems: SystemsIllustration,
  dashboard: DashboardIllustration,
  automation: AutomationIllustration,
  integration: IntegrationIllustration,
}

export function ModuleIllustration({ type, active = false }: { type: IllustrationType; active?: boolean }) {
  const Component = map[type]
  return <Component active={active} />
}
