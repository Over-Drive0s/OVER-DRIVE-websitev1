import {
  Calendar,
  ChevronDown,
  Circle,
  Database,
  Link2,
  Settings,
  Truck,
  Workflow,
  Zap,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

type Tab = 'overview' | 'jobs' | 'automations'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'automations', label: 'Automations' },
]

const tabStats: Record<Tab, { title: string; value: string; change: string }[]> = {
  overview: [
    { title: 'Revenue', value: '$2.84M', change: '↑ 12.6% vs last month' },
    { title: 'Active Jobs', value: '128', change: '↑ 8.4% vs last month' },
    { title: 'Customers', value: '2,543', change: '↑ 15.3% vs last month' },
    { title: 'On Time %', value: '92%', change: '↑ 6.7% vs last month' },
  ],
  jobs: [
    { title: 'In Progress', value: '47', change: '↑ 3 new today' },
    { title: 'Scheduled', value: '81', change: 'Next 7 days' },
    { title: 'Completed', value: '312', change: '↑ 22 this week' },
    { title: 'Avg. Duration', value: '4.2h', change: '↓ 18min improved' },
  ],
  automations: [
    { title: 'Runs Today', value: '847', change: '↑ 124 vs yesterday' },
    { title: 'Success Rate', value: '99.4%', change: '↑ 0.2% this week' },
    { title: 'Time Saved', value: '38h', change: 'Est. this week' },
    { title: 'Active Flows', value: '24', change: '3 triggered now' },
  ],
}

function Stat({
  title,
  value,
  change,
  active,
  onHover,
}: {
  title: string
  value: string
  change: string
  active?: boolean
  onHover: () => void
}) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      className={`rounded-lg border p-4 text-left transition-all duration-300 sm:p-5 ${
        active
          ? 'border-[#0080ff]/35 bg-[#0080ff]/[0.06] glow-brand-blue'
          : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#0080ff]/20 hover:bg-[#0080ff]/[0.04]'
      }`}
    >
      <p className="text-xs uppercase text-white/35">{title}</p>
      <div className="mt-2 text-xl font-semibold text-white sm:text-2xl">{value}</div>
      <p className="mt-2 text-xs text-[#ccff00]/80">{change}</p>
    </button>
  )
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-white/60">
      <span className="flex items-center gap-2">
        <Circle size={8} className="fill-current text-[#0080ff]" />
        {label}
      </span>
      <span className="text-white/80">{value}</span>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
      <h4 className="mb-4 text-sm font-medium text-white">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Activity({ text, time, highlight }: { text: string; time: string; highlight?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-sm transition-colors ${
        highlight ? 'bg-[#0080ff]/[0.08] text-white' : 'text-white/55'
      }`}
    >
      <span className="min-w-0 truncate">{text}</span>
      <span className="shrink-0 text-white/35">{time}</span>
    </div>
  )
}

function Health({ icon, label, status }: { icon: ReactNode; label: string; status: string }) {
  const isHealthy = status === 'Operational'
  return (
    <div className="flex items-center justify-between text-sm text-white/55">
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      <span className={isHealthy ? 'text-[#ccff00]' : 'text-amber-400'}>{status}</span>
    </div>
  )
}

function JobsView() {
  const jobs = [
    { id: 'JO-1084', client: 'Northpoint Fleet', status: 'In Progress', pct: 72 },
    { id: 'JO-1083', client: 'ACME Logistics', status: 'Scheduled', pct: 0 },
    { id: 'JO-1082', client: 'Summit Auto', status: 'Completed', pct: 100 },
    { id: 'JO-1081', client: 'Covalent Supply', status: 'In Progress', pct: 45 },
  ]

  return (
    <Panel title="Active Job Queue">
      {jobs.map((job) => (
        <div key={job.id} className="space-y-2 border-b border-white/5 pb-3 last:border-0 last:pb-0">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-white">{job.id}</span>
            <span
              className={`text-xs ${
                job.status === 'Completed'
                  ? 'text-[#ccff00]'
                  : job.status === 'Scheduled'
                    ? 'text-white/40'
                    : 'text-[#0080ff]'
              }`}
            >
              {job.status}
            </span>
          </div>
          <p className="text-xs text-white/45">{job.client}</p>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#0080ff] transition-all duration-700"
              style={{ width: `${job.pct}%` }}
            />
          </div>
        </div>
      ))}
    </Panel>
  )
}

function AutomationsView() {
  const flows = [
    { name: 'Invoice → Accounting sync', runs: 142, status: 'running' },
    { name: 'Job status notifications', runs: 89, status: 'running' },
    { name: 'Inventory reorder trigger', runs: 12, status: 'idle' },
    { name: 'Customer follow-up sequence', runs: 34, status: 'running' },
  ]

  return (
    <Panel title="Automation Flows">
      {flows.map((flow) => (
        <div key={flow.name} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-white">{flow.name}</p>
            <p className="text-xs text-white/40">{flow.runs} runs today</p>
          </div>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              flow.status === 'running'
                ? 'bg-[#0080ff]/15 text-[#0080ff]'
                : 'bg-white/5 text-white/40'
            }`}
          >
            {flow.status === 'running' && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0080ff]" />
            )}
            {flow.status}
          </span>
        </div>
      ))}
    </Panel>
  )
}

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [hoveredStat, setHoveredStat] = useState(0)
  const stats = tabStats[activeTab]

  return (
    <div className="relative text-white">
      <div className="absolute -inset-4 -z-10 animate-pulse-glow rounded-3xl bg-[#0080ff]/[0.08] blur-3xl" />
      <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-[#0080ff]/10 via-transparent to-transparent" />

      <div className="glow-brand overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080a0e]/95 shadow-2xl backdrop-blur-sm">
        <div className="border-b border-white/[0.06] bg-[#050607]/50 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setHoveredStat(0)
                  }}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#0080ff]/15 text-[#0080ff] glow-brand-blue'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-xs text-white/60 transition-colors hover:border-[#0080ff]/25 hover:text-white/80"
            >
              <Calendar size={13} /> May 12 – Jun 12, 2024 <ChevronDown size={13} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((stat, i) => (
              <Stat
                key={`${activeTab}-${stat.title}`}
                {...stat}
                active={hoveredStat === i}
                onHover={() => setHoveredStat(i)}
              />
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="animate-fade-up mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
                <h4 className="mb-4 text-sm font-medium text-white">Revenue Over Time</h4>
                <div className="relative h-40 sm:h-48">
                  <div className="absolute inset-0 grid grid-rows-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-white/[0.06]" />
                    ))}
                  </div>
                  <svg viewBox="0 0 600 180" className="relative h-full w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0080ff" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0080ff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#chartGradient)"
                      points="0,120 40,145 80,110 130,100 175,75 220,130 260,140 300,85 350,70 400,90 450,40 500,30 540,65 600,18 600,180 0,180"
                    />
                    <polyline
                      className="animate-draw-line"
                      fill="none"
                      stroke="#0080ff"
                      strokeWidth="2.5"
                      points="0,120 40,145 80,110 130,100 175,75 220,130 260,140 300,85 350,70 400,90 450,40 500,30 540,65 600,18"
                    />
                  </svg>
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
                <h4 className="mb-6 text-sm font-medium text-white">Operational Status</h4>
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
                  <div className="absolute inset-0 rounded-full bg-[#0080ff]/10 blur-xl" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-full border-[6px] border-[#0080ff]/80 sm:border-[8px]">
                    <div className="text-center">
                      <div className="text-xl text-white sm:text-2xl">92%</div>
                      <div className="text-xs text-[#ccff00]">On Track</div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-2.5 text-sm text-white/60">
                  <Status label="On Track" value="92%" />
                  <Status label="At Risk" value="6%" />
                  <Status label="Delayed" value="2%" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="animate-fade-up mt-4 grid gap-4 lg:grid-cols-2">
              <JobsView />
              <Panel title="Dispatch Map">
                <div className="relative flex h-40 items-center justify-center rounded-lg border border-white/[0.06] bg-[#080a0e]/50">
                  <div className="absolute inset-0 bg-dot-pattern opacity-30" />
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-2 w-2 rounded-full bg-[#0080ff] shadow-[0_0_8px_rgba(0,128,255,0.6)]"
                      style={{
                        top: `${20 + i * 14}%`,
                        left: `${15 + i * 16}%`,
                      }}
                    />
                  ))}
                  <Truck size={28} className="relative text-white/20" />
                </div>
                <p className="mt-3 text-xs text-white/40">47 technicians active across 3 regions</p>
              </Panel>
            </div>
          )}

          {activeTab === 'automations' && (
            <div className="animate-fade-up mt-4 grid gap-4 lg:grid-cols-2">
              <AutomationsView />
              <Panel title="Workflow Pipeline">
                <div className="space-y-3">
                  {['Trigger', 'Process', 'Sync', 'Notify'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${
                          i <= 2
                            ? 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]'
                            : 'border-white/[0.08] bg-[#080a0e]/50 text-white/40'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{step}</p>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#0080ff]/60 transition-all duration-1000"
                            style={{ width: i <= 2 ? '100%' : '30%' }}
                          />
                        </div>
                      </div>
                      {i <= 2 && <Workflow size={14} className="shrink-0 text-[#0080ff]/60" />}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Panel title="Recent Activity">
                <Activity text="New job order #JO-1084 created" time="2m ago" highlight />
                <Activity text="Inventory update — 2019 Ford F-150" time="15m ago" />
                <Activity text="Customer John D. updated" time="1h ago" />
              </Panel>

              <Panel title="System Health">
                <Health icon={<Zap size={15} />} label="API Gateway" status="Operational" />
                <Health icon={<Database size={15} />} label="Database" status="Operational" />
                <Health icon={<Settings size={15} />} label="Automations" status="Operational" />
                <Health icon={<Link2 size={15} />} label="Integrations" status="Degraded" />
              </Panel>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
