import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'

type LineKind = 'comment' | 'keyword' | 'string' | 'func' | 'plain' | 'num'

interface PineLine {
  text: string
  kind: LineKind
  action?: {
    label: string
    detail: string
    accent: string
  }
}

const PINE_LINES: PineLine[] = [
  { text: '//@version=5', kind: 'comment' },
  {
    text: 'indicator("Overdrive IO Confluence Pro", overlay=true)',
    kind: 'keyword',
    action: { label: 'Create indicator', detail: 'Registering overlay on chart', accent: '#ff9800' },
  },
  { text: '', kind: 'plain' },
  { text: '// ── Inputs ──', kind: 'comment' },
  { text: 'fastLen = input.int(9, "Fast EMA")', kind: 'plain' },
  { text: 'slowLen = input.int(21, "Slow EMA")', kind: 'plain' },
  { text: 'rsiLen  = input.int(14, "RSI Length")', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: '// ── Calculations ──', kind: 'comment' },
  { text: 'fastEma = ta.ema(close, fastLen)', kind: 'func' },
  { text: 'slowEma = ta.ema(close, slowLen)', kind: 'func' },
  { text: 'rsiVal  = ta.rsi(close, rsiLen)', kind: 'func' },
  { text: '', kind: 'plain' },
  { text: 'bullTrend = fastEma > slowEma', kind: 'plain' },
  { text: 'bullMom   = rsiVal > 50 and rsiVal < 70', kind: 'plain' },
  { text: 'score     = (bullTrend ? 50 : 0) + (bullMom ? 50 : 0)', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: '// ── Plots ──', kind: 'comment' },
  {
    text: 'plot(fastEma, "Fast EMA", color=#2962FF, linewidth=2)',
    kind: 'func',
    action: { label: 'Plot Fast EMA', detail: 'Drawing blue line on chart', accent: '#2962FF' },
  },
  {
    text: 'plot(slowEma, "Slow EMA", color=#FF6D00, linewidth=2)',
    kind: 'func',
    action: { label: 'Plot Slow EMA', detail: 'Drawing orange line on chart', accent: '#FF6D00' },
  },
  { text: '', kind: 'plain' },
  { text: 'longCond  = ta.crossover(fastEma, slowEma) and rsiVal > 45', kind: 'plain' },
  { text: 'shortCond = ta.crossunder(fastEma, slowEma) and rsiVal < 55', kind: 'plain' },
  { text: '', kind: 'plain' },
  {
    text: 'plotshape(longCond, "Long", shape.triangleup, location.belowbar, #26a69a)',
    kind: 'func',
    action: { label: 'Mark long entries', detail: 'Green triangles below bars', accent: '#26a69a' },
  },
  {
    text: 'plotshape(shortCond, "Short", shape.triangledown, location.abovebar, #ef5350)',
    kind: 'func',
    action: { label: 'Mark short entries', detail: 'Red triangles above bars', accent: '#ef5350' },
  },
  { text: '', kind: 'plain' },
  {
    text: 'alertcondition(longCond, "Long Entry", "Confluence long signal")',
    kind: 'func',
    action: { label: 'Wire long alert', detail: 'Alert fires on crossover', accent: '#ccff00' },
  },
  {
    text: 'alertcondition(shortCond, "Short Entry", "Confluence short signal")',
    kind: 'func',
    action: { label: 'Wire short alert', detail: 'Alert fires on crossunder', accent: '#ccff00' },
  },
]

const CHAR_MS = 28
const LINE_PAUSE_MS = 120
const ACTION_PAUSE_MS = 900
const RESET_PAUSE_MS = 2400

function pineColor(kind: LineKind) {
  switch (kind) {
    case 'comment':
      return 'text-white/30'
    case 'keyword':
      return 'text-[#ff9800]'
    case 'string':
      return 'text-[#4caf50]'
    case 'func':
      return 'text-[#42a5f5]'
    case 'num':
      return 'text-[#ab47bc]'
    default:
      return 'text-[#d4d4d4]'
  }
}

interface LivePineEditorProps {
  onAttach?: (event: import('./pineAttachState').PineAttachEvent) => void
}

export default function LivePineEditor({ onAttach }: LivePineEditorProps) {
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deployReady, setDeployReady] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const onAttachRef = useRef(onAttach)
  const attachFiredRef = useRef<Set<number>>(new Set())
  const deployFiredRef = useRef(false)

  useEffect(() => {
    onAttachRef.current = onAttach
  }, [onAttach])

  const fireAttachForLine = useCallback((idx: number) => {
    if (attachFiredRef.current.has(idx)) return
    attachFiredRef.current.add(idx)

    const line = PINE_LINES[idx]
    if (!line?.action) return

    const map: Record<string, import('./pineAttachState').PineAttachEvent> = {
      'Create indicator': { type: 'register' },
      'Plot Fast EMA': { type: 'plot-ema-fast', label: 'Fast EMA', color: '#2962FF' },
      'Plot Slow EMA': { type: 'plot-ema-slow', label: 'Slow EMA', color: '#FF6D00' },
      'Mark long entries': { type: 'plot-long', label: 'Long markers', color: '#26a69a' },
      'Mark short entries': { type: 'plot-short', label: 'Short markers', color: '#ef5350' },
    }
    const event = map[line.action.label]
    if (event) onAttachRef.current?.(event)
  }, [])

  const reset = useCallback(() => {
    setLineIndex(0)
    setCharIndex(0)
    setDeployReady(false)
    attachFiredRef.current.clear()
    deployFiredRef.current = false
    onAttachRef.current?.({ type: 'reset' })
  }, [])

  useEffect(() => {
    if (lineIndex >= PINE_LINES.length) {
      setDeployReady(true)
      const resetTimer = window.setTimeout(reset, RESET_PAUSE_MS)
      return () => window.clearTimeout(resetTimer)
    }

    const line = PINE_LINES[lineIndex]
    const isEmpty = line.text.length === 0

    if (isEmpty) {
      const t = window.setTimeout(() => {
        setLineIndex((i) => i + 1)
        setCharIndex(0)
      }, LINE_PAUSE_MS)
      return () => window.clearTimeout(t)
    }

    if (charIndex < line.text.length) {
      const t = window.setTimeout(() => setCharIndex((c) => c + 1), CHAR_MS)
      return () => window.clearTimeout(t)
    }

    if (line.action) fireAttachForLine(lineIndex)

    if (line.action) {
      const t = window.setTimeout(() => {
        setLineIndex((i) => i + 1)
        setCharIndex(0)
      }, ACTION_PAUSE_MS)
      return () => window.clearTimeout(t)
    }

    const t = window.setTimeout(() => {
      setLineIndex((i) => i + 1)
      setCharIndex(0)
    }, LINE_PAUSE_MS)
    return () => window.clearTimeout(t)
  }, [lineIndex, charIndex, reset, fireAttachForLine])

  useEffect(() => {
    if (!deployReady || deployFiredRef.current) return
    deployFiredRef.current = true
    const attachTimer = window.setTimeout(() => {
      onAttachRef.current?.({ type: 'deploy' })
    }, 500)
    return () => window.clearTimeout(attachTimer)
  }, [deployReady])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [lineIndex, charIndex])

  const visibleLines = PINE_LINES.slice(0, lineIndex)
  const currentLine = PINE_LINES[lineIndex]
  const typingCurrent = currentLine && charIndex > 0 ? currentLine.text.slice(0, charIndex) : ''
  const isTyping = lineIndex < PINE_LINES.length

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-end gap-2 border-b border-white/[0.06] bg-[#2a2e39]/90 px-3 py-1">
        <span className="mr-auto text-[10px] text-white/30">Pine Script v5</span>
        <span
          className={`rounded px-2 py-0.5 text-[9px] font-semibold transition-all duration-300 ${
            deployReady
              ? 'pine-deploy-pulse bg-[#26a69a]/25 text-[#26a69a] ring-2 ring-[#26a69a]/50'
              : 'bg-[#26a69a]/15 text-[#26a69a]/70'
          }`}
        >
          {deployReady ? '▶ Attaching…' : 'Add to chart'}
        </span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#252830]/75">
        <div className="absolute inset-y-0 left-0 w-8 border-r border-white/[0.04] bg-[#252830]">
          <div className="py-2 text-center font-mono text-[9px] leading-[1.65] text-white/20">
            {PINE_LINES.map((_, i) => (
              <div
                key={i}
                className={i === lineIndex && isTyping ? 'text-[#42a5f5]/60' : ''}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="absolute inset-0 left-8 overflow-y-auto py-2 pl-3 pr-4">
          <pre className="font-mono text-[10px] leading-[1.65] sm:text-[11px]">
            {visibleLines.map((line, i) => (
              <div
                key={i}
                className={`whitespace-pre rounded-sm px-1 -mx-1 ${pineColor(line.kind)} ${
                  line.action ? 'bg-white/[0.03]' : ''
                }`}
              >
                {line.text || '\u00A0'}
              </div>
            ))}
            {isTyping && currentLine && (
              <div
                className={`whitespace-pre rounded-sm px-1 -mx-1 pine-line-typing ${pineColor(currentLine.kind)} ${
                  currentLine.action ? 'pine-action-line' : 'code-line-active'
                }`}
              >
                {typingCurrent || '\u00A0'}
                <span className="code-cursor ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#42a5f5]" />
              </div>
            )}
            {deployReady && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#26a69a]">
                <Sparkles size={11} />
                <span>Attaching indicator to chart…</span>
              </div>
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}
