import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Database,
  Link2,
  Plug,
  RefreshCw,
  Server,
  X,
} from 'lucide-react'

interface IntegrationLayerPopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'performance' | 'systems' | 'sync'

const tabs: { id: TabId; label: string; icon: typeof Link2 }[] = [
  { id: 'overview', label: 'Overview', icon: Link2 },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'systems', label: 'Systems', icon: Server },
  { id: 'sync', label: 'Sync', icon: RefreshCw },
]

const headlineStats = [
  { label: 'Sync Success', value: '99.4%', accent: 'text-[#ccff00]' },
  { label: 'Connected APIs', value: '38', accent: 'text-[#0080ff]' },
  { label: 'Records Synced', value: '248K', accent: 'text-white' },
  { label: 'Failed Syncs', value: '7', accent: 'text-amber-300' },
]

const integrationStats = [
  { title: 'Sync Success Rate', value: '99.4%', trend: '↑ 0.2% this week' },
  { title: 'Connected APIs', value: '38', trend: 'All operational' },
  { title: 'Data Sources', value: '16', trend: '8 real-time' },
  { title: 'Records Synced', value: '248K', trend: '↑ 8% this week' },
  { title: 'Failed Syncs', value: '7', trend: 'Auto-retry queued' },
  { title: 'Avg. Sync Time', value: '2.1s', trend: '↓ 0.4s improved' },
]

const integrations = [
  { name: 'Salesforce CRM', type: 'CRM', status: 'Synced' as const, lastSync: '2 min ago', health: 100 },
  { name: 'NetSuite ERP', type: 'ERP', status: 'Synced' as const, lastSync: '8 min ago', health: 100 },
  { name: 'Inventory Manager', type: 'Inventory', status: 'Active' as const, lastSync: 'Live', health: 100 },
  { name: 'Stripe API', type: 'Payments', status: 'Synced' as const, lastSync: '14 min ago', health: 99 },
  { name: 'Twilio API', type: 'Messaging', status: 'Warning' as const, lastSync: '1 hour ago', health: 82 },
]

const connectionTypes = [
  'CRM Systems',
  'ERP Platforms',
  'Inventory Systems',
  'Payment APIs',
  'Marketing Tools',
  'Accounting Software',
  'Cloud Databases',
  'Third-Party APIs',
]

const capabilities = [
  'API authentication management',
  'Real-time and scheduled syncs',
  'Field mapping and data normalization',
  'Error detection and retry handling',
  'Webhook event processing',
  'Sync logs and audit history',
]

const activityFeed = [
  { event: 'Salesforce CRM synced 4,218 customer records', time: '2 min ago' },
  { event: 'NetSuite ERP completed invoice data sync', time: '8 min ago' },
  { event: 'Inventory Manager updated live stock levels', time: '14 min ago' },
  { event: 'Stripe API pushed payment status updates', time: '22 min ago' },
  { event: 'Twilio API returned 2 delivery warnings', time: '1 hr ago' },
]

const syncHealth = [
  { name: 'API Gateway', status: 'Online' as const },
  { name: 'Webhook Listener', status: 'Active' as const },
  { name: 'Data Mapper', status: 'Stable' as const },
  { name: 'Failed Syncs', status: 'Warning' as const },
]

function IntegrationStatusBadge({ status }: { status: (typeof integrations)[number]['status'] }) {
  const styles = {
    Synced: 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    Active: 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    Warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status === 'Active' && (
        <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-current" />
      )}
      {status}
    </span>
  )
}

function SyncHealthBadge({ status }: { status: 'Online' | 'Active' | 'Stable' | 'Warning' }) {
  return (
    <span className={`text-xs font-medium ${status === 'Warning' ? 'text-amber-300' : 'text-[#ccff00]'}`}>
      {status === 'Warning' ? '7 Warnings' : status}
    </span>
  )
}

export default function IntegrationLayerPopup({ onClose }: IntegrationLayerPopupProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  useScrollToTopOnMount()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="integration-layer-title"
    >
      <div
        className="flex h-[min(920px,calc(100%-1rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#06080c] shadow-[0_0_0_1px_rgba(0,128,255,0.12),0_32px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-white/[0.08]">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-[#0080ff]/10 blur-[80px]" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-32 w-32 rounded-full bg-[#ccff00]/[0.06] blur-[60px]" />

          <div className="relative px-6 pb-0 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0080ff]/30 bg-[#0080ff]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0080ff]">
                    <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
                    Sync Success Rate
                  </span>
                  <span className="text-[11px] text-white/35">38 APIs connected · 248K records synced</span>
                </div>

                <h1 id="integration-layer-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Integration <span className="text-[#0080ff]">LAYER</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Connect CRMs, ERPs, inventory systems, payment services, databases, and third-party
                  APIs into one unified operational data layer.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Integration Layer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/50 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex gap-1 overflow-x-auto border-b border-white/[0.06]">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
                    activeTab === id ? 'text-[#0080ff]' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  {label}
                  {activeTab === id && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0080ff]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {headlineStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/80 px-4 py-3.5 transition-colors hover:border-[#0080ff]/25"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      {stat.label}
                    </p>
                    <p className={`mt-1 text-2xl font-semibold ${stat.accent}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center gap-2 text-[#0080ff]">
                    <Link2 size={16} strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                      Unified Data Connection Layer
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-white/50">
                    Integration Layer is the connection system that allows business platforms, internal
                    tools, external services, and third-party APIs to communicate through structured
                    data syncs — keeping customer data, inventory, revenue, and operations aligned.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['API Auth', 'Field Mapping', 'Webhooks', 'Retry Logic'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/45"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#0080ff]/20 bg-[#0080ff]/[0.06] p-5">
                  <h2 className="text-sm font-semibold text-white">API Connection Manager</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Connect business tools, map data fields, manage API credentials, and monitor sync
                    health from a controlled integration layer.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        navigate('/apimanager')
                      }}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Add Integration
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sync')}
                      className="inline-flex flex-1 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      Sync Settings
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">Integration Capabilities</h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {capabilities.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/50">
                      <ChevronRight size={14} className="shrink-0 text-[#0080ff]/60" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Integration Performance</h2>
                  <p className="mt-1 text-xs text-white/40">Real-time sync metrics across all connected systems</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-4 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-black"
                >
                  <Plug size={14} />
                  Connect API
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {integrationStats.map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5 transition hover:border-[#0080ff]/25"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      {item.title}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-xs text-[#ccff00]/70">{item.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'systems' && (
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Connected Systems</h2>
                  <p className="mt-1 text-xs text-white/40">5 active integrations across business platforms</p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  View Sync Logs
                </button>
              </div>

              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                          <Database size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{integration.name}</p>
                          <p className="mt-0.5 text-xs text-white/35">{integration.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-white/40">
                          <Clock size={11} />
                          {integration.lastSync}
                        </span>
                        <IntegrationStatusBadge status={integration.status} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/30">
                        <span>Sync Health</span>
                        <span>{integration.health}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${
                            integration.health < 90 ? 'bg-amber-400' : 'bg-[#0080ff]'
                          }`}
                          style={{ width: `${integration.health}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Connection Types</h2>
                <p className="mt-1 text-xs text-white/40">8 platform categories supported for integration</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {connectionTypes.map((type) => (
                  <div
                    key={type}
                    className="rounded-lg border border-white/[0.08] bg-[#080a0e]/60 px-3 py-2 text-sm text-white/60 transition hover:border-[#0080ff]/25 hover:text-white"
                  >
                    {type}
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Sync Activity</h2>
                    <button type="button" className="text-xs font-medium text-[#0080ff] hover:text-white">
                      View Logs
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activityFeed.map((item, index) => (
                      <div
                        key={item.event}
                        className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                      >
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0080ff]" />
                        <div>
                          <p className="text-sm text-white/60">{item.event}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/30">
                            <Clock size={10} />
                            {item.time}
                          </p>
                        </div>
                        {index === 0 && (
                          <span className="ml-auto shrink-0 text-[10px] font-medium uppercase tracking-wider text-[#ccff00]">
                            Latest
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <RefreshCw size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold text-white">Sync Health</h2>
                  </div>
                  <div className="space-y-2">
                    {syncHealth.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                      >
                        <span className="text-sm text-white/50">{item.name}</span>
                        <SyncHealthBadge status={item.status} />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-lg border border-[#ccff00]/20 bg-[#ccff00]/[0.06] p-4">
                    <div className="flex items-center gap-2">
                      <Link2 size={16} className="text-[#ccff00]" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-white">All gateways operational</p>
                    </div>
                    <p className="mt-1 text-xs text-white/40">Avg. sync time 2.1s · Last checked 30 sec ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/[0.08] bg-[#050607]/80 px-6 py-3">
          <p className="text-[11px] text-white/30">
            Press <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/45">Esc</kbd> to close
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
          >
            Back to Platform
          </button>
        </div>
      </div>
    </div>
  )
}
