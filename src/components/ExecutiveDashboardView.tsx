import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MiniSparkline } from './InfographicWidgets'

type ExecutiveTab = 'overview' | 'kpis' | 'jobs'
type JobFilter = 'all' | 'In Progress' | 'Completed' | 'Delayed'
type DateRange = '7d' | '30d' | '90d' | 'qtd'
type ChartMetric = 'revenue' | 'margin' | 'accounts'

const executiveStats = [
  {
    title: 'Revenue',
    values: { '7d': '$412K', '30d': '$2.84M', '90d': '$7.1M', qtd: '$2.84M' },
    changes: { '7d': '↑ 8.2% vs prior week', '30d': '↑ 12.6% vs last month', '90d': '↑ 18.4% YoY', qtd: '↑ 12.6% vs last quarter' },
    sparkline: [62, 68, 71, 65, 78, 82, 88, 91, 86, 94],
    detail: 'Enterprise renewals drove 64% of growth. Top segment: logistics.',
  },
  {
    title: 'Gross margin',
    values: { '7d': '33.8%', '30d': '34.2%', '90d': '33.9%', qtd: '34.2%' },
    changes: { '7d': '↑ 0.4 pts', '30d': '↑ 1.8 pts', '90d': '↑ 2.1 pts', qtd: '↑ 1.8 pts' },
    sparkline: [30, 31, 32, 31, 33, 33, 34, 34, 33, 34],
    detail: 'Cost optimization in fulfillment improved margin by 1.2 pts.',
  },
  {
    title: 'Active accounts',
    values: { '7d': '2,498', '30d': '2,543', '90d': '2,612', qtd: '2,543' },
    changes: { '7d': '↑ 42 new', '30d': '↑ 15.3%', '90d': '↑ 22.1%', qtd: '↑ 15.3%' },
    sparkline: [2100, 2180, 2240, 2310, 2380, 2420, 2460, 2498, 2510, 2543],
    detail: 'Net retention at 108%. 89 accounts upgraded tier this period.',
  },
  {
    title: 'Forecast accuracy',
    values: { '7d': '89%', '30d': '91%', '90d': '90%', qtd: '91%' },
    changes: { '7d': '↑ 2.8%', '30d': '↑ 4.1%', '90d': '↑ 3.6%', qtd: '↑ 4.1%' },
    sparkline: [82, 84, 85, 86, 87, 88, 89, 90, 90, 91],
    detail: 'ML pipeline adjustments reduced variance by 6% in Q2.',
  },
]

const kpiGrid = [
  { title: 'Total revenue', value: '$128,400', trend: '↑ 12.6% this month', sparkline: [72, 78, 81, 85, 88, 92, 95], category: 'Finance' },
  { title: 'Active jobs', value: '42', trend: '6 in progress', sparkline: [28, 32, 35, 38, 40, 41, 42], category: 'Operations' },
  { title: 'Completion rate', value: '87%', trend: '↑ 4.2% vs last week', sparkline: [78, 80, 82, 83, 84, 86, 87], category: 'Operations' },
  { title: 'Team output', value: '214 tasks', trend: 'Across 5 teams', sparkline: [140, 160, 175, 190, 200, 208, 214], category: 'People' },
  { title: 'Open issues', value: '6', trend: '2 need review', sparkline: [12, 10, 9, 8, 7, 7, 6], category: 'Support' },
  { title: 'Pending approvals', value: '13', trend: 'Awaiting sign-off', sparkline: [18, 16, 15, 14, 14, 13, 13], category: 'Finance' },
]

const executiveJobs = [
  { name: 'Fleet dispatch rollout', status: 'In Progress' as const, owner: 'Ops Team', progress: 68, due: 'Jun 12' },
  { name: 'CRM integration', status: 'Waiting Approval' as const, owner: 'Systems Team', progress: 90, due: 'Jun 8' },
  { name: 'Inventory sync', status: 'Completed' as const, owner: 'Warehouse', progress: 100, due: 'May 28' },
  { name: 'Client portal v2', status: 'Delayed' as const, owner: 'Dev Team', progress: 45, due: 'Jun 20' },
  { name: 'KPI dashboard build', status: 'In Progress' as const, owner: 'Design Team', progress: 72, due: 'Jun 15' },
  { name: 'Invoice automation', status: 'Completed' as const, owner: 'Finance', progress: 100, due: 'May 22' },
]

const activityItems = [
  { id: '1', text: 'Operations cleared 12 open tickets', time: '12 min ago', team: 'Operations', action: 'View queue', href: '/dashboards' },
  { id: '2', text: 'Sales closed 3 deals today', time: '1 hr ago', team: 'Sales', action: 'See pipeline', href: '/dashboards' },
  { id: '3', text: 'Finance processed 9 invoices', time: '2 hr ago', team: 'Finance', action: 'Open ledger', href: '/pricing' },
  { id: '4', text: 'Design team shipped dashboard v1', time: '4 hr ago', team: 'Product', action: 'View release', href: '/index' },
  { id: '5', text: 'New enterprise account onboarded', time: '6 hr ago', team: 'Success', action: 'Account profile', href: '/platform' },
]

const departments = [
  { name: 'Operations', value: 38, revenue: '$1.08M', color: '#0080ff' },
  { name: 'Sales', value: 28, revenue: '$796K', color: '#4f7cff' },
  { name: 'Finance', value: 18, revenue: '$512K', color: '#0066cc' },
  { name: 'Product', value: 16, revenue: '$456K', color: '#3399ff' },
]

const regions = [
  { id: 'north', name: 'North', accounts: 842, growth: '+14%', revenue: '$980K', active: true },
  { id: 'south', name: 'South', accounts: 612, growth: '+11%', revenue: '$720K', active: true },
  { id: 'west', name: 'West', accounts: 534, growth: '+18%', revenue: '$640K', active: true },
  { id: 'east', name: 'East', accounts: 555, growth: '+9%', revenue: '$500K', active: false },
]

const pendingApprovals = [
  { id: '1', title: 'Q2 budget reallocation', amount: '$48,000', requester: 'Finance', urgent: true },
  { id: '2', title: 'Vendor contract renewal', amount: '$12,400', requester: 'Procurement', urgent: false },
  { id: '3', title: 'Headcount expansion — Ops', amount: '3 roles', requester: 'HR', urgent: false },
]

const businessUnits = [
  { title: 'Logistics', metric: '$1.4M', metricLabel: 'Revenue', sparkline: [60, 65, 70, 72, 78, 82, 88] },
  { title: 'Retail', metric: '$890K', metricLabel: 'Revenue', sparkline: [45, 48, 52, 55, 58, 62, 65] },
  { title: 'Enterprise', metric: '$550K', metricLabel: 'Revenue', sparkline: [30, 32, 35, 38, 42, 45, 48] },
]

const chartPaths: Record<ChartMetric, string> = {
  revenue: '0,120 40,145 80,110 130,100 175,75 220,130 260,140 300,85 350,70 400,90 450,40 500,30 540,65 600,18',
  margin: '0,140 60,130 120,125 180,115 240,100 300,95 360,88 420,82 480,78 540,72 600,68',
  accounts: '0,150 50,140 100,128 150,118 200,105 250,98 300,88 350,82 400,75 450,68 500,58 550,52 600,45',
}

const chartLabels: Record<ChartMetric, string> = {
  revenue: 'Revenue over time',
  margin: 'Gross margin trend',
  accounts: 'Account growth',
}

const jobFilters: JobFilter[] = ['all', 'In Progress', 'Completed', 'Delayed']
const dateRanges: { id: DateRange; label: string }[] = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: 'qtd', label: 'QTD' },
]

function StatCard({
  title,
  value,
  change,
  sparkline,
  active,
  onSelect,
}: {
  title: string
  value: string
  change: string
  sparkline: number[]
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group rounded-lg border p-4 text-left transition-all duration-200 sm:p-5 ${
        active
          ? 'border-[#0080ff]/40 bg-[#0080ff]/[0.08] glow-brand-blue'
          : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#0080ff]/20 hover:bg-[#0080ff]/[0.04]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wider text-white/35 sm:text-xs">{title}</p>
        <ChevronRight
          size={14}
          className={`shrink-0 transition-transform ${active ? 'text-[#0080ff] translate-x-0.5' : 'text-white/20 group-hover:text-white/40'}`}
        />
      </div>
      <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-[#ccff00]/80">{change}</p>
      <div className="mt-3 opacity-70">
        <MiniSparkline points={sparkline} color={active ? '#0080ff' : '#4f7cff'} />
      </div>
    </button>
  )
}

function HealthRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#healthGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0080ff" />
            <stop offset="100%" stopColor="#ccff00" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white sm:text-3xl">{score}%</span>
        <span className="text-[10px] uppercase tracking-wider text-white/40">Health</span>
      </div>
    </div>
  )
}

function DonutChart({
  segments,
  selected,
  onSelect,
}: {
  segments: { name: string; value: number; color: string }[]
  selected: string | null
  onSelect: (name: string) => void
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  let cumulative = 0

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">
        {segments.map((seg) => {
          const start = (cumulative / total) * 360
          cumulative += seg.value
          const end = (cumulative / total) * 360
          const large = end - start > 180 ? 1 : 0
          const r = 48
          const cx = 60
          const cy = 60
          const startRad = ((start - 90) * Math.PI) / 180
          const endRad = ((end - 90) * Math.PI) / 180
          const x1 = cx + r * Math.cos(startRad)
          const y1 = cy + r * Math.sin(startRad)
          const x2 = cx + r * Math.cos(endRad)
          const y2 = cy + r * Math.sin(endRad)
          const active = selected === seg.name

          return (
            <path
              key={seg.name}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={seg.color}
              opacity={selected && !active ? 0.35 : active ? 1 : 0.75}
              className="cursor-pointer transition-opacity hover:opacity-100"
              onClick={() => onSelect(seg.name)}
            />
          )
        })}
        <circle cx="60" cy="60" r="28" fill="#080a0e" />
        <text x="60" y="58" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
          {total}%
        </text>
        <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">
          MIX
        </text>
      </svg>
      <div className="flex-1 space-y-2">
        {segments.map((seg) => (
          <button
            key={seg.name}
            type="button"
            onClick={() => onSelect(seg.name)}
            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
              selected === seg.name ? 'bg-[#0080ff]/10 text-white' : 'text-white/55 hover:bg-white/[0.04] hover:text-white/80'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.name}
            </span>
            <span className="font-medium">{seg.value}%</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ExecutiveDashboardView({
  activeTab,
  selectedStat,
  setSelectedStat,
  jobFilter,
  setJobFilter,
}: {
  activeTab: ExecutiveTab
  selectedStat: number
  setSelectedStat: (i: number) => void
  jobFilter: JobFilter
  setJobFilter: (f: JobFilter) => void
}) {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [chartMetric, setChartMetric] = useState<ChartMetric>('revenue')
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>('north')
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState(0)
  const [kpiCategory, setKpiCategory] = useState<string>('All')
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [approvals, setApprovals] = useState(pendingApprovals)
  const [toast, setToast] = useState<string | null>(null)

  const filteredJobs = useMemo(() => {
    if (jobFilter === 'all') return executiveJobs
    return executiveJobs.filter((job) => job.status === jobFilter)
  }, [jobFilter])

  const filteredKpis = useMemo(() => {
    if (kpiCategory === 'All') return kpiGrid
    return kpiGrid.filter((k) => k.category === kpiCategory)
  }, [kpiCategory])

  const kpiCategories = ['All', ...new Set(kpiGrid.map((k) => k.category))]

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id))
    showToast('Approval submitted — team notified')
  }

  const selectedStatData = executiveStats[selectedStat]
  const selectedRegionData = regions.find((r) => r.id === selectedRegion)

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[#ccff00]/30 bg-[#0a0c10]/95 px-4 py-2.5 text-sm text-[#ccff00] shadow-lg backdrop-blur-md">
          {toast}
        </div>
      )}

      {(activeTab === 'overview' || activeTab === 'kpis') && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {dateRanges.map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setDateRange(range.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    dateRange === range.id
                      ? 'bg-[#0080ff]/15 text-[#0080ff]'
                      : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => showToast('Report exported — check downloads')}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-[#0080ff]/30 hover:text-white"
              >
                <Download size={13} />
                Export
              </button>
              <Link
                to="/platform"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#0080ff]/30 bg-[#0080ff]/10 px-3 py-1.5 text-xs text-[#0080ff] transition-colors hover:bg-[#0080ff]/20"
              >
                <ExternalLink size={13} />
                Launch platform
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {executiveStats.map((stat, i) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.values[dateRange]}
                change={stat.changes[dateRange]}
                sparkline={stat.sparkline}
                active={selectedStat === i}
                onSelect={() => setSelectedStat(i)}
              />
            ))}
          </div>

          {activeTab === 'overview' && selectedStatData && (
            <div className="rounded-lg border border-[#0080ff]/20 bg-[#0080ff]/[0.04] px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-white/80">
                  <span className="font-medium text-white">{selectedStatData.title} insight:</span>{' '}
                  {selectedStatData.detail}
                </p>
                <button
                  type="button"
                  onClick={() => showToast(`Drill-down opened for ${selectedStatData.title}`)}
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-[#0080ff] hover:underline"
                >
                  View breakdown
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="mt-4 space-y-4">
          {/* Main chart + health */}
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-white">{chartLabels[chartMetric]}</h2>
                <div className="flex gap-1">
                  {(['revenue', 'margin', 'accounts'] as ChartMetric[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setChartMetric(m)}
                      className={`rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition-all ${
                        chartMetric === m
                          ? 'bg-[#0080ff]/15 text-[#0080ff]'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative h-40 sm:h-48">
                <div className="absolute inset-0 grid grid-rows-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-white/[0.06]" />
                  ))}
                </div>
                <svg viewBox="0 0 600 180" className="relative h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="execDashFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0080ff" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#0080ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon fill="url(#execDashFill)" points={`${chartPaths[chartMetric]} 600,180 0,180`} />
                  <polyline fill="none" stroke="#0080ff" strokeWidth="2.5" points={chartPaths[chartMetric]} />
                </svg>
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-white/30">
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-2 text-sm font-medium text-white">Operational health</h2>
              <HealthRing score={92} />
              <div className="mt-4 space-y-2">
                {[
                  { label: 'Uptime', value: '99.8%', up: true },
                  { label: 'SLA compliance', value: '94%', up: true },
                  { label: 'Escalations', value: '3', up: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{item.label}</span>
                    <span className={`flex items-center gap-1 font-medium ${item.up ? 'text-[#ccff00]' : 'text-amber-400'}`}>
                      {item.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => showToast('Health report generated')}
                className="mt-4 w-full rounded-md border border-white/[0.08] py-2 text-xs text-white/60 transition-colors hover:border-[#0080ff]/30 hover:text-white"
              >
                <FileText size={12} className="mr-1.5 inline" />
                Full health report
              </button>
            </div>
          </div>

          {/* Department bars + donut */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-white">Revenue by department</h2>
                <button
                  type="button"
                  onClick={() => setSelectedDept(null)}
                  className="text-[10px] text-white/35 hover:text-white/60"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <button
                    key={dept.name}
                    type="button"
                    onClick={() => setSelectedDept(selectedDept === dept.name ? null : dept.name)}
                    className={`group w-full text-left transition-opacity ${selectedDept && selectedDept !== dept.name ? 'opacity-40' : ''}`}
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={selectedDept === dept.name ? 'font-medium text-white' : 'text-white/60'}>
                        {dept.name}
                      </span>
                      <span className="text-white/45">{dept.revenue}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${dept.value}%`,
                          backgroundColor: dept.color,
                          opacity: selectedDept === dept.name ? 1 : 0.7,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
              {selectedDept && (
                <div className="mt-4 rounded-md border border-[#0080ff]/20 bg-[#0080ff]/[0.06] px-3 py-2 text-xs text-white/70">
                  {departments.find((d) => d.name === selectedDept)?.name} —{' '}
                  {departments.find((d) => d.name === selectedDept)?.revenue} this period.{' '}
                  <button
                    type="button"
                    onClick={() => showToast(`${selectedDept} detail view opened`)}
                    className="text-[#0080ff] hover:underline"
                  >
                    Open detail →
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Portfolio mix</h2>
              <DonutChart
                segments={departments.map((d) => ({ name: d.name, value: d.value, color: d.color }))}
                selected={selectedDept}
                onSelect={(name) => setSelectedDept(selectedDept === name ? null : name)}
              />
            </div>
          </div>

          {/* Regions + business units */}
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Regional performance</h2>
              <div className="grid grid-cols-2 gap-2">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegion(region.id)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      selectedRegion === region.id
                        ? 'border-[#0080ff]/40 bg-[#0080ff]/[0.08]'
                        : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <MapPin size={11} />
                      {region.name}
                    </div>
                    <p className="mt-1 text-lg font-semibold text-white">{region.revenue}</p>
                    <p className="text-[10px] text-[#ccff00]/80">{region.growth} · {region.accounts} accounts</p>
                  </button>
                ))}
              </div>
              {selectedRegionData && (
                <div className="mt-3 flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2">
                  <span className="text-xs text-white/55">{selectedRegionData.name} region selected</span>
                  <Link
                    to="/dashboards"
                    className="text-xs text-[#0080ff] hover:underline"
                  >
                    Regional dashboard →
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Business units</h2>
              <div className="space-y-2">
                {businessUnits.map((unit, i) => (
                  <button
                    key={unit.title}
                    type="button"
                    onClick={() => setSelectedUnit(i)}
                    className={`group w-full rounded-lg border p-3 text-left transition-all ${
                      selectedUnit === i
                        ? 'border-[#0080ff]/40 bg-[#0080ff]/[0.06]'
                        : 'border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-white">{unit.title}</p>
                        <p className="text-[10px] text-white/40">{unit.metricLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{unit.metric}</p>
                        <ArrowRight
                          size={12}
                          className={`ml-auto transition-transform ${selectedUnit === i ? 'text-[#0080ff] translate-x-0.5' : 'text-white/20 group-hover:text-white/40'}`}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <MiniSparkline points={unit.sparkline} color={selectedUnit === i ? '#0080ff' : '#4f7cff'} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity + approvals */}
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-white">Recent activity</h2>
                <button
                  type="button"
                  onClick={() => showToast('Activity log opened')}
                  className="text-xs text-[#0080ff] hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-1">
                {activityItems.map((item) => (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedActivity(selectedActivity === item.id ? null : item.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors ${
                        selectedActivity === item.id
                          ? 'bg-[#0080ff]/[0.12] text-white'
                          : 'text-white/55 hover:bg-white/[0.03] hover:text-white/80'
                      }`}
                    >
                      <span className="min-w-0 truncate">{item.text}</span>
                      <span className="shrink-0 text-xs text-white/35">{item.time}</span>
                    </button>
                    {selectedActivity === item.id && (
                      <div className="mx-2 mb-2 flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <span className="text-xs text-white/45">{item.team}</span>
                        <Link
                          to={item.href}
                          className="inline-flex items-center gap-1 text-xs text-[#0080ff] hover:underline"
                        >
                          {item.action}
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-white">Pending approvals</h2>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  {approvals.length} open
                </span>
              </div>
              <div className="space-y-2">
                {approvals.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <CheckCircle2 size={24} className="text-[#ccff00]/60" />
                    <p className="mt-2 text-xs text-white/45">All caught up — no pending items</p>
                  </div>
                ) : (
                  approvals.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-md border px-3 py-2.5 ${
                        item.urgent ? 'border-amber-500/25 bg-amber-500/[0.04]' : 'border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-white/85">{item.title}</p>
                          <p className="mt-0.5 text-[10px] text-white/40">
                            {item.requester} · {item.amount}
                          </p>
                        </div>
                        {item.urgent && (
                          <span className="shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-medium uppercase text-amber-400">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="flex-1 rounded-md bg-[#0080ff]/15 py-1.5 text-[10px] font-medium text-[#0080ff] transition-colors hover:bg-[#0080ff]/25"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Review scheduled for tomorrow')}
                          className="flex-1 rounded-md border border-white/[0.08] py-1.5 text-[10px] text-white/50 transition-colors hover:text-white/80"
                        >
                          Review later
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick actions footer */}
          <div className="flex flex-wrap gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="w-full text-[10px] uppercase tracking-wider text-white/30 sm:w-auto sm:mr-2 sm:self-center">
              Quick actions
            </span>
            {[
              { label: 'Schedule exec review', action: () => showToast('Calendar invite sent') },
              { label: 'Share snapshot', action: () => showToast('Link copied to clipboard') },
              { label: 'Compare periods', action: () => showToast('Comparison view opened') },
            ].map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={qa.action}
                className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/55 transition-colors hover:border-[#0080ff]/25 hover:text-white"
              >
                {qa.label}
              </button>
            ))}
            <Link
              to="/request-demo"
              className="rounded-md border border-[#ccff00]/25 bg-[#ccff00]/[0.06] px-3 py-1.5 text-xs text-[#ccff00] transition-colors hover:bg-[#ccff00]/10"
            >
              Request custom build →
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'kpis' && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {kpiCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setKpiCategory(cat)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  kpiCategory === cat
                    ? 'bg-[#0080ff]/15 text-[#0080ff]'
                    : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredKpis.map((kpi) => (
              <button
                key={kpi.title}
                type="button"
                onClick={() => setExpandedKpi(expandedKpi === kpi.title ? null : kpi.title)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  expandedKpi === kpi.title
                    ? 'border-[#0080ff]/40 bg-[#0080ff]/[0.08]'
                    : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#0080ff]/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs uppercase tracking-wider text-white/35">{kpi.title}</p>
                  <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-white/40">{kpi.category}</span>
                </div>
                <p className="mt-2 text-xl font-semibold text-white">{kpi.value}</p>
                <p className="mt-1 text-xs text-[#ccff00]/75">{kpi.trend}</p>
                <div className="mt-3">
                  <MiniSparkline points={kpi.sparkline} color="#0080ff" />
                </div>
                {expandedKpi === kpi.title && (
                  <div className="mt-3 border-t border-white/[0.06] pt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        showToast(`${kpi.title} report opened`)
                      }}
                      className="text-xs text-[#0080ff] hover:underline"
                    >
                      View full metric report →
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {jobFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setJobFilter(filter)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    jobFilter === filter
                      ? 'bg-[#0080ff]/15 text-[#0080ff]'
                      : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                  }`}
                >
                  {filter === 'all' ? 'All jobs' : filter}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => showToast('New initiative form opened')}
              className="rounded-md border border-[#ccff00]/25 bg-[#ccff00]/[0.06] px-3 py-1.5 text-xs text-[#ccff00] hover:bg-[#ccff00]/10"
            >
              + New initiative
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/[0.08]">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35 sm:px-5">
              <span>Job</span>
              <span>Owner</span>
              <span>Status</span>
              <span className="text-right">Progress</span>
            </div>
            {filteredJobs.map((job) => (
              <div key={job.name}>
                <button
                  type="button"
                  onClick={() => setExpandedJob(expandedJob === job.name ? null : job.name)}
                  className="grid w-full grid-cols-[1.4fr_1fr_1fr_0.8fr] items-center gap-3 border-b border-white/[0.04] px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.02] sm:px-5"
                >
                  <span className="font-medium text-white/85">{job.name}</span>
                  <span className="text-white/50">{job.owner}</span>
                  <span
                    className={
                      job.status === 'Completed'
                        ? 'text-[#ccff00]'
                        : job.status === 'Delayed'
                          ? 'text-amber-400'
                          : 'text-[#0080ff]'
                    }
                  >
                    {job.status}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-white/10 sm:block">
                      <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${job.progress}%` }} />
                    </div>
                    <span className="text-xs text-white/45">{job.progress}%</span>
                  </div>
                </button>
                {expandedJob === job.name && (
                  <div className="border-b border-white/[0.04] bg-white/[0.02] px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-white/45">Due: {job.due}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => showToast(`Status update sent for ${job.name}`)}
                          className="rounded-md bg-[#0080ff]/15 px-2.5 py-1 text-[#0080ff] hover:bg-[#0080ff]/25"
                        >
                          Request update
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast(`${job.name} details opened`)}
                          className="rounded-md border border-white/[0.08] px-2.5 py-1 text-white/50 hover:text-white/80"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
