import {
  ArrowRight,
  Download,
  ExternalLink,
  ShoppingBag,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { RetailTab } from '../data/metricsAccounts'
import { MiniSparkline } from './InfographicWidgets'

type StoreFilter = 'all' | 'Top' | 'Average' | 'Underperforming'
type CategoryFilter = 'all' | 'Apparel' | 'Electronics' | 'Home' | 'Grocery'

const storeStats = [
  { title: 'Network revenue', value: '$842K', change: '↑ 11.2% vs LW', up: true, sparkline: [620, 680, 720, 760, 790, 820, 842] },
  { title: 'Foot traffic', value: '48.2K', change: '↑ 6.8%', up: true, sparkline: [38, 40, 42, 43, 45, 47, 48] },
  { title: 'Conversion rate', value: '3.8%', change: '↑ 0.4 pts', up: true, sparkline: [3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8] },
  { title: 'Avg. basket', value: '$68.40', change: '↑ $4.20', up: true, sparkline: [58, 60, 62, 64, 65, 67, 68] },
  { title: 'Stock turns', value: '6.2×', change: '↓ 0.3×', up: false, sparkline: [6.8, 6.6, 6.5, 6.4, 6.3, 6.2, 6.2] },
  { title: 'Shrinkage', value: '0.9%', change: '↓ 0.2 pts', up: true, sparkline: [1.2, 1.1, 1.1, 1.0, 1.0, 0.9, 0.9] },
]

const topStores = [
  { id: '1', name: 'SoHo Flagship', region: 'Manhattan', revenue: '$124K', traffic: '8.2K', conv: '5.2%', trend: 'up' as const, tier: 'Top' as const },
  { id: '2', name: 'Brooklyn Heights', region: 'Brooklyn', revenue: '$98K', traffic: '6.4K', conv: '4.8%', trend: 'up' as const, tier: 'Top' as const },
  { id: '3', name: 'Jersey City Mall', region: 'New Jersey', revenue: '$86K', traffic: '7.1K', conv: '3.9%', trend: 'flat' as const, tier: 'Average' as const },
  { id: '4', name: 'Queens Center', region: 'Queens', revenue: '$72K', traffic: '5.8K', conv: '3.4%', trend: 'down' as const, tier: 'Underperforming' as const },
  { id: '5', name: 'White Plains', region: 'Westchester', revenue: '$68K', traffic: '4.2K', conv: '4.1%', trend: 'up' as const, tier: 'Average' as const },
  { id: '6', name: 'Staten Island', region: 'Staten Island', revenue: '$52K', traffic: '3.1K', conv: '2.8%', trend: 'down' as const, tier: 'Underperforming' as const },
]

const products = [
  { id: '1', name: 'Premium outerwear', category: 'Apparel' as const, units: 842, revenue: '$68K', stock: 'Low', trend: [40, 45, 52, 58, 62, 68] },
  { id: '2', name: 'Wireless earbuds', category: 'Electronics' as const, units: 1240, revenue: '$52K', stock: 'OK', trend: [30, 35, 38, 42, 48, 52] },
  { id: '3', name: 'Kitchen essentials', category: 'Home' as const, units: 620, revenue: '$28K', stock: 'OK', trend: [22, 24, 25, 26, 27, 28] },
  { id: '4', name: 'Organic produce', category: 'Grocery' as const, units: 2100, revenue: '$18K', stock: 'High', trend: [12, 14, 15, 16, 17, 18] },
  { id: '5', name: 'Athleisure line', category: 'Apparel' as const, units: 980, revenue: '$44K', stock: 'Low', trend: [28, 32, 36, 38, 40, 44] },
]

const regions = [
  { id: 'manhattan', name: 'Manhattan', stores: 8, revenue: '$312K', growth: '+14%', compIndex: 108 },
  { id: 'outer', name: 'Outer boroughs', stores: 12, revenue: '$284K', growth: '+9%', compIndex: 102 },
  { id: 'nj', name: 'New Jersey', stores: 6, revenue: '$142K', growth: '+11%', compIndex: 105 },
  { id: 'westchester', name: 'Westchester', stores: 4, revenue: '$104K', growth: '+6%', compIndex: 98 },
]

const staffScoreboard = [
  { name: 'Elena M.', store: 'SoHo Flagship', sales: '$18.2K', units: 142, rating: 4.9, quota: 112 },
  { name: 'James P.', store: 'Brooklyn Heights', sales: '$14.8K', units: 118, rating: 4.7, quota: 98 },
  { name: 'Priya S.', store: 'Jersey City Mall', sales: '$12.4K', units: 96, rating: 4.6, quota: 88 },
  { name: 'Tom W.', store: 'Queens Center', sales: '$9.6K', units: 78, rating: 4.2, quota: 72 },
]

const hourlyTraffic = [12, 18, 28, 42, 58, 72, 88, 95, 82, 68, 52, 38]

function StatCard({
  title,
  value,
  change,
  up,
  sparkline,
  active,
  onSelect,
}: {
  title: string
  value: string
  change: string
  up: boolean
  sparkline: number[]
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border p-3 text-left transition-all sm:p-4 ${
        active
          ? 'border-amber-500/40 bg-amber-500/[0.08]'
          : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-amber-500/20'
      }`}
    >
      <p className="text-[10px] uppercase tracking-wider text-white/35">{title}</p>
      <p className="mt-2 text-lg font-semibold text-white sm:text-xl">{value}</p>
      <p className={`mt-1 flex items-center gap-1 text-xs ${up ? 'text-[#ccff00]/80' : 'text-amber-400/90'}`}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {change}
      </p>
      <div className="mt-2 opacity-60">
        <MiniSparkline points={sparkline} color={active ? '#f59e0b' : '#d97706'} />
      </div>
    </button>
  )
}

export default function RetailStoreMetricsView({ activeTab }: { activeTab: RetailTab }) {
  const [selectedStat, setSelectedStat] = useState(0)
  const [storeFilter, setStoreFilter] = useState<StoreFilter>('all')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>('manhattan')
  const [selectedAssociate, setSelectedAssociate] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const filteredStores = useMemo(() => {
    if (storeFilter === 'all') return topStores
    return topStores.filter((s) => s.tier === storeFilter)
  }, [storeFilter])

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return products
    return products.filter((p) => p.category === categoryFilter)
  }, [categoryFilter])

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-amber-500/30 bg-[#0a0c10]/95 px-4 py-2.5 text-sm text-amber-400 shadow-lg backdrop-blur-md">
          {toast}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {['Today', 'WTD', 'MTD'].map((range, i) => (
            <button
              key={range}
              type="button"
              onClick={() => showToast(`Period: ${range}`)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                i === 2 ? 'bg-amber-500/15 text-amber-400' : 'border border-white/[0.08] text-white/50 hover:text-white/80'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => showToast('Retail report exported')}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 hover:border-amber-500/30"
          >
            <Download size={13} />
            Export
          </button>
          <Link
            to="/request-demo"
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/20"
          >
            <ExternalLink size={13} />
            Request custom build
          </Link>
        </div>
      </div>

      {(activeTab === 'pulse' || activeTab === 'regions') && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {storeStats.map((stat, i) => (
            <StatCard
              key={stat.title}
              {...stat}
              active={selectedStat === i}
              onSelect={() => setSelectedStat(i)}
            />
          ))}
        </div>
      )}

      {activeTab === 'pulse' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Foot traffic by hour</h2>
              <div className="flex h-40 items-end gap-1 sm:h-48">
                {hourlyTraffic.map((val, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => showToast(`Hour ${i + 8}:00 — ${val * 52} visitors`)}
                    className="group flex flex-1 flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t bg-amber-500/60 transition-all group-hover:bg-amber-400"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[8px] text-white/25">{i + 8}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-white/35">Peak: 2–4 PM · 4,940 visitors</p>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-medium text-white">Conversion funnel</h2>
              {[
                { stage: 'Visitors', value: '48.2K', pct: 100 },
                { stage: 'Engaged', value: '12.4K', pct: 26 },
                { stage: 'Add to cart', value: '4.8K', pct: 10 },
                { stage: 'Purchase', value: '1.8K', pct: 3.8 },
              ].map((step) => (
                <div key={step.stage} className="mb-3 last:mb-0">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-white/60">{step.stage}</span>
                    <span className="text-white/45">{step.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: `${step.pct}%` }} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => showToast('Funnel analysis opened')}
                className="mt-4 w-full rounded-md border border-white/[0.08] py-2 text-xs text-amber-400 hover:border-amber-500/25"
              >
                Analyze drop-off →
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-white">Store leaderboard</h2>
              <div className="flex gap-1.5">
                {(['all', 'Top', 'Average', 'Underperforming'] as StoreFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStoreFilter(f)}
                    className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                      storeFilter === f ? 'bg-amber-500/15 text-amber-400' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              {filteredStores.map((store, i) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                    selectedStore === store.id ? 'bg-amber-500/[0.1]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="w-5 shrink-0 text-xs font-bold text-white/25">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/90">{store.name}</p>
                    <p className="text-[10px] text-white/40">{store.region} · {store.traffic} visits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{store.revenue}</p>
                    <p className="text-[10px] text-[#ccff00]/75">{store.conv} conv.</p>
                  </div>
                  <ShoppingBag size={14} className={`shrink-0 ${store.trend === 'up' ? 'text-[#ccff00]' : store.trend === 'down' ? 'text-amber-400' : 'text-white/30'}`} />
                </button>
              ))}
            </div>
            {selectedStore && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                <button type="button" onClick={() => showToast('Store detail opened')} className="rounded-md bg-amber-500/15 px-3 py-1.5 text-[10px] font-medium text-amber-400">
                  View store detail
                </button>
                <button type="button" onClick={() => showToast('Action plan created')} className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/50 hover:text-white/80">
                  Create action plan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'Apparel', 'Electronics', 'Home', 'Grocery'] as CategoryFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCategoryFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  categoryFilter === f ? 'bg-amber-500/15 text-amber-400' : 'border border-white/[0.08] text-white/50 hover:text-white/80'
                }`}
              >
                {f === 'all' ? 'All categories' : f}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  selectedProduct === product.id
                    ? 'border-amber-500/40 bg-amber-500/[0.08]'
                    : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-amber-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-[10px] text-white/40">{product.category}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${
                      product.stock === 'Low'
                        ? 'bg-red-500/15 text-red-400'
                        : product.stock === 'High'
                          ? 'bg-[#ccff00]/15 text-[#ccff00]'
                          : 'bg-white/[0.06] text-white/45'
                    }`}
                  >
                    {product.stock} stock
                  </span>
                </div>
                <p className="mt-2 text-xl font-semibold text-white">{product.revenue}</p>
                <p className="text-[10px] text-white/40">{product.units.toLocaleString()} units sold</p>
                <div className="mt-3">
                  <MiniSparkline points={product.trend} color="#f59e0b" />
                </div>
              </button>
            ))}
          </div>

          {selectedProduct && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <button type="button" onClick={() => showToast('Reorder submitted')} className="rounded-md bg-amber-500/15 px-3 py-1.5 text-xs text-amber-400">
                Reorder stock
              </button>
              <button type="button" onClick={() => showToast('Promo created')} className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/50 hover:text-white/80">
                Create promotion
              </button>
              <button type="button" onClick={() => showToast('SKU report opened')} className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/50 hover:text-white/80">
                View SKU report
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'regions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {regions.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedRegion === region.id
                    ? 'border-amber-500/40 bg-amber-500/[0.08]'
                    : 'border-white/[0.08] bg-[#080a0e]/50 hover:border-white/[0.12]'
                }`}
              >
                <p className="text-xs font-medium text-white/60">{region.name}</p>
                <p className="mt-1 text-2xl font-bold text-white">{region.revenue}</p>
                <p className="text-[10px] text-[#ccff00]/80">{region.growth} · {region.stores} stores</p>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-white/35">Comp index</span>
                  <span className={region.compIndex >= 100 ? 'text-[#ccff00]' : 'text-amber-400'}>{region.compIndex}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedRegion && (
            <div className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-white">
                  {regions.find((r) => r.id === selectedRegion)?.name} — store breakdown
                </h2>
                <button
                  type="button"
                  onClick={() => showToast('Regional report opened')}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
                >
                  Full report
                  <ArrowRight size={12} />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {topStores
                  .filter((s) => {
                    const region = regions.find((r) => r.id === selectedRegion)
                    if (!region) return true
                    if (selectedRegion === 'manhattan') return s.region === 'Manhattan'
                    if (selectedRegion === 'outer') return ['Brooklyn', 'Queens', 'Staten Island'].includes(s.region)
                    if (selectedRegion === 'nj') return s.region === 'New Jersey'
                    if (selectedRegion === 'westchester') return s.region === 'Westchester'
                    return true
                  })
                  .map((store) => (
                    <div key={store.id} className="flex items-center justify-between rounded-md border border-white/[0.06] px-3 py-2">
                      <span className="text-sm text-white/80">{store.name}</span>
                      <span className="text-sm font-medium text-white">{store.revenue}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-white/[0.08]">
            <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.6fr_0.6fr] gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35 sm:px-5">
              <span>Associate</span>
              <span>Store</span>
              <span>Sales</span>
              <span>Units</span>
              <span className="text-right">Quota</span>
            </div>
            {staffScoreboard.map((rep) => (
              <div key={rep.name}>
                <button
                  type="button"
                  onClick={() => setSelectedAssociate(selectedAssociate === rep.name ? null : rep.name)}
                  className={`grid w-full grid-cols-[1.2fr_1fr_0.8fr_0.6fr_0.6fr] gap-2 border-b border-white/[0.04] px-4 py-3 text-left text-xs hover:bg-white/[0.02] sm:px-5 ${
                    selectedAssociate === rep.name ? 'bg-amber-500/[0.05]' : ''
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium text-white/85">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    {rep.name}
                  </span>
                  <span className="truncate text-white/50">{rep.store}</span>
                  <span className="text-white/70">{rep.sales}</span>
                  <span className="text-white/50">{rep.units}</span>
                  <span className="text-right text-[#ccff00]/80">{rep.quota}%</span>
                </button>
                {selectedAssociate === rep.name && (
                  <div className="border-b border-white/[0.04] bg-white/[0.02] px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => showToast('Coaching note added')} className="rounded-md bg-amber-500/15 px-3 py-1.5 text-[10px] text-amber-400">
                        Add coaching note
                      </button>
                      <button type="button" onClick={() => showToast('Schedule updated')} className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[10px] text-white/50 hover:text-white/80">
                        Adjust schedule
                      </button>
                      <span className="self-center text-[10px] text-white/35">Rating: {rep.rating}/5.0</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Labor vs sales', value: '18.2%', detail: 'Within target range' },
              { label: 'Avg. units / associate', value: '108', detail: '↑ 12 vs last month' },
              { label: 'Training completion', value: '94%', detail: '6 associates pending' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/35">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-[10px] text-white/40">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
