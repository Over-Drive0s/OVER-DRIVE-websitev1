import { useCallback, useRef, useState } from 'react'
import { ArrowUpRight, ChevronUp, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import TradingViewChartWidget, { TV_CHART_SYMBOL_LABEL } from './TradingViewChartWidget'
import TradingViewChartHeader, { TV_INTERVALS, type ChartStyle } from './TradingViewChartHeader'
import LivePineEditor from './LivePineEditor'
import {
  INITIAL_LAYERS,
  reduceAttachState,
  type AttachedStudy,
  type IndicatorLayers,
  type PineAttachEvent,
} from './pineAttachState'

export default function CustomTradingIndicatorsSection() {
  const [interval, setInterval] = useState('15')
  const [chartStyle, setChartStyle] = useState<ChartStyle>('1')
  const [editorOpen, setEditorOpen] = useState<boolean | null>(null)
  const [layers, setLayers] = useState<IndicatorLayers>(INITIAL_LAYERS)
  const [attachedStudies, setAttachedStudies] = useState<AttachedStudy[]>([])
  const [statusLine, setStatusLine] = useState('Live coding indicator…')
  const attachStateRef = useRef({ layers: INITIAL_LAYERS, studies: [] as AttachedStudy[] })

  const intervalLabel = TV_INTERVALS.find((i) => i.value === interval)?.label ?? interval

  const toggleEditor = useCallback(() => {
    setEditorOpen((prev) => (prev === null ? false : !prev))
  }, [])

  const handleAttach = useCallback((event: PineAttachEvent) => {
    const next = reduceAttachState(
      attachStateRef.current.layers,
      attachStateRef.current.studies,
      event,
    )
    attachStateRef.current = next
    setLayers(next.layers)
    setAttachedStudies(next.studies)

    switch (event.type) {
      case 'register':
        setStatusLine('Registering indicator…')
        break
      case 'plot-ema-fast':
        setStatusLine('Plotting Fast EMA 9…')
        break
      case 'plot-ema-slow':
        setStatusLine('Plotting Slow EMA 21…')
        break
      case 'plot-long':
        setStatusLine('Adding long markers…')
        break
      case 'plot-short':
        setStatusLine('Adding short markers…')
        break
      case 'deploy':
        setStatusLine('Indicator attached to chart')
        setEditorOpen(false)
        window.setTimeout(() => setEditorOpen(null), 3500)
        break
      case 'reset':
        setStatusLine('Live coding indicator…')
        attachStateRef.current = { layers: INITIAL_LAYERS, studies: [] }
        break
    }
  }, [])

  const panelClass =
    editorOpen === null
      ? 'pine-editor-auto'
      : editorOpen
        ? 'pine-editor-open'
        : 'pine-editor-closed'

  return (
    <section className="mt-12 border-t border-white/[0.06] pt-10 sm:mt-16 sm:pt-12">
      <div className="mb-6 sm:mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2962FF]/30 bg-[#2962FF]/10">
            <Code2 size={16} className="text-[#2962FF]" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2962FF]">
            Pine Script · TradingView
          </p>
        </div>
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
          Custom Trading Indicators
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
          Customize your ultimate money-making indicators — from confluence scoring and multi-timeframe
          signals to automated alerts. We engineer Pine Script indicators on TradingView that match your
          edge, then deploy them live on your charts.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-[0_0_60px_rgba(41,98,255,0.08)]">
        <TradingViewChartHeader
          symbol={TV_CHART_SYMBOL_LABEL}
          interval={interval}
          chartStyle={chartStyle}
          attachedStudies={attachedStudies}
          onIntervalChange={setInterval}
          onChartStyleChange={setChartStyle}
        />

        <div className="relative aspect-[16/10] min-h-[320px] max-h-[520px] w-full sm:aspect-[16/9]">
          <div className="absolute inset-0 overflow-hidden bg-[#131722]">
            <TradingViewChartWidget
              interval={interval}
              chartStyle={chartStyle}
              layers={layers}
            />
          </div>

          <div
            className={`pine-editor-shell absolute bottom-0 left-0 right-0 z-10 flex flex-col border-t border-[#363a45]/80 bg-[#1e222d]/95 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] ${panelClass}`}
          >
            <button
              type="button"
              onClick={toggleEditor}
              className="pine-editor-tab flex shrink-0 items-center justify-between gap-2 border-b border-[#363a45]/60 bg-[#2a2e39] px-3 py-2 text-left transition hover:bg-[#32363f]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="rounded bg-[#ff9800]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ff9800]">
                  Pine
                </span>
                <span className="truncate text-[11px] font-medium text-white/75">
                  OverdriveIO_Confluence_Pro.pine
                </span>
                <span className="hidden text-[9px] text-[#42a5f5] sm:inline">· {statusLine}</span>
              </div>
              <ChevronUp
                size={14}
                className={`shrink-0 text-white/40 transition-transform duration-500 ${
                  editorOpen === false ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div className="min-h-0 flex-1 overflow-hidden">
              <LivePineEditor onAttach={handleAttach} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-[#1e222d] px-3 py-2 text-[10px] text-white/35 sm:px-4">
          <span>
            TradingView chart · {TV_CHART_SYMBOL_LABEL} · {intervalLabel}
            {layers.deployed ? ' · Confluence Pro attached' : ''}
          </span>
          <span className="flex items-center gap-1.5 text-[#42a5f5]/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#42a5f5]" />
            {statusLine}
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2962FF]">
              Trading systems
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
              Request a Demo
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/45">
              We build end-to-end trading systems for every level — custom Pine Script indicators and
              TradingView setups for active traders, plus journals, scoreboards, automation, and
              infrastructure for desks scaling toward fund-grade operations. Tell us your market, timeframe,
              and workflow — we&apos;ll design a system around how you actually trade.
            </p>
          </div>
          <Link
            to="/request-demo"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0080ff] px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98] sm:px-8"
          >
            Request a Demo
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
