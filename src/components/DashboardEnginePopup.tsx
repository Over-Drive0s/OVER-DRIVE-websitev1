import { useEffect, useState } from 'react'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  DollarSign,
  LayoutDashboard,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'

interface DashboardEnginePopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'kpis' | 'jobs' | 'views'

const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'kpis', label: 'KPIs', icon: BarChart3 },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'views', label: 'Views', icon: TrendingUp },
]

const headlineStats = [
  { label: 'Live Views', value: '24', accent: 'text-[#0080ff]' },
  { label: 'Total Revenue', value: '$128K', accent: 'text-[#ccff00]' },
  { label: 'Active Jobs', value: '42', accent: 'text-white' },
  { label: 'Completion Rate', value: '87%', accent: 'text-[#ccff00]' },
]

const kpis = [
  { title: 'Total Revenue', value: '$128,400', trend: '↑ 12.6% this month' },
  { title: 'Active Jobs', value: '42', trend: '6 in progress' },
  { title: 'Completion Rate', value: '87%', trend: '↑ 4.2% vs last week' },
  { title: 'Team Output', value: '214 Tasks', trend: 'Across 5 teams' },
  { title: 'Open Issues', value: '6', trend: '2 critical' },
  { title: 'Pending Approvals', value: '13', trend: 'Awaiting review' },
]

const jobs = [
  { name: 'Website Build', status: 'In Progress' as const, owner: 'Design Team', progress: 68 },
  { name: 'CRM Setup', status: 'Waiting Approval' as const, owner: 'Ops Team', progress: 90 },
  { name: 'Inventory Sync', status: 'Completed' as const, owner: 'Systems Team', progress: 100 },
  { name: 'Client Portal', status: 'Delayed' as const, owner: 'Dev Team', progress: 45 },
]

const revenueSnapshot = [
  { label: 'Monthly Revenue', value: '$128,400' },
  { label: 'Paid Invoices', value: '$92,800' },
  { label: 'Outstanding', value: '$35,600' },
  { label: 'Avg. Deal Value', value: '$4,850' },
]

const dashboardViews = [
  { name: 'Executive View', role: 'Leadership' },
  { name: 'Operations View', role: 'Ops' },
  { name: 'Sales View', role: 'Sales' },
  { name: 'Finance View', role: 'Finance' },
  { name: 'Project View', role: 'PM' },
  { name: 'Team Member View', role: 'Individual' },
]

const performanceFeed = [
  { event: 'Design team completed 18 tasks today', time: '12 min ago' },
  { event: 'Sales closed 6 new deals this week', time: '1 hr ago' },
  { event: 'Operations resolved 12 open tickets', time: '2 hr ago' },
  { event: 'Finance processed 9 invoices', time: '4 hr ago' },
  { event: 'Development deployed 3 updates', time: '6 hr ago' },
]

const systemStatus = [
  { name: 'Dashboard Sync', status: 'Online' as const },
  { name: 'Analytics Engine', status: 'Active' as const },
  { name: 'Revenue Tracking', status: 'Synced' as const },
  { name: 'Team Monitoring', status: 'Warning' as const },
]

function JobStatusBadge({ status }: { status: (typeof jobs)[number]['status'] }) {
  const styles = {
    'In Progress': 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    'Waiting Approval': 'border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00]',
    Completed: 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    Delayed: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status === 'In Progress' && (
        <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-current" />
      )}
      {status}
    </span>
  )
}

function SystemStatusBadge({ status }: { status: 'Online' | 'Active' | 'Synced' | 'Warning' }) {
  const isWarning = status === 'Warning'
  return (
    <span className={`text-xs font-medium ${isWarning ? 'text-amber-300' : 'text-[#ccff00]'}`}>
      {status}
    </span>
  )
}

export default function DashboardEnginePopup({ onClose }: DashboardEnginePopupProps) {
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
      aria-labelledby="dashboard-engine-title"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ccff00]">
                    <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
                    Live Dashboard Views
                  </span>
                  <span className="text-[11px] text-white/35">24 views active · Real-time sync enabled</span>
                </div>

                <h1 id="dashboard-engine-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Dashboard <span className="text-[#0080ff]">ENGINE</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Configurable views for KPIs, operational status, revenue, performance metrics, and team productivity.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Dashboard Engine"
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
                    <BarChart3 size={16} strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                      Operational Visibility Layer
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-white/50">
                    Dashboard Engine is the visual command center for monitoring business performance,
                    operational activity, revenue tracking, and team productivity — transforming raw
                    data into actionable live views for executives, departments, and teams.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['KPI Tracking', 'Revenue Metrics', 'Job Status', 'Team Performance'].map((tag) => (
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
                  <h2 className="text-sm font-semibold text-white">Dashboard Control Center</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Build custom dashboard environments for operations, finance, performance tracking,
                    and live workflow monitoring.
                  </p>
                  <div className="mt-5">
                    <a
                      href="https://tickr-watchfloor.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Open Dashboard
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-sm font-semibold text-white">Revenue Snapshot</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('kpis')}
                    className="text-xs font-medium text-[#0080ff] transition hover:text-white"
                  >
                    View all KPIs →
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {revenueSnapshot.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-white/35">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kpis' && (
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Live KPI Metrics</h2>
                  <p className="mt-1 text-xs text-white/40">Updated in real time across all dashboard views</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-4 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-black"
                >
                  <BarChart3 size={14} />
                  Configure KPIs
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((item) => (
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

          {activeTab === 'jobs' && (
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Job Status Pipeline</h2>
                  <p className="mt-1 text-xs text-white/40">4 active jobs across teams</p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  View Reports
                </button>
              </div>

              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.name}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                          <Briefcase size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{job.name}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/35">
                            <Users size={11} />
                            {job.owner}
                          </p>
                        </div>
                      </div>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/30">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${
                            job.status === 'Delayed' ? 'bg-amber-400' : 'bg-[#0080ff]'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'views' && (
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Dashboard Views</h2>
                <p className="mt-1 text-xs text-white/40">6 role-based views configured</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardViews.map((view) => (
                  <div
                    key={view.name}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/25 hover:glow-brand-blue"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#0080ff]/20 bg-[#0080ff]/10">
                        <LayoutDashboard size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                      </div>
                      <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
                        {view.role}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">{view.name}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Team Performance Feed</h2>
                    <button type="button" className="text-xs font-medium text-[#0080ff] hover:text-white">
                      View Activity
                    </button>
                  </div>
                  <div className="space-y-3">
                    {performanceFeed.map((item, index) => (
                      <div
                        key={item.event}
                        className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                      >
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ccff00]" />
                        <div>
                          <p className="text-sm text-white/60">{item.event}</p>
                          <p className="mt-0.5 text-[11px] text-white/30">{item.time}</p>
                        </div>
                        {index === 0 && (
                          <span className="ml-auto shrink-0 text-[10px] font-medium uppercase tracking-wider text-[#0080ff]">
                            New
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold text-white">Live System Status</h2>
                  </div>
                  <div className="space-y-2">
                    {systemStatus.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                      >
                        <span className="text-sm text-white/50">{item.name}</span>
                        <SystemStatusBadge status={item.status} />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-lg border border-[#ccff00]/20 bg-[#ccff00]/[0.06] p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[#ccff00]" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-white">Revenue tracking synced</p>
                    </div>
                    <p className="mt-1 text-xs text-white/40">Last updated 2 minutes ago</p>
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
