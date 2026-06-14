import { useMemo } from 'react'
import type { ChartStyle } from './TradingViewChartHeader'
import { INITIAL_LAYERS, type IndicatorLayers } from './pineAttachState'

/** TradingView symbol — NASDAQ:AAPL avoids CME futures market-closed popups */
export const TV_CHART_SYMBOL = 'NASDAQ:AAPL'
export const TV_CHART_SYMBOL_LABEL = 'AAPL'

interface TradingViewChartWidgetProps {
  interval?: string
  chartStyle?: ChartStyle
  symbol?: string
  layers?: IndicatorLayers
}

/** Map Pine attach state → native TradingView studies (rendered inside the iframe). */
function buildStudiesFromLayers(layers: IndicatorLayers) {
  const studies: string[] = []
  const overrides: Record<string, string | number> = {}

  if (layers.fastEma) {
    studies.push('MASimple@tv-basicstudies')
    overrides['moving average.length'] = 9
    overrides['moving average.color'] = '#2962FF'
    overrides['moving average.linewidth'] = 2
  }

  if (layers.slowEma) {
    studies.push('MASimple@tv-basicstudies')
    overrides['moving average 1.length'] = 21
    overrides['moving average 1.color'] = '#FF6D00'
    overrides['moving average 1.linewidth'] = 2
  }

  if (layers.longSignals || layers.shortSignals || layers.deployed) {
    studies.push('RSI@tv-basicstudies')
    overrides['relative strength index.length'] = 14
  }

  return { studies, overrides }
}

function buildEmbedUrl(
  symbol: string,
  interval: string,
  chartStyle: ChartStyle,
  layers: IndicatorLayers,
) {
  const { studies, overrides } = buildStudiesFromLayers(layers)

  const params = new URLSearchParams({
    frameElementId: 'tradingview_embed',
    symbol,
    interval,
    hidesidetoolbar: '1',
    hidetoptoolbar: '1',
    symboledit: '0',
    saveimage: '0',
    toolbarbg: '131722',
    theme: 'dark',
    style: chartStyle,
    timezone: 'America/New_York',
    withdateranges: '0',
    showpopupbutton: '0',
    hideideas: '1',
    locale: 'en',
    allow_symbol_change: '0',
    calendar: 'false',
    hotlist: 'false',
  })

  params.set('studies', JSON.stringify(studies))
  if (Object.keys(overrides).length > 0) {
    params.set('studiesOverrides', JSON.stringify(overrides))
  }

  params.set('enabled_features', JSON.stringify([]))
  params.set(
    'disabled_features',
    JSON.stringify([
      'use_localstorage_for_settings',
      'save_chart_properties_to_local_storage',
      'header_compare',
      'header_symbol_search',
      'header_saveload',
      'header_settings',
      'header_undo_redo',
      'header_fullscreen_button',
      'timeframes_toolbar',
      'control_bar',
      'main_series_scale_menu',
      'display_market_status',
      'chart_property_page',
      'popup_hints',
      'header_widget',
      'legend_context_menu',
      'context_menus',
      'edit_buttons_in_legend',
      'border_around_the_chart',
      'remove_library_container_border',
      'chart_style_hilo',
      'compare_symbol',
      'show_symbol_logo',
    ]),
  )

  return `https://s.tradingview.com/widgetembed/?${params.toString()}`
}

export default function TradingViewChartWidget({
  interval = '15',
  chartStyle = '1',
  symbol = TV_CHART_SYMBOL,
  layers = INITIAL_LAYERS,
}: TradingViewChartWidgetProps) {
  const src = useMemo(
    () => buildEmbedUrl(symbol, interval, chartStyle, layers),
    [
      symbol,
      interval,
      chartStyle,
      layers.registered,
      layers.fastEma,
      layers.slowEma,
      layers.longSignals,
      layers.shortSignals,
      layers.deployed,
    ],
  )

  return (
    <div className="tv-chart-clip h-full w-full overflow-hidden bg-[#131722]">
      <iframe
        key={src}
        title="TradingView chart"
        src={src}
        className="tv-chart-iframe h-full w-full border-0"
        scrolling="no"
        allowFullScreen
      />
    </div>
  )
}
