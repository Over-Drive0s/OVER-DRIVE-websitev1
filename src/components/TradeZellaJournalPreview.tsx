const metrics = [
  { label: 'Net P&L', value: '+$4,280', sub: 'This month', positive: true },
  { label: 'Win rate', value: '68.5%', sub: 'Last 30 trades' },
  { label: 'OD Score', value: '82', sub: 'Discipline index', accent: true },
]

const calendarDays = [
  { day: 'M', state: 'win' as const },
  { day: 'T', state: 'loss' as const },
  { day: 'W', state: 'win' as const },
  { day: 'T', state: 'win' as const },
  { day: 'F', state: 'be' as const },
  { day: 'S', state: 'win' as const },
  { day: 'S', state: 'loss' as const },
]

const trades = [
  { symbol: 'ES', setup: 'Breakout', pnl: '+$420', r: '2.4R', win: true },
  { symbol: 'NQ', setup: 'Reversal', pnl: '-$180', r: '-1R', win: false },
  { symbol: 'CL', setup: 'Trend', pnl: '+$310', r: '1.6R', win: true },
]

const dayStyles = {
  win: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/30',
  loss: 'bg-red-500/20 text-red-400 border-red-500/30',
  be: 'bg-white/[0.06] text-white/40 border-white/[0.08]',
}

export default function TradeZellaJournalPreview() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-violet-500/15 bg-[#0c0a12]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#110e18] px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20 text-[10px] font-bold text-violet-300">
            OD
          </div>
          <div>
            <p className="text-xs font-semibold text-white/90">Trading Journal</p>
            <p className="text-[10px] text-white/35">May 2026 · All accounts</p>
          </div>
        </div>
        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] font-medium text-violet-300">
          Live feed
        </span>
      </div>

      {/* KPI row */}
      <div className="grid shrink-0 grid-cols-3 gap-1.5 border-b border-white/[0.06] p-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-md border px-2 py-1.5 ${
              m.accent
                ? 'border-violet-500/25 bg-violet-500/[0.08]'
                : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <p className="text-[9px] text-white/40">{m.label}</p>
            <p
              className={`mt-0.5 text-sm font-semibold leading-none ${
                m.positive ? 'text-emerald-400' : m.accent ? 'text-violet-300' : 'text-white'
              }`}
            >
              {m.value}
            </p>
            <p className="mt-0.5 text-[8px] text-white/30">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Performance calendar strip */}
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-2">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/35">
          Daily performance
        </p>
        <div className="flex gap-1">
          {calendarDays.map((d, i) => (
            <div key={`${d.day}-${i}`} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[8px] text-white/30">{d.day}</span>
              <div className={`h-5 w-full rounded border ${dayStyles[d.state]}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Trade log table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2">
        <div className="mb-1.5 flex shrink-0 items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            Recent trades
          </span>
          <span className="text-[10px] text-violet-400/80">50+ reports →</span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="grid grid-cols-[0.7fr_1fr_0.9fr_0.6fr] gap-1 border-b border-white/[0.06] pb-1 text-[8px] font-semibold uppercase tracking-wider text-white/30">
            <span>Symbol</span>
            <span>Setup</span>
            <span className="text-right">P&L</span>
            <span className="text-right">R</span>
          </div>
          <div className="overflow-y-auto">
            {trades.map((t) => (
              <div
                key={`${t.symbol}-${t.setup}`}
                className="grid grid-cols-[0.7fr_1fr_0.9fr_0.6fr] gap-1 border-b border-white/[0.04] py-1.5 text-xs last:border-0"
              >
                <span className="font-medium text-white/85">{t.symbol}</span>
                <span>
                  <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[9px] text-violet-300">
                    {t.setup}
                  </span>
                </span>
                <span className={`text-right font-semibold ${t.win ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.pnl}
                </span>
                <span className={`text-right text-[10px] ${t.win ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                  {t.r}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
