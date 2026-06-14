import { AlertTriangle, Box, CheckCircle2, MapPin, Package, Search, Warehouse } from 'lucide-react'
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

interface InventoryCatalogPanelProps {
  items: CatalogItem[]
  filteredItems: CatalogItem[]
  search: string
  onSearchChange: (value: string) => void
  onSelectItem: (item: CatalogItem) => void
  stockStatus: (item: CatalogItem) => StockStatus
}

const categoryColors: Record<string, string> = {
  Electronics: '#0080ff',
  Hardware: 'var(--inv-accent-lime)',
  Supplies: '#66ccff',
}

const statusConfig: Record<StockStatus, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  healthy: { label: 'Healthy', color: 'var(--inv-status-healthy)', bg: 'var(--inv-status-healthy-bg)', border: 'var(--inv-status-healthy-border)', icon: CheckCircle2 },
  low: { label: 'Low', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', icon: AlertTriangle },
  critical: { label: 'Critical', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(251,113,113,0.3)', icon: AlertTriangle },
}

function stockFillPct(item: CatalogItem) {
  const cap = Math.max(item.reorderAt * 2.5, item.qty, 1)
  return Math.min(100, (item.qty / cap) * 100)
}

function skuSpark(sku: string): number[] {
  let hash = 0
  for (let i = 0; i < sku.length; i += 1) hash = (hash * 17 + sku.charCodeAt(i)) >>> 0
  return Array.from({ length: 8 }, (_, i) => 4 + (hash % 12) + i * 0.6 + Math.sin(hash + i) * 2)
}

export default function InventoryCatalogPanel({
  items,
  filteredItems,
  search,
  onSearchChange,
  onSelectItem,
  stockStatus,
}: InventoryCatalogPanelProps) {
  const totalUnits = items.reduce((s, i) => s + i.qty, 0)
  const totalValue = items.reduce((s, i) => s + i.qty * i.unitCost, 0)
  const healthyCount = items.filter((i) => stockStatus(i) === 'healthy').length
  const atRiskCount = items.length - healthyCount

  const byCategory = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.qty
    return acc
  }, {})
  const categoryTotal = Object.values(byCategory).reduce((s, v) => s + v, 0) || 1

  return (
    <div className="inv-catalog">
      <div className="inv-catalog-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="inv-catalog-hud-icon">
                <Warehouse size={14} className="text-[#0080ff]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-white">Inventory catalog</h3>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#ccff00]/80">SKU registry · live stock</p>
              </div>
              <span className="inv-catalog-badge">CAT-01</span>
            </div>
            <p className="mt-1.5 text-[11px] text-white/40">Click any item for detailed analytics</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0080ff]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search SKU, name, category…"
              className="inv-input inv-input-search inv-catalog-search !mt-0 w-full font-mono"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { icon: Box, label: 'Total SKUs', value: String(items.length), sub: 'Active catalog', color: 'var(--inv-accent-lime)', spark: [3, 3, 4, 4, 4, 5, 5, items.length] },
            { icon: Package, label: 'Total units', value: totalUnits.toLocaleString(), sub: 'On hand', color: '#0080ff', spark: skuSpark('units') },
            { icon: Warehouse, label: 'Stock value', value: `$${(totalValue / 1000).toFixed(1)}K`, sub: 'At cost', color: '#66ccff', spark: [38, 40, 41, 43, 44, 45, 46, totalValue / 1000] },
            { icon: AlertTriangle, label: 'At risk', value: String(atRiskCount), sub: `${healthyCount} healthy`, color: atRiskCount > 0 ? '#f87171' : 'var(--inv-status-healthy)', spark: [2, 2, 3, 2, 3, atRiskCount, atRiskCount, atRiskCount] },
          ].map((stat) => (
            <div key={stat.label} className="inv-catalog-stat" style={{ borderColor: `${stat.color}33` }}>
              <stat.icon size={12} style={{ color: stat.color }} />
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-white/35">{stat.label}</p>
              <p className="font-mono text-lg font-semibold text-white">{stat.value}</p>
              <p className="text-[9px] text-white/30">{stat.sub}</p>
              <div className="mt-2 opacity-70">
                <MiniSparkline points={stat.spark} color={stat.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="inv-catalog-mix mt-4">
          <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-white/35">
            <span>Category mix</span>
            <span className="font-mono text-white/45">{totalUnits.toLocaleString()} units</span>
          </div>
          <div className="inv-progress-track mt-2 flex h-2.5 overflow-hidden rounded-full">
            {Object.entries(byCategory).map(([cat, units]) => (
              <div
                key={cat}
                className="h-full transition-all duration-500"
                style={{
                  width: `${(units / categoryTotal) * 100}%`,
                  background: categoryColors[cat] ?? '#0080ff',
                }}
                title={`${cat}: ${units}`}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {Object.entries(byCategory).map(([cat, units]) => (
              <div key={cat} className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-full" style={{ background: categoryColors[cat] ?? '#0080ff' }} />
                <span className="text-white/50">{cat}</span>
                <span className="font-semibold tabular-nums text-white">{units.toLocaleString()}</span>
                <span className="text-white/25">({((units / categoryTotal) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="inv-catalog-list">
        <div className="inv-catalog-list-head hidden sm:grid">
          <span>SKU / Product</span>
          <span>Location</span>
          <span>Stock level</span>
          <span className="text-right">Value</span>
          <span>Status</span>
        </div>

        {filteredItems.length === 0 && (
          <div className="inv-catalog-empty">
            <Package size={24} className="text-white/20" />
            <p className="mt-2 text-sm text-white/50">No items match your search</p>
          </div>
        )}

        {filteredItems.map((item) => {
          const status = stockStatus(item)
          const cfg = statusConfig[status]
          const StatusIcon = cfg.icon
          const fill = stockFillPct(item)
          const catColor = categoryColors[item.category] ?? '#0080ff'
          const value = item.qty * item.unitCost

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className="inv-catalog-row group"
            >
              <div className="inv-catalog-row-accent" style={{ background: catColor }} />

              <div className="inv-catalog-row-main min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-[#ccff00]/90">{item.sku}</span>
                  <span
                    className="rounded border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
                    style={{ borderColor: `${catColor}40`, color: catColor, background: `${catColor}12` }}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm font-medium text-white">{item.name}</p>
                <div className="mt-2 sm:hidden">
                  <div className="flex items-center justify-between text-[9px] text-white/35">
                    <span className="flex items-center gap-1">
                      <MapPin size={9} />
                      {item.location}
                    </span>
                    <span className="font-mono tabular-nums">${value.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-1.5 font-mono text-[11px] text-white/50 sm:flex">
                <MapPin size={11} className="text-[#0080ff]/60" />
                {item.location}
              </div>

              <div className="inv-catalog-stock">
                <div className="flex items-center justify-between gap-2 text-[9px]">
                  <span className="font-mono uppercase tracking-wider text-white/30">Qty</span>
                  <span className="font-mono font-semibold tabular-nums text-white">
                    {item.qty}
                    <span className="ml-1 text-white/30">/ {item.reorderAt} min</span>
                  </span>
                </div>
                <div className="inv-catalog-stock-bar mt-1.5">
                  <div
                    className="inv-catalog-stock-fill"
                    style={{
                      width: `${fill}%`,
                      background: `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})`,
                      boxShadow: status !== 'healthy' ? `0 0 8px ${cfg.color}55` : undefined,
                    }}
                  />
                </div>
                <div className="mt-1 hidden opacity-60 sm:block">
                  <MiniSparkline points={skuSpark(item.sku)} color={catColor} />
                </div>
              </div>

              <div className="hidden text-right font-mono text-sm tabular-nums text-white/70 sm:block">
                ${value.toLocaleString()}
              </div>

              <div className="flex items-center justify-end sm:justify-start">
                <span
                  className="inv-catalog-status"
                  style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                >
                  <StatusIcon size={10} />
                  {cfg.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="inv-catalog-footer">
        <span>
          Showing <strong className="text-white">{filteredItems.length}</strong> of{' '}
          <strong className="text-white">{items.length}</strong> SKUs
        </span>
        <span className="font-mono text-white/25">Tap row for detail view</span>
      </div>
    </div>
  )
}
