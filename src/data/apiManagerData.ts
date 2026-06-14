export type ConnectionCategory = 'api' | 'email' | 'portal' | 'third-party'

export type ConnectionStatus = 'online' | 'degraded' | 'offline'

export interface ApiConnection {
  id: string
  name: string
  provider: string
  category: ConnectionCategory
  logo: string
  status: ConnectionStatus
  latencyMs: number
  throughputMbps: number
  requestsPerMin: number
  uptime: number
  sparkline: number[]
  description: string
  meshAngle: number
}

export const categoryLabels: Record<ConnectionCategory, string> = {
  api: 'API',
  email: 'Email',
  portal: 'Portal',
  'third-party': 'Third Party',
}

export const categoryColors: Record<ConnectionCategory, string> = {
  api: '#3b82f6',
  email: '#64748b',
  portal: '#6366f1',
  'third-party': '#78716c',
}

export const initialConnections: ApiConnection[] = [
  {
    id: 'openclaw',
    name: 'OpenClaw Agent',
    provider: 'OpenClaw',
    category: 'api',
    logo: '/integrations/openclaw.svg',
    status: 'online',
    latencyMs: 42,
    throughputMbps: 128,
    requestsPerMin: 840,
    uptime: 99.8,
    sparkline: [720, 780, 810, 840, 820, 850, 840],
    description: 'Autonomous agent runtime & tool orchestration',
    meshAngle: 0,
  },
  {
    id: 'claude',
    name: 'Claude API',
    provider: 'Anthropic',
    category: 'api',
    logo: '/integrations/claude.svg',
    status: 'online',
    latencyMs: 68,
    throughputMbps: 96,
    requestsPerMin: 1240,
    uptime: 99.9,
    sparkline: [1100, 1150, 1200, 1240, 1220, 1260, 1240],
    description: 'LLM inference & reasoning endpoints',
    meshAngle: 51,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT API',
    provider: 'OpenAI',
    category: 'api',
    logo: '/integrations/chatgpt.svg',
    status: 'online',
    latencyMs: 54,
    throughputMbps: 112,
    requestsPerMin: 2180,
    uptime: 99.7,
    sparkline: [1900, 2000, 2100, 2180, 2150, 2200, 2180],
    description: 'GPT models, embeddings & assistants',
    meshAngle: 103,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Gateway',
    provider: 'OpenRouter',
    category: 'api',
    logo: '/integrations/openrouter.png',
    status: 'online',
    latencyMs: 38,
    throughputMbps: 156,
    requestsPerMin: 960,
    uptime: 99.6,
    sparkline: [880, 920, 940, 960, 950, 970, 960],
    description: 'Multi-model routing & fallback layer',
    meshAngle: 154,
  },
  {
    id: 'cursor',
    name: 'Cursor Portal',
    provider: 'Cursor',
    category: 'portal',
    logo: '/integrations/cursor.svg',
    status: 'online',
    latencyMs: 91,
    throughputMbps: 64,
    requestsPerMin: 420,
    uptime: 99.5,
    sparkline: [380, 400, 410, 420, 415, 425, 420],
    description: 'Developer portal & IDE sync bridge',
    meshAngle: 206,
  },
  {
    id: 'supabase',
    name: 'Supabase Realtime',
    provider: 'Supabase',
    category: 'third-party',
    logo: '/integrations/supabase.svg',
    status: 'online',
    latencyMs: 24,
    throughputMbps: 88,
    requestsPerMin: 3120,
    uptime: 99.9,
    sparkline: [2800, 2950, 3000, 3120, 3080, 3150, 3120],
    description: 'Database, auth & realtime subscriptions',
    meshAngle: 257,
  },
  {
    id: 'aws',
    name: 'AWS Infrastructure',
    provider: 'Amazon Web Services',
    category: 'third-party',
    logo: '/integrations/aws.svg',
    status: 'degraded',
    latencyMs: 112,
    throughputMbps: 72,
    requestsPerMin: 1840,
    uptime: 98.4,
    sparkline: [1900, 1880, 1860, 1840, 1820, 1850, 1840],
    description: 'Lambda, S3, SES & cloud services',
    meshAngle: 309,
  },
  {
    id: 'aws-ses',
    name: 'AWS SES Email',
    provider: 'Amazon SES',
    category: 'email',
    logo: '/integrations/aws.svg',
    status: 'online',
    latencyMs: 86,
    throughputMbps: 48,
    requestsPerMin: 680,
    uptime: 99.4,
    sparkline: [620, 640, 660, 680, 670, 690, 680],
    description: 'Transactional & bulk email delivery',
    meshAngle: 340,
  },
]

export function jitterMetric(value: number, variance: number, min = 0): number {
  const next = value + (Math.random() - 0.5) * variance
  return Math.max(min, Math.round(next * 10) / 10)
}
