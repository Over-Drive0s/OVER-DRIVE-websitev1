import { useEffect, useMemo, useState } from 'react'

type TokenColor = 'comment' | 'keyword' | 'string' | 'type' | 'fn' | 'plain' | 'punct'

interface Token {
  text: string
  color: TokenColor
}

interface CodeLine {
  num: number
  tokens: Token[]
}

interface ColoredChar {
  char: string
  color: TokenColor
}

interface FlatLine {
  num: number
  chars: ColoredChar[]
}

interface LineRenderState {
  line: FlatLine
  visible: ColoredChar[]
  showEmpty: boolean
  showCursor: boolean
  isActive: boolean
}

const colorMap: Record<TokenColor, string> = {
  comment: 'text-white/55',
  keyword: 'text-[#0080ff]',
  string: 'text-[#ccff00]',
  type: 'text-[#4db8ff]',
  fn: 'text-[#e8f4ff]',
  plain: 'text-white/70',
  punct: 'text-white/45',
}

const codeLines: CodeLine[] = [
  {
    num: 1,
    tokens: [{ text: '// overdriveio-com · system simulators registry', color: 'comment' }],
  },
  {
    num: 2,
    tokens: [
      { text: 'import', color: 'keyword' },
      { text: ' { deploy, SimulatorEnv } ', color: 'plain' },
      { text: 'from', color: 'keyword' },
      { text: " '@overdriveio/core'", color: 'string' },
    ],
  },
  { num: 3, tokens: [] },
  {
    num: 4,
    tokens: [
      { text: 'export const', color: 'keyword' },
      { text: ' SYSTEM_SIMULATORS', color: 'type' },
      { text: ' = [', color: 'punct' },
    ],
  },
  { num: 5, tokens: [{ text: "  'dashboard-systems',", color: 'string' }] },
  { num: 6, tokens: [{ text: "  'tracking-metrics',", color: 'string' }] },
  { num: 7, tokens: [{ text: "  'trading-systems',", color: 'string' }] },
  { num: 8, tokens: [{ text: "  'inventory-solutions',", color: 'string' }] },
  { num: 9, tokens: [{ text: "  'admin-panels',", color: 'string' }] },
  { num: 10, tokens: [{ text: "  'api-manager',", color: 'string' }] },
  { num: 11, tokens: [{ text: '] as const', color: 'punct' }] },
  { num: 12, tokens: [] },
  {
    num: 13,
    tokens: [
      { text: 'export async function', color: 'keyword' },
      { text: ' launchSimulator', color: 'fn' },
      { text: '(id: string) {', color: 'punct' },
    ],
  },
  {
    num: 14,
    tokens: [
      { text: '  return ', color: 'plain' },
      { text: 'deploy', color: 'fn' },
      { text: '({ id, env: ', color: 'punct' },
      { text: 'SimulatorEnv', color: 'type' },
      { text: '.Live })', color: 'punct' },
    ],
  },
  { num: 15, tokens: [{ text: '}', color: 'punct' }] },
]

const ghostLines: CodeLine[] = [
  {
    num: 18,
    tokens: [
      { text: 'const', color: 'keyword' },
      { text: ' status = ', color: 'plain' },
      { text: 'await', color: 'keyword' },
      { text: ' runtime.healthCheck()', color: 'fn' },
    ],
  },
  {
    num: 19,
    tokens: [
      { text: 'if', color: 'keyword' },
      { text: ' (status.uptime > ', color: 'plain' },
      { text: '0.999', color: 'string' },
      { text: ') {', color: 'punct' },
    ],
  },
  {
    num: 20,
    tokens: [
      { text: '  simulators.forEach', color: 'fn' },
      { text: '(s => s.warmCache())', color: 'punct' },
    ],
  },
  { num: 21, tokens: [{ text: '}', color: 'punct' }] },
]

function flattenLines(lines: CodeLine[]): FlatLine[] {
  return lines.map((line) => ({
    num: line.num,
    chars: line.tokens.flatMap((token) =>
      [...token.text].map((char) => ({ char, color: token.color })),
    ),
  }))
}

function countChars(flatLines: FlatLine[]) {
  return flatLines.reduce((sum, line) => sum + line.chars.length, 0)
}

function getVisibleState(flatLines: FlatLine[], charIndex: number): LineRenderState[] {
  const totalChars = countChars(flatLines)
  let consumed = 0

  return flatLines.map((line, index) => {
    if (line.chars.length === 0) {
      const show = consumed > 0 && charIndex >= consumed
      return {
        line,
        visible: [],
        showEmpty: show,
        showCursor: false,
        isActive: false,
      }
    }

    if (charIndex <= consumed) {
      return {
        line,
        visible: [],
        showEmpty: false,
        showCursor: false,
        isActive: false,
      }
    }

    const visibleCount = Math.min(charIndex - consumed, line.chars.length)
    const lineEnd = consumed + line.chars.length
    const isLastLine = index === flatLines.length - 1
    const showCursor =
      charIndex < totalChars &&
      ((visibleCount < line.chars.length) || (!isLastLine && charIndex === lineEnd))

    consumed = lineEnd

    return {
      line,
      visible: line.chars.slice(0, visibleCount),
      showEmpty: visibleCount > 0,
      showCursor,
      isActive: showCursor,
    }
  })
}

function TypingCodeBlock({
  lines,
  charIndex,
  className = '',
}: {
  lines: CodeLine[]
  charIndex: number
  className?: string
}) {
  const flatLines = useMemo(() => flattenLines(lines), [lines])
  const rendered = getVisibleState(flatLines, charIndex)

  return (
    <div className={`font-mono text-[11px] leading-[1.7] sm:text-xs lg:text-[13px] ${className}`}>
      {rendered.map(({ line, visible, showCursor, isActive, showEmpty }) => {
        if (!showEmpty) return null

        return (
          <div
            key={line.num}
            className={`flex whitespace-pre rounded-sm transition-colors duration-150 ${
              isActive ? 'code-line-active -mx-2 px-2' : ''
            }`}
          >
            <span
              className={`w-7 shrink-0 select-none pr-3 text-right transition-colors ${
                isActive ? 'text-[#0080ff]/80' : 'text-white/30'
              }`}
            >
              {line.num}
            </span>
            <span className="min-w-0">
              {visible.map((item, i) => (
                <span key={i} className={colorMap[item.color]}>
                  {item.char}
                </span>
              ))}
              {showCursor && (
                <span className="code-cursor ml-px inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function useTypingAnimation(totalChars: number, speedMs = 24, startDelayMs = 0) {
  const [charIndex, setCharIndex] = useState(0)
  const [started, setStarted] = useState(startDelayMs === 0)

  useEffect(() => {
    if (startDelayMs === 0) return
    const delay = window.setTimeout(() => setStarted(true), startDelayMs)
    return () => window.clearTimeout(delay)
  }, [startDelayMs])

  useEffect(() => {
    if (!started || totalChars === 0) return

    const timer = window.setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= totalChars) return prev
        return prev + 1
      })
    }, speedMs)

    return () => window.clearInterval(timer)
  }, [started, totalChars, speedMs])

  useEffect(() => {
    if (charIndex < totalChars) return

    const resetTimer = window.setTimeout(() => setCharIndex(0), 2800)
    return () => window.clearTimeout(resetTimer)
  }, [charIndex, totalChars])

  return { charIndex, isComplete: charIndex >= totalChars }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

export default function SourceCodeBackground() {
  const reducedMotion = usePrefersReducedMotion()
  const flatMain = useMemo(() => flattenLines(codeLines), [])
  const flatGhost = useMemo(() => flattenLines(ghostLines), [])

  const mainUnits = countChars(flatMain)
  const ghostUnits = countChars(flatGhost)

  const { charIndex: mainIndex, isComplete } = useTypingAnimation(mainUnits, 20)
  const { charIndex: ghostIndex } = useTypingAnimation(ghostUnits, 30, 1400)

  const displayMainIndex = reducedMotion ? mainUnits : mainIndex
  const displayGhostIndex = reducedMotion ? ghostUnits : ghostIndex

  const [statusPhase, setStatusPhase] = useState(1)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStatusPhase((p) => (p % 3) + 1)
    }, 450)
    return () => window.clearInterval(timer)
  }, [])

  const statusText = isComplete
    ? '6 simulators loaded'
    : `compiling${'.'.repeat(statusPhase)}`

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#06090f]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1020] via-[#070b14] to-[#040608]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="code-glow-pulse absolute left-1/4 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#0080ff]/[0.14] blur-[100px]" />
      <div className="code-glow-pulse-delayed absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-[#ccff00]/[0.1] blur-[80px]" />

      <div className="absolute inset-x-0 top-0 border-b border-white/[0.1] bg-[#0c101a]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.5)]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.4)]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.4)]" />
          </div>
          <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
            <span className="rounded-t-md border border-b-0 border-[#0080ff]/30 bg-[#080c14] px-3 py-1 font-mono text-[11px] text-white/80 shadow-[0_0_16px_rgba(0,128,255,0.15)]">
              simulators.config.ts
            </span>
            <span className="hidden font-mono text-[11px] text-white/35 sm:inline">runtime.env.ts</span>
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ccff00] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ccff00]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#ccff00]/80">Live build</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 w-10 border-r border-[#0080ff]/10 bg-[#05080d]/80 sm:w-12" />

      <div className="absolute inset-0 pt-14 sm:pt-[3.75rem]">
        <div className="absolute left-12 top-6 sm:left-14 sm:top-8 lg:top-10">
          <div className="rounded-lg border border-[#0080ff]/15 bg-[#080c14]/70 p-3 shadow-[0_0_48px_rgba(0,128,255,0.12)] backdrop-blur-[2px] sm:p-4">
            <TypingCodeBlock lines={codeLines} charIndex={displayMainIndex} />
          </div>
        </div>

        <div className="absolute right-4 top-20 hidden lg:block xl:right-10">
          <div className="rounded-lg border border-white/[0.06] bg-[#080c14]/55 p-3 shadow-[0_0_32px_rgba(204,255,0,0.06)] backdrop-blur-[1px]">
            <TypingCodeBlock lines={ghostLines} charIndex={displayGhostIndex} className="opacity-90" />
          </div>
        </div>

        <div className="absolute bottom-6 left-12 hidden font-mono text-[11px] sm:block lg:left-14">
          <span className="text-[#0080ff]">git</span>
          <span className="text-white/50"> main</span>
          <span className="mx-2 text-white/25">·</span>
          <span className={isComplete ? 'text-[#ccff00]' : 'text-[#ccff00]/80'}>{statusText}</span>
          <span className="mx-2 text-white/25">·</span>
          <span className="text-white/45">UTF-8</span>
          <span className="mx-2 text-white/25">·</span>
          <span className="text-white/45">TypeScript React</span>
        </div>
      </div>

      <div className="scanlines absolute inset-0 opacity-[0.08]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050607]/15 via-transparent to-[#050607]/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,#050607_72%)]" />
    </div>
  )
}
