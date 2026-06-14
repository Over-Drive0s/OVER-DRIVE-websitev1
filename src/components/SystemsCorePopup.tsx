import { useEffect, useState } from 'react'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'
import {
  Activity,
  ArrowUpRight,
  Boxes,
  ChevronRight,
  Clock,
  Link2,
  Server,
  Shield,
  Workflow,
  X,
  Zap,
} from 'lucide-react'

interface SystemsCorePopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'pipelines' | 'services' | 'activity'

const tabs: { id: TabId; label: string; icon: typeof Boxes }[] = [
  { id: 'overview', label: 'Overview', icon: Boxes },
  { id: 'pipelines', label: 'Pipelines', icon: Workflow },
  { id: 'services', label: 'Services', icon: Link2 },
  { id: 'activity', label: 'Activity', icon: Activity },
]

const healthStats = [
  { label: 'Uptime', value: '99.98%', accent: 'text-[#ccff00]' },
  { label: 'Integrations', value: '42', accent: 'text-[#0080ff]' },
  { label: 'Automations', value: '218', accent: 'text-white' },
  { label: 'Critical Errors', value: '0', accent: 'text-[#ccff00]' },
]

const capabilities = [
  {
    title: 'Platform Integrations',
    icon: Link2,
    items: ['CRM Systems', 'Inventory Platforms', 'Payment Processors', 'ERP Systems'],
  },
  {
    title: 'Workflow Automation',
    icon: Workflow,
    items: ['Trigger Actions', 'Scheduled Flows', 'Approval Pipelines', 'Event Automation'],
  },
  {
    title: 'Access & Permissions',
    icon: Shield,
    items: ['Role-Based Access', 'Admin Controls', 'Team Permissions', 'Audit Visibility'],
  },
  {
    title: 'Infrastructure Monitoring',
    icon: Server,
    items: ['API Uptime', 'Workflow Health', 'Queue Monitoring', 'Sync Status'],
  },
]

const pipelines = [
  { name: 'Inventory Sync', status: 'Active' as const, lastRun: '2 min ago', progress: 100 },
  { name: 'CRM Lead Import', status: 'Active' as const, lastRun: '12 min ago', progress: 100 },
  { name: 'Invoice Generator', status: 'Warning' as const, lastRun: '1 hour ago', progress: 72 },
  { name: 'Customer SMS Flow', status: 'Live' as const, lastRun: 'Realtime', progress: 100 },
]

const integrations = [
  { name: 'Stripe', category: 'Payments' },
  { name: 'Slack', category: 'Comms' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Supabase', category: 'Database' },
  { name: 'HubSpot', category: 'CRM' },
  { name: 'Shopify', category: 'Commerce' },
  { name: 'Firebase', category: 'Backend' },
  { name: 'Twilio', category: 'Messaging' },
]

const activityFeed = [
  { event: 'API token updated', time: '3 min ago', type: 'security' as const },
  { event: 'Inventory sync completed', time: '8 min ago', type: 'sync' as const },
  { event: 'New integration connected', time: '24 min ago', type: 'integration' as const },
  { event: 'User permissions modified', time: '1 hr ago', type: 'security' as const },
  { event: 'Workflow deployment published', time: '2 hr ago', type: 'workflow' as const },
]

function StatusBadge({ status }: { status: 'Active' | 'Warning' | 'Live' }) {
  const styles = {
    Active: 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    Warning: 'border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00]',
    Live: 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {(status === 'Active' || status === 'Live') && (
        <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-current" />
      )}
      {status}
    </span>
  )
}

export default function SystemsCorePopup({ onClose }: SystemsCorePopupProps) {
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
      aria-labelledby="systems-core-title"
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
                    Live Module
                  </span>
                  <span className="text-[11px] text-white/35">12 tools connected · All systems operational</span>
                </div>

                <h1 id="systems-core-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Systems <span className="text-[#0080ff]">CORE</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Unified control layer for tools, data sources, integrations, and automated workflows.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Systems CORE"
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
                    activeTab === id
                      ? 'text-[#0080ff]'
                      : 'text-white/40 hover:text-white/70'
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
                {healthStats.map((stat) => (
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
                    <Boxes size={16} strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                      Operational Control Layer
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-white/50">
                    Systems CORE is the centralized infrastructure environment for connected services,
                    workflows, and data pipelines — reducing fragmentation and eliminating repetitive
                    manual work across your organization.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['API Management', 'Data Sync', 'Event Routing', 'Role Governance'].map((tag) => (
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
                  <h2 className="text-sm font-semibold text-white">Infrastructure Console</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Manage integrations, monitor workflows, and configure operational systems from
                    one environment.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <a
                      href="https://roadmappv2.vercel.app/roadmap.html#/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Launch Console
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveTab('services')}
                      className="inline-flex flex-1 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      View Integrations
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {capabilities.map(({ title, icon: Icon, items }) => (
                  <div
                    key={title}
                    className="group rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/25"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0080ff]/20 bg-[#0080ff]/10">
                        <Icon size={15} className="text-[#0080ff]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-semibold text-white">{title}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-white/45">
                          <ChevronRight size={12} className="shrink-0 text-[#0080ff]/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pipelines' && (
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Active Pipelines</h2>
                  <p className="mt-1 text-xs text-white/40">4 workflows running across connected systems</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-4 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-black"
                >
                  <Zap size={14} />
                  Configure Workflows
                </button>
              </div>

              <div className="space-y-3">
                {pipelines.map((pipeline) => (
                  <div
                    key={pipeline.name}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                          <Workflow size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{pipeline.name}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/35">
                            <Clock size={11} />
                            {pipeline.lastRun}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={pipeline.status} />
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/30">
                        <span>Health</span>
                        <span>{pipeline.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pipeline.status === 'Warning'
                              ? 'bg-[#ccff00]'
                              : 'bg-[#0080ff]'
                          }`}
                          style={{ width: `${pipeline.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Connected Services</h2>
                <p className="mt-1 text-xs text-white/40">8 active integrations · 0 sync errors</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {integrations.map((tool) => (
                  <div
                    key={tool.name}
                    className="group rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/25 hover:glow-brand-blue"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs font-bold text-white/70">
                        {tool.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-[#ccff00]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00]" />
                        Live
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">{tool.name}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/35">
                      {tool.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Recent Activity</h2>
                <p className="mt-1 text-xs text-white/40">Last 24 hours across all systems</p>
              </div>

              <div className="relative space-y-0">
                <div className="absolute bottom-2 left-[11px] top-2 w-px bg-white/[0.08]" aria-hidden="true" />
                {activityFeed.map((item, index) => (
                  <div key={item.event} className="relative flex gap-4 pb-4 last:pb-0">
                    <div
                      className={`relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        item.type === 'security'
                          ? 'border-[#ccff00]/30 bg-[#ccff00]/10'
                          : 'border-[#0080ff]/30 bg-[#0080ff]/10'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.type === 'security' ? 'bg-[#ccff00]' : 'bg-[#0080ff]'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-[#080a0e]/50 px-4 py-3 transition hover:border-white/[0.12]">
                      <p className="text-sm text-white/70">{item.event}</p>
                      <p className="mt-1 text-[11px] text-white/30">{item.time}</p>
                    </div>
                    {index === 0 && (
                      <span className="shrink-0 self-center rounded-full bg-[#0080ff]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#0080ff]">
                        Latest
                      </span>
                    )}
                  </div>
                ))}
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
