import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  ArchiveRestore,
  Bot,
  Calendar,
  ChevronDown,
  Code2,
  GitBranch,
  Globe,
  GripVertical,
  LayoutGrid,
  Link2,
  Hand,
  MessageCircle,
  Mic,
  MousePointer2,
  PenLine,
  Plug,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Type,
  Unplug,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  type Connection,
  type DiagramNode,
  type NavTabId,
  type NodeId,
  type CardType,
  CARD_TYPE_OPTIONS,
  ALL_PORT_SIDES,
  buildBezierPath,
  buildPortSlotMaps,
  getDistributedPortPosition,
  isConnectionLive,
  resolveFromPort,
  resolveToPort,
  type PortSide,
  navTabs,
  sidebarInProgress,
  sidebarReady,
} from './nerveCenterData'
import { formatSavedTime, CANVAS_BASE_HEIGHT, CANVAS_BASE_WIDTH, type MemoryBinEntry } from './diagramStorage'
import { useDiagramCanvas } from './useDiagramCanvas'

const navIcons: Record<NavTabId, typeof LayoutGrid> = {
  overview: LayoutGrid,
  workflows: GitBranch,
  connections: Plug,
  schedule: Calendar,
  integrations: Link2,
  settings: Settings,
}

function Toggle({
  active,
  onChange,
  label,
}: {
  active: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onChange()
      }}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        active ? 'bg-violet-500' : 'bg-white/15'
      }`}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          active ? 'translate-x-[1.125rem]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

const portPositionClasses: Record<PortSide, string> = {
  left: 'top-1/2 -left-[5px] -translate-y-1/2',
  right: 'top-1/2 -right-[5px] -translate-y-1/2',
  top: 'left-1/2 -top-[5px] -translate-x-1/2',
  bottom: 'left-1/2 -bottom-[5px] -translate-x-1/2',
}

const portLabels: Record<PortSide, string> = {
  left: 'Input port (left)',
  right: 'Output port (right)',
  top: 'Input port (top)',
  bottom: 'Output port (bottom)',
}

function Port({
  port,
  active,
  highlighted,
  connectable,
  isDropTarget,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}: {
  port: PortSide
  active: boolean
  highlighted: boolean
  connectable: boolean
  isDropTarget: boolean
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onPointerEnter: () => void
  onPointerLeave: () => void
}) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      aria-label={portLabels[port]}
      className={`nerve-port absolute z-30 flex items-center justify-center rounded-full transition-[transform,box-shadow,background-color] duration-200 ${portPositionClasses[port]} ${
        connectable || isDropTarget ? 'cursor-crosshair nerve-port-connectable' : 'cursor-crosshair'
      } ${isDropTarget ? 'scale-125' : ''}`}
      style={{ width: 20, height: 20, margin: 0, padding: 0, border: 'none', background: 'transparent' }}
    >
      <span
        className={`block rounded-full transition-all duration-200 ${
          isDropTarget
            ? 'h-2.5 w-2.5 bg-violet-300 shadow-[0_0_14px_rgba(167,139,250,0.95)]'
            : highlighted
              ? 'h-2.5 w-2.5 bg-violet-400/70 shadow-[0_0_12px_rgba(139,92,246,0.75)]'
              : active
                ? 'h-2 w-2 bg-violet-500/35 shadow-[0_0_10px_rgba(139,92,246,0.4)] ring-2 ring-violet-400/20'
                : 'h-2 w-2 bg-zinc-500'
        }`}
      />
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium text-white/45">{children}</label>
  )
}

function SelectField({ value, options }: { value: string; options: string[] }) {
  return (
    <div className="relative" onPointerDown={(event) => event.stopPropagation()}>
      <select
        defaultValue={value}
        className="w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 pr-8 text-xs text-white/75 outline-none transition focus:border-violet-400/40"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#12121a]">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30" />
    </div>
  )
}

function TextField({ value, placeholder }: { value?: string; placeholder?: string }) {
  return (
    <input
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      onPointerDown={(event) => event.stopPropagation()}
      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/75 outline-none transition placeholder:text-white/25 focus:border-violet-400/40"
    />
  )
}

function TriggersNodeContent() {
  return (
    <div className="space-y-3">
      <FieldLabel>Event Source</FieldLabel>
      <SelectField value="Webhook" options={['Webhook', 'Schedule', 'Manual', 'API Poll']} />
      <FieldLabel>Endpoint URL</FieldLabel>
      <TextField value="https://api.source.io/hooks/ord" />
      <FieldLabel>Payload Type</FieldLabel>
      <SelectField value="JSON" options={['JSON', 'Form Data', 'XML']} />
      <FieldLabel>Auth Method</FieldLabel>
      <SelectField value="Bearer Token" options={['Bearer Token', 'API Key', 'OAuth 2.0', 'None']} />
    </div>
  )
}

function HubNodeContent({ connectedCount }: { connectedCount: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-violet-400/20 bg-violet-500/[0.08] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/20">
            <Zap size={14} className="text-violet-300" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-white/80">Nerve Center</p>
            <p className="text-[10px] text-white/35">{connectedCount} systems plugged in</p>
          </div>
        </div>
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      </div>
      <FieldLabel>Routing Mode</FieldLabel>
      <SelectField value="Parallel dispatch" options={['Parallel dispatch', 'Sequential', 'Conditional']} />
      <FieldLabel>Retry Policy</FieldLabel>
      <SelectField value="3 attempts · 30s backoff" options={['3 attempts · 30s backoff', '5 attempts · 60s', 'No retry']} />
    </div>
  )
}

function IntegrationNodeContent({
  provider,
  active,
  onToggle,
}: {
  provider: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wider text-white/40">
          {provider}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium ${active ? 'text-emerald-400' : 'text-white/30'}`}>
            {active ? 'Active' : 'Inactive'}
          </span>
          <Toggle active={active} onChange={onToggle} label={`Toggle ${provider} integration`} />
        </div>
      </div>
      <FieldLabel>API Key / Token</FieldLabel>
      <TextField value="sk_live_••••••••••••4f2a" />
      <FieldLabel>Environment</FieldLabel>
      <SelectField value="Production" options={['Production', 'Sandbox', 'Staging']} />
      {!active && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-2 text-[10px] text-white/35">
          <Unplug size={12} />
          Unplugged — toggle to activate
        </div>
      )}
    </div>
  )
}

function AgentCardContent({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 rounded-md border border-violet-400/20 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-wider text-violet-300">
          <Bot size={11} />
          Agent
        </span>
        <Toggle active={active} onChange={onToggle} label="Toggle agent" />
      </div>
      <FieldLabel>Agent Name</FieldLabel>
      <TextField value="Workflow Assistant" />
      <FieldLabel>Model</FieldLabel>
      <SelectField value="GPT-5" options={['GPT-5', 'Claude', 'Gemini']} />
      <FieldLabel>Instructions</FieldLabel>
      <TextField placeholder="Describe agent behavior…" />
    </div>
  )
}

function ApiCardContent({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 rounded-md border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-[10px] uppercase tracking-wider text-sky-300">
          <Code2 size={11} />
          API
        </span>
        <Toggle active={active} onChange={onToggle} label="Toggle API" />
      </div>
      <FieldLabel>Endpoint</FieldLabel>
      <TextField value="https://api.example.com/v1" />
      <FieldLabel>Method</FieldLabel>
      <SelectField value="POST" options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE']} />
      <FieldLabel>Auth</FieldLabel>
      <SelectField value="Bearer Token" options={['Bearer Token', 'API Key', 'OAuth 2.0', 'None']} />
    </div>
  )
}

function PortalCardContent({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-300">
          <Globe size={11} />
          Portal
        </span>
        <Toggle active={active} onChange={onToggle} label="Toggle portal" />
      </div>
      <FieldLabel>Portal Name</FieldLabel>
      <TextField value="Customer Hub" />
      <FieldLabel>URL</FieldLabel>
      <TextField value="https://portal.source.io" />
      <FieldLabel>Access</FieldLabel>
      <SelectField value="Authenticated" options={['Public', 'Authenticated', 'SSO Only']} />
    </div>
  )
}

function OutputNodeContent() {
  const actions = ['Send Email', 'Send SMS', 'Webhook Out', 'CRM Sync']
  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-left text-[11px] text-white/65 transition hover:border-violet-400/30 hover:bg-violet-500/[0.06] hover:text-white/85"
        >
          {action}
          <ChevronDown size={12} className="-rotate-90 text-white/25" />
        </button>
      ))}
    </div>
  )
}

function DiagramNodeCard({
  node,
  isDragging,
  isSelected,
  wireDraftActive,
  wireDraftFrom,
  connectMode,
  hoverPort,
  consumePanClick,
  onRegisterRef,
  onDragStart,
  onSelect,
  onDelete,
  onToggle,
  onPortPointerDown,
  onPortEnter,
  onPortLeave,
  connectedCount,
}: {
  node: DiagramNode
  isDragging: boolean
  isSelected: boolean
  wireDraftActive: boolean
  wireDraftFrom: { nodeId: NodeId; port: PortSide } | null
  connectMode: boolean
  hoverPort: { nodeId: NodeId; port: PortSide } | null
  consumePanClick: () => boolean
  onRegisterRef: (id: NodeId, element: HTMLDivElement | null) => void
  onDragStart: (nodeId: NodeId, event: ReactPointerEvent<HTMLElement>) => void
  onSelect: (nodeId: NodeId) => void
  onDelete: (nodeId: NodeId) => void
  onToggle: (nodeId: NodeId) => void
  onPortPointerDown: (nodeId: NodeId, port: PortSide, event: ReactPointerEvent<HTMLButtonElement>) => void
  onPortEnter: (nodeId: NodeId, port: PortSide) => void
  onPortLeave: () => void
  connectedCount?: number
}) {
  const dimmed = node.category === 'integration' && !node.active
  const isWireSource = wireDraftFrom?.nodeId === node.id

  return (
    <div
      ref={(element) => onRegisterRef(node.id, element)}
      onClick={(event) => {
        if (consumePanClick()) return
        const target = event.target as HTMLElement
        if (target.closest('[data-no-select]')) return
        event.stopPropagation()
        onSelect(node.id)
      }}
      className={`nerve-node absolute select-none rounded-2xl border p-4 ${
        isDragging
          ? 'z-40 cursor-grabbing nerve-node-dragging'
          : isSelected
            ? 'z-30'
            : 'z-10'
      } ${isSelected ? 'nerve-node-selected nerve-node-delete-ready' : ''} ${
        dimmed ? 'nerve-node-dimmed opacity-75' : 'nerve-node-active'
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: node.height,
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease, opacity 0.2s ease, border-color 0.2s ease',
      }}
    >
      {ALL_PORT_SIDES.map((port) => {
        const isDropTarget =
          wireDraftActive &&
          hoverPort?.nodeId === node.id &&
          hoverPort.port === port &&
          !isWireSource
        const isSourcePort = isWireSource && wireDraftFrom?.port === port

        return (
          <Port
            key={port}
            port={port}
            active={node.active}
            highlighted={isSourcePort || (wireDraftActive && isDropTarget)}
            connectable={connectMode || wireDraftActive}
            isDropTarget={isDropTarget}
            onPointerDown={(event) => onPortPointerDown(node.id, port, event)}
            onPointerEnter={() => onPortEnter(node.id, port)}
            onPointerLeave={onPortLeave}
          />
        )
      })}

      <div
        className="nerve-node-drag-handle nerve-node-header -mx-1 mb-3 flex cursor-grab items-center gap-2 rounded-lg px-1 py-1 active:cursor-grabbing"
        data-no-select
        onPointerDown={(event) => onDragStart(node.id, event)}
      >
        <GripVertical size={14} className="shrink-0 text-white/20" />
        <div className="min-w-0 flex-1 pointer-events-none">
          <h3 className="text-sm font-semibold text-white/90">{node.title}</h3>
          {node.provider && (
            <p className="mt-0.5 text-[10px] text-white/35">{node.provider}</p>
          )}
        </div>
        {isSelected && (
          <button
            type="button"
            data-no-select
            title="Delete node"
            aria-label={`Delete ${node.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onDelete(node.id)
            }}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-400/45 bg-red-500/15 text-red-300 transition hover:border-red-300/60 hover:bg-red-500/25 hover:text-white"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div data-no-select onPointerDown={(event) => event.stopPropagation()}>
        {node.id === 'triggers' && <TriggersNodeContent />}
        {node.id === 'hub' && <HubNodeContent connectedCount={connectedCount ?? 0} />}
        {node.cardType === 'agent' && (
          <AgentCardContent active={node.active} onToggle={() => onToggle(node.id)} />
        )}
        {node.cardType === 'api' && (
          <ApiCardContent active={node.active} onToggle={() => onToggle(node.id)} />
        )}
        {node.cardType === 'portal' && (
          <PortalCardContent active={node.active} onToggle={() => onToggle(node.id)} />
        )}
        {!node.cardType && node.category === 'integration' && (
          <IntegrationNodeContent
            provider={node.provider ?? 'API'}
            active={node.active}
            onToggle={() => onToggle(node.id)}
          />
        )}
        {node.id === 'output' && <OutputNodeContent />}
      </div>
    </div>
  )
}

function ConnectionLayer({
  nodes,
  connections,
  measuredHeights,
  wireDraftPath,
  selectedConnectionId,
  selectedNodeId,
  hoveredConnectionId,
  consumePanClick,
  onSelect,
  onHover,
  onDelete,
}: {
  nodes: DiagramNode[]
  connections: Connection[]
  measuredHeights: Partial<Record<NodeId, number>>
  wireDraftPath: string | null
  selectedConnectionId: string | null
  selectedNodeId: NodeId | null
  hoveredConnectionId: string | null
  consumePanClick: () => boolean
  onSelect: (connectionId: string) => void
  onHover: (connectionId: string | null) => void
  onDelete: (connectionId: string) => void
}) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const portSlots = useMemo(
    () => buildPortSlotMaps(connections, nodes, measuredHeights),
    [connections, measuredHeights, nodes],
  )

  const orderedConnections = useMemo(() => {
    const isHighlighted = (connection: Connection) =>
      connection.id === selectedConnectionId ||
      (selectedNodeId !== null &&
        (connection.from === selectedNodeId || connection.to === selectedNodeId))

    const normal = connections.filter((connection) => !isHighlighted(connection))
    const highlighted = connections.filter((connection) => isHighlighted(connection))
    return [...normal, ...highlighted]
  }, [connections, selectedConnectionId, selectedNodeId])

  return (
    <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible">
      <defs>
        <linearGradient id="nerve-line-active" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="nerve-line-selected" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
          <stop offset="50%" stopColor="#f87171" stopOpacity="1" />
          <stop offset="100%" stopColor="#fca5a5" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="nerve-line-node-delete" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="1" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="nerve-line-draft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e879f9" stopOpacity="0.75" />
        </linearGradient>
        <filter id="nerve-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="nerve-glow-strong" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="nerve-glow-red" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {orderedConnections.map((connection) => {
        const fromNode = nodeMap.get(connection.from)
        const toNode = nodeMap.get(connection.to)
        if (!fromNode || !toNode) return null

        const fromHeight = measuredHeights[connection.from]
        const toHeight = measuredHeights[connection.to]
        const fromPort = resolveFromPort(connection, fromNode, toNode, fromHeight, toHeight)
        const toPort = resolveToPort(connection, fromNode, toNode, fromHeight, toHeight)
        const fromSlot = portSlots.from.get(connection.id) ?? { index: 0, total: 1 }
        const toSlot = portSlots.to.get(connection.id) ?? { index: 0, total: 1 }
        const from = getDistributedPortPosition(fromNode, fromPort, fromHeight, fromSlot.index, fromSlot.total)
        const to = getDistributedPortPosition(toNode, toPort, toHeight, toSlot.index, toSlot.total)
        const path = buildBezierPath(from, to, fromPort, toPort)
        const live = isConnectionLive(connection, nodes)
        const selected = selectedConnectionId === connection.id
        const hovered = hoveredConnectionId === connection.id
        const linkedToSelectedNode =
          selectedNodeId !== null &&
          (connection.from === selectedNodeId || connection.to === selectedNodeId)

        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2

        let stroke = live ? 'url(#nerve-line-active)' : 'rgba(167, 139, 250, 0.72)'
        let strokeWidth = live ? 2.5 : 2
        let filter: string | undefined = 'url(#nerve-glow)'
        let dasharray: string | undefined

        if (hovered && !selected && !linkedToSelectedNode) {
          stroke = live ? '#c4b5fd' : 'rgba(196, 181, 253, 0.85)'
          strokeWidth = 3
        }

        if (linkedToSelectedNode && !selected) {
          stroke = 'url(#nerve-line-node-delete)'
          strokeWidth = 3.5
          filter = 'url(#nerve-glow-red)'
        }

        if (selected) {
          stroke = 'url(#nerve-line-selected)'
          strokeWidth = 4
          filter = 'url(#nerve-glow-red)'
          dasharray = undefined
        }

        return (
          <g key={connection.id}>
            {(selected || linkedToSelectedNode) && (
              <path
                d={path}
                fill="none"
                stroke="rgba(239, 68, 68, 0.18)"
                strokeWidth={10}
                strokeLinecap="round"
                className="pointer-events-none"
              />
            )}
            <path
              d={path}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={dasharray}
              filter={filter}
            />
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              data-nerve-wire-hit
              className="pointer-events-auto cursor-pointer"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                if (consumePanClick()) return
                event.stopPropagation()
                onSelect(connection.id)
              }}
              onMouseEnter={() => onHover(connection.id)}
              onMouseLeave={() => onHover(null)}
            />
            {selected && (
              <foreignObject
                x={midX - 52}
                y={midY - 16}
                width={104}
                height={32}
                className="pointer-events-auto overflow-visible"
              >
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(connection.id)
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-red-400/40 bg-[#1a0808]/95 px-3 py-1.5 text-[10px] font-medium text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.35)] backdrop-blur-md transition hover:border-red-300/60 hover:bg-red-500/20 hover:text-white"
                >
                  <Trash2 size={11} />
                  Delete wire
                </button>
              </foreignObject>
            )}
          </g>
        )
      })}

      {wireDraftPath && (
        <path
          d={wireDraftPath}
          fill="none"
          stroke="url(#nerve-line-draft)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="6 4"
          filter="url(#nerve-glow)"
          className="pointer-events-none"
        />
      )}
    </svg>
  )
}

function Sidebar({
  prompt,
  onPromptChange,
  promptModel,
  onPromptModelChange,
  memoryBin,
  saveStatus,
  lastSavedAt,
  onRestoreFromBin,
  onEmptyBin,
}: {
  prompt: string
  onPromptChange: (value: string) => void
  promptModel: string
  onPromptModelChange: (model: string) => void
  memoryBin: MemoryBinEntry[]
  saveStatus: 'idle' | 'saving' | 'saved'
  lastSavedAt: number | null
  onRestoreFromBin: (entryId: string) => void
  onEmptyBin: () => void
}) {
  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : lastSavedAt
        ? `Saved ${formatSavedTime(lastSavedAt)}`
        : 'Session save ready'

  return (
    <aside className="nerve-sidebar flex w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#07070d]/95">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="mb-3">
          <Link
            to="/platform"
            className="text-[10px] font-medium uppercase tracking-wider text-white/30 transition hover:text-violet-300"
          >
            ← Back to Platform
          </Link>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <Sparkles size={16} className="text-white" />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">Source Hub</span>
        </div>
      </div>

      <div className="border-b border-white/[0.06] px-4 py-4">
        <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
          Workflow Prompt
        </h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={3}
            placeholder="Describe your automation workflow..."
            className="w-full resize-none bg-transparent text-xs leading-relaxed text-white/70 outline-none placeholder:text-white/25"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <PromptModelMenu value={promptModel} onChange={onPromptModelChange} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Voice input"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 transition hover:text-white/70"
              >
                <Mic size={14} />
              </button>
              <button
                type="button"
                aria-label="Send prompt"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_16px_rgba(139,92,246,0.45)] transition hover:brightness-110"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section className="mb-6">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Canvas Guide
          </h2>
          <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.06] p-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/15 text-violet-300">
                <Plug size={14} strokeWidth={1.5} />
              </span>
              <p className="text-[10px] leading-relaxed text-white/50">
                Select the{' '}
                <span className="font-medium text-violet-300">plug icon</span> in the left toolbar to
                add a new card — choose Agent, API, or Portal from the menu.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Memory Storage
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                saveStatus === 'saving'
                  ? 'border border-violet-400/30 bg-violet-400/10 text-violet-300'
                  : 'border border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
              }`}
            >
              {saveLabel}
            </span>
          </div>
          <p className="mb-3 text-[10px] leading-relaxed text-white/35">
            Edits auto-save during this session · refresh restores the default workflow canvas.
          </p>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              <Archive size={11} />
              Memory Bin
              {memoryBin.length > 0 && (
                <span className="rounded-full bg-fuchsia-500/20 px-1.5 py-0.5 text-[9px] text-fuchsia-300">
                  {memoryBin.length}
                </span>
              )}
            </h2>
            {memoryBin.length > 0 && (
              <button
                type="button"
                onClick={onEmptyBin}
                className="text-[9px] font-medium uppercase tracking-wider text-white/30 transition hover:text-fuchsia-300"
              >
                Empty bin
              </button>
            )}
          </div>
          {memoryBin.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-3 py-4 text-center text-[10px] text-white/30">
              Deleted nodes and wires appear here for restore
            </div>
          ) : (
            <div className="space-y-2">
              {memoryBin.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-fuchsia-400/25"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white/80">
                        {entry.kind === 'node' ? entry.node.title : 'Wire connection'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/35">
                        {entry.kind === 'node'
                          ? `${entry.relatedConnections.length} wire${entry.relatedConnections.length === 1 ? '' : 's'} attached`
                          : `${entry.connection.from} → ${entry.connection.to}`}
                      </p>
                      <p className="mt-1 text-[10px] text-white/25">
                        Removed {formatSavedTime(entry.deletedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Restore to canvas"
                      aria-label="Restore to canvas"
                      onClick={() => onRestoreFromBin(entry.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/10 text-violet-300 transition hover:border-violet-300/40 hover:bg-violet-500/20 hover:text-white"
                    >
                      <ArchiveRestore size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            In Progress
          </h2>
          <div className="space-y-2">
            {sidebarInProgress.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-violet-400/20"
              >
                <p className="text-xs font-medium text-white/80">{item.title}</p>
                <p className="mt-1 text-[10px] text-white/35">{item.meta}</p>
                <p className="mt-2 text-[10px] text-white/25">{item.time}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Ready for Review
          </h2>
          <div className="space-y-2">
            {sidebarReady.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-violet-400/20"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-white/80">{item.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                      item.badgeTone === 'green'
                        ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                        : 'border border-violet-400/30 bg-violet-400/10 text-violet-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="text-[10px] text-white/35">{item.meta}</p>
                <p className="mt-2 text-[10px] text-white/25">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}

function TopNav({
  activeTab,
  onTabChange,
}: {
  activeTab: NavTabId
  onTabChange: (tab: NavTabId) => void
}) {
  return (
    <nav className="flex shrink-0 items-center gap-1 border-b border-white/[0.06] px-5 py-2">
      {navTabs.map(({ id, label }) => {
        const Icon = navIcons[id]
        const active = activeTab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
              active ? 'text-violet-300' : 'text-white/40 hover:text-white/65'
            }`}
          >
            <Icon size={14} strokeWidth={1.5} />
            {label}
            {active && (
              <span className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

type BoardToolId = 'select' | 'connect' | 'pan' | 'text' | 'draw' | 'comment'

const PROMPT_MODEL_OPTIONS = ['GPT-5', 'Claude', 'Cursor', 'OpenClaw'] as const

function PromptModelMenu({
  value,
  onChange,
}: {
  value: string
  onChange: (model: string) => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Select model"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] transition ${
          open
            ? 'border-violet-400/30 bg-violet-500/10 text-violet-300'
            : 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-white/[0.12] hover:text-white/70'
        }`}
      >
        {value}
        <ChevronDown size={10} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Model options"
          className="absolute left-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-white/10 bg-[#0d0d16]/95 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          {PROMPT_MODEL_OPTIONS.map((model) => {
            const selected = model === value
            return (
              <button
                key={model}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(model)
                  setOpen(false)
                }}
                className={`flex w-full px-3 py-2 text-left text-[10px] transition ${
                  selected
                    ? 'bg-violet-500/15 font-medium text-violet-300'
                    : 'text-white/60 hover:bg-white/[0.06] hover:text-white/85'
                }`}
              >
                {model}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const cardTypeIcons: Record<CardType, typeof Bot> = {
  agent: Bot,
  api: Code2,
  portal: Globe,
}

function AddCardMenu({
  onAddCard,
}: {
  onAddCard: (type: CardType) => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        title="Add card — Agent, API, or Portal"
        aria-label="Add card — Agent, API, or Portal"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          open
            ? 'bg-violet-500/20 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
            : 'text-white/40 hover:bg-white/[0.06] hover:text-white/75'
        }`}
      >
        <Plug size={16} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-full top-0 z-50 ml-2 min-w-[168px] overflow-hidden rounded-xl border border-white/10 bg-[#0d0d16]/95 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Add Card
          </p>
          {CARD_TYPE_OPTIONS.map(({ id, label, description }) => {
            const Icon = cardTypeIcons[id]
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onAddCard(id)
                  setOpen(false)
                }}
                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition hover:bg-violet-500/10"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-violet-300">
                  <Icon size={14} strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block text-xs font-medium text-white/85">{label}</span>
                  <span className="mt-0.5 block text-[10px] text-white/35">{description}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BoardToolbar({
  activeTool,
  onToolChange,
  onAddCard,
  hasSelection,
  onDeleteSelection,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: {
  activeTool: BoardToolId
  onToolChange: (tool: BoardToolId) => void
  onAddCard: (type: CardType) => void
  hasSelection: boolean
  onDeleteSelection: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}) {
  const primaryTools: { id: BoardToolId; icon: typeof MousePointer2; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'connect', icon: Link2, label: 'Connect wire' },
    { id: 'pan', icon: Hand, label: 'Pan canvas' },
  ]

  const secondaryTools: { id: BoardToolId; icon: typeof MousePointer2; label: string }[] = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'draw', icon: PenLine, label: 'Draw' },
    { id: 'comment', icon: MessageCircle, label: 'Comment' },
  ]

  return (
    <aside className="nerve-board-toolbar z-20 flex w-12 shrink-0 flex-col items-center border-r border-white/[0.06] bg-[#0a0a12]/90 py-3 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-1">
        {primaryTools.map(({ id, icon: Icon, label }) => {
          const active = activeTool === id
          return (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active}
              onClick={() => onToolChange(id)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                active
                  ? 'bg-violet-500/20 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                  : 'text-white/40 hover:bg-white/[0.06] hover:text-white/75'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
            </button>
          )
        })}
        <AddCardMenu onAddCard={onAddCard} />
      </div>

      <div className="my-2 h-px w-6 bg-white/[0.08]" />

      <div className="flex flex-col items-center gap-1">
        {secondaryTools.map(({ id, icon: Icon, label }) => {
          const active = activeTool === id
          return (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active}
              onClick={() => onToolChange(id)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                active
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-white/40 hover:bg-white/[0.06] hover:text-white/75'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
            </button>
          )
        })}
      </div>

      <div className="my-2 h-px w-6 bg-white/[0.08]" />

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          title="Zoom in"
          aria-label="Zoom in"
          onClick={onZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white/75"
        >
          <ZoomIn size={16} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          title="Reset zoom to 100%"
          aria-label="Reset zoom"
          onClick={onResetZoom}
          className="flex h-8 min-w-[2.25rem] items-center justify-center rounded-lg px-1 text-[9px] font-semibold tabular-nums text-white/45 transition hover:bg-white/[0.06] hover:text-violet-300"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          title="Zoom out"
          aria-label="Zoom out"
          onClick={onZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white/75"
        >
          <ZoomOut size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 pt-2">
        <button
          type="button"
          title={hasSelection ? 'Delete selected' : 'Delete selected (none selected)'}
          aria-label="Delete selected"
          disabled={!hasSelection}
          onClick={onDeleteSelection}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            hasSelection
              ? 'text-fuchsia-300 hover:bg-fuchsia-500/15 hover:text-fuchsia-200'
              : 'cursor-not-allowed text-white/15'
          }`}
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  )
}

function CanvasToolbar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="Deploy automation"
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_24px_rgba(139,92,246,0.55)] transition hover:scale-105 hover:brightness-110"
      >
        <Send size={18} />
      </button>
    </div>
  )
}

export default function IntegrationNerveCenter() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview')
  const [prompt, setPrompt] = useState('')
  const [promptModel, setPromptModel] = useState<string>('GPT-5')
  const [activeTool, setActiveTool] = useState<BoardToolId>('select')

  const {
    canvasRef,
    surfaceRef,
    nodes,
    connections,
    memoryBin,
    saveStatus,
    lastSavedAt,
    measuredHeights,
    dragState,
    wireDraft,
    wireDraftPath,
    hoverPort,
    connectedCount,
    registerNodeRef,
    toggleNode,
    selection,
    selectedConnectionId,
    selectedNodeId,
    hoveredConnectionId,
    selectConnection,
    selectNode,
    deleteConnection,
    deleteNode,
    deleteSelection,
    restoreFromBin,
    emptyMemoryBin,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    panState,
    panOffset,
    consumePanClick,
    setHoveredConnectionId,
    startNodeDrag,
    startWireDrag,
    addCard,
    setHoverPort,
  } = useDiagramCanvas()

  const handlePortPointerDown = useCallback(
    (nodeId: NodeId, port: PortSide, event: ReactPointerEvent<HTMLButtonElement>) => {
      if (activeTool === 'connect' || activeTool === 'select') {
        startWireDrag(nodeId, port, event)
      }
    },
    [activeTool, startWireDrag],
  )

  const connectMode = activeTool === 'connect' || Boolean(wireDraft)
  const wireDraftFrom = wireDraft
    ? { nodeId: wireDraft.fromNodeId, port: wireDraft.fromPort }
    : null

  return (
    <div className="nerve-center-shell flex h-full min-h-0 flex-1 overflow-hidden bg-[#06060c]">
      <Sidebar
        prompt={prompt}
        onPromptChange={setPrompt}
        promptModel={promptModel}
        onPromptModelChange={setPromptModel}
        memoryBin={memoryBin}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        onRestoreFromBin={restoreFromBin}
        onEmptyBin={emptyMemoryBin}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <BoardToolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onAddCard={addCard}
            hasSelection={Boolean(selection)}
            onDeleteSelection={deleteSelection}
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
          />

          <div className="relative flex min-w-0 flex-1 flex-col gap-2 overflow-hidden p-3">
          <Link
            to="/platform"
            className="shrink-0 self-start rounded-md border border-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40 transition hover:border-violet-400/30 hover:text-violet-300"
          >
            ← Back to Platform
          </Link>
          <div className="nerve-workflow-board relative min-h-0 flex-1 overflow-hidden rounded-xl border border-violet-500/20 bg-[#07070d]/80 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.08),0_8px_32px_rgba(0,0,0,0.35)]">
          {!wireDraft && !selectedConnectionId && !selectedNodeId && (
            <div className="pointer-events-none absolute left-4 top-4 z-20 flex max-w-[280px] items-start gap-2 rounded-xl border border-white/[0.08] bg-[#0a0a12]/85 px-3 py-2.5 backdrop-blur-md">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-violet-400/25 bg-violet-500/15 text-violet-300">
                <Plug size={12} strokeWidth={1.5} />
              </span>
              <p className="text-[11px] leading-relaxed text-white/55">
                Select the plug icon in the toolbar to add a new card.
              </p>
            </div>
          )}
          <div
            ref={canvasRef}
            className={`nerve-canvas absolute inset-0 overflow-hidden ${
              panState ? 'cursor-grabbing' : wireDraft ? 'cursor-crosshair' : 'cursor-grab'
            }`}
          >
            <div
              ref={surfaceRef}
              className="relative overflow-visible will-change-transform"
              style={{
                width: CANVAS_BASE_WIDTH,
                height: CANVAS_BASE_HEIGHT,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}
            >
              <ConnectionLayer
                nodes={nodes}
                connections={connections}
                measuredHeights={measuredHeights}
                wireDraftPath={wireDraftPath}
                selectedConnectionId={selectedConnectionId}
                selectedNodeId={selectedNodeId}
                hoveredConnectionId={hoveredConnectionId}
                consumePanClick={consumePanClick}
                onSelect={selectConnection}
                onHover={setHoveredConnectionId}
                onDelete={deleteConnection}
              />

              {nodes.map((node) => (
                <DiagramNodeCard
                  key={node.id}
                  node={node}
                  isDragging={dragState?.nodeId === node.id}
                  isSelected={selectedNodeId === node.id}
                  wireDraftActive={Boolean(wireDraft)}
                  wireDraftFrom={wireDraftFrom}
                  connectMode={connectMode}
                  hoverPort={hoverPort}
                  consumePanClick={consumePanClick}
                  onRegisterRef={registerNodeRef}
                  onDragStart={startNodeDrag}
                  onSelect={selectNode}
                  onDelete={deleteNode}
                  onToggle={toggleNode}
                  onPortPointerDown={handlePortPointerDown}
                  onPortEnter={(nodeId, port) => setHoverPort({ nodeId, port })}
                  onPortLeave={() => {
                    if (!wireDraft) setHoverPort(null)
                  }}
                  connectedCount={connectedCount}
                />
              ))}

              {wireDraft && (
                <div className="pointer-events-none absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-violet-400/30 bg-[#12081f]/90 px-4 py-1.5 text-[11px] text-violet-200 backdrop-blur-md">
                  Drag to any port on another node · release to connect · Esc to cancel
                </div>
              )}

              {selectedConnectionId && !wireDraft && (
                <div className="pointer-events-none absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-red-400/30 bg-[#1a0808]/90 px-4 py-1.5 text-[11px] text-red-200 backdrop-blur-md">
                  Wire selected · Delete or Backspace to remove · Esc to deselect
                </div>
              )}

              {selectedNodeId && !wireDraft && (
                <div className="pointer-events-none absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-red-400/35 bg-[#1a0808]/90 px-4 py-1.5 text-[11px] text-red-200 backdrop-blur-md">
                  Node selected · Click trash or press Delete to remove · Esc to deselect
                </div>
              )}
            </div>
          </div>

            <CanvasToolbar />
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
