import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Clock,
  GitBranch,
  Plus,
  Users,
  X,
} from 'lucide-react'

interface JobTrackingMetricsPopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'metrics' | 'jobs' | 'resources'

const tabs: { id: TabId; label: string; icon: typeof Briefcase }[] = [
  { id: 'overview', label: 'Overview', icon: Briefcase },
  { id: 'metrics', label: 'Metrics', icon: Activity },
  { id: 'jobs', label: 'Jobs', icon: GitBranch },
  { id: 'resources', label: 'Resources', icon: Users },
]

const headlineStats = [
  { label: 'Active Jobs', value: '64', accent: 'text-[#0080ff]' },
  { label: 'On-Time Rate', value: '91%', accent: 'text-[#ccff00]' },
  { label: 'Utilization', value: '78%', accent: 'text-white' },
  { label: 'Bottlenecks', value: '8', accent: 'text-amber-300' },
]

const opsStats = [
  { title: 'Active Jobs', value: '64', trend: '12 in progress' },
  { title: 'On-Time Rate', value: '91%', trend: '↑ 4.2% this week' },
  { title: 'Team Utilization', value: '78%', trend: 'Across 4 teams' },
  { title: 'Open Bottlenecks', value: '8', trend: '3 critical' },
  { title: 'Completed Today', value: '27', trend: '↑ 6 vs yesterday' },
  { title: 'Avg. Cycle Time', value: '3.4d', trend: '↓ 0.6d improved' },
]

const jobs = [
  {
    job: 'Client Portal Build',
    stage: 'In Progress' as const,
    owner: 'Dev Team',
    priority: 'High' as const,
    dueDate: 'Today',
    progress: 72,
  },
  {
    job: 'Inventory Data Cleanup',
    stage: 'Review' as const,
    owner: 'Ops Team',
    priority: 'Medium' as const,
    dueDate: 'Tomorrow',
    progress: 85,
  },
  {
    job: 'CRM Workflow Setup',
    stage: 'Waiting Approval' as const,
    owner: 'Systems Team',
    priority: 'High' as const,
    dueDate: '2 days',
    progress: 90,
  },
  {
    job: 'Invoice Automation',
    stage: 'Completed' as const,
    owner: 'Finance Ops',
    priority: 'Low' as const,
    dueDate: 'Done',
    progress: 100,
  },
  {
    job: 'Support Queue Audit',
    stage: 'Delayed' as const,
    owner: 'Support Lead',
    priority: 'Urgent' as const,
    dueDate: 'Overdue',
    progress: 45,
  },
]

const resources = [
  { team: 'Development', capacity: 82, assigned: '18 Jobs' },
  { team: 'Operations', capacity: 76, assigned: '24 Jobs' },
  { team: 'Finance Ops', capacity: 61, assigned: '9 Jobs' },
  { team: 'Support', capacity: 88, assigned: '13 Jobs' },
]

const workflowStages = [
  'New',
  'Assigned',
  'In Progress',
  'Review',
  'Waiting Approval',
  'Completed',
  'Delayed',
  'Flagged',
]

const activityFeed = [
  { event: 'Support Queue Audit was flagged as overdue', time: '8 min ago' },
  { event: 'CRM Workflow Setup moved to Waiting Approval', time: '22 min ago' },
  { event: 'Development team completed 7 jobs today', time: '1 hr ago' },
  { event: 'Inventory Data Cleanup assigned to Ops Team', time: '2 hr ago' },
  { event: 'Invoice Automation marked as completed', time: '3 hr ago' },
]

const performanceHealth = [
  { name: 'Workflow Throughput', status: 'Strong' as const },
  { name: 'Team Capacity', status: 'High Load' as const },
  { name: 'Approval Queue', status: 'Stable' as const },
  { name: 'Delayed Jobs', status: 'Warning' as const },
]

function StageBadge({ stage }: { stage: (typeof jobs)[number]['stage'] }) {
  const styles = {
    'In Progress': 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    Review: 'border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00]',
    'Waiting Approval': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    Completed: 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    Delayed: 'border-red-500/30 bg-red-500/10 text-red-300',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[stage]}`}>
      {stage === 'In Progress' && (
        <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-current" />
      )}
      {stage}
    </span>
  )
}

function PriorityLabel({ priority }: { priority: (typeof jobs)[number]['priority'] }) {
  const colors = {
    Urgent: 'text-red-300',
    High: 'text-amber-300',
    Medium: 'text-[#0080ff]',
    Low: 'text-white/40',
  }
  return <span className={`text-xs font-medium ${colors[priority]}`}>{priority}</span>
}

function HealthBadge({ status }: { status: 'Strong' | 'Stable' | 'High Load' | 'Warning' }) {
  if (status === 'High Load') return <span className="text-xs font-medium text-amber-300">High Load</span>
  if (status === 'Warning') return <span className="text-xs font-medium text-amber-300">8 Open</span>
  return <span className="text-xs font-medium text-[#ccff00]">{status}</span>
}

export default function JobTrackingMetricsPopup({ onClose }: JobTrackingMetricsPopupProps) {
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
      aria-labelledby="job-tracking-title"
    >
      <div
        className="flex max-h-[min(920px,calc(100%-1rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#06080c] shadow-[0_0_0_1px_rgba(0,128,255,0.12),0_32px_80px_rgba(0,0,0,0.65)]"
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
                    Operations Teams
                  </span>
                  <span className="text-[11px] text-white/35">64 active jobs · 91% on-time rate</span>
                </div>

                <h1 id="job-tracking-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Job Tracking <span className="text-[#0080ff]">& Metrics</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Centralize job tracking, resource allocation, and performance metrics with real-time
                  visibility across every active workflow.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Job Tracking & Metrics"
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
                    <Briefcase size={16} strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                      Operations Visibility Layer
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-white/50">
                    Job Tracking & Metrics gives operations teams a centralized control view for
                    monitoring active jobs, workload capacity, workflow stages, team performance,
                    blockers, and completion timelines.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['Job Pipeline', 'Resource Allocation', 'Stage Tracking', 'Bottleneck Alerts'].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/45"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#0080ff]/20 bg-[#0080ff]/[0.06] p-5">
                  <h2 className="text-sm font-semibold text-white">Operations Command Center</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Track jobs, assign resources, measure performance, and monitor blockers from one
                    live operations view.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to="/metrics"
                      state={{ fromSolutionsOps: true }}
                      onClick={onClose}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Open Ops View
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveTab('jobs')}
                      className="inline-flex flex-1 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      Manage Jobs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Operations Metrics</h2>
                  <p className="mt-1 text-xs text-white/40">Live performance data across all active workflows</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-4 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-black"
                >
                  <Plus size={14} />
                  Create Job
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {opsStats.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5 transition hover:border-[#0080ff]/25"
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
                  <h2 className="text-base font-semibold text-white">Active Job Pipeline</h2>
                  <p className="mt-1 text-xs text-white/40">5 jobs tracked across teams</p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  View All Jobs
                </button>
              </div>

              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.job}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                          <Briefcase size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{job.job}</p>
                          <p className="mt-0.5 flex items-center gap-2 text-xs text-white/35">
                            <Users size={11} />
                            {job.owner}
                            <span className="text-white/20">·</span>
                            <PriorityLabel priority={job.priority} />
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Clock size={11} />
                          {job.dueDate}
                        </span>
                        <StageBadge stage={job.stage} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/30">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${
                            job.stage === 'Delayed' ? 'bg-red-400' : job.stage === 'Completed' ? 'bg-[#ccff00]' : 'bg-[#0080ff]'
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

          {activeTab === 'resources' && (
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Resource Allocation</h2>
                <p className="mt-1 text-xs text-white/40">Team capacity and job assignments</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {resources.map((resource) => (
                  <div
                    key={resource.team}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{resource.team}</span>
                      <span className={`text-sm font-semibold ${resource.capacity > 85 ? 'text-amber-300' : 'text-[#ccff00]'}`}>
                        {resource.capacity}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/35">{resource.assigned}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full ${resource.capacity > 85 ? 'bg-amber-400' : 'bg-[#0080ff]'}`}
                        style={{ width: `${resource.capacity}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">Workflow Stages</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {workflowStages.map((stage) => (
                    <span
                      key={stage}
                      className="rounded-lg border border-white/[0.08] bg-[#080a0e]/60 px-3 py-1.5 text-xs text-white/55"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Operations Activity</h2>
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
                          <p className="mt-0.5 text-[11px] text-white/30">{item.time}</p>
                        </div>
                        {index === 0 && (
                          <span className="ml-auto shrink-0 text-[10px] font-medium uppercase tracking-wider text-amber-300">
                            Alert
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold text-white">Performance Health</h2>
                  </div>
                  <div className="space-y-2">
                    {performanceHealth.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                      >
                        <span className="text-sm text-white/50">{item.name}</span>
                        <HealthBadge status={item.status} />
                      </div>
                    ))}
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
            Back to Solutions
          </button>
        </div>
      </div>
    </div>
  )
}
