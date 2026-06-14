import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  addToMemoryBin,
  clampZoom,
  clampNodePosition,
  clearMemoryBin,
  DEFAULT_ZOOM,
  loadInitialCanvas,
  loadMemoryBin,
  nodeExistsInCanvas,
  removeFromMemoryBin,
  saveCanvasState,
  ZOOM_STEP,
  type MemoryBinEntry,
} from './diagramStorage'
import {
  createCardNode,
  type CardType,
  type Connection,
  type CanvasSelection,
  type DiagramNode,
  type NodeId,
  type Point,
  type PortSide,
  buildDraftWirePath,
  canConnect,
  connectionEndpointExists,
  defaultFromPort,
  defaultToPort,
  findNearestPort,
  getPortPosition,
  isConnectionLive,
} from './nerveCenterData'

type SaveStatus = 'idle' | 'saving' | 'saved'

interface WireDraft {
  fromNodeId: NodeId
  fromPort: PortSide
  x: number
  y: number
}

interface PanState {
  pointerId: number
  startX: number
  startY: number
  startPanX: number
  startPanY: number
}

interface PanOffset {
  x: number
  y: number
}

interface DragState {
  nodeId: NodeId
  offsetX: number
  offsetY: number
  nodeWidth: number
  nodeHeight: number
}

function getCanvasPoint(
  clientX: number,
  clientY: number,
  canvasEl: HTMLElement,
  zoom: number,
  pan: PanOffset,
): Point {
  const rect = canvasEl.getBoundingClientRect()
  return {
    x: (clientX - rect.left - pan.x) / zoom,
    y: (clientY - rect.top - pan.y) / zoom,
  }
}

export function useDiagramCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<NodeId, HTMLDivElement>>(new Map())
  const hoverPortRef = useRef<{ nodeId: NodeId; port: PortSide } | null>(null)
  const wireDraftRef = useRef<WireDraft | null>(null)
  const skipNextSave = useRef(true)
  const saveTimerRef = useRef<number | null>(null)

  const initial = useMemo(() => loadInitialCanvas(), [])

  const nodesRef = useRef(initial.nodes)
  const connectionsRef = useRef(initial.connections)

  const [nodes, setNodes] = useState<DiagramNode[]>(initial.nodes)
  const [connections, setConnections] = useState<Connection[]>(initial.connections)
  const [zoom, setZoom] = useState(initial.zoom)
  const zoomRef = useRef(initial.zoom)
  const [panOffset, setPanOffset] = useState<PanOffset>(initial.pan)
  const panOffsetRef = useRef<PanOffset>(initial.pan)
  const [panState, setPanState] = useState<PanState | null>(null)
  const panMovedRef = useRef(false)
  const panListenersRef = useRef<{
    move: (event: PointerEvent) => void
    end: (event: PointerEvent) => void
  } | null>(null)
  const [memoryBin, setMemoryBin] = useState<MemoryBinEntry[]>(() => loadMemoryBin())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [measuredHeights, setMeasuredHeights] = useState<Partial<Record<NodeId, number>>>({})
  const measuredHeightsRef = useRef<Partial<Record<NodeId, number>>>({})
  const [dragState, setDragState] = useState<DragState | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const [wireDraft, setWireDraft] = useState<WireDraft | null>(null)
  const [hoverPort, setHoverPort] = useState<{ nodeId: NodeId; port: PortSide } | null>(null)
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null)
  const [selection, setSelection] = useState<CanvasSelection>(null)

  const clearSelection = useCallback(() => {
    setSelection(null)
  }, [])

  const persistCanvas = useCallback(
    (
      nextNodes: DiagramNode[],
      nextConnections: Connection[],
      nextZoom = zoomRef.current,
      nextPan = panOffsetRef.current,
    ) => {
      saveCanvasState(nextNodes, nextConnections, nextZoom, nextPan)
      setLastSavedAt(Date.now())
      setSaveStatus('saved')
    },
    [],
  )

  const scheduleAutoSave = useCallback(
    (
      nextNodes: DiagramNode[],
      nextConnections: Connection[],
      immediate = false,
      nextZoom = zoomRef.current,
      nextPan = panOffsetRef.current,
    ) => {
      if (skipNextSave.current) return

      setSaveStatus('saving')

      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }

      if (immediate) {
        persistCanvas(nextNodes, nextConnections, nextZoom, nextPan)
        return
      }

      saveTimerRef.current = window.setTimeout(() => {
        persistCanvas(nextNodes, nextConnections, nextZoom, nextPan)
        saveTimerRef.current = null
      }, 350)
    },
    [persistCanvas],
  )

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    panOffsetRef.current = panOffset
  }, [panOffset])

  useEffect(() => {
    dragStateRef.current = dragState
  }, [dragState])

  const applyPanOffset = useCallback((next: PanOffset) => {
    panOffsetRef.current = next
    setPanOffset(next)
  }, [])

  const zoomAt = useCallback((nextZoom: number, focal?: { x: number; y: number }) => {
    const canvas = canvasRef.current
    const clamped = clampZoom(nextZoom)

    if (!canvas) {
      setZoom(clamped)
      return
    }

    const rect = canvas.getBoundingClientRect()
    const fx = focal?.x ?? rect.width / 2
    const fy = focal?.y ?? rect.height / 2
    const prev = zoomRef.current
    const pan = panOffsetRef.current
    const worldX = (fx - pan.x) / prev
    const worldY = (fy - pan.y) / prev

    setZoom(clamped)
    applyPanOffset({
      x: fx - worldX * clamped,
      y: fy - worldY * clamped,
    })
    scheduleAutoSave(nodesRef.current, connectionsRef.current, true, clamped)
  }, [applyPanOffset, scheduleAutoSave])

  const zoomIn = useCallback(() => {
    zoomAt(zoomRef.current + ZOOM_STEP)
  }, [zoomAt])

  const zoomOut = useCallback(() => {
    zoomAt(zoomRef.current - ZOOM_STEP)
  }, [zoomAt])

  const resetZoom = useCallback(() => {
    zoomAt(DEFAULT_ZOOM)
  }, [zoomAt])

  useEffect(() => {
    skipNextSave.current = false
    return () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    }
  }, [])

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    connectionsRef.current = connections
  }, [connections])

  useEffect(() => {
    scheduleAutoSave(nodes, connections, false, zoom, panOffset)
  }, [nodes, connections, zoom, panOffset, scheduleAutoSave])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()

      const rect = canvas.getBoundingClientRect()
      const factor = Math.exp(-event.deltaY * 0.002)
      zoomAt(zoomRef.current * factor, {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const endActivePan = useCallback(() => {
    const listeners = panListenersRef.current
    if (listeners) {
      window.removeEventListener('pointermove', listeners.move)
      window.removeEventListener('pointerup', listeners.end)
      window.removeEventListener('pointercancel', listeners.end)
      panListenersRef.current = null
    }
    setPanState(null)
  }, [])

  const beginPan = useCallback(
    (clientX: number, clientY: number, pointerId: number) => {
      endActivePan()

      const pan = panOffsetRef.current
      panMovedRef.current = false

      const state: PanState = {
        pointerId,
        startX: clientX,
        startY: clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      }

      setPanState(state)

      const isCanvasBackground = (target: HTMLElement) =>
        !target.closest('.nerve-node') &&
        !target.closest('.nerve-port') &&
        !target.closest('[data-nerve-wire-hit]') &&
        !target.closest('button, input, textarea, select')

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerId !== state.pointerId) return

        const dx = event.clientX - state.startX
        const dy = event.clientY - state.startY
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) panMovedRef.current = true

        applyPanOffset({
          x: state.startPanX + dx,
          y: state.startPanY + dy,
        })
      }

      const onPointerEnd = (event: PointerEvent) => {
        if (event.pointerId !== state.pointerId) return

        const moved = panMovedRef.current
        endActivePan()

        if (!moved && isCanvasBackground(event.target as HTMLElement)) {
          clearSelection()
        }
      }

      panListenersRef.current = { move: onPointerMove, end: onPointerEnd }
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerEnd)
      window.addEventListener('pointercancel', onPointerEnd)
    },
    [applyPanOffset, clearSelection, endActivePan],
  )

  useEffect(() => () => endActivePan(), [endActivePan])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const isPanBlockedTarget = (target: HTMLElement) =>
      Boolean(
        target.closest('.nerve-port') ||
          target.closest('.nerve-node-drag-handle') ||
          target.closest('.nerve-node-header') ||
          target.closest('[data-nerve-wire-hit]') ||
          target.closest('button, input, textarea, select'),
      )

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.button !== 1) return
      if (wireDraftRef.current || dragStateRef.current) return

      const target = event.target as HTMLElement
      if (event.button === 0 && isPanBlockedTarget(target)) return

      event.preventDefault()
      beginPan(event.clientX, event.clientY, event.pointerId)
    }

    canvas.addEventListener('pointerdown', onPointerDown, true)
    return () => canvas.removeEventListener('pointerdown', onPointerDown, true)
  }, [beginPan])

  const consumePanClick = useCallback(() => {
    if (!panMovedRef.current) return false
    panMovedRef.current = false
    return true
  }, [])

  const measureRafRef = useRef<number | null>(null)

  const measureNodes = useCallback(() => {
    if (dragStateRef.current) return
    if (measureRafRef.current !== null) return

    measureRafRef.current = window.requestAnimationFrame(() => {
      measureRafRef.current = null
      const next: Partial<Record<NodeId, number>> = {}
      let changed = false

      nodeRefs.current.forEach((element, id) => {
        const height = element.offsetHeight
        const prev = measuredHeightsRef.current[id]
        if (prev === undefined || Math.abs(height - prev) >= 2) {
          next[id] = height
          changed = true
        } else {
          next[id] = prev
        }
      })

      if (!changed) return

      measuredHeightsRef.current = next
      setMeasuredHeights(next)
    })
  }, [])

  useEffect(() => {
    measureNodes()
    const observer = new ResizeObserver(measureNodes)
    nodeRefs.current.forEach((element) => observer.observe(element))
    return () => {
      observer.disconnect()
      if (measureRafRef.current !== null) {
        window.cancelAnimationFrame(measureRafRef.current)
      }
    }
  }, [measureNodes, nodes])

  const registerNodeRef = useCallback((id: NodeId, element: HTMLDivElement | null) => {
    if (element) nodeRefs.current.set(id, element)
    else nodeRefs.current.delete(id)
  }, [])

  const getPort = useCallback(
    (nodeId: NodeId, port: PortSide): Point => {
      const node = nodes.find((item) => item.id === nodeId)
      if (!node) return { x: 0, y: 0 }
      return getPortPosition(node, port, measuredHeights[nodeId])
    },
    [measuredHeights, nodes],
  )

  const connectedCount = useMemo(
    () => connections.filter((connection) => isConnectionLive(connection, nodes)).length,
    [connections, nodes],
  )

  const toggleNode = useCallback((nodeId: NodeId) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, active: !node.active } : node)),
    )
  }, [])

  const toggleConnectionPlug = useCallback((connectionId: string) => {
    setConnections((prev) =>
      prev.map((connection) =>
        connection.id === connectionId
          ? { ...connection, plugged: !connection.plugged }
          : connection,
      ),
    )
  }, [])

  const selectConnection = useCallback((connectionId: string) => {
    setSelection({ kind: 'connection', id: connectionId })
  }, [])

  const selectNode = useCallback((nodeId: NodeId) => {
    setSelection({ kind: 'node', id: nodeId })
  }, [])

  const deleteConnection = useCallback((connectionId: string) => {
    setConnections((prev) => {
      const connection = prev.find((item) => item.id === connectionId)
      if (connection) {
        const entry: MemoryBinEntry = {
          id: `bin-${Date.now()}-${connectionId}`,
          kind: 'connection',
          deletedAt: Date.now(),
          connection,
        }
        addToMemoryBin(entry)
        setMemoryBin(loadMemoryBin())
      }
      return prev.filter((item) => item.id !== connectionId)
    })
    setSelection((prev) =>
      prev?.kind === 'connection' && prev.id === connectionId ? null : prev,
    )
  }, [])

  const deleteNode = useCallback((nodeId: NodeId) => {
    setNodes((prev) => {
      const node = prev.find((item) => item.id === nodeId)
      if (!node) return prev

      setConnections((prevConnections) => {
        const relatedConnections = prevConnections.filter(
          (connection) => connection.from === nodeId || connection.to === nodeId,
        )
        const entry: MemoryBinEntry = {
          id: `bin-${Date.now()}-${nodeId}`,
          kind: 'node',
          deletedAt: Date.now(),
          node,
          relatedConnections,
        }
        addToMemoryBin(entry)
        setMemoryBin(loadMemoryBin())
        return prevConnections.filter(
          (connection) => connection.from !== nodeId && connection.to !== nodeId,
        )
      })

      nodeRefs.current.delete(nodeId)
      return prev.filter((item) => item.id !== nodeId)
    })
    setSelection((prev) => (prev?.kind === 'node' && prev.id === nodeId ? null : prev))
  }, [])

  const deleteSelection = useCallback(() => {
    if (!selection) return
    if (selection.kind === 'connection') deleteConnection(selection.id)
    if (selection.kind === 'node') deleteNode(selection.id)
  }, [deleteConnection, deleteNode, selection])

  const restoreFromBin = useCallback((entryId: string) => {
    const entry = removeFromMemoryBin(entryId)
    if (!entry) return

    if (entry.kind === 'node') {
      setNodes((prev) => {
        if (nodeExistsInCanvas(prev, entry.node.id)) return prev
        return [...prev, entry.node]
      })
      setConnections((prev) => {
        const next = [...prev]
        entry.relatedConnections.forEach((connection) => {
          if (!connectionEndpointExists(next, connection.from, connection.to, connection.fromPort ?? defaultFromPort(), connection.toPort ?? defaultToPort())) {
            next.push(connection)
          }
        })
        return next
      })
    }

    if (entry.kind === 'connection') {
      setConnections((prev) => {
        const { connection } = entry
        const nodesSnapshot = nodes
        const fromExists = nodeExistsInCanvas(nodesSnapshot, connection.from)
        const toExists = nodeExistsInCanvas(nodesSnapshot, connection.to)
        if (!fromExists || !toExists) return prev
        if (connectionEndpointExists(prev, connection.from, connection.to, connection.fromPort ?? defaultFromPort(), connection.toPort ?? defaultToPort())) return prev
        return [...prev, connection]
      })
    }

    setMemoryBin(loadMemoryBin())
  }, [nodes])

  const emptyMemoryBin = useCallback(() => {
    clearMemoryBin()
    setMemoryBin([])
  }, [])

  const selectedConnectionId = selection?.kind === 'connection' ? selection.id : null
  const selectedNodeId = selection?.kind === 'node' ? selection.id : null

  useEffect(() => {
    if (!selection) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const target = event.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          return
        }
        event.preventDefault()
        deleteSelection()
      }
      if (event.key === 'Escape') {
        clearSelection()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clearSelection, deleteSelection, selection])

  const upsertConnection = useCallback(
    (from: NodeId, to: NodeId, fromPort: PortSide = defaultFromPort(), toPort: PortSide = defaultToPort()) => {
      setConnections((prev) => {
        const existing = prev.find(
          (connection) =>
            connection.from === from &&
            connection.to === to &&
            (connection.fromPort ?? defaultFromPort()) === fromPort &&
            (connection.toPort ?? defaultToPort()) === toPort,
        )
        if (existing) {
          return prev.map((connection) =>
            connection.id === existing.id ? { ...connection, plugged: true } : connection,
          )
        }
        return [
          ...prev,
          { id: `c-${Date.now()}`, from, to, fromPort, toPort, plugged: true },
        ]
      })
    },
    [],
  )

  const setHoverPortSafe = useCallback((port: { nodeId: NodeId; port: PortSide } | null) => {
    hoverPortRef.current = port
    setHoverPort(port)
  }, [])

  const startNodeDrag = useCallback(
    (nodeId: NodeId, event: ReactPointerEvent<HTMLElement>) => {
      const canvas = canvasRef.current
      const node = nodes.find((item) => item.id === nodeId)
      if (!canvas || !node) return

      event.preventDefault()
      event.stopPropagation()

      const point = getCanvasPoint(
        event.clientX,
        event.clientY,
        canvas,
        zoomRef.current,
        panOffsetRef.current,
      )
      setDragState({
        nodeId,
        offsetX: point.x - node.x,
        offsetY: point.y - node.y,
        nodeWidth: node.width,
        nodeHeight: measuredHeightsRef.current[nodeId] ?? node.height,
      })
    },
    [nodes],
  )

  const startWireDrag = useCallback(
    (nodeId: NodeId, port: PortSide, event: ReactPointerEvent<HTMLButtonElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      event.preventDefault()
      event.stopPropagation()

      const point = getCanvasPoint(
        event.clientX,
        event.clientY,
        canvas,
        zoomRef.current,
        panOffsetRef.current,
      )
      setWireDraft({
        fromNodeId: nodeId,
        fromPort: port,
        x: point.x,
        y: point.y,
      })
      wireDraftRef.current = {
        fromNodeId: nodeId,
        fromPort: port,
        x: point.x,
        y: point.y,
      }
      setHoverPortSafe(null)
    },
    [setHoverPortSafe],
  )

  useEffect(() => {
    if (!dragState) return

    const onPointerMove = (event: PointerEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const point = getCanvasPoint(
        event.clientX,
        event.clientY,
        canvas,
        zoomRef.current,
        panOffsetRef.current,
      )
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id !== dragState.nodeId) return node
          const height = measuredHeightsRef.current[node.id] ?? dragState.nodeHeight
          const next = clampNodePosition(
            point.x - dragState.offsetX,
            point.y - dragState.offsetY,
            dragState.nodeWidth,
            height,
            panOffsetRef.current,
            zoomRef.current,
          )
          return { ...node, x: next.x, y: next.y }
        }),
      )
    }

    const onPointerUp = () => {
      setDragState(null)
      measureNodes()
      window.requestAnimationFrame(() => {
        scheduleAutoSave(nodesRef.current, connectionsRef.current, true)
      })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [dragState, measureNodes, scheduleAutoSave])

  useEffect(() => {
    if (!wireDraft) return

    const onPointerMove = (event: PointerEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const point = getCanvasPoint(
        event.clientX,
        event.clientY,
        canvas,
        zoomRef.current,
        panOffsetRef.current,
      )
      setWireDraft((prev) => {
        if (!prev) return prev
        const next = { ...prev, x: point.x, y: point.y }
        wireDraftRef.current = next
        return next
      })

      const draft = wireDraftRef.current
      if (!draft) return

      const nearest = findNearestPort(
        point,
        draft.fromNodeId,
        nodesRef.current,
        measuredHeightsRef.current,
      )
      setHoverPortSafe(nearest)
    }

    const cancelWire = () => {
      wireDraftRef.current = null
      setWireDraft(null)
      setHoverPortSafe(null)
    }

    const finishWire = () => {
      const targetPort = hoverPortRef.current
      const draft = wireDraftRef.current

      if (targetPort && draft) {
        const fromNode = nodes.find((node) => node.id === draft.fromNodeId)
        const toNode = nodes.find((node) => node.id === targetPort.nodeId)
        if (fromNode && toNode && canConnect(fromNode, toNode, draft.fromPort, targetPort.port)) {
          upsertConnection(draft.fromNodeId, targetPort.nodeId, draft.fromPort, targetPort.port)
        }
      }

      cancelWire()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelWire()
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', finishWire)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', finishWire)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [nodes, setHoverPortSafe, upsertConnection, Boolean(wireDraft)])

  const wireDraftPath = useMemo(() => {
    if (!wireDraft) return null
    const origin = getPort(wireDraft.fromNodeId, wireDraft.fromPort)
    let end = { x: wireDraft.x, y: wireDraft.y }

    if (hoverPort && hoverPort.nodeId !== wireDraft.fromNodeId) {
      const targetNode = nodes.find((node) => node.id === hoverPort.nodeId)
      if (targetNode) {
        end = getPortPosition(targetNode, hoverPort.port, measuredHeights[hoverPort.nodeId])
      }
    }

    return buildDraftWirePath(origin, end, wireDraft.fromPort)
  }, [getPort, hoverPort, measuredHeights, nodes, wireDraft])

  const addCard = useCallback((cardType: CardType) => {
    setNodes((prev) => {
      const nextNode = createCardNode(cardType, prev)
      setSelection({ kind: 'node', id: nextNode.id })
      scheduleAutoSave([...prev, nextNode], connectionsRef.current, true)
      return [...prev, nextNode]
    })
  }, [scheduleAutoSave])

  return {
    canvasRef,
    surfaceRef,
    nodes,
    connections,
    memoryBin,
    saveStatus,
    lastSavedAt,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    panState,
    panOffset,
    consumePanClick,
    measuredHeights,
    dragState,
    wireDraft,
    wireDraftPath,
    hoverPort,
    connectedCount,
    registerNodeRef,
    toggleNode,
    toggleConnectionPlug,
    selection,
    selectedConnectionId,
    selectedNodeId,
    hoveredConnectionId,
    selectConnection,
    selectNode,
    deleteConnection,
    deleteNode,
    deleteSelection,
    clearSelection,
    restoreFromBin,
    emptyMemoryBin,
    setHoveredConnectionId,
    startNodeDrag,
    startWireDrag,
    addCard,
    setHoverPort: setHoverPortSafe,
  }
}
