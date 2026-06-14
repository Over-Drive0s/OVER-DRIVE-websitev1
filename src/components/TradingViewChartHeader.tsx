import { BarChart3, LineChart, Search } from 'lucide-react'
import type { AttachedStudy } from './pineAttachState'

export type ChartStyle = '1' | '2'

export interface IntervalOption {
  label: string
  value: string
}

export const TV_INTERVALS: IntervalOption[] = [
  { label: '1m', value: '1' },
  { label: '3m', value: '3' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '30m', value: '30' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: 'D', value: 'D' },
  { label: 'W', value: 'W' },
]

interface TradingViewChartHeaderProps {
  symbol: string
  interval: string
  chartStyle: ChartStyle
  attachedStudies: AttachedStudy[]
  onIntervalChange: (interval: string) => void
  onChartStyleChange: (style: ChartStyle) => void
}

export default function TradingViewChartHeader({
  symbol,
  interval,
  chartStyle,
  attachedStudies,
  onIntervalChange,
  onChartStyleChange,
}: TradingViewChartHeaderProps) {
  const activeInterval = TV_INTERVALS.find((i) => i.value === interval)?.label ?? interval

  return (
    <div className="border-b border-[#363a45] bg-[#131722]">
      {/* Row 1 — symbol + chart type + intervals (TradingView layout) */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 px-2 py-1.5 sm:px-3">
        {/* Symbol block */}
        <div className="flex min-w-0 items-center gap-2 border-r border-[#363a45] pr-2 sm:pr-3">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded px-1.5 py-1 text-left transition hover:bg-white/[0.04]"
          >
            <Search size={13} className="shrink-0 text-white/35" />
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-white/90 sm:text-sm">{symbol}</span>
              <span className="hidden text-[10px] text-emerald-400 sm:block">Apple Inc. · NASDAQ</span>
            </div>
          </button>
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-white/85">213.49</span>
            <span className="ml-1.5 text-xs text-emerald-400">+0.18%</span>
          </div>
        </div>

        {/* Chart type — candles / line */}
        <div className="flex items-center gap-0.5 rounded border border-[#363a45] bg-[#1e222d] p-0.5">
          <button
            type="button"
            title="Candles"
            aria-label="Candles"
            aria-pressed={chartStyle === '1'}
            onClick={() => onChartStyleChange('1')}
            className={`rounded p-1.5 transition ${
              chartStyle === '1'
                ? 'bg-[#2962FF] text-white'
                : 'text-white/45 hover:bg-white/[0.06] hover:text-white/75'
            }`}
          >
            <BarChart3 size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            title="Line"
            aria-label="Line chart"
            aria-pressed={chartStyle === '2'}
            onClick={() => onChartStyleChange('2')}
            className={`rounded p-1.5 transition ${
              chartStyle === '2'
                ? 'bg-[#2962FF] text-white'
                : 'text-white/45 hover:bg-white/[0.06] hover:text-white/75'
            }`}
          >
            <LineChart size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Interval times */}
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {TV_INTERVALS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onIntervalChange(item.value)}
              className={`shrink-0 rounded px-2 py-1 text-[11px] font-medium transition sm:text-xs ${
                interval === item.value
                  ? 'bg-[#2962FF] text-white'
                  : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Indicators pill */}
        <button
          type="button"
          className="hidden shrink-0 items-center gap-1 rounded border border-[#363a45] bg-[#1e222d] px-2.5 py-1 text-[11px] font-medium text-white/60 transition hover:border-[#2962FF]/40 hover:text-white/85 sm:flex"
        >
          <span className="text-[#2962FF]">ƒx</span>
          Indicators
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#363a45]/60 bg-[#1e222d]/80 px-2 py-1 sm:px-3">
        {attachedStudies.length === 0 ? (
          <span className="text-[10px] italic text-white/25">Scroll · zoom · Pine editor below</span>
        ) : (
          attachedStudies.map((study) => (
            <span
              key={study.id}
              className="study-attach-pop flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-white/60"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: study.color }} />
              {study.name}
            </span>
          ))
        )}
        <span className="ml-auto text-[10px] text-white/30">{activeInterval} · {symbol}</span>
      </div>
    </div>
  )
}
