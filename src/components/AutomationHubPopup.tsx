import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Clock,
  GitBranch,
  Play,
  Timer,
  Workflow,
  X,
  Zap,
} from 'lucide-react'

interface AutomationHubPopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'performance' | 'workflows' | 'triggers'

const tabs: { id: TabId; label: string; icon: typeof Workflow }[] = [
  { id: 'overview', label: 'Overview', icon: Workflow },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'triggers', label: 'Triggers', icon: Play },
]

const headlineStats = [
  { label: 'Runs Today', value: '1,284', accent: 'text-[#ccff00]' },
  { label: 'Active Workflows', value: '86', accent: 'text-[#0080ff]' },
  { label: 'Hours Saved', value: '42h', accent: 'text-white' },
  { label: 'Failed Runs', value: '3', accent: 'text-amber-300' },
]

const automationStats = [
  { title: 'Runs Today', value: '1,284', trend: '↑ 124 vs yesterday' },
  { title: 'Active Workflows', value: '86', trend: '3 running now' },
  { title: 'Manual Hours Saved', value: '42h', trend: 'Est. this week' },
  { title: 'Failed Runs', value: '3', trend: 'Auto-retry enabled' },
  { title: 'Pending Approvals', value: '11', trend: 'Awaiting review' },
  { title: 'Avg. Runtime', value: '1.8s', trend: '↓ 0.3s improved' },
]

const workflows = [
  { name: 'New Lead Intake', trigger: 'Form Submitted', status: 'Active' as const, runs: '248', success: 99 },
  { name: 'Invoice Reminder', trigger: 'Invoice Overdue', status: 'Active' as const, runs: '96', success: 100 },
  { name: 'Job Status Update', trigger: 'Stage Changed', status: 'Running' as const, runs: '312', success: 98 },
  { name: 'Inventory Alert', trigger: 'Stock Below Limit', status: 'Active' as const, runs: '73', success: 100 },
  { name: 'Approval Routing', trigger: 'Request Created', status: 'Review' as const, runs: '18', success: 85 },
]

const triggerTypes = [
  'Form Submitted',
  'Status Changed',
  'Payment Received',
  'Invoice Overdue',
  'Task Completed',
  'File Uploaded',
  'Inventory Low',
  'New Customer Added',
]

const capabilities = [
  'Trigger-based actions',
  'Scheduled workflow runs',
  'Approval routing',
  'Automated notifications',
  'Cross-platform data sync',
  'Failure detection and retry logic',
]

const activityFeed = [
  { event: 'New Lead Intake workflow completed 248 runs today', time: '5 min ago' },
  { event: 'Invoice Reminder sent 96 automated notices', time: '18 min ago' },
  { event: 'Job Status Update triggered from operations pipeline', time: '32 min ago' },
  { event: 'Inventory Alert detected 4 low-stock items', time: '1 hr ago' },
  { event: 'Approval Routing paused 2 requests for manual review', time: '2 hr ago' },
]

const workflowHealth = [
  { name: 'Run Engine', status: 'Online' as const },
  { name: 'Queue Processor', status: 'Stable' as const },
  { name: 'Retry Logic', status: 'Active' as const },
  { name: 'Failed Jobs', status: 'Warning' as const },
]

function WorkflowStatusBadge({ status }: { status: (typeof workflows)[number]['status'] }) {
  const styles = {
    Active: 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    Running: 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    Review: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status === 'Running' && (
        <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-current" />
      )}
      {status}
    </span>
  )
}

function HealthStatusBadge({ status }: { status: 'Online' | 'Stable' | 'Active' | 'Warning' }) {
  return (
    <span className={`text-xs font-medium ${status === 'Warning' ? 'text-amber-300' : 'text-[#ccff00]'}`}>
      {status === 'Warning' ? '3 Warnings' : status}
    </span>
  )
}

export default function AutomationHubPopup({ onClose }: AutomationHubPopupProps) {
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
      aria-labelledby="automation-hub-title"
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
                    Runs Today
                  </span>
                  <span className="text-[11px] text-white/35">1,284 runs · 86 active workflows</span>
                </div>

                <h1 id="automation-hub-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Automation <span className="text-[#0080ff]">HUB</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Trigger-based workflows that eliminate repetitive manual processes across operations,
                  sales, finance, support, and approvals.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Automation Hub"
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
                    <Workflow size={16} strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                      Workflow Automation Layer
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-white/50">
                    Automation Hub is the centralized workflow engine for creating, monitoring, and
                    managing trigger-based automations — reducing repetitive work, improving response
                    time, and keeping business processes moving without constant manual input.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['Event Triggers', 'Schedules', 'Approvals', 'Notifications'].map((tag) => (
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
                  <h2 className="text-sm font-semibold text-white">Workflow Builder</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Build automations using triggers, conditions, actions, approvals, and system rules
                    without manually repeating operational tasks.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to="/diagrams"
                      onClick={onClose}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Create Automation
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveTab('workflows')}
                      className="inline-flex flex-1 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      Run History
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">Automation Capabilities</h2>
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
              <div>
                <h2 className="text-base font-semibold text-white">Automation Performance</h2>
                <p className="mt-1 text-xs text-white/40">Real-time metrics across all active workflows</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {automationStats.map((item) => (
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

          {activeTab === 'workflows' && (
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Active Workflows</h2>
                  <p className="mt-1 text-xs text-white/40">5 workflows running across connected systems</p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  View All Runs
                </button>
              </div>

              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.name}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                          <GitBranch size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{workflow.name}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/35">
                            <Play size={11} />
                            {workflow.trigger}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40">{workflow.runs} runs</span>
                        <WorkflowStatusBadge status={workflow.status} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/30">
                        <span>Success Rate</span>
                        <span>{workflow.success}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${
                            workflow.success < 90 ? 'bg-amber-400' : 'bg-[#0080ff]'
                          }`}
                          style={{ width: `${workflow.success}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'triggers' && (
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Trigger Types</h2>
                <p className="mt-1 text-xs text-white/40">8 event types available for workflow automation</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {triggerTypes.map((trigger) => (
                  <div
                    key={trigger}
                    className="rounded-lg border border-white/[0.08] bg-[#080a0e]/60 px-3 py-2 text-sm text-white/60 transition hover:border-[#0080ff]/25 hover:text-white"
                  >
                    {trigger}
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Automation Activity</h2>
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
                            Live
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold text-white">Workflow Health</h2>
                  </div>
                  <div className="space-y-2">
                    {workflowHealth.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                      >
                        <span className="text-sm text-white/50">{item.name}</span>
                        <HealthStatusBadge status={item.status} />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-lg border border-[#ccff00]/20 bg-[#ccff00]/[0.06] p-4">
                    <div className="flex items-center gap-2">
                      <Timer size={16} className="text-[#ccff00]" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-white">Queue processing stable</p>
                    </div>
                    <p className="mt-1 text-xs text-white/40">Avg. runtime 1.8s · Last checked 1 min ago</p>
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
