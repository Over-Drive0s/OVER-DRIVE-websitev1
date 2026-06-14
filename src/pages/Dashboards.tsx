import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Calendar,
  ChevronDown,
  Circle,
  LayoutDashboard,
  Radio,
  Sparkles,
  Target,
  Truck,
  Users,
  Zap,
} from 'lucide-react'
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import ExecutiveDashboardView from '../components/ExecutiveDashboardView'
import PlatformBackground from '../components/PlatformBackground'

type ExecutiveTab = 'overview' | 'kpis' | 'jobs'
type OperationsTab = 'queue' | 'capacity' | 'issues'
type SalesTab = 'pipeline' | 'deals' | 'scoreboard'
type Role = 'executive' | 'operations' | 'sales'
type JobFilter = 'all' | 'In Progress' | 'Completed' | 'Delayed'
type QueuePriority = 'all' | 'Critical' | 'High' | 'Normal'
type PipelineStage = 'all' | 'Lead' | 'Qualified' | 'Proposal' | 'Closed'

const roles: { id: Role; label: string }[] = [
  { id: 'executive', label: 'Executive view' },
  { id: 'operations', label: 'Operations view' },
  { id: 'sales', label: 'Sales view' },
]

const executiveTabs = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'kpis' as const, label: 'KPIs', icon: BarChart3 },
  { id: 'jobs' as const, label: 'Jobs', icon: Briefcase },
]

const operationsTabs = [
  { id: 'queue' as const, label: 'Dispatch queue', icon: Radio },
  { id: 'capacity' as const, label: 'Team capacity', icon: Users },
  { id: 'issues' as const, label: 'Open issues', icon: Zap },
]

const salesTabs = [
  { id: 'pipeline' as const, label: 'Pipeline', icon: Target },
  { id: 'deals' as const, label: 'Active deals', icon: Briefcase },
  { id: 'scoreboard' as const, label: 'Rep scoreboard', icon: BarChart3 },
]

const operationsStats = [
  { title: 'Active jobs', value: '128', change: '↑ 8.4% vs last month' },
  { title: 'On-time delivery', value: '92%', change: '↑ 6.7%' },
  { title: 'Avg. cycle time', value: '4.2h', change: '↓ 18 min' },
  { title: 'Open issues', value: '6', change: '2 critical' },
]

const salesStats = [
  { title: 'Pipeline value', value: '$1.2M', change: '↑ 22% this quarter' },
  { title: 'Deals closed', value: '47', change: '↑ 9 this month' },
  { title: 'Win rate', value: '38%', change: '↑ 3.2 pts' },
  { title: 'Avg. deal size', value: '$4,850', change: '↑ $320' },
]

const initialQueue = [
  { id: '1', route: 'Brooklyn → Newark', priority: 'Critical' as const, eta: '18 min', assigned: false },
  { id: '2', route: 'Queens pickup #4421', priority: 'High' as const, eta: '32 min', assigned: false },
  { id: '3', route: 'Manhattan express', priority: 'Normal' as const, eta: '45 min', assigned: true },
  { id: '4', route: 'Staten Island run', priority: 'High' as const, eta: '51 min', assigned: false },
  { id: '5', route: 'Warehouse restock', priority: 'Normal' as const, eta: '1h 10m', assigned: true },
]

const teamCapacity = [
  { name: 'Dispatch A', load: 88, jobs: 14 },
  { name: 'Dispatch B', load: 62, jobs: 9 },
  { name: 'Field crew 1', load: 74, jobs: 11 },
  { name: 'Field crew 2', load: 45, jobs: 6 },
]

const openIssues = [
  { id: '1', title: 'GPS sync delay on Unit 12', severity: 'Critical' as const, resolved: false },
  { id: '2', title: 'SLA breach risk — Route 88', severity: 'High' as const, resolved: false },
  { id: '3', title: 'Inventory count mismatch', severity: 'Normal' as const, resolved: false },
  { id: '4', title: 'Driver check-in overdue', severity: 'High' as const, resolved: false },
]

const pipelineStages = [
  { stage: 'Lead' as const, count: 24, value: '$180K' },
  { stage: 'Qualified' as const, count: 16, value: '$320K' },
  { stage: 'Proposal' as const, count: 9, value: '$410K' },
  { stage: 'Closed' as const, count: 47, value: '$890K' },
]

const salesDeals = [
  { id: '1', name: 'Metro Logistics contract', value: '$84,000', stage: 'Proposal' as const, rep: 'Sarah K.' },
  { id: '2', name: 'Greenfield retail rollout', value: '$52,000', stage: 'Qualified' as const, rep: 'Mike T.' },
  { id: '3', name: 'Harbor fleet upgrade', value: '$120,000', stage: 'Lead' as const, rep: 'Sarah K.' },
  { id: '4', name: 'Summit Health portal', value: '$38,500', stage: 'Closed' as const, rep: 'Jen L.' },
  { id: '5', name: 'Northside warehouse', value: '$67,200', stage: 'Proposal' as const, rep: 'Mike T.' },
]

const repScoreboard = [
  { name: 'Sarah K.', closed: 14, quota: 85, revenue: '$312K' },
  { name: 'Mike T.', closed: 11, quota: 72, revenue: '$248K' },
  { name: 'Jen L.', closed: 9, quota: 68, revenue: '$196K' },
  { name: 'Alex R.', closed: 7, quota: 54, revenue: '$142K' },
]

const queuePriorities: QueuePriority[] = ['all', 'Critical', 'High', 'Normal']

function OperationsView({
  activeTab,
  queue,
  setQueue,
  queueFilter,
  setQueueFilter,
  selectedTeam,
  setSelectedTeam,
  issues,
  setIssues,
}: {
  activeTab: OperationsTab
  queue: typeof initialQueue
  setQueue: Dispatch<SetStateAction<typeof initialQueue>>
  queueFilter: QueuePriority
  setQueueFilter: (f: QueuePriority) => void
  selectedTeam: number | null
  setSelectedTeam: (i: number | null) => void
  issues: typeof openIssues
  setIssues: Dispatch<SetStateAction<typeof openIssues>>
}) {
  const filteredQueue = useMemo(() => {
    if (queueFilter === 'all') return queue
    return queue.filter((item) => item.priority === queueFilter)
  }, [queue, queueFilter])

  const assignDispatch = (id: string) => {
    setQueue((items) =>
      items.map((item) => (item.id === id ? { ...item, assigned: true } : item)),
    )
  }

  const resolveIssue = (id: string) => {
    setIssues((items) =>
      items.map((item) => (item.id === id ? { ...item, resolved: true } : item)),
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {operationsStats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border border-[#ccff00]/15 bg-[#ccff00]/[0.04] p-4 sm:p-5"
          >
            <p className="text-[10px] uppercase tracking-wider text-white/35 sm:text-xs">{stat.title}</p>
            <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">{stat.value}</p>
            <p className="mt-2 text-xs text-[#ccff00]/80">{stat.change}</p>
          </div>
        ))}
      </div>

      {activeTab === 'queue' && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {queuePriorities.map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setQueueFilter(priority)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  queueFilter === priority
                    ? 'bg-[#ccff00]/15 text-[#ccff00]'
                    : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                }`}
              >
                {priority === 'all' ? 'All priorities' : priority}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredQueue.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                  item.assigned
                    ? 'border-[#ccff00]/20 bg-[#ccff00]/[0.04]'
                    : 'border-white/[0.08] bg-[#080a0e]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Truck size={18} className="mt-0.5 shrink-0 text-[#0080ff]" />
                  <div>
                    <p className="font-medium text-white/90">{item.route}</p>
                    <p className="mt-0.5 text-xs text-white/40">ETA {item.eta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      item.priority === 'Critical'
                        ? 'bg-red-500/15 text-red-400'
                        : item.priority === 'High'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {item.priority}
                  </span>
                  {item.assigned ? (
                    <span className="text-xs font-medium text-[#ccff00]">Dispatched</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => assignDispatch(item.id)}
                      className="rounded-md bg-[#0080ff] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Assign crew
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'capacity' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {teamCapacity.map((team, i) => (
            <button
              key={team.name}
              type="button"
              onClick={() => setSelectedTeam(selectedTeam === i ? null : i)}
              className={`rounded-lg border p-4 text-left transition-all ${
                selectedTeam === i
                  ? 'border-[#ccff00]/35 bg-[#ccff00]/[0.06]'
                  : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#0080ff]/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{team.name}</p>
                <span className="text-sm text-white/50">{team.jobs} jobs</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    team.load > 80 ? 'bg-red-500/80' : team.load > 60 ? 'bg-amber-400/80' : 'bg-brand-gradient'
                  }`}
                  style={{ width: `${team.load}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/40">{team.load}% capacity utilized</p>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="mt-4 space-y-2">
          {issues.filter((i) => !i.resolved).map((issue) => (
            <div
              key={issue.id}
              className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-[#080a0e]/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-white/90">{issue.title}</p>
                <p className="mt-0.5 text-xs text-white/40">{issue.severity} severity</p>
              </div>
              <button
                type="button"
                onClick={() => resolveIssue(issue.id)}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-[#ccff00]/30 hover:text-[#ccff00]"
              >
                Mark resolved
              </button>
            </div>
          ))}
          {issues.every((i) => i.resolved) && (
            <p className="py-8 text-center text-sm text-[#ccff00]/80">All issues resolved — queue clear.</p>
          )}
        </div>
      )}
    </>
  )
}

function SalesView({
  activeTab,
  pipelineStage,
  setPipelineStage,
  deals,
  setDeals,
  selectedRep,
  setSelectedRep,
}: {
  activeTab: SalesTab
  pipelineStage: PipelineStage
  setPipelineStage: (s: PipelineStage) => void
  deals: typeof salesDeals
  setDeals: Dispatch<SetStateAction<typeof salesDeals>>
  selectedRep: number | null
  setSelectedRep: (i: number | null) => void
}) {
  const filteredDeals = useMemo(() => {
    if (pipelineStage === 'all') return deals
    return deals.filter((d) => d.stage === pipelineStage)
  }, [deals, pipelineStage])

  const advanceDeal = (id: string) => {
    const order: PipelineStage[] = ['Lead', 'Qualified', 'Proposal', 'Closed']
    setDeals((items) =>
      items.map((deal) => {
        if (deal.id !== id) return deal
        const idx = order.indexOf(deal.stage)
        if (idx < 0 || idx >= order.length - 1) return deal
        return { ...deal, stage: order[idx + 1] as typeof deal.stage }
      }),
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {salesStats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border border-[#0080ff]/20 bg-[#0080ff]/[0.05] p-4 sm:p-5"
          >
            <p className="text-[10px] uppercase tracking-wider text-white/35 sm:text-xs">{stat.title}</p>
            <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">{stat.value}</p>
            <p className="mt-2 text-xs text-[#ccff00]/80">{stat.change}</p>
          </div>
        ))}
      </div>

      {activeTab === 'pipeline' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {pipelineStages.map((stage) => (
              <button
                key={stage.stage}
                type="button"
                onClick={() => setPipelineStage(pipelineStage === stage.stage ? 'all' : stage.stage)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  pipelineStage === stage.stage
                    ? 'border-[#0080ff]/40 bg-[#0080ff]/10 glow-brand-blue'
                    : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#0080ff]/20'
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider text-white/35">{stage.stage}</p>
                <p className="mt-1 text-lg font-semibold text-white">{stage.count}</p>
                <p className="text-xs text-[#ccff00]/75">{stage.value}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4"
              >
                <p className="font-medium text-white">{deal.name}</p>
                <p className="mt-1 text-sm text-[#ccff00]">{deal.value}</p>
                <p className="mt-2 text-xs text-white/40">
                  {deal.stage} · {deal.rep}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="mt-4 space-y-2">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-[#080a0e]/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-white/90">{deal.name}</p>
                <p className="mt-0.5 text-sm text-[#ccff00]">{deal.value}</p>
                <p className="mt-1 text-xs text-white/40">{deal.rep}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#0080ff]/10 px-2.5 py-0.5 text-xs text-[#0080ff]">
                  {deal.stage}
                </span>
                {deal.stage !== 'Closed' && (
                  <button
                    type="button"
                    onClick={() => advanceDeal(deal.id)}
                    className="rounded-md bg-[#0080ff] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white hover:text-black"
                  >
                    Advance stage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'scoreboard' && (
        <div className="mt-4 space-y-2">
          {repScoreboard.map((rep, i) => (
            <button
              key={rep.name}
              type="button"
              onClick={() => setSelectedRep(selectedRep === i ? null : i)}
              className={`flex w-full flex-col gap-2 rounded-lg border px-4 py-3 text-left transition-all sm:flex-row sm:items-center sm:justify-between ${
                selectedRep === i
                  ? 'border-[#0080ff]/35 bg-[#0080ff]/[0.06]'
                  : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#0080ff]/20'
              }`}
            >
              <div>
                <p className="font-medium text-white">{rep.name}</p>
                <p className="text-xs text-white/40">{rep.closed} deals closed · {rep.revenue}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${rep.quota}%` }} />
                </div>
                <span className="text-sm font-semibold text-[#ccff00]">{rep.quota}%</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export default function Dashboards() {
  const [activeRole, setActiveRole] = useState<Role>('executive')
  const [executiveTab, setExecutiveTab] = useState<ExecutiveTab>('overview')
  const [operationsTab, setOperationsTab] = useState<OperationsTab>('queue')
  const [salesTab, setSalesTab] = useState<SalesTab>('pipeline')
  const [selectedStat, setSelectedStat] = useState(0)
  const [jobFilter, setJobFilter] = useState<JobFilter>('all')
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [queue, setQueue] = useState(initialQueue)
  const [queueFilter, setQueueFilter] = useState<QueuePriority>('all')
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [issues, setIssues] = useState(openIssues)
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('all')
  const [deals, setDeals] = useState(salesDeals)
  const [selectedRep, setSelectedRep] = useState<number | null>(null)

  const handleRoleChange = (role: Role) => {
    setActiveRole(role)
    setSelectedStat(0)
    setRoleMenuOpen(false)
  }

  const roleDescriptions: Record<Role, string> = {
    executive: 'Explore tabs, switch role views, and filter jobs — a working sample of the dashboards we build for clients on Overdrive IO.',
    operations: 'Run dispatch assignments, monitor team capacity, and resolve field issues in this ops control simulator.',
    sales: 'Browse the pipeline funnel, advance deals, and review rep performance in this sales dashboard simulator.',
  }

  const currentTabs =
    activeRole === 'executive'
      ? executiveTabs
      : activeRole === 'operations'
        ? operationsTabs
        : salesTabs

  const activeTabId =
    activeRole === 'executive'
      ? executiveTab
      : activeRole === 'operations'
        ? operationsTab
        : salesTab

  const setActiveTab = (id: string) => {
    if (activeRole === 'executive') setExecutiveTab(id as ExecutiveTab)
    else if (activeRole === 'operations') setOperationsTab(id as OperationsTab)
    else setSalesTab(id as SalesTab)
    setSelectedStat(0)
  }

  return (
    <div
      data-scroll-root
      className="relative flex min-h-full flex-col overflow-x-hidden bg-[#050607]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
        <PlatformBackground />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6">
          <Link
            to="/index"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to simulators
          </Link>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
              Dashboard Systems
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]">
              <Sparkles size={10} />
              Live simulator
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Operations dashboard preview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">{roleDescriptions[activeRole]}</p>
        </div>

        <div className="glow-brand overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080a0e]/95 shadow-2xl backdrop-blur-sm">
          <div className="border-b border-white/[0.06] bg-[#050607]/60 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-1">
                {currentTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      activeTabId === tab.id
                        ? activeRole === 'operations'
                          ? 'bg-[#ccff00]/15 text-[#ccff00]'
                          : 'bg-[#0080ff]/15 text-[#0080ff] glow-brand-blue'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleMenuOpen((open) => !open)}
                    className="flex items-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-xs text-white/60 transition-colors hover:border-[#0080ff]/25 hover:text-white/80"
                  >
                    {roles.find((r) => r.id === activeRole)?.label}
                    <ChevronDown size={13} className={roleMenuOpen ? 'rotate-180' : ''} />
                  </button>
                  {roleMenuOpen && (
                    <div className="absolute right-0 z-20 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-white/10 bg-[#0a0c10] py-1 shadow-xl">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleRoleChange(role.id)}
                          className={`block w-full px-3 py-2 text-left text-xs transition ${
                            activeRole === role.id
                              ? 'bg-[#0080ff]/10 text-[#0080ff]'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-xs text-white/60 transition-colors hover:border-[#0080ff]/25 hover:text-white/80"
                >
                  <Calendar size={13} />
                  Last 30 days
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeRole === 'executive' && (
              <ExecutiveDashboardView
                activeTab={executiveTab}
                selectedStat={selectedStat}
                setSelectedStat={setSelectedStat}
                jobFilter={jobFilter}
                setJobFilter={setJobFilter}
              />
            )}
            {activeRole === 'operations' && (
              <OperationsView
                activeTab={operationsTab}
                queue={queue}
                setQueue={setQueue}
                queueFilter={queueFilter}
                setQueueFilter={setQueueFilter}
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
                issues={issues}
                setIssues={setIssues}
              />
            )}
            {activeRole === 'sales' && (
              <SalesView
                activeTab={salesTab}
                pipelineStage={pipelineStage}
                setPipelineStage={setPipelineStage}
                deals={deals}
                setDeals={setDeals}
                selectedRep={selectedRep}
                setSelectedRep={setSelectedRep}
              />
            )}
          </div>

          <div className="border-t border-white/[0.06] bg-[#050607]/40 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/35">
              <span className="flex items-center gap-2">
                <Circle size={8} className="fill-[#ccff00] text-[#ccff00]" />
                Simulator data — not connected to live systems
              </span>
              <span>
                Viewing: <span className="text-white/55">{roles.find((r) => r.id === activeRole)?.label}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
