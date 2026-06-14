import {
  ArrowRight,
  ChevronRight,
  Download,
  ExternalLink,
  Lightbulb,
  Monitor,
  Smartphone,
  Tablet,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { metricsAccounts } from '../data/metricsAccounts'
import { MiniSparkline } from './InfographicWidgets'

type MetricsTab = 'overview' | 'campaigns' | 'channels' | 'audiences'
type DateRange = 'today' | '7d' | '30d' | '90d'
type CampaignStatus = 'all' | 'Enabled' | 'Paused' | 'Limited'
type ChannelFilter = 'all' | 'Search' | 'Display' | 'Social' | 'Email'

type MetricKey = 'impressions' | 'clicks' | 'cost' | 'conversions' | 'ctr' | 'cpc'

const dateRanges: { id: DateRange; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
]

const summaryMetrics: {
  key: MetricKey
  label: string
  values: Record<DateRange, string>
  changes: Record<DateRange, string>
  up: Record<DateRange, boolean>
  sparkline: number[]
  color: string
}[] = [
  {
    key: 'impressions',
    label: 'Impressions',
    values: { today: '18.2K', '7d': '124K', '30d': '482K', '90d': '1.4M' },
    changes: { today: '↑ 4.2%', '7d': '↑ 8.1%', '30d': '↑ 12.4%', '90d': '↑ 18.6%' },
    up: { today: true, '7d': true, '30d': true, '90d': true },
    sparkline: [320, 340, 355, 348, 380, 410, 425, 440, 432, 482],
    color: '#ccff00',
  },
  {
    key: 'clicks',
    label: 'Clicks',
    values: { today: '842', '7d': '5.8K', '30d': '22.4K', '90d': '68K' },
    changes: { today: '↑ 6.8%', '7d': '↑ 9.2%', '30d': '↑ 14.1%', '90d': '↑ 21.3%' },
    up: { today: true, '7d': true, '30d': true, '90d': true },
    sparkline: [18, 19, 20, 19, 21, 22, 23, 24, 23, 22],
    color: '#0080ff',
  },
  {
    key: 'ctr',
    label: 'CTR',
    values: { today: '4.62%', '7d': '4.68%', '30d': '4.65%', '90d': '4.71%' },
    changes: { today: '↑ 0.12 pts', '7d': '↑ 0.08 pts', '30d': '↑ 0.15 pts', '90d': '↑ 0.22 pts' },
    up: { today: true, '7d': true, '30d': true, '90d': true },
    sparkline: [4.2, 4.3, 4.35, 4.4, 4.45, 4.5, 4.55, 4.6, 4.62, 4.65],
    color: '#4f7cff',
  },
  {
    key: 'cost',
    label: 'Cost',
    values: { today: '$1,240', '7d': '$8,420', '30d': '$32,800', '90d': '$94,200' },
    changes: { today: '↓ 2.1%', '7d': '↑ 3.4%', '30d': '↑ 7.8%', '90d': '↑ 11.2%' },
    up: { today: false, '7d': true, '30d': true, '90d': true },
    sparkline: [28, 29, 30, 31, 30, 32, 33, 32, 33, 33],
    color: '#ff6b6b',
  },
  {
    key: 'conversions',
    label: 'Conversions',
    values: { today: '48', '7d': '312', '30d': '1,240', '90d': '3,680' },
    changes: { today: '↑ 11.6%', '7d': '↑ 15.2%', '30d': '↑ 19.8%', '90d': '↑ 24.4%' },
    up: { today: true, '7d': true, '30d': true, '90d': true },
    sparkline: [980, 1020, 1080, 1120, 1150, 1180, 1200, 1220, 1230, 1240],
    color: '#ccff00',
  },
  {
    key: 'cpc',
    label: 'Avg. CPC',
    values: { today: '$1.47', '7d': '$1.45', '30d': '$1.46', '90d': '$1.38' },
    changes: { today: '↓ $0.08', '7d': '↓ $0.04', '30d': '↓ $0.02', '90d': '↓ $0.12' },
    up: { today: false, '7d': false, '30d': false, '90d': false },
    sparkline: [1.58, 1.55, 1.52, 1.5, 1.49, 1.48, 1.47, 1.46, 1.46, 1.46],
    color: '#0080ff',
  },
]

const chartPaths: Record<MetricKey, string> = {
  impressions: '0,140 50,130 100,125 150,118 200,110 250,105 300,98 350,92 400,88 450,82 500,78 550,72 600,65',
  clicks: '0,150 50,142 100,135 150,128 200,120 250,115 300,108 350,100 400,95 450,88 500,82 550,78 600,72',
  cost: '0,120 50,125 100,122 150,128 200,118 250,115 300,112 350,108 400,105 450,102 500,98 550,95 600,92',
  conversions: '0,160 50,150 100,142 150,135 200,128 250,118 300,110 350,102 400,95 450,88 500,80 550,72 600,65',
  ctr: '0,130 50,128 100,125 150,122 200,118 250,115 300,112 350,108 400,105 450,102 500,98 550,95 600,92',
  cpc: '0,100 50,105 100,108 150,112 200,115 250,118 300,122 350,125 400,128 450,130 500,132 550,135 600,138',
}

const initialCampaigns = [
  { id: '1', name: 'Brand — Core search', status: 'Enabled' as const, budget: '$120/day', cost: '$3,840', impressions: '98K', clicks: '4.2K', ctr: '4.29%', conversions: '186', costPerConv: '$20.65' },
  { id: '2', name: 'Retargeting — Cart abandoners', status: 'Enabled' as const, budget: '$80/day', cost: '$2,560', impressions: '62K', clicks: '3.1K', ctr: '5.00%', conversions: '142', costPerConv: '$18.03' },
  { id: '3', name: 'Display — Awareness Q2', status: 'Limited' as const, budget: '$200/day', cost: '$4,120', impressions: '210K', clicks: '2.8K', ctr: '1.33%', conversions: '68', costPerConv: '$60.59' },
  { id: '4', name: 'Social — Lead gen', status: 'Enabled' as const, budget: '$60/day', cost: '$1,920', impressions: '45K', clicks: '2.4K', ctr: '5.33%', conversions: '98', costPerConv: '$19.59' },
  { id: '5', name: 'Competitor keywords', status: 'Paused' as const, budget: '$40/day', cost: '$0', impressions: '0', clicks: '0', ctr: '—', conversions: '0', costPerConv: '—' },
  { id: '6', name: 'Email nurture — Upsell', status: 'Enabled' as const, budget: '$30/day', cost: '$960', impressions: '28K', clicks: '1.8K', ctr: '6.43%', conversions: '74', costPerConv: '$12.97' },
]

const channels = [
  { name: 'Search' as const, spend: 42, conversions: 38, cost: '$13,800', convRate: '4.8%', color: '#ccff00' },
  { name: 'Display' as const, spend: 28, conversions: 18, cost: '$9,240', convRate: '1.9%', color: '#0080ff' },
  { name: 'Social' as const, spend: 22, conversions: 28, cost: '$7,260', convRate: '5.2%', color: '#4f7cff' },
  { name: 'Email' as const, spend: 8, conversions: 16, cost: '$2,640', convRate: '6.1%', color: '#66ccff' },
]

const devices = [
  { name: 'Mobile', icon: Smartphone, share: 58, clicks: '13.0K', convRate: '5.1%' },
  { name: 'Desktop', icon: Monitor, share: 34, clicks: '7.6K', convRate: '4.2%' },
  { name: 'Tablet', icon: Tablet, share: 8, clicks: '1.8K', convRate: '3.8%' },
]

const audiences = [
  { name: 'In-market — Logistics', size: '240K', impressions: '82K', convRate: '5.4%', selected: false },
  { name: 'Custom — Past purchasers', size: '18K', impressions: '12K', convRate: '8.2%', selected: false },
  { name: 'Similar — High LTV', size: '1.2M', impressions: '45K', convRate: '3.1%', selected: false },
  { name: 'Remarketing — 30 day', size: '42K', impressions: '28K', convRate: '6.8%', selected: false },
  { name: 'Affinity — Business services', size: '890K', impressions: '62K', convRate: '2.4%', selected: false },
]

const insights = [
  { id: '1', title: 'Raise budget on Brand — Core search', detail: 'Campaign is limited by budget. Est. +42 conversions/week at +15% budget.', impact: 'High' },
  { id: '2', title: 'Pause underperforming Display placements', detail: '3 placements have CTR below 0.4%. Removing could save ~$380/month.', impact: 'Medium' },
  { id: '3', title: 'Add mobile-preferred bid adjustment', detail: 'Mobile converts 22% higher than account average. Consider +20% mobile bid.', impact: 'High' },
]

const locations = [
  { name: 'New York', share: 32, conversions: 398 },
  { name: 'New Jersey', share: 18, conversions: 224 },
  { name: 'Pennsylvania', share: 14, conversions: 174 },
  { name: 'Connecticut', share: 11, conversions: 136 },
  { name: 'Other', share: 25, conversions: 308 },
]

function MetricCard({
  label,
  value,
  change,
  up,
  sparkline,
  color,
  active,
  onToggle,
}: {
  label: string
  value: string
  change: string
  up: boolean
  sparkline: number[]
  color: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group min-w-[120px] shrink-0 rounded-lg border p-3 text-left transition-all sm:min-w-0 sm:flex-1 sm:p-4 ${
        active
          ? 'border-[#ccff00]/40 bg-[#ccff00]/[0.08] glow-brand-lime'
          : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-[#ccff00]/20 hover:bg-[#ccff00]/[0.04]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: active ? color : 'rgba(255,255,255,0.2)' }} />
        <p className="truncate text-[10px] uppercase tracking-wider text-white/35">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold text-white sm:text-xl">{value}</p>
      <p className={`mt-1 flex items-center gap-1 text-[10px] sm:text-xs ${up ? 'text-[#ccff00]/80' : 'text-amber-400/90'}`}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {change}
      </p>
      <div className="mt-2 opacity-60">
        <MiniSparkline points={sparkline} color={active ? color : '#4f7cff'} />
      </div>
    </button>
  )
}

function StatusBadge({ status }: { status: 'Enabled' | 'Paused' | 'Limited' }) {
  const styles = {
    Enabled: 'border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00]',
    Paused: 'border-white/15 bg-white/[0.04] text-white/45',
    Limited: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  }
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

export default function MetricsPanelView({ activeTab }: { activeTab: MetricsTab }) {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [comparePeriod, setComparePeriod] = useState(false)
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['impressions', 'clicks', 'conversions'])
  const [selectedMetricInsight, setSelectedMetricInsight] = useState<MetricKey>('conversions')
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [campaignFilter, setCampaignFilter] = useState<CampaignStatus>('all')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<string | null>('Search')
  const [selectedDevice, setSelectedDevice] = useState<string | null>('Mobile')
  const [audienceList, setAudienceList] = useState(audiences)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev
        return prev.filter((k) => k !== key)
      }
      return [...prev, key]
    })
  }

  const filteredCampaigns = useMemo(() => {
    if (campaignFilter === 'all') return campaigns
    return campaigns.filter((c) => c.status === campaignFilter)
  }, [campaigns, campaignFilter])

  const filteredChannels = useMemo(() => {
    if (channelFilter === 'all') return channels
    return channels.filter((c) => c.name === channelFilter)
  }, [channelFilter])

  const selectedMetricData = summaryMetrics.find((m) => m.key === selectedMetricInsight)

  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const next = c.status === 'Enabled' ? 'Paused' : 'Enabled'
        showToast(`Campaign ${next.toLowerCase()}`)
        return { ...c, status: next as 'Enabled' | 'Paused' }
      }),
    )
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[#ccff00]/30 bg-[#0a0c10]/95 px-4 py-2.5 text-sm text-[#ccff00] shadow-lg backdrop-blur-md">
          {toast}
        </div>
      )}

      {/* Toolbar — Google Ads-style date + compare */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {dateRanges.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => setDateRange(range.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                dateRange === range.id
                  ? 'bg-[#ccff00]/15 text-[#ccff00]'
                  : 'border border-white/[0.08] text-white/50 hover:text-white/80'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setComparePeriod((v) => !v)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              comparePeriod
                ? 'bg-[#0080ff]/15 text-[#0080ff]'
                : 'border border-white/[0.08] text-white/50 hover:text-white/80'
            }`}
          >
            Compare to prior period
          </button>
          <button
            type="button"
            onClick={() => showToast('Report exported — check downloads')}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 hover:border-[#ccff00]/30 hover:text-white"
          >
            <Download size={13} />
            Export
          </button>
          <Link
            to="/request-demo"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#ccff00]/30 bg-[#ccff00]/10 px-3 py-1.5 text-xs text-[#ccff00] hover:bg-[#ccff00]/20"
          >
            <ExternalLink size={13} />
            Request custom build
          </Link>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Summary metric cards — scrollable row like Google Ads */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {summaryMetrics.map((metric) => (
              <MetricCard
                key={metric.key}
                label={metric.label}
                value={metric.values[dateRange]}
                change={metric.changes[dateRange]}
                up={metric.up[dateRange]}
                sparkline={metric.sparkline}
                color={metric.color}
                active={activeMetrics.includes(metric.key)}
                onToggle={() => toggleMetric(metric.key)}
              />
            ))}
          </div>

          {selectedMetricData && (
            <div className="rounded-lg border border-[#ccff00]/20 bg-[#ccff00]/[0.04] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-white/80">
                  <span className="font-medium text-white">{selectedMetricData.label}</span> is trending{' '}
                  {selectedMetricData.up[dateRange] ? 'up' : 'down'} — click metrics above to overlay on the chart.
                </p>
                <button
                  type="button"
                  onClick={() => showToast(`${selectedMetricData.label} breakdown opened`)}
                  className="inline-flex items-center gap-1 text-xs text-[#ccff00] hover:underline"
                >
                  View breakdown
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Performance chart */}
          <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-white">Performance over time</h2>
              <div className="flex flex-wrap gap-2">
                {activeMetrics.map((key) => {
                  const m = summaryMetrics.find((s) => s.key === key)!
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedMetricInsight(key)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium ${
                        selectedMetricInsight === key
                          ? 'bg-white/[0.08] text-white'
                          : 'text-white/45 hover:text-white/70'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="relative h-44 sm:h-52">
              <div className="absolute inset-0 grid grid-rows-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-white/[0.06]" />
                ))}
              </div>
              <svg viewBox="0 0 600 180" className="relative h-full w-full" preserveAspectRatio="none">
                {activeMetrics.map((key, idx) => {
                  const m = summaryMetrics.find((s) => s.key === key)!
                  return (
                    <g key={key}>
                      {idx === 0 && (
                        <defs>
                          <linearGradient id="metricsFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={m.color} stopOpacity="0.18" />
                            <stop offset="100%" stopColor={m.color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      )}
                      {idx === 0 && (
                        <polygon fill="url(#metricsFill)" points={`${chartPaths[key]} 600,180 0,180`} />
                      )}
                      <polyline
                        fill="none"
                        stroke={m.color}
                        strokeWidth={selectedMetricInsight === key ? 2.5 : 1.5}
                        strokeOpacity={selectedMetricInsight === key ? 1 : 0.45}
                        points={chartPaths[key]}
                      />
                    </g>
                  )
                })}
                {comparePeriod && (
                  <polyline
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    points="0,155 60,148 120,142 180,138 240,132 300,128 360,122 420,118 480,112 540,108 600,102"
                  />
                )}
              </svg>
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-white/30">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          {/* Campaigns snapshot + insights */}
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-white">Top campaigns</h2>
                <button
                  type="button"
                  onClick={() => showToast('Full campaign report opened')}
                  className="text-xs text-[#ccff00] hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[520px]">
                  <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr_0.6fr] gap-2 border-b border-white/[0.06] pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                    <span>Campaign</span>
                    <span>Status</span>
                    <span>Cost</span>
                    <span>Clicks</span>
                    <span className="text-right">Conv.</span>
                  </div>
                  {campaigns.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCampaign(selectedCampaign === c.id ? null : c.id)}
                      className={`grid w-full grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr_0.6fr] gap-2 border-b border-white/[0.04] py-2.5 text-left text-xs transition-colors last:border-0 hover:bg-white/[0.02] ${
                        selectedCampaign === c.id ? 'bg-[#ccff00]/[0.06]' : ''
                      }`}
                    >
                      <span className="truncate font-medium text-white/85">{c.name}</span>
                      <StatusBadge status={c.status} />
                      <span className="text-white/55">{c.cost}</span>
                      <span className="text-white/55">{c.clicks}</span>
                      <span className="text-right text-[#ccff00]/80">{c.conversions}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selectedCampaign && (
                <div className="mt-3 flex flex-wrap gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
                  <button
                    type="button"
                    onClick={() => toggleCampaignStatus(selectedCampaign)}
                    className="rounded-md bg-[#ccff00]/15 px-3 py-1.5 text-[10px] font-medium text-[#ccff00] hover:bg-[#ccff00]/25"
                  >
                    Toggle status
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Campaign editor opened')}
                    className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/50 hover:text-white/80"
                  >
                    Edit campaign
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Budget adjustment saved')}
                    className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/50 hover:text-white/80"
                  >
                    Adjust budget
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb size={14} className="text-[#ccff00]" />
                <h2 className="text-sm font-medium text-white">Recommendations</h2>
              </div>
              <div className="space-y-2">
                {insights.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => showToast(`Applied insight: ${item.title}`)}
                    className="group w-full rounded-lg border border-white/[0.06] p-3 text-left transition-colors hover:border-[#ccff00]/25 hover:bg-[#ccff00]/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-white/85">{item.title}</p>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${
                          item.impact === 'High'
                            ? 'bg-[#ccff00]/15 text-[#ccff00]'
                            : 'bg-white/[0.06] text-white/45'
                        }`}
                      >
                        {item.impact}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-white/40">{item.detail}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#ccff00] opacity-0 transition-opacity group-hover:opacity-100">
                      Apply recommendation
                      <ChevronRight size={10} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Device breakdown */}
          <div className="grid gap-4 sm:grid-cols-3">
            {devices.map((device) => {
              const Icon = device.icon
              return (
                <button
                  key={device.name}
                  type="button"
                  onClick={() => setSelectedDevice(selectedDevice === device.name ? null : device.name)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    selectedDevice === device.name
                      ? 'border-[#ccff00]/40 bg-[#ccff00]/[0.08]'
                      : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-[#ccff00]/70" />
                    <span className="text-xs font-medium text-white">{device.name}</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{device.share}%</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-[#ccff00]" style={{ width: `${device.share}%`, opacity: 0.7 }} />
                  </div>
                  <p className="mt-2 text-[10px] text-white/40">
                    {device.clicks} clicks · {device.convRate} conv. rate
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(['all', 'Enabled', 'Paused', 'Limited'] as CampaignStatus[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCampaignFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    campaignFilter === f
                      ? 'bg-[#ccff00]/15 text-[#ccff00]'
                      : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                  }`}
                >
                  {f === 'all' ? 'All campaigns' : f}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => showToast('New campaign wizard opened')}
              className="rounded-md border border-[#ccff00]/25 bg-[#ccff00]/[0.06] px-3 py-1.5 text-xs text-[#ccff00] hover:bg-[#ccff00]/10"
            >
              + New campaign
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/[0.08]">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.7fr] gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35 sm:px-5">
                  <span>Campaign</span>
                  <span>Status</span>
                  <span>Budget</span>
                  <span>Cost</span>
                  <span>Impr.</span>
                  <span>Clicks</span>
                  <span>CTR</span>
                  <span className="text-right">Cost/conv</span>
                </div>
                {filteredCampaigns.map((c) => (
                  <div key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCampaign(selectedCampaign === c.id ? null : c.id)}
                      className={`grid w-full grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.7fr] gap-2 border-b border-white/[0.04] px-4 py-3 text-left text-xs transition-colors hover:bg-white/[0.02] sm:px-5 ${
                        selectedCampaign === c.id ? 'bg-[#ccff00]/[0.05]' : ''
                      }`}
                    >
                      <span className="truncate font-medium text-white/85">{c.name}</span>
                      <StatusBadge status={c.status} />
                      <span className="text-white/50">{c.budget}</span>
                      <span className="text-white/50">{c.cost}</span>
                      <span className="text-white/50">{c.impressions}</span>
                      <span className="text-white/50">{c.clicks}</span>
                      <span className="text-white/50">{c.ctr}</span>
                      <span className="text-right text-white/50">{c.costPerConv}</span>
                    </button>
                    {selectedCampaign === c.id && (
                      <div className="border-b border-white/[0.04] bg-white/[0.02] px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCampaignStatus(c.id)}
                            className="rounded-md bg-[#ccff00]/15 px-3 py-1.5 text-[10px] font-medium text-[#ccff00]"
                          >
                            {c.status === 'Enabled' ? 'Pause' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('Ad groups opened')}
                            className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/50 hover:text-white/80"
                          >
                            View ad groups
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('Change history opened')}
                            className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/50 hover:text-white/80"
                          >
                            Change history
                          </button>
                          <Link
                            to="/request-demo"
                            className="rounded-md border border-[#0080ff]/25 px-3 py-1.5 text-[10px] text-[#0080ff] hover:bg-[#0080ff]/10"
                          >
                            Request custom build
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'Search', 'Display', 'Social', 'Email'] as ChannelFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setChannelFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  channelFilter === f
                    ? 'bg-[#ccff00]/15 text-[#ccff00]'
                    : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                }`}
              >
                {f === 'all' ? 'All channels' : f}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Spend by channel</h2>
              <div className="space-y-3">
                {filteredChannels.map((ch) => (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => setSelectedChannel(selectedChannel === ch.name ? null : ch.name)}
                    className={`w-full text-left transition-opacity ${selectedChannel && selectedChannel !== ch.name ? 'opacity-40' : ''}`}
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={selectedChannel === ch.name ? 'font-medium text-white' : 'text-white/60'}>
                        {ch.name}
                      </span>
                      <span className="text-white/45">{ch.cost}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${ch.spend}%`, backgroundColor: ch.color, opacity: selectedChannel === ch.name ? 1 : 0.65 }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-white/35">
                      {ch.conversions}% of conversions · {ch.convRate} conv. rate
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Channel comparison</h2>
              <div className="grid grid-cols-2 gap-3">
                {channels.map((ch) => (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => setSelectedChannel(ch.name)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      selectedChannel === ch.name
                        ? 'border-[#ccff00]/40 bg-[#ccff00]/[0.06]'
                        : 'border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <span className="h-2 w-2 inline-block rounded-full" style={{ backgroundColor: ch.color }} />
                    <p className="mt-2 text-sm font-semibold text-white">{ch.name}</p>
                    <p className="text-lg font-bold text-white">{ch.cost}</p>
                    <p className="text-[10px] text-[#ccff00]/75">{ch.convRate} conv. rate</p>
                    <div className="mt-2">
                      <MiniSparkline
                        points={[ch.spend, ch.spend + 2, ch.spend + 4, ch.spend + 3, ch.spend + 6, ch.spend + 5, ch.spend + 8]}
                        color={ch.color}
                      />
                    </div>
                  </button>
                ))}
              </div>
              {selectedChannel && (
                <button
                  type="button"
                  onClick={() => showToast(`${selectedChannel} channel report opened`)}
                  className="mt-4 w-full rounded-md border border-white/[0.08] py-2 text-xs text-white/55 hover:border-[#ccff00]/25 hover:text-white"
                >
                  Open {selectedChannel} report →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audiences' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Audience segments</h2>
              <div className="space-y-1">
                {audienceList.map((aud, i) => (
                  <button
                    key={aud.name}
                    type="button"
                    onClick={() => {
                      setAudienceList((prev) =>
                        prev.map((a, j) => (j === i ? { ...a, selected: !a.selected } : a)),
                      )
                      showToast(aud.selected ? 'Audience removed from targeting' : 'Audience added to targeting')
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                      aud.selected ? 'bg-[#ccff00]/[0.1] text-white' : 'text-white/55 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="min-w-0 truncate">{aud.name}</span>
                    <span className="shrink-0 text-xs text-[#ccff00]/80">{aud.convRate}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Top locations</h2>
              <div className="space-y-2">
                {locations.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => setSelectedLocation(selectedLocation === loc.name ? null : loc.name)}
                    className={`w-full rounded-md px-2 py-2 text-left transition-colors ${
                      selectedLocation === loc.name ? 'bg-[#ccff00]/[0.08]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">{loc.name}</span>
                      <span className="text-white/45">{loc.conversions} conv.</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-[#0080ff]" style={{ width: `${loc.share}%` }} />
                    </div>
                  </button>
                ))}
              </div>
              {selectedLocation && (
                <button
                  type="button"
                  onClick={() => showToast(`${selectedLocation} geo report opened`)}
                  className="mt-4 w-full rounded-md border border-white/[0.08] py-2 text-xs text-[#ccff00] hover:border-[#ccff00]/25"
                >
                  View {selectedLocation} breakdown →
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="w-full text-[10px] uppercase tracking-wider text-white/30 sm:w-auto sm:mr-2 sm:self-center">
              Quick actions
            </span>
            {[
              { label: 'Create audience', action: () => showToast('Audience builder opened') },
              { label: 'Exclude underperformers', action: () => showToast('3 segments excluded') },
              { label: 'Export segment list', action: () => showToast('Segment list exported') },
            ].map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={qa.action}
                className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/55 hover:border-[#ccff00]/25 hover:text-white"
              >
                {qa.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export { metricsAccounts as accounts }
