const confluenceFactors = [
  { label: 'HTF trend alignment', weight: 25, score: 92 },
  { label: 'Key level reaction', weight: 20, score: 88 },
  { label: 'Volume confirmation', weight: 15, score: 76 },
  { label: 'Momentum (RSI/MACD)', weight: 15, score: 90 },
  { label: 'Session timing', weight: 10, score: 68 },
  { label: 'Risk / reward setup', weight: 15, score: 95 },
]

const ratedTrades = [
  { symbol: 'ES', setup: 'Breakout', side: 'Long', grade: 'A+', score: 94 },
  { symbol: 'NQ', setup: 'Reversal', side: 'Short', grade: 'B+', score: 78 },
  { symbol: 'CL', setup: 'Trend', side: 'Long', grade: 'A-', score: 86 },
  { symbol: 'GC', setup: 'Range fade', side: 'Short', grade: 'C+', score: 67 },
]

const compositeScore = Math.round(
  confluenceFactors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0),
)

const compositeGrade = 'A'

const gradeStyles: Record<string, string> = {
  'A+': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
  A: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'A-': 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  'B+': 'bg-[#0080ff]/15 text-[#0080ff] border-[#0080ff]/30',
  B: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'B-': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'C+': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  C: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'C-': 'bg-red-500/15 text-red-400 border-red-500/30',
}

function scoreBarColor(score: number) {
  if (score >= 85) return 'from-emerald-500 to-[#ccff00]'
  if (score >= 70) return 'from-[#0080ff] to-cyan-400'
  return 'from-amber-500 to-orange-400'
}

export default function TradeStrykeScoreboardPreview() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[#0080ff]/20 bg-[#050608]">
      {/* Composite weighted score */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#080a0e] px-3 py-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">
            Weighted confluence score
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold leading-none text-white">{compositeScore}</span>
            <span className="text-xs text-white/35">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-bold ${gradeStyles[compositeGrade]}`}
          >
            {compositeGrade}
          </span>
          <p className="mt-1 text-[9px] text-white/30">Current setup grade</p>
        </div>
      </div>

      {/* Weighted confluence list */}
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">
            Confluence factors
          </p>
          <span className="text-[9px] text-white/30">Weight · Score</span>
        </div>
        <div className="space-y-1.5">
          {confluenceFactors.map((factor) => (
            <div key={factor.label} className="flex items-center gap-2">
              <span className="w-[44%] shrink-0 truncate text-[10px] text-white/60">{factor.label}</span>
              <span className="w-7 shrink-0 text-right text-[9px] font-medium text-[#0080ff]/80">
                {factor.weight}%
              </span>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor(factor.score)}`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-[10px] font-semibold text-white/75">
                {factor.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rated trades */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2">
        <div className="mb-1.5 flex shrink-0 items-center justify-between">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">
            Rated trades
          </p>
          <div className="flex gap-0.5">
            {(['A+', 'B', 'C-'] as const).map((g) => (
              <span
                key={g}
                className={`rounded px-1 py-0.5 text-[8px] font-semibold border ${gradeStyles[g]}`}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="grid grid-cols-[0.55fr_0.9fr_0.5fr_0.45fr_0.4fr] gap-1 border-b border-white/[0.06] pb-1 text-[8px] font-semibold uppercase tracking-wider text-white/30">
            <span>Sym</span>
            <span>Setup</span>
            <span>Side</span>
            <span className="text-center">Grade</span>
            <span className="text-right">Pts</span>
          </div>
          <div className="overflow-y-auto">
            {ratedTrades.map((trade) => (
              <div
                key={`${trade.symbol}-${trade.setup}`}
                className="grid grid-cols-[0.55fr_0.9fr_0.5fr_0.45fr_0.4fr] gap-1 border-b border-white/[0.04] py-1.5 text-[10px] last:border-0"
              >
                <span className="font-medium text-white/85">{trade.symbol}</span>
                <span className="truncate text-white/50">{trade.setup}</span>
                <span className={trade.side === 'Long' ? 'text-emerald-400/80' : 'text-red-400/80'}>
                  {trade.side}
                </span>
                <span className="flex justify-center">
                  <span
                    className={`rounded border px-1 py-0.5 text-[9px] font-bold leading-none ${gradeStyles[trade.grade]}`}
                  >
                    {trade.grade}
                  </span>
                </span>
                <span className="text-right font-semibold text-white/70">{trade.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
