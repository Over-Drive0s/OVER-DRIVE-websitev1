import { useEffect, useMemo, useRef, useState } from 'react'

type CandleSignal = 'entry-long' | 'exit-long' | 'entry-short' | 'exit-short'

interface Candle {
  o: number
  h: number
  l: number
  c: number
  signal?: CandleSignal
}

const CANDLE_SEQUENCE: Candle[] = [
  { o: 62, h: 64, l: 60, c: 63 },
  { o: 63, h: 65, l: 62, c: 64 },
  { o: 64, h: 66, l: 63, c: 65 },
  { o: 65, h: 67, l: 64, c: 66, signal: 'entry-long' },
  { o: 66, h: 69, l: 65, c: 68 },
  { o: 68, h: 70, l: 67, c: 69 },
  { o: 69, h: 72, l: 68, c: 71 },
  { o: 71, h: 73, l: 69, c: 70, signal: 'exit-long' },
  { o: 70, h: 71, l: 67, c: 68 },
  { o: 68, h: 69, l: 65, c: 66, signal: 'entry-short' },
  { o: 66, h: 67, l: 63, c: 64 },
  { o: 64, h: 65, l: 61, c: 62 },
  { o: 62, h: 63, l: 59, c: 60, signal: 'exit-short' },
  { o: 60, h: 62, l: 58, c: 61 },
  { o: 61, h: 64, l: 60, c: 63 },
  { o: 63, h: 66, l: 62, c: 65 },
]

const VISIBLE = 10
const TICK_MS = 320
const BASE_PNL = 842

function isBull(c: Candle) {
  return c.c >= c.o
}

function CandleSvg({
  candle,
  x,
  yScale,
  bodyW,
}: {
  candle: Candle
  x: number
  yScale: (v: number) => number
  bodyW: number
}) {
  const bull = isBull(candle)
  const color = bull ? '#26a69a' : '#ef5350'
  const top = yScale(Math.max(candle.o, candle.c))
  const bottom = yScale(Math.min(candle.o, candle.c))
  const bodyH = Math.max(bottom - top, 1.2)

  return (
    <g>
      <line
        x1={x}
        y1={yScale(candle.h)}
        x2={x}
        y2={yScale(candle.l)}
        stroke={color}
        strokeWidth="1"
      />
      <rect x={x - bodyW / 2} y={top} width={bodyW} height={bodyH} fill={color} rx="0.5" />
      {candle.signal === 'entry-long' && (
        <polygon
          points={`${x},${yScale(candle.l) + 10} ${x - 4},${yScale(candle.l) + 16} ${x + 4},${yScale(candle.l) + 16}`}
          fill="#26a69a"
        />
      )}
      {candle.signal === 'exit-long' && (
        <g>
          <circle cx={x} cy={yScale(candle.h) - 8} r="3" fill="#fbbf24" />
          <text x={x + 5} y={yScale(candle.h) - 6} fill="#fbbf24" fontSize="6" fontWeight="600">
            TP
          </text>
        </g>
      )}
      {candle.signal === 'entry-short' && (
        <polygon
          points={`${x},${yScale(candle.h) - 10} ${x - 4},${yScale(candle.h) - 16} ${x + 4},${yScale(candle.h) - 16}`}
          fill="#ef5350"
        />
      )}
      {candle.signal === 'exit-short' && (
        <g>
          <circle cx={x} cy={yScale(candle.l) + 8} r="3" fill="#fbbf24" />
          <text x={x + 5} y={yScale(candle.l) + 10} fill="#fbbf24" fontSize="6" fontWeight="600">
            TP
          </text>
        </g>
      )}
    </g>
  )
}

function RadarOverlay({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Phosphor tint */}
      <div className="absolute inset-0 bg-emerald-500/[0.03]" />

      {/* Crosshairs */}
      <div className="absolute inset-0">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-emerald-400/20" />
        <div className="absolute bottom-0 top-0 left-1/2 w-px bg-emerald-400/20" />
      </div>

      {/* Range rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[88, 64, 40].map((size, i) => (
          <div
            key={size}
            className="bot-radar-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/25"
            style={{
              width: size,
              height: size,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Rotating sweep */}
      <div className="absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2">
        <div className="bot-radar-sweep h-full w-full rounded-full" />
      </div>

      {/* Target blips */}
      <div
        className="bot-radar-blip absolute h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]"
        style={{ top: '38%', left: '62%', animationDelay: '0.2s' }}
      />
      <div
        className="bot-radar-blip absolute h-1 w-1 rounded-full bg-emerald-300/80 shadow-[0_0_4px_rgba(52,211,153,0.7)]"
        style={{ top: '58%', left: '44%', animationDelay: '0.7s' }}
      />
      <div
        className="bot-radar-blip absolute h-1 w-1 rounded-full bg-emerald-300/70"
        style={{ top: '28%', left: '36%', animationDelay: '1.1s' }}
      />

      {/* HUD label */}
      <div className="absolute left-2 top-2 font-mono text-[8px] uppercase tracking-widest text-emerald-400/50">
        Radar · scan
      </div>
    </div>
  )
}

function computePnlDelta(candle: Candle, position: 'flat' | 'long' | 'short'): number {
  if (candle.signal === 'exit-long') return 186
  if (candle.signal === 'exit-short') return 142
  if (candle.signal === 'entry-long' || candle.signal === 'entry-short') return 0

  const move = Math.abs(candle.c - candle.o)
  const bull = isBull(candle)

  if (position === 'long') return bull ? 8 + move * 2 : -(5 + move)
  if (position === 'short') return bull ? -(5 + move) : 8 + move * 2

  return bull ? 4 + move : -(3 + move * 0.6)
}

export default function BotTradingChartPreview() {
  const [index, setIndex] = useState(VISIBLE)
  const [flash, setFlash] = useState<string | null>(null)
  const [position, setPosition] = useState<'flat' | 'long' | 'short'>('flat')
  const [sessionPnl, setSessionPnl] = useState(BASE_PNL)
  const [pnlTick, setPnlTick] = useState<'up' | 'down' | null>(null)
  const positionRef = useRef<'flat' | 'long' | 'short'>('flat')

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1
        const seqIdx = next % CANDLE_SEQUENCE.length
        const candle = CANDLE_SEQUENCE[seqIdx]

        let pos = positionRef.current
        if (candle.signal === 'entry-long') {
          pos = 'long'
          setFlash('Long opened · ES @ 5248')
        } else if (candle.signal === 'exit-long') {
          pos = 'flat'
          setFlash('Long closed · +$186')
        } else if (candle.signal === 'entry-short') {
          pos = 'short'
          setFlash('Short opened · ES @ 5252')
        } else if (candle.signal === 'exit-short') {
          pos = 'flat'
          setFlash('Short closed · +$142')
        }

        positionRef.current = pos
        setPosition(pos)

        const delta = computePnlDelta(candle, pos)
        if (delta !== 0) {
          setSessionPnl((pnl) => Math.max(380, pnl + Math.round(delta)))
          setPnlTick(delta > 0 ? 'up' : 'down')
        }

        return next
      })
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!pnlTick) return
    const t = setTimeout(() => setPnlTick(null), 350)
    return () => clearTimeout(t)
  }, [pnlTick, sessionPnl])

  const visible = useMemo(() => {
    const candles: Candle[] = []
    for (let i = VISIBLE - 1; i >= 0; i--) {
      const seqIdx = ((index - i) % CANDLE_SEQUENCE.length + CANDLE_SEQUENCE.length) % CANDLE_SEQUENCE.length
      candles.push(CANDLE_SEQUENCE[seqIdx])
    }
    return candles
  }, [index])

  const { min, max } = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const c of visible) {
      lo = Math.min(lo, c.l)
      hi = Math.max(hi, c.h)
    }
    const pad = (hi - lo) * 0.15 || 2
    return { min: lo - pad, max: hi + pad }
  }, [visible])

  const chartW = 280
  const chartH = 100
  const padX = 8
  const padY = 6
  const plotW = chartW - padX - 28
  const plotH = chartH - padY * 2

  const yScale = (v: number) => padY + ((max - v) / (max - min)) * plotH
  const xStep = plotW / VISIBLE
  const bodyW = Math.min(xStep * 0.55, 10)

  const entryLineY =
    position === 'long' ? yScale(66) : position === 'short' ? yScale(66) : null

  const pnlPositive = sessionPnl >= 0
  const pnlDisplay = `${pnlPositive ? '+' : '-'}$${Math.abs(sessionPnl).toLocaleString()}`

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-[#0d1117]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#131722] px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-semibold text-white/90">ES1!</span>
          <span className="text-[10px] text-white/35">·</span>
          <span className="text-[10px] text-cyan-400/90">1m</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[9px] text-white/30 sm:inline">TradingView</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
              position === 'long'
                ? 'bg-[#26a69a]/20 text-[#26a69a]'
                : position === 'short'
                  ? 'bg-[#ef5350]/20 text-[#ef5350]'
                  : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {position === 'flat' ? 'Scanning' : position}
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[#131722]">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="relative z-[1] h-full w-full" preserveAspectRatio="none">
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={padX}
              y1={padY + (plotH / 3) * i}
              x2={chartW - 28}
              y2={padY + (plotH / 3) * i}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
          ))}

          {entryLineY !== null && (
            <line
              x1={padX}
              y1={entryLineY}
              x2={chartW - 28}
              y2={entryLineY}
              stroke={position === 'long' ? '#26a69a' : '#ef5350'}
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
          )}

          {visible.map((candle, i) => (
            <CandleSvg
              key={`${index}-${i}`}
              candle={candle}
              x={padX + xStep * i + xStep / 2}
              yScale={yScale}
              bodyW={bodyW}
            />
          ))}

          {[max, (max + min) / 2, min].map((p, i) => (
            <text
              key={i}
              x={chartW - 4}
              y={padY + (plotH / 2) * i + (i === 2 ? 4 : 0)}
              textAnchor="end"
              fill="rgba(255,255,255,0.25)"
              fontSize="5.5"
            >
              {(5240 + p / 10).toFixed(1)}
            </text>
          ))}
        </svg>

        <RadarOverlay active={position === 'flat'} />
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#0d1117] px-2.5 py-1.5">
        <div className="min-w-0 flex-1 truncate font-mono text-[10px] text-cyan-400/90">
          {flash ?? '> Analyzing order flow…'}
        </div>
        <div className="ml-2 shrink-0 text-right">
          <p className="text-[9px] text-white/35">Session P&L</p>
          <p
            key={sessionPnl}
            className={`text-xs font-semibold tabular-nums ${
              pnlTick === 'up'
                ? 'bot-pnl-tick-up text-[#ccff00]'
                : pnlTick === 'down'
                  ? 'bot-pnl-tick-down text-red-400'
                  : pnlPositive
                    ? 'text-[#ccff00]'
                    : 'text-red-400'
            }`}
          >
            {pnlDisplay}
          </p>
        </div>
      </div>
    </div>
  )
}
