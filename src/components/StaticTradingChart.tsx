import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChartStyle } from './TradingViewChartHeader'
import type { AttachedStudy, IndicatorLayers } from './pineAttachState'

export const TV_CHART_SYMBOL_LABEL = 'AAPL'

interface Candle {
  o: number
  h: number
  l: number
  c: number
  v: number
}

interface StaticTradingChartProps {
  chartStyle?: ChartStyle
  interval?: string
  layers?: IndicatorLayers
  attachedStudies?: AttachedStudy[]
}

interface IntervalConfig {
  aggregate: number
  visible: number
  bodyScale: number
  minutes: number
}

const TV = {
  bg: '#131722',
  grid: 'rgba(42, 46, 57, 0.85)',
  gridSubtle: 'rgba(42, 46, 57, 0.45)',
  bull: '#089981',
  bear: '#F23645',
  bullVol: 'rgba(8, 153, 129, 0.55)',
  bearVol: 'rgba(242, 54, 69, 0.55)',
  emaFast: '#2962FF',
  emaSlow: '#FF6D00',
  rsi: '#ab47bc',
  text: '#787b86',
  textBright: '#d1d4dc',
  scaleBg: '#131722',
  watchlistBg: '#1e222d',
  border: '#2a2e39',
}

const INTERVAL_CONFIG: Record<string, IntervalConfig> = {
  '1': { aggregate: 1, visible: 36, bodyScale: 0.62, minutes: 1 },
  '3': { aggregate: 2, visible: 32, bodyScale: 0.64, minutes: 3 },
  '5': { aggregate: 3, visible: 30, bodyScale: 0.66, minutes: 5 },
  '15': { aggregate: 4, visible: 26, bodyScale: 0.68, minutes: 15 },
  '30': { aggregate: 6, visible: 24, bodyScale: 0.7, minutes: 30 },
  '60': { aggregate: 8, visible: 22, bodyScale: 0.72, minutes: 60 },
  '240': { aggregate: 12, visible: 20, bodyScale: 0.74, minutes: 240 },
  D: { aggregate: 18, visible: 18, bodyScale: 0.76, minutes: 1440 },
  W: { aggregate: 24, visible: 16, bodyScale: 0.78, minutes: 10080 },
}

const DEFAULT_CONFIG = INTERVAL_CONFIG['15']

const WATCHLIST = [
  { sym: 'AAPL', chg: 0.18 },
  { sym: 'MSFT', chg: -0.42 },
  { sym: 'NVDA', chg: 1.24 },
  { sym: 'TSLA', chg: -0.89 },
  { sym: 'META', chg: 0.31 },
]

function generateBaseCandles(count: number): Candle[] {
  const candles: Candle[] = []
  let price = 68

  for (let i = 0; i < count; i++) {
    const wave = Math.sin(i * 0.42) * 2.4 + Math.cos(i * 0.17) * 1.6
    const drift = Math.sin(i * 0.08) * 0.35
    const noise = Math.sin(i * 1.73) * 0.9 + Math.cos(i * 2.31) * 0.6
    const delta = wave * 0.55 + drift + noise * 0.35

    const o = price
    const c = Math.max(58, Math.min(88, o + delta))
    const h = Math.max(o, c) + 0.6 + Math.abs(Math.sin(i * 0.91)) * 1.8
    const l = Math.min(o, c) - 0.6 - Math.abs(Math.cos(i * 1.07)) * 1.8
    const range = h - l

    candles.push({
      o,
      h: Math.min(90, h),
      l: Math.max(56, l),
      c,
      v: 800_000 + range * 120_000 + Math.abs(Math.sin(i * 0.63)) * 400_000,
    })
    price = c
  }

  return candles
}

function aggregateCandles(candles: Candle[], factor: number): Candle[] {
  if (factor <= 1) return candles

  const out: Candle[] = []
  for (let i = 0; i < candles.length; i += factor) {
    const chunk = candles.slice(i, i + factor)
    if (chunk.length === 0) continue
    out.push({
      o: chunk[0].o,
      h: Math.max(...chunk.map((c) => c.h)),
      l: Math.min(...chunk.map((c) => c.l)),
      c: chunk[chunk.length - 1].c,
      v: chunk.reduce((sum, c) => sum + c.v, 0),
    })
  }
  return out
}

const BASE_CANDLES = generateBaseCandles(180)

function ema(values: number[], period: number) {
  const k = 2 / (period + 1)
  let prev = values[0]
  return values.map((v, i) => {
    prev = i === 0 ? v : v * k + prev * (1 - k)
    return prev
  })
}

function rsi(values: number[], period = 14) {
  const out: number[] = []
  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      out.push(50)
      continue
    }
    const change = values[i] - values[i - 1]
    const gain = Math.max(change, 0)
    const loss = Math.max(-change, 0)

    if (i <= period) {
      avgGain += gain
      avgLoss += loss
      out.push(50)
      continue
    }

    if (i === period + 1) {
      avgGain /= period
      avgLoss /= period
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    out.push(100 - 100 / (1 + rs))
  }

  return out
}

function toPrice(normalized: number) {
  return 213 + (normalized - 75) * 0.8
}

function formatVolume(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(Math.round(v))
}

function formatTimeLabel(barOffset: number, minutes: number) {
  const totalMin = barOffset * minutes
  const h = Math.floor(totalMin / 60) % 24
  const m = totalMin % 60
  if (minutes >= 1440) {
    const day = 12 + Math.floor(barOffset / 1)
    return `${['Jan', 'Feb', 'Mar', 'Apr', 'May'][day % 5]} ${10 + (day % 18)}`
  }
  if (minutes >= 60) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function StaticTradingChart({
  chartStyle = '1',
  interval = '15',
  layers,
  attachedStudies = [],
}: StaticTradingChartProps) {
  const L = layers ?? {
    registered: false,
    fastEma: false,
    slowEma: false,
    longSignals: false,
    shortSignals: false,
    deployed: false,
  }

  const config = INTERVAL_CONFIG[interval] ?? DEFAULT_CONFIG
  const allCandles = useMemo(
    () => aggregateCandles(BASE_CANDLES, config.aggregate),
    [config.aggregate],
  )

  const [offset, setOffset] = useState(0)
  const [crosshair, setCrosshair] = useState<{ xPct: number; yPct: number } | null>(null)
  const dragRef = useRef<{ active: boolean; startX: number; startOffset: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOffset(0)
  }, [interval, config.aggregate, config.visible])

  const maxOffset = Math.max(0, allCandles.length - config.visible)

  const clampOffset = useCallback(
    (value: number) => Math.max(0, Math.min(maxOffset, value)),
    [maxOffset],
  )

  const visibleStart = Math.max(0, allCandles.length - config.visible - offset)
  const visibleEnd = visibleStart + config.visible
  const visible = allCandles.slice(visibleStart, visibleEnd)

  const showRsi = L.deployed || L.longSignals || L.shortSignals

  const { min, max } = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const c of visible) {
      lo = Math.min(lo, c.l)
      hi = Math.max(hi, c.h)
    }
    const pad = (hi - lo) * 0.1 || 2
    return { min: lo - pad, max: hi + pad }
  }, [visible])

  const maxVol = useMemo(() => Math.max(...visible.map((c) => c.v), 1), [visible])

  const chartW = 400
  const chartH = showRsi ? 248 : 220
  const mainH = showRsi ? 168 : 196
  const rsiH = showRsi ? 52 : 0
  const volH = 28
  const padX = 4
  const padTop = 18
  const padBottom = 4
  const plotW = chartW - padX * 2
  const candleH = mainH - volH - padTop - padBottom
  const rsiTop = mainH + 6

  const n = visible.length
  const step = plotW / Math.max(n, 1)
  const bodyW = Math.max(step * config.bodyScale, 1.5)

  const yPrice = (v: number) => padTop + ((max - v) / (max - min)) * candleH
  const yVol = (v: number) => mainH - padBottom - (v / maxVol) * (volH - 4)
  const yRsi = (v: number) => rsiTop + ((100 - v) / 100) * (rsiH - 8)
  const x = (i: number) => padX + step * i + step / 2

  const closes = visible.map((c) => c.c)
  const fullCloses = allCandles.map((c) => c.c)
  const fastEmaVisible = ema(fullCloses, 9).slice(visibleStart, visibleEnd)
  const slowEmaVisible = ema(fullCloses, 21).slice(visibleStart, visibleEnd)
  const rsiVisible = rsi(fullCloses).slice(visibleStart, visibleEnd)

  const linePath = (vals: number[], yFn: (v: number) => number) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${yFn(v)}`).join(' ')

  const lastCandle = visible[visible.length - 1]
  const lastPrice = lastCandle ? toPrice(lastCandle.c) : 213.49
  const lastBull = lastCandle ? lastCandle.c >= lastCandle.o : true

  const ohlc = lastCandle
    ? {
        o: toPrice(lastCandle.o),
        h: toPrice(lastCandle.h),
        l: toPrice(lastCandle.l),
        c: lastPrice,
      }
    : null

  const priceGridLines = useMemo(() => {
    const count = 6
    return Array.from({ length: count }, (_, i) => {
      const v = min + ((max - min) / (count - 1)) * i
      return { v, price: toPrice(v), topPct: (yPrice(v) / chartH) * 100 }
    })
  }, [min, max, chartH, candleH, padTop])

  const signalIndices = useMemo(
    () => ({
      long: [allCandles.length - 10, allCandles.length - 3],
      short: [allCandles.length - 6],
    }),
    [allCandles.length],
  )

  const indexInVisible = (globalIdx: number) => globalIdx - visibleStart

  const timeLabels = useMemo(() => {
    const slots = 5
    return Array.from({ length: slots }, (_, i) => {
      const idx = Math.round((i / (slots - 1)) * (visible.length - 1))
      const barFromEnd = offset + (visible.length - 1 - idx)
      return {
        idx,
        label: formatTimeLabel(allCandles.length - barFromEnd, config.minutes),
        leftPct: (x(idx) / chartW) * 100,
      }
    })
  }, [visible.length, offset, allCandles.length, config.minutes, step, chartW])

  const panByBars = useCallback(
    (bars: number) => setOffset((prev) => clampOffset(prev + bars)),
    [clampOffset],
  )

  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      panByBars(delta > 0 ? 1 : -1)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [panByBars])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    dragRef.current = { active: true, startX: e.clientX, startOffset: offset }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = chartRef.current?.getBoundingClientRect()
    if (rect) {
      const xPct = ((e.clientX - rect.left) / rect.width) * 100
      const yPct = ((e.clientY - rect.top) / rect.height) * 100
      setCrosshair({ xPct, yPct })
    }

    if (!dragRef.current?.active) return
    const dx = e.clientX - dragRef.current.startX
    const bars = Math.round(-dx / 14)
    setOffset(clampOffset(dragRef.current.startOffset + bars))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const onPointerLeave = () => setCrosshair(null)

  const studiesInChart =
    attachedStudies.length > 0
      ? attachedStudies
      : [
          ...(L.fastEma ? [{ id: 'ema9', name: 'EMA 9', color: TV.emaFast }] : []),
          ...(L.slowEma ? [{ id: 'ema21', name: 'EMA 21', color: TV.emaSlow }] : []),
          ...(showRsi ? [{ id: 'rsi', name: 'RSI 14', color: TV.rsi }] : []),
        ]

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: TV.bg }}>
      {/* Watchlist — TradingView left sidebar */}
      <div
        className="hidden w-[52px] shrink-0 border-r sm:block"
        style={{ background: TV.watchlistBg, borderColor: TV.border }}
      >
        <div
          className="border-b px-1.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider"
          style={{ borderColor: TV.border, color: TV.text }}
        >
          Watch
        </div>
        {WATCHLIST.map((item, i) => (
          <div
            key={item.sym}
            className="border-b px-1.5 py-1"
            style={{
              borderColor: `${TV.border}80`,
              background: i === 0 ? 'rgba(41, 98, 255, 0.12)' : 'transparent',
            }}
          >
            <div
              className="text-[9px] font-semibold leading-tight"
              style={{ color: i === 0 ? TV.textBright : TV.text }}
            >
              {item.sym}
            </div>
            <div
              className="text-[8px] tabular-nums leading-tight"
              style={{ color: item.chg >= 0 ? TV.bull : TV.bear }}
            >
              {item.chg >= 0 ? '+' : ''}
              {item.chg.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Chart + time axis */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          ref={chartRef}
          className="relative min-h-0 flex-1 cursor-crosshair touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
        >
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="h-full w-full select-none"
            preserveAspectRatio="none"
          >
            {/* Horizontal grid */}
            {priceGridLines.map((line) => (
              <line
                key={line.price}
                x1={padX}
                y1={yPrice(line.v)}
                x2={chartW - padX}
                y2={yPrice(line.v)}
                stroke={TV.gridSubtle}
                strokeWidth="0.5"
              />
            ))}

            {/* Vertical time grid */}
            {timeLabels.map((t) => (
              <line
                key={t.idx}
                x1={x(t.idx)}
                y1={padTop}
                x2={x(t.idx)}
                y2={mainH - padBottom}
                stroke={TV.gridSubtle}
                strokeWidth="0.5"
              />
            ))}

            {/* Volume bars */}
            {visible.map((c, i) => {
              const bull = c.c >= c.o
              const baseY = mainH - padBottom
              const topY = yVol(c.v)
              return (
                <rect
                  key={`vol-${offset}-${i}`}
                  x={x(i) - bodyW / 2}
                  y={topY}
                  width={bodyW}
                  height={Math.max(baseY - topY, 0.5)}
                  fill={bull ? TV.bullVol : TV.bearVol}
                />
              )
            })}

            {/* Candles or line */}
            {chartStyle === '1' &&
              visible.map((c, i) => {
                const bull = c.c >= c.o
                const color = bull ? TV.bull : TV.bear
                const top = yPrice(Math.max(c.o, c.c))
                const bottom = yPrice(Math.min(c.o, c.c))
                return (
                  <g key={`c-${offset}-${i}`}>
                    <line
                      x1={x(i)}
                      y1={yPrice(c.h)}
                      x2={x(i)}
                      y2={yPrice(c.l)}
                      stroke={color}
                      strokeWidth="1"
                    />
                    <rect
                      x={x(i) - bodyW / 2}
                      y={top}
                      width={bodyW}
                      height={Math.max(bottom - top, 1)}
                      fill={color}
                    />
                  </g>
                )
              })}

            {chartStyle === '2' && (
              <path
                d={linePath(closes, yPrice)}
                fill="none"
                stroke={TV.emaFast}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* EMA overlays */}
            {L.fastEma && fastEmaVisible.length > 0 && (
              <path
                d={linePath(fastEmaVisible, yPrice)}
                fill="none"
                stroke={TV.emaFast}
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {L.slowEma && slowEmaVisible.length > 0 && (
              <path
                d={linePath(slowEmaVisible, yPrice)}
                fill="none"
                stroke={TV.emaSlow}
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Last price line */}
            {lastCandle && (
              <line
                x1={padX}
                y1={yPrice(lastCandle.c)}
                x2={chartW - padX}
                y2={yPrice(lastCandle.c)}
                stroke={lastBull ? TV.bull : TV.bear}
                strokeWidth="0.6"
                strokeDasharray="3 3"
                opacity="0.85"
              />
            )}

            {/* Signal markers */}
            {L.longSignals &&
              signalIndices.long.map((globalIdx) => {
                const vi = indexInVisible(globalIdx)
                if (vi < 0 || vi >= visible.length) return null
                const candle = visible[vi]
                return (
                  <polygon
                    key={`long-${globalIdx}`}
                    points={`${x(vi)},${yPrice(candle.l) + 5} ${x(vi) - 4},${yPrice(candle.l) + 10} ${x(vi) + 4},${yPrice(candle.l) + 10}`}
                    fill={TV.bull}
                  />
                )
              })}
            {L.shortSignals &&
              signalIndices.short.map((globalIdx) => {
                const vi = indexInVisible(globalIdx)
                if (vi < 0 || vi >= visible.length) return null
                const candle = visible[vi]
                return (
                  <polygon
                    key={`short-${globalIdx}`}
                    points={`${x(vi)},${yPrice(candle.h) - 5} ${x(vi) - 4},${yPrice(candle.h) - 10} ${x(vi) + 4},${yPrice(candle.h) - 10}`}
                    fill={TV.bear}
                  />
                )
              })}

            {/* RSI pane */}
            {showRsi && (
              <>
                <line
                  x1={padX}
                  y1={rsiTop}
                  x2={chartW - padX}
                  y2={rsiTop}
                  stroke={TV.border}
                  strokeWidth="1"
                />
                {[30, 50, 70].map((level) => (
                  <g key={level}>
                    <line
                      x1={padX}
                      y1={yRsi(level)}
                      x2={chartW - padX}
                      y2={yRsi(level)}
                      stroke={level === 50 ? TV.gridSubtle : `${TV.rsi}33`}
                      strokeWidth="0.5"
                      strokeDasharray={level === 50 ? undefined : '2 2'}
                    />
                  </g>
                ))}
                <path
                  d={linePath(rsiVisible, yRsi)}
                  fill="none"
                  stroke={TV.rsi}
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={padX + 2}
                  y={rsiTop + 10}
                  fill={TV.rsi}
                  fontSize="8"
                  opacity="0.9"
                >
                  RSI 14
                </text>
              </>
            )}

            {/* Crosshair */}
            {crosshair && (
              <>
                <line
                  x1={(crosshair.xPct / 100) * chartW}
                  y1={padTop}
                  x2={(crosshair.xPct / 100) * chartW}
                  y2={chartH}
                  stroke="rgba(117, 134, 150, 0.55)"
                  strokeWidth="0.6"
                  strokeDasharray="4 3"
                />
                <line
                  x1={padX}
                  y1={(crosshair.yPct / 100) * chartH}
                  x2={chartW - padX}
                  y2={(crosshair.yPct / 100) * chartH}
                  stroke="rgba(117, 134, 150, 0.55)"
                  strokeWidth="0.6"
                  strokeDasharray="4 3"
                />
              </>
            )}
          </svg>

          {/* OHLC legend — top-left like TradingView */}
          {ohlc && (
            <div className="pointer-events-none absolute left-1 top-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 px-1 py-0.5 text-[10px] tabular-nums">
              <span style={{ color: TV.text }}>
                O<span className="ml-0.5" style={{ color: TV.textBright }}>{ohlc.o.toFixed(2)}</span>
              </span>
              <span style={{ color: TV.text }}>
                H<span className="ml-0.5" style={{ color: TV.textBright }}>{ohlc.h.toFixed(2)}</span>
              </span>
              <span style={{ color: TV.text }}>
                L<span className="ml-0.5" style={{ color: TV.textBright }}>{ohlc.l.toFixed(2)}</span>
              </span>
              <span style={{ color: TV.text }}>
                C
                <span
                  className="ml-0.5 font-medium"
                  style={{ color: lastBull ? TV.bull : TV.bear }}
                >
                  {ohlc.c.toFixed(2)}
                </span>
              </span>
              {lastCandle && (
                <span className="text-[9px]" style={{ color: TV.text }}>
                  Vol {formatVolume(lastCandle.v)}
                </span>
              )}
            </div>
          )}

          {/* In-chart study legend */}
          {studiesInChart.length > 0 && (
            <div className="pointer-events-none absolute left-1 top-[18px] flex flex-wrap gap-1.5">
              {studiesInChart.map((study) => (
                <span
                  key={study.id}
                  className="flex items-center gap-1 rounded px-1 py-0.5 text-[9px]"
                  style={{ color: TV.textBright, background: 'rgba(19, 23, 34, 0.75)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: study.color }} />
                  {study.name}
                </span>
              ))}
            </div>
          )}

          {L.deployed && (
            <div
              className="pointer-events-none absolute right-14 top-1 rounded px-1.5 py-0.5 text-[9px] font-medium"
              style={{
                color: TV.bull,
                background: 'rgba(19, 23, 34, 0.85)',
                border: `1px solid ${TV.bull}44`,
              }}
            >
              Confluence Pro
            </div>
          )}
        </div>

        {/* Time axis */}
        <div
          className="relative h-[18px] shrink-0 border-t"
          style={{ background: TV.bg, borderColor: TV.border }}
        >
          {timeLabels.map((t) => (
            <span
              key={t.idx}
              className="absolute top-0.5 -translate-x-1/2 text-[9px] tabular-nums"
              style={{ left: `${t.leftPct}%`, color: TV.text }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Price scale */}
      <div
        className="relative w-[54px] shrink-0 border-l"
        style={{ background: TV.scaleBg, borderColor: TV.border }}
      >
        {priceGridLines.map((line) => (
          <span
            key={line.price}
            className="absolute right-1.5 -translate-y-1/2 font-mono text-[9px] tabular-nums leading-none"
            style={{ top: `${line.topPct}%`, color: TV.text }}
          >
            {line.price.toFixed(2)}
          </span>
        ))}

        {/* Current price badge */}
        <span
          className="absolute right-0 min-w-[54px] -translate-y-1/2 px-1 py-0.5 text-right font-mono text-[9px] font-semibold tabular-nums leading-none text-white"
          style={{
            top: `${(yPrice(lastCandle?.c ?? 75) / chartH) * 100}%`,
            background: lastBull ? TV.bull : TV.bear,
          }}
        >
          {lastPrice.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
