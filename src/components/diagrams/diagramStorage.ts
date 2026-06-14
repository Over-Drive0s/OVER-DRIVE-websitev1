import {
  type Connection,
  type DiagramNode,
  type NodeId,
  initialConnections,
  initialNodes,
} from './nerveCenterData'

const LEGACY_CANVAS_STORAGE_KEY = 'source-hub-diagram-canvas'
const LEGACY_BIN_STORAGE_KEY = 'source-hub-diagram-bin'

export interface DiagramCanvasState {
  nodes: DiagramNode[]
  connections: Connection[]
  zoom?: number
  pan?: { x: number; y: number }
  layoutVersion?: number
  savedAt: number
}

export const CANVAS_BASE_WIDTH = 1500
export const CANVAS_BASE_HEIGHT = 820
export const CANVAS_DRAG_MARGIN = 240
export const MIN_ZOOM = 0.35
export const MAX_ZOOM = 2
export const DEFAULT_ZOOM = 1
export const ZOOM_STEP = 0.1
export const CANVAS_LAYOUT_VERSION = 2
export const DEFAULT_PAN = { x: 48, y: 40 }

export type MemoryBinEntry =
  | {
      id: string
      kind: 'node'
      deletedAt: number
      node: DiagramNode
      relatedConnections: Connection[]
    }
  | {
      id: string
      kind: 'connection'
      deletedAt: number
      connection: Connection
    }

let sessionCanvasState: DiagramCanvasState | null = null
let sessionMemoryBin: MemoryBinEntry[] = []

function clearLegacyStorage() {
  try {
    localStorage.removeItem(LEGACY_CANVAS_STORAGE_KEY)
    localStorage.removeItem(LEGACY_BIN_STORAGE_KEY)
  } catch {
    // ignore
  }
}

clearLegacyStorage()

export function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

export function clampNodePosition(
  x: number,
  y: number,
  width: number,
  height: number,
  pan?: { x: number; y: number },
  zoom = 1,
): { x: number; y: number } {
  const margin = CANVAS_DRAG_MARGIN
  const safeZoom = zoom || 1
  const minX = pan ? -pan.x / safeZoom - margin : -margin
  const minY = pan ? -pan.y / safeZoom - margin : -margin

  return {
    x: Math.max(minX, Math.min(CANVAS_BASE_WIDTH - width + margin, x)),
    y: Math.max(minY, Math.min(CANVAS_BASE_HEIGHT - height + margin, y)),
  }
}

export function getDefaultCanvas(): {
  nodes: DiagramNode[]
  connections: Connection[]
  zoom: number
  pan: { x: number; y: number }
} {
  return {
    nodes: initialNodes.map((node) => ({ ...node })),
    connections: initialConnections.map((connection) => ({ ...connection })),
    zoom: DEFAULT_ZOOM,
    pan: { ...DEFAULT_PAN },
  }
}

export function resetDiagramSession() {
  sessionCanvasState = null
  sessionMemoryBin = []
  clearLegacyStorage()
}

export function loadCanvasState(): DiagramCanvasState | null {
  return sessionCanvasState
}

export function saveCanvasState(
  nodes: DiagramNode[],
  connections: Connection[],
  zoom = DEFAULT_ZOOM,
  pan: { x: number; y: number } = DEFAULT_PAN,
) {
  sessionCanvasState = {
    nodes: nodes.map((node) => ({ ...node })),
    connections: connections.map((connection) => ({ ...connection })),
    zoom: clampZoom(zoom),
    pan: { ...pan },
    layoutVersion: CANVAS_LAYOUT_VERSION,
    savedAt: Date.now(),
  }
}

export function loadInitialCanvas(): {
  nodes: DiagramNode[]
  connections: Connection[]
  zoom: number
  pan: { x: number; y: number }
} {
  resetDiagramSession()
  return getDefaultCanvas()
}

export function loadMemoryBin(): MemoryBinEntry[] {
  return sessionMemoryBin.map((entry) =>
    entry.kind === 'node'
      ? {
          ...entry,
          node: { ...entry.node },
          relatedConnections: entry.relatedConnections.map((connection) => ({ ...connection })),
        }
      : { ...entry, connection: { ...entry.connection } },
  )
}

export function saveMemoryBin(entries: MemoryBinEntry[]) {
  sessionMemoryBin = entries
}

export function addToMemoryBin(entry: MemoryBinEntry) {
  sessionMemoryBin = [entry, ...sessionMemoryBin].slice(0, 50)
}

export function removeFromMemoryBin(entryId: string): MemoryBinEntry | null {
  const index = sessionMemoryBin.findIndex((entry) => entry.id === entryId)
  if (index === -1) return null
  const [removed] = sessionMemoryBin.splice(index, 1)
  return removed
}

export function clearMemoryBin() {
  sessionMemoryBin = []
}

export function formatSavedTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 5000) return 'Just now'
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function nodeExistsInCanvas(nodes: DiagramNode[], nodeId: NodeId) {
  return nodes.some((node) => node.id === nodeId)
}

export function connectionExistsInCanvas(connections: Connection[], from: NodeId, to: NodeId) {
  return connections.some((connection) => connection.from === from && connection.to === to)
}
