import { DollarSign, Package, TrendingUp, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { MiniSparkline } from './InfographicWidgets'

export interface CatalogItem {
  id: string
  sku: string
  name: string
  category: string
  location: string
  qty: number
  reorderAt: number
  unitCost: number
}

type StockStatus = 'healthy' | 'low' | 'critical'

interface InventoryItemDetailModalProps {
  item: CatalogItem
  status: StockStatus
  onClose: () => void
  lightMode?: boolean
}

const categoryColors: Record<string, string> = {
  Electronics: '#0080ff',
  Hardware: 'var(--inv-accent-lime)',
  Supplies: '#66ccff',
}

const markupByCategory: Record<string, number> = {
  Electronics: 35,
  Hardware: 28,
  Supplies: 42,
}

function skuSeed(sku: string) {
  let hash = 0
  for (let i = 0; i < sku.length; i += 1) {
    hash = (hash * 31 + sku.charCodeAt(i)) >>> 0
  }
  return hash
}

function buildStaticStats(item: CatalogItem) {
  const seed = skuSeed(item.sku)
  const markupPct = markupByCategory[item.category] ?? 30
  const retailPrice = item.unitCost * (1 + markupPct / 100)
  const unitsSold = 95 + (seed % 410)
  const totalReceived = unitsSold + item.qty + 20 + (seed % 50)
  const revenue = unitsSold * retailPrice
  const cogs = unitsSold * item.unitCost
  const grossProfit = revenue - cogs
  const marginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0
  const onHandValue = item.qty * item.unitCost
  const onHandRetail = item.qty * retailPrice
  const sellThrough = totalReceived > 0 ? (unitsSold / totalReceived) * 100 : 0

  const salesTrend = Array.from({ length: 10 }, (_, i) => {
    const wave = Math.sin((seed % 360) + i * 0.9) * 12
    const base = 8 + (seed % 20) + i * 1.4
    return Math.max(2, Math.round(base + wave))
  })

  const weeklyRevenue = salesTrend.map((units) => units * retailPrice)

  return {
    markupPct,
    retailPrice,
    unitsSold,
    totalReceived,
    revenue,
    cogs,
    grossProfit,
    marginPct,
    onHandValue,
    onHandRetail,
    sellThrough,
    salesTrend,
    weeklyRevenue,
    avgOrderSize: 3 + (seed % 8),
    returnRate: 0.4 + (seed % 25) / 10,
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string
  value: string
  sub: string
  color: string
  icon: typeof Package
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-3">
      <div className="flex items-center gap-2">
        <div className="rounded-md p-1.5" style={{ background: `${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums text-white">{value}</p>
      <p className="text-[10px] text-white/35">{sub}</p>
    </div>
  )
}

function MarginBar({ marginPct }: { marginPct: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-xs font-semibold text-white">Gross margin</p>
      <p className="mt-0.5 text-[10px] text-white/35">Revenue kept after unit cost</p>
      <div className="mt-3 flex items-end gap-3">
        <p className="text-3xl font-semibold tabular-nums text-[#ccff00]">{marginPct.toFixed(1)}%</p>
        <div className="mb-1 flex-1">
          <div className="inv-progress-track h-3 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0080ff] to-[var(--inv-accent-lime)]"
              style={{ width: `${Math.min(marginPct, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function CostRevenueChart({
  cogs,
  grossProfit,
  accent,
}: {
  cogs: number
  grossProfit: number
  accent: string
}) {
  const total = cogs + grossProfit || 1
  const profitPct = (grossProfit / total) * 100
  const costPct = (cogs / total) * 100

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-xs font-semibold text-white">Cost vs revenue</p>
      <p className="mt-0.5 text-[10px] text-white/35">Lifetime unit economics · simulator</p>
      <div className="mt-4 flex h-28 items-end gap-3">
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-white/20"
              style={{ height: `${costPct}%` }}
            />
          </div>
          <p className="text-[10px] text-white/45">COGS</p>
          <p className="text-xs font-semibold tabular-nums text-white">{formatMoney(cogs)}</p>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md"
              style={{ height: `${profitPct}%`, background: accent }}
            />
          </div>
          <p className="text-[10px] text-white/45">Profit</p>
          <p className="text-xs font-semibold tabular-nums text-[#ccff00]">{formatMoney(grossProfit)}</p>
        </div>
      </div>
    </div>
  )
}

function StockMixDonut({
  onHand,
  sold,
  accent,
}: {
  onHand: number
  sold: number
  accent: string
}) {
  const total = onHand + sold || 1
  const soldPct = (sold / total) * 100
  const circumference = 2 * Math.PI * 15.9
  const soldDash = (soldPct / 100) * circumference

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-xs font-semibold text-white">Stock mix</p>
      <p className="mt-0.5 text-[10px] text-white/35">On hand vs lifetime sold</p>
      <div className="relative mx-auto mt-3 flex h-32 w-32 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--inv-chart-track)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeDasharray={`${soldDash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-xl font-semibold tabular-nums text-white">{soldPct.toFixed(0)}%</p>
          <p className="text-[9px] text-white/35">Sold thru</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-white/35">On hand</p>
          <p className="font-semibold tabular-nums text-white">{onHand.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-white/35">Sold</p>
          <p className="font-semibold tabular-nums text-white">{sold.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default function InventoryItemDetailModal({
  item,
  status,
  onClose,
  lightMode = false,
}: InventoryItemDetailModalProps) {
  const stats = buildStaticStats(item)
  const accent = categoryColors[item.category] ?? '#0080ff'

  const statusBadge =
    status === 'healthy'
      ? 'bg-emerald-500/15 text-emerald-400'
      : status === 'low'
        ? 'bg-amber-500/15 text-amber-400'
        : 'bg-red-500/15 text-red-400'

  return createPortal(
    <div data-inv-theme={lightMode ? 'light' : 'dark'} className="inv-simulator-page">
      <div className="inv-add-modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div
          className="inv-detail-modal flex h-[min(920px,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
          role="dialog"
          aria-labelledby="inventory-detail-title"
        >
        <div className="flex shrink-0 items-start justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <p className="font-mono text-xs text-[#ccff00]/90">{item.sku}</p>
            <h3 id="inventory-detail-title" className="mt-1 text-base font-semibold text-white">
              {item.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/60">{item.category}</span>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/60">{item.location}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadge}`}>
                {status}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-white/40 hover:bg-white/[0.06] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Units sold"
              value={stats.unitsSold.toLocaleString()}
              sub="Lifetime · simulator"
              color={accent}
              icon={Package}
            />
            <StatCard
              label="Revenue"
              value={formatMoney(stats.revenue)}
              sub={`@${formatMoney(stats.retailPrice)} retail`}
              color="var(--inv-accent-lime)"
              icon={TrendingUp}
            />
            <StatCard
              label="Product cost"
              value={formatMoney(stats.cogs)}
              sub={`@${formatMoney(item.unitCost)} unit cost`}
              color="#0080ff"
              icon={DollarSign}
            />
            <StatCard
              label="Gross profit"
              value={formatMoney(stats.grossProfit)}
              sub={`${stats.markupPct}% markup`}
              color="#66ccff"
              icon={TrendingUp}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold text-white">Sales velocity</p>
              <p className="mt-0.5 text-[10px] text-white/35">Units sold · last 10 weeks</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                {stats.salesTrend[stats.salesTrend.length - 1]} <span className="text-sm font-normal text-white/40">this wk</span>
              </p>
              <MiniSparkline points={stats.salesTrend} color={accent} />
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold text-white">Weekly revenue</p>
              <p className="mt-0.5 text-[10px] text-white/35">Retail trend · simulator</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[#ccff00]">
                {formatMoney(stats.weeklyRevenue[stats.weeklyRevenue.length - 1])}
              </p>
              <MiniSparkline points={stats.weeklyRevenue} color="var(--inv-accent-lime)" />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <CostRevenueChart cogs={stats.cogs} grossProfit={stats.grossProfit} accent={accent} />
            <StockMixDonut onHand={item.qty} sold={stats.unitsSold} accent={accent} />
            <MarginBar marginPct={stats.marginPct} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'On hand', value: item.qty.toLocaleString(), sub: 'units in stock' },
              { label: 'On-hand value', value: formatMoney(stats.onHandValue), sub: 'at cost' },
              { label: 'Retail value', value: formatMoney(stats.onHandRetail), sub: 'if sold today' },
              { label: 'Reorder at', value: String(item.reorderAt), sub: `${stats.avgOrderSize} avg order size` },
            ].map((row) => (
              <div key={row.label} className="rounded-lg border border-white/[0.06] bg-[#080a0e]/50 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-white/35">{row.label}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-white">{row.value}</p>
                <p className="text-[10px] text-white/30">{row.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs font-semibold text-white">Unit economics</p>
            <div className="mt-3 space-y-2">
              {[
                { label: 'Unit cost', value: formatMoney(item.unitCost), pct: 100 - stats.marginPct, color: 'bg-white/25' },
                { label: 'Retail price', value: formatMoney(stats.retailPrice), pct: 100, color: 'bg-[#ccff00]/40' },
                { label: 'Profit per unit', value: formatMoney(stats.retailPrice - item.unitCost), pct: stats.marginPct, color: 'bg-[#0080ff]/50' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-white/55">{row.label}</span>
                    <span className="font-semibold tabular-nums text-white">{row.value}</span>
                  </div>
                  <div className="inv-progress-track h-1.5 overflow-hidden rounded-full">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-white/30">
              Return rate {stats.returnRate.toFixed(1)}% · Sell-through {stats.sellThrough.toFixed(1)}% · Static simulator data
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>,
    document.body,
  )
}
