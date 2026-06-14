export type PineAttachEvent =
  | { type: 'reset' }
  | { type: 'register' }
  | { type: 'plot-ema-fast'; label: string; color: string }
  | { type: 'plot-ema-slow'; label: string; color: string }
  | { type: 'plot-long'; label: string; color: string }
  | { type: 'plot-short'; label: string; color: string }
  | { type: 'deploy' }

export interface AttachedStudy {
  id: string
  name: string
  color: string
}

export interface IndicatorLayers {
  registered: boolean
  fastEma: boolean
  slowEma: boolean
  longSignals: boolean
  shortSignals: boolean
  deployed: boolean
}

export const INITIAL_LAYERS: IndicatorLayers = {
  registered: false,
  fastEma: false,
  slowEma: false,
  longSignals: false,
  shortSignals: false,
  deployed: false,
}

export function reduceAttachState(
  layers: IndicatorLayers,
  studies: AttachedStudy[],
  event: PineAttachEvent,
): { layers: IndicatorLayers; studies: AttachedStudy[] } {
  switch (event.type) {
    case 'reset':
      return { layers: INITIAL_LAYERS, studies: [] }
    case 'register':
      return {
        layers: { ...layers, registered: true },
        studies: [{ id: 'confluence', name: 'Overdrive IO Confluence Pro', color: '#26a69a' }],
      }
    case 'plot-ema-fast':
      return {
        layers: { ...layers, fastEma: true },
        studies: [
          ...studies.filter((s) => s.id !== 'fast-ema'),
          { id: 'fast-ema', name: 'Fast EMA 9', color: event.color },
        ],
      }
    case 'plot-ema-slow':
      return {
        layers: { ...layers, slowEma: true },
        studies: [
          ...studies.filter((s) => s.id !== 'slow-ema'),
          { id: 'slow-ema', name: 'Slow EMA 21', color: event.color },
        ],
      }
    case 'plot-long':
      return {
        layers: { ...layers, longSignals: true },
        studies: [
          ...studies.filter((s) => s.id !== 'long-markers'),
          { id: 'long-markers', name: 'Long entries', color: event.color },
        ],
      }
    case 'plot-short':
      return {
        layers: { ...layers, shortSignals: true },
        studies: [
          ...studies.filter((s) => s.id !== 'short-markers'),
          { id: 'short-markers', name: 'Short entries', color: event.color },
        ],
      }
    case 'deploy':
      return {
        layers: { ...layers, deployed: true },
        studies: studies.map((s) => ({ ...s })),
      }
    default:
      return { layers, studies }
  }
}
