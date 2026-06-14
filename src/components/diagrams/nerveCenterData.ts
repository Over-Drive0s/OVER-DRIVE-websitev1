export type NodeId = string

export type CardType = 'agent' | 'api' | 'portal'

export type NavTabId = 'overview' | 'workflows' | 'connections' | 'schedule' | 'integrations' | 'settings'

export interface DiagramNode {
  id: NodeId
  title: string
  x: number
  y: number
  width: number
  height: number
  active: boolean
  category: 'trigger' | 'hub' | 'integration' | 'output'
  cardType?: CardType
  provider?: string
}

export interface Connection {
  id: string
  from: NodeId
  to: NodeId
  fromPort?: PortSide
  toPort?: PortSide
  plugged: boolean
}

export type PortSide = 'left' | 'right' | 'top' | 'bottom'

export const ALL_PORT_SIDES: PortSide[] = ['left', 'right', 'top', 'bottom']

export type CanvasSelection =
  | { kind: 'connection'; id: string }
  | { kind: 'node'; id: NodeId }
  | null

export interface Point {
  x: number
  y: number
}

export const CARD_TYPE_OPTIONS: { id: CardType; label: string; description: string }[] = [
  { id: 'agent', label: 'Agent', description: 'AI agent workflow card' },
  { id: 'api', label: 'API', description: 'REST / webhook integration' },
  { id: 'portal', label: 'Portal', description: 'Customer or ops portal' },
]

const CARD_DEFAULTS: Record<
  CardType,
  { title: string; provider: string; width: number; height: number }
> = {
  agent: { title: 'Agent', provider: 'AI Agent', width: 248, height: 188 },
  api: { title: 'API', provider: 'REST API', width: 236, height: 172 },
  portal: { title: 'Portal', provider: 'Web Portal', width: 244, height: 180 },
}

export function createCardNode(cardType: CardType, existingNodes: DiagramNode[]): DiagramNode {
  const defaults = CARD_DEFAULTS[cardType]
  const sameTypeCount = existingNodes.filter((node) => node.cardType === cardType).length
  const slot = existingNodes.length
  const col = slot % 3
  const row = Math.floor(slot / 3)

  return {
    id: `${cardType}-${Date.now()}`,
    title: sameTypeCount > 0 ? `${defaults.title} ${sameTypeCount + 1}` : defaults.title,
    x: 180 + col * 280,
    y: 100 + row * 210,
    width: defaults.width,
    height: defaults.height,
    active: true,
    category: 'integration',
    cardType,
    provider: defaults.provider,
  }
}

export const initialNodes: DiagramNode[] = [
  {
    id: 'triggers',
    title: 'Input Triggers',
    x: 48,
    y: 120,
    width: 288,
    height: 340,
    active: true,
    category: 'trigger',
  },
  {
    id: 'hub',
    title: 'Automation Hub',
    x: 420,
    y: 200,
    width: 252,
    height: 220,
    active: true,
    category: 'hub',
  },
  {
    id: 'email',
    title: 'Email Integration',
    x: 780,
    y: 48,
    width: 236,
    height: 196,
    active: true,
    category: 'integration',
    provider: 'SendGrid',
  },
  {
    id: 'sms',
    title: 'SMS Integration',
    x: 780,
    y: 280,
    width: 236,
    height: 176,
    active: false,
    category: 'integration',
    provider: 'Twilio',
  },
  {
    id: 'stripe',
    title: 'Stripe API',
    x: 420,
    y: 500,
    width: 236,
    height: 148,
    active: true,
    category: 'integration',
    provider: 'Payments',
  },
  {
    id: 'salesforce',
    title: 'Salesforce CRM',
    x: 48,
    y: 520,
    width: 236,
    height: 148,
    active: false,
    category: 'integration',
    provider: 'Third-Party',
  },
  {
    id: 'output',
    title: 'Output Router',
    x: 1080,
    y: 140,
    width: 220,
    height: 280,
    active: true,
    category: 'output',
  },
]

export const initialConnections: Connection[] = [
  { id: 'c1', from: 'triggers', to: 'hub', plugged: true },
  { id: 'c2', from: 'hub', to: 'email', plugged: true },
  { id: 'c3', from: 'hub', to: 'sms', plugged: false },
  { id: 'c4', from: 'hub', to: 'stripe', fromPort: 'bottom', toPort: 'top', plugged: true },
  { id: 'c5', from: 'salesforce', to: 'hub', plugged: false },
  { id: 'c6', from: 'email', to: 'output', plugged: true },
  { id: 'c7', from: 'sms', to: 'output', plugged: false },
  { id: 'c8', from: 'stripe', to: 'output', plugged: true },
]

export const sidebarInProgress = [
  {
    id: '1',
    title: 'Order Confirmation Email Flow',
    meta: 'SendGrid · Webhook trigger',
    time: '23m ago',
  },
  {
    id: '2',
    title: 'Stripe Payment Webhook Sync',
    meta: 'Stripe API · Hub routing',
    time: '1h ago',
  },
]

export const sidebarReady = [
  {
    id: '3',
    title: 'Lead Capture → Salesforce',
    meta: 'CRM sync · 3 nodes connected',
    badge: 'Review Ready',
    badgeTone: 'green' as const,
    detail: 'Last sync: 2m ago',
  },
  {
    id: '4',
    title: 'SMS Appointment Reminders',
    meta: 'Twilio · Schedule trigger',
    badge: 'Draft Complete',
    badgeTone: 'purple' as const,
    detail: 'Awaiting activation',
  },
]

export const navTabs: { id: NavTabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'connections', label: 'Connections' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'settings', label: 'Settings' },
]

export function getPortPosition(
  node: DiagramNode,
  port: PortSide,
  measuredHeight?: number,
): Point {
  const height = measuredHeight ?? node.height
  const centerX = node.x + node.width / 2
  const centerY = node.y + height / 2

  switch (port) {
    case 'left':
      return { x: node.x, y: centerY }
    case 'right':
      return { x: node.x + node.width, y: centerY }
    case 'top':
      return { x: centerX, y: node.y }
    case 'bottom':
      return { x: centerX, y: node.y + height }
  }
}

export function portSlotKey(nodeId: NodeId, port: PortSide): string {
  return `${nodeId}:${port}`
}

export function getDistributedPortPosition(
  node: DiagramNode,
  port: PortSide,
  measuredHeight: number | undefined,
  slot: number,
  total: number,
): Point {
  const base = getPortPosition(node, port, measuredHeight)
  if (total <= 1) return base

  const height = measuredHeight ?? node.height
  const verticalSpread = Math.min(Math.max(height - 32, 56), 120)
  const horizontalSpread = Math.min(Math.max(node.width - 32, 56), 140)
  const step = total > 1 ? 1 / (total - 1) : 0
  const normalized = slot * step - 0.5
  const offset = normalized * (port === 'left' || port === 'right' ? verticalSpread : horizontalSpread)

  if (port === 'left' || port === 'right') {
    return { x: base.x, y: base.y + offset }
  }
  return { x: base.x + offset, y: base.y }
}

export type PortSlotMaps = {
  from: Map<string, { index: number; total: number }>
  to: Map<string, { index: number; total: number }>
}

export function buildPortSlotMaps(
  connections: Connection[],
  nodes: DiagramNode[],
  measuredHeights: Partial<Record<NodeId, number>>,
): PortSlotMaps {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const fromGroups = new Map<string, string[]>()
  const toGroups = new Map<string, string[]>()

  connections.forEach((connection) => {
    const fromNode = nodeMap.get(connection.from)
    const toNode = nodeMap.get(connection.to)
    if (!fromNode || !toNode) return

    const fromPort = resolveFromPort(
      connection,
      fromNode,
      toNode,
      measuredHeights[connection.from],
      measuredHeights[connection.to],
    )
    const toPort = resolveToPort(
      connection,
      fromNode,
      toNode,
      measuredHeights[connection.from],
      measuredHeights[connection.to],
    )

    const fromKey = portSlotKey(connection.from, fromPort)
    const toKey = portSlotKey(connection.to, toPort)
    fromGroups.set(fromKey, [...(fromGroups.get(fromKey) ?? []), connection.id])
    toGroups.set(toKey, [...(toGroups.get(toKey) ?? []), connection.id])
  })

  const from = new Map<string, { index: number; total: number }>()
  const to = new Map<string, { index: number; total: number }>()

  fromGroups.forEach((ids) => {
    ids.forEach((id, index) => from.set(id, { index, total: ids.length }))
  })
  toGroups.forEach((ids) => {
    ids.forEach((id, index) => to.set(id, { index, total: ids.length }))
  })

  return { from, to }
}

export function findNearestPort(
  point: Point,
  excludeNodeId: NodeId,
  nodes: DiagramNode[],
  measuredHeights: Partial<Record<NodeId, number>>,
  threshold = 52,
): { nodeId: NodeId; port: PortSide } | null {
  let bestNodeId: NodeId | null = null
  let bestPort: PortSide | null = null
  let bestDist = threshold

  for (const node of nodes) {
    if (node.id === excludeNodeId) continue

    for (const port of ALL_PORT_SIDES) {
      const pos = getPortPosition(node, port, measuredHeights[node.id])
      const dist = Math.hypot(point.x - pos.x, point.y - pos.y)
      if (dist <= bestDist) {
        bestDist = dist
        bestNodeId = node.id
        bestPort = port
      }
    }
  }

  if (!bestNodeId || !bestPort) return null
  return { nodeId: bestNodeId, port: bestPort }
}

export function connectionEndpointExists(
  connections: Connection[],
  from: NodeId,
  to: NodeId,
  fromPort: PortSide,
  toPort: PortSide,
): boolean {
  return connections.some(
    (connection) =>
      connection.from === from &&
      connection.to === to &&
      resolveFromPort(connection) === fromPort &&
      resolveToPort(connection) === toPort,
  )
}

function portTangent(port: PortSide): Point {
  switch (port) {
    case 'left':
      return { x: -1, y: 0 }
    case 'right':
      return { x: 1, y: 0 }
    case 'top':
      return { x: 0, y: -1 }
    case 'bottom':
      return { x: 0, y: 1 }
  }
}

export function inferConnectionPorts(
  fromNode: DiagramNode,
  toNode: DiagramNode,
  fromHeight?: number,
  toHeight?: number,
): { fromPort: PortSide; toPort: PortSide } {
  const fromH = fromHeight ?? fromNode.height
  const toH = toHeight ?? toNode.height
  const fromCx = fromNode.x + fromNode.width / 2
  const fromCy = fromNode.y + fromH / 2
  const toCx = toNode.x + toNode.width / 2
  const toCy = toNode.y + toH / 2
  const dx = toCx - fromCx
  const dy = toCy - fromCy

  if (Math.abs(dy) > Math.abs(dx) * 0.72) {
    return dy > 0
      ? { fromPort: 'bottom', toPort: 'top' }
      : { fromPort: 'right', toPort: 'left' }
  }

  return dx >= 0
    ? { fromPort: 'right', toPort: 'left' }
    : { fromPort: 'bottom', toPort: 'top' }
}

export function resolveConnectionPorts(
  connection: Connection,
  fromNode: DiagramNode,
  toNode: DiagramNode,
  fromHeight?: number,
  toHeight?: number,
): { fromPort: PortSide; toPort: PortSide } {
  const inferred = inferConnectionPorts(fromNode, toNode, fromHeight, toHeight)
  return {
    fromPort: connection.fromPort ?? inferred.fromPort,
    toPort: connection.toPort ?? inferred.toPort,
  }
}

export function buildBezierPath(
  from: Point,
  to: Point,
  fromPort: PortSide,
  toPort: PortSide,
): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.hypot(dx, dy)
  const handle = Math.max(56, Math.min(dist * 0.45, 180))

  const fromTan = portTangent(fromPort)
  const toTan = portTangent(toPort)

  let cx1 = from.x + fromTan.x * handle
  let cy1 = from.y + fromTan.y * handle
  let cx2 = to.x + toTan.x * handle
  let cy2 = to.y + toTan.y * handle

  const span = Math.abs(dx) + Math.abs(dy) * 0.35
  const gravity = Math.min(span * 0.14, 64)

  if (fromPort === 'right' || fromPort === 'left') {
    cy1 += gravity
    cy2 += gravity
  } else if (fromPort === 'bottom') {
    cy1 += gravity * 0.35
    cy2 += gravity * 0.55
  }

  if (toPort === 'left' || toPort === 'right') {
    cy2 += gravity * 0.45
  }

  return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`
}

export function buildDraftWirePath(from: Point, to: Point, fromPort: PortSide): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.max(Math.hypot(dx, dy), 1)
  const handle = Math.max(56, Math.min(dist * 0.45, 180))
  const fromTan = portTangent(fromPort)

  let cx1 = from.x + fromTan.x * handle
  let cy1 = from.y + fromTan.y * handle
  const cx2 = to.x - (dx / dist) * handle * 0.55
  let cy2 = to.y - (dy / dist) * handle * 0.55

  const gravity = Math.min((Math.abs(dx) + Math.abs(dy) * 0.35) * 0.14, 64)
  if (fromPort === 'right' || fromPort === 'left') {
    cy1 += gravity
    cy2 += gravity
  } else {
    cy1 += gravity * 0.35
    cy2 += gravity * 0.55
  }

  return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`
}

export function isOutputPort(port: PortSide): boolean {
  return port === 'right' || port === 'bottom'
}

export function isInputPort(port: PortSide): boolean {
  return port === 'left' || port === 'top'
}

export function defaultFromPort(): PortSide {
  return 'right'
}

export function defaultToPort(): PortSide {
  return 'left'
}

export function resolveFromPort(
  connection: Connection,
  fromNode?: DiagramNode,
  toNode?: DiagramNode,
  fromHeight?: number,
  toHeight?: number,
): PortSide {
  if (connection.fromPort) return connection.fromPort
  if (fromNode && toNode) return inferConnectionPorts(fromNode, toNode, fromHeight, toHeight).fromPort
  return defaultFromPort()
}

export function resolveToPort(
  connection: Connection,
  fromNode?: DiagramNode,
  toNode?: DiagramNode,
  fromHeight?: number,
  toHeight?: number,
): PortSide {
  if (connection.toPort) return connection.toPort
  if (fromNode && toNode) return inferConnectionPorts(fromNode, toNode, fromHeight, toHeight).toPort
  return defaultToPort()
}

export function isConnectionLive(
  connection: Connection,
  nodes: DiagramNode[],
): boolean {
  if (!connection.plugged) return false
  const fromNode = nodes.find((node) => node.id === connection.from)
  const toNode = nodes.find((node) => node.id === connection.to)
  if (!fromNode || !toNode) return false
  return fromNode.active && toNode.active
}

export function canConnect(
  fromNode: DiagramNode,
  toNode: DiagramNode,
  _fromPort: PortSide,
  _toPort: PortSide,
): boolean {
  return fromNode.id !== toNode.id
}
