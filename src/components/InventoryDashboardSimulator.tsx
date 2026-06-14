import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Box,
  Moon,
  Package,
  PackagePlus,
  Sun,
  Truck,
  Warehouse,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import AddInventoryModal from './AddInventoryModal'
import FedExShippingLabel, { type LabelData } from './FedExShippingLabel'
import { MiniSparkline } from './InfographicWidgets'
import InventoryCatalogPanel from './InventoryCatalogPanel'
import InventoryItemDetailModal from './InventoryItemDetailModal'
import InboundOutboundChart from './InboundOutboundChart'
import ShipmentTrackingWidget from './ShipmentTrackingWidget'
import StatusDonut from './StatusDonut'
import {
  CarrierLogo,
  carriers,
  type CarrierId,
} from './ShippingCarrierLogos'

type TabId = 'overview' | 'inventory' | 'shipping'

type StockStatus = 'healthy' | 'low' | 'critical'

interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  location: string
  qty: number
  reorderAt: number
  unitCost: number
}

interface Shipment {
  id: string
  orderId: string
  sku: string
  itemName: string
  qty: number
  carrier: CarrierId
  tracking: string
  status: 'label_created' | 'in_transit' | 'delivered'
  createdAt: string
}

const initialInventory: InventoryItem[] = [
  { id: '1', sku: 'OD-1001', name: 'Wireless Sensor Hub', category: 'Electronics', location: 'A-12', qty: 248, reorderAt: 80, unitCost: 42 },
  { id: '2', sku: 'OD-2044', name: 'Industrial Fastener Kit', category: 'Hardware', location: 'B-04', qty: 56, reorderAt: 100, unitCost: 18 },
  { id: '3', sku: 'OD-3180', name: 'Packaging Box — Medium', category: 'Supplies', location: 'C-01', qty: 1240, reorderAt: 400, unitCost: 2.4 },
  { id: '4', sku: 'OD-4022', name: 'LED Control Module', category: 'Electronics', location: 'A-08', qty: 18, reorderAt: 40, unitCost: 64 },
  { id: '5', sku: 'OD-5099', name: 'Thermal Label Roll', category: 'Supplies', location: 'C-06', qty: 312, reorderAt: 120, unitCost: 8.5 },
  { id: '6', sku: 'OD-6110', name: 'Steel Mount Bracket', category: 'Hardware', location: 'B-11', qty: 92, reorderAt: 60, unitCost: 12 },
]

const initialShipments: Shipment[] = [
  { id: 's1', orderId: 'ORD-8841', sku: 'OD-1001', itemName: 'Wireless Sensor Hub', qty: 12, carrier: 'fedex', tracking: '7946 1284 9921', status: 'in_transit', createdAt: 'Today 09:14' },
  { id: 's2', orderId: 'ORD-8836', sku: 'OD-3180', itemName: 'Packaging Box — Medium', qty: 200, carrier: 'ups', tracking: '1Z 999 AA1 01 2345 6784', status: 'label_created', createdAt: 'Today 08:42' },
  { id: 's3', orderId: 'ORD-8829', sku: 'OD-5099', itemName: 'Thermal Label Roll', qty: 48, carrier: 'usps', tracking: '9400 1000 0000 0284 3821', status: 'delivered', createdAt: 'Yesterday' },
]

const categoryColors: Record<string, string> = {
  Electronics: '#0080ff',
  Hardware: 'var(--inv-accent-lime)',
  Supplies: '#66ccff',
}

const inboundTrend = [820, 840, 880, 860, 910, 940, 920, 980, 1020, 1040]
const outboundTrend = [760, 780, 800, 820, 850, 870, 890, 910, 940, 960]

function stockStatus(item: InventoryItem): StockStatus {
  if (item.qty <= item.reorderAt * 0.35) return 'critical'
  if (item.qty <= item.reorderAt) return 'low'
  return 'healthy'
}

function genTracking(carrier: CarrierId) {
  const n = Math.floor(Math.random() * 9000000000) + 1000000000
  if (carrier === 'ups') return `1Z 999 AA1 01 ${String(n).slice(0, 4)} ${String(n).slice(4, 8)}`
  if (carrier === 'usps') return `9400 1000 0000 ${String(n).slice(0, 4)} ${String(n).slice(4, 8)}`
  if (carrier === 'fedex') return `${String(n).slice(0, 4)} ${String(n).slice(4, 8)} ${String(n).slice(8, 12)}`
  return `JD ${String(n).slice(0, 6)} ${String(n).slice(6, 10)} DE`
}

const tabs: { id: TabId; label: string; icon: typeof Box }[] = [
  { id: 'overview', label: 'Overview', icon: Warehouse },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'shipping', label: 'Shipping', icon: Truck },
]

const statusStyles = {
  label_created: 'bg-[#0080ff]/15 text-[#0080ff]',
  in_transit: 'bg-[#ccff00]/15 text-[#ccff00]',
  delivered: 'bg-emerald-500/15 text-emerald-400',
}

const statusLabel = {
  label_created: 'Label created',
  in_transit: 'In transit',
  delivered: 'Delivered',
}

interface InventoryDashboardSimulatorProps {
  lightMode: boolean
  onLightModeChange: (value: boolean) => void
}

export default function InventoryDashboardSimulator({
  lightMode,
  onLightModeChange,
}: InventoryDashboardSimulatorProps) {
  const [tab, setTab] = useState<TabId>('overview')
  const [items, setItems] = useState<InventoryItem[]>(initialInventory)
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [labelPreview, setLabelPreview] = useState<LabelData | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const [shipForm, setShipForm] = useState({
    itemId: initialInventory[0].id,
    qty: 1,
    carrier: 'fedex' as CarrierId,
  })

  const stats = useMemo(() => {
    const totalUnits = items.reduce((s, i) => s + i.qty, 0)
    const totalValue = items.reduce((s, i) => s + i.qty * i.unitCost, 0)
    const lowStock = items.filter((i) => stockStatus(i) !== 'healthy').length
    const todayShipments = shipments.filter((s) => s.createdAt.includes('Today')).length
    const inTransit = shipments.filter((s) => s.status === 'in_transit').length
    const fillRate = Math.min(99.4, 94 + items.filter((i) => stockStatus(i) === 'healthy').length * 0.8)

    const byCategory = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.qty
      return acc
    }, {})

    const maxCat = Math.max(...Object.values(byCategory), 1)

    const healthyCount = items.filter((i) => stockStatus(i) === 'healthy').length
    const lowCount = items.filter((i) => stockStatus(i) === 'low').length
    const criticalCount = items.filter((i) => stockStatus(i) === 'critical').length
    const budgetCap = 280000
    const budgetUsed = totalValue
    const budgetRemaining = Math.max(0, budgetCap - totalValue)
    const budgetUsedPct = Math.min(100, (totalValue / budgetCap) * 100)
    const riskScore = items.length
      ? Math.round(((criticalCount * 3 + lowCount) / (items.length * 3)) * 100)
      : 0

    return {
      totalUnits,
      totalValue,
      lowStock,
      todayShipments,
      inTransit,
      fillRate,
      byCategory,
      maxCat,
      healthyCount,
      lowCount,
      criticalCount,
      budgetCap,
      budgetUsed,
      budgetRemaining,
      budgetUsedPct,
      riskScore,
    }
  }, [items, shipments])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.sku.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    )
  }, [items, search])

  const notify = (msg: string) => {
    setFlash(msg)
    window.setTimeout(() => setFlash(null), 2800)
  }

  const handleAddItem = (payload: {
    sku: string
    name: string
    category: string
    location: string
    qty: number
    reorderAt: number
    unitCost: number
  }) => {
    const item: InventoryItem = {
      id: `new-${Date.now()}`,
      ...payload,
    }

    setItems((prev) => [item, ...prev])
    setShowAdd(false)
    notify(`Added ${item.qty}× ${item.name} to catalog`)
  }

  const handleShip = (e: React.FormEvent) => {
    e.preventDefault()
    const item = items.find((i) => i.id === shipForm.itemId)
    if (!item || shipForm.qty < 1 || shipForm.qty > item.qty) {
      notify('Invalid ship quantity')
      return
    }

    const shipment: Shipment = {
      id: `s-${Date.now()}`,
      orderId: `ORD-${8800 + shipments.length + 1}`,
      sku: item.sku,
      itemName: item.name,
      qty: shipForm.qty,
      carrier: shipForm.carrier,
      tracking: genTracking(shipForm.carrier),
      status: 'label_created',
      createdAt: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    }

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty - shipForm.qty } : i)),
    )
    setShipments((prev) => [shipment, ...prev])
    setLabelPreview({
      orderId: shipment.orderId,
      sku: shipment.sku,
      itemName: shipment.itemName,
      qty: shipment.qty,
      tracking: shipment.tracking,
      carrier: shipment.carrier,
      createdAt: shipment.createdAt,
    })
  }

  return (
    <div className="inv-dashboard">
      {/* Toolbar */}
      <div className="inv-toolbar">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inv-tab-rail">
            {tabs.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inv-tab ${tab === t.id ? 'inv-tab--active' : 'inv-tab--idle'}`}
                >
                  <Icon size={14} className={tab === t.id ? 'text-[#ccff00]' : ''} />
                  {t.label}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inv-theme-toggle" role="group" aria-label="Dashboard theme">
              <button
                type="button"
                onClick={() => onLightModeChange(false)}
                className={`inv-theme-toggle-btn ${!lightMode ? 'inv-theme-toggle-btn--active' : ''}`}
                aria-pressed={!lightMode}
              >
                <Moon size={13} />
                Dark
              </button>
              <button
                type="button"
                onClick={() => onLightModeChange(true)}
                className={`inv-theme-toggle-btn ${lightMode ? 'inv-theme-toggle-btn--active' : ''}`}
                aria-pressed={lightMode}
              >
                <Sun size={13} />
                Light
              </button>
            </div>
            <button type="button" onClick={() => setShowAdd(true)} className="inv-btn-lime">
              <PackagePlus size={14} />
              Add inventory
            </button>
          </div>
        </div>
      </div>

      {flash && <div className="inv-flash">{flash}</div>}

      <div className="inv-content sm:p-6">
        {/* KPI row — all tabs */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Total SKUs', value: String(items.length), sub: `${stats.totalUnits.toLocaleString()} units`, up: true, spark: inboundTrend, color: 'var(--inv-accent-lime)' },
            { label: 'Stock value', value: `$${(stats.totalValue / 1000).toFixed(1)}K`, sub: 'On-hand valuation', up: true, spark: [42, 44, 43, 46, 48, 47, 49, 51, 52, 53], color: '#0080ff' },
            { label: 'Fill rate', value: `${stats.fillRate.toFixed(1)}%`, sub: 'Order fulfillment', up: true, spark: [96, 96.5, 97, 97.2, 97.8, 98, 98.4, 98.8, 99, 99.2], color: '#66ccff' },
            { label: 'Shipments today', value: String(stats.todayShipments), sub: `${stats.inTransit} in transit`, up: stats.todayShipments > 0, spark: outboundTrend, color: 'var(--inv-accent-lime)' },
          ].map((kpi) => (
            <div key={kpi.label} className="inv-kpi">
              <div className="inv-kpi-accent" style={{ background: kpi.color }} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">{kpi.label}</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <p className="text-2xl font-semibold tracking-tight text-white">{kpi.value}</p>
                {kpi.up ? (
                  <ArrowUpRight size={16} className="text-emerald-400" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-400" />
                )}
              </div>
              <p className="mt-1 text-[11px] text-white/40">{kpi.sub}</p>
              <div className="mt-3 opacity-80">
                <MiniSparkline points={kpi.spark} color={kpi.color} />
              </div>
            </div>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <ShipmentTrackingWidget shipments={shipments} variant="compact" />
            </div>

            {/* Budget & risk donuts */}
            <StatusDonut
              title="Budget utilization"
              subtitle={`Cap: $${(stats.budgetCap / 1000).toFixed(0)}K · on-hand valuation`}
              segments={[
                { label: 'Used', value: Math.round(stats.budgetUsed), color: '#0080ff' },
                { label: 'Remaining', value: Math.round(stats.budgetRemaining), color: 'var(--inv-chart-segment-muted)' },
              ]}
              centerValue={`${stats.budgetUsedPct.toFixed(0)}%`}
              centerLabel="Used"
            />
            <StatusDonut
              title="Inventory risk"
              subtitle="SKU health distribution"
              segments={[
                { label: 'Healthy', value: stats.healthyCount, color: 'var(--inv-status-healthy)' },
                { label: 'Low stock', value: stats.lowCount, color: '#fbbf24' },
                { label: 'Critical', value: stats.criticalCount, color: '#f87171' },
              ]}
              centerValue={stats.riskScore <= 25 ? 'Low' : stats.riskScore <= 55 ? 'Med' : 'High'}
              centerLabel="Risk"
            />

            <div className="inv-panel inv-panel-pad">
              <h3 className="text-sm font-semibold tracking-tight text-white">Stock by category</h3>
              <p className="mt-1 text-[11px] text-white/40">Units on hand</p>
              <div className="mt-4 space-y-3">
                {Object.entries(stats.byCategory).map(([cat, units]) => (
                  <div key={cat}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-white/70">{cat}</span>
                      <span className="font-medium tabular-nums text-white">{units.toLocaleString()}</span>
                    </div>
                    <div className="inv-progress-track h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(units / stats.maxCat) * 100}%`,
                          background: categoryColors[cat] ?? '#0080ff',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inbound / outbound chart */}
            <InboundOutboundChart inbound={inboundTrend} outbound={outboundTrend} />

            {/* Warehouse + reorder — right of inbound/outbound */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <div className="inv-panel inv-panel-pad">
                <h3 className="text-sm font-semibold tracking-tight text-white">Warehouse capacity</h3>
                <div className="relative mx-auto mt-5 flex h-32 w-32 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--inv-chart-track)" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="var(--inv-accent-lime)"
                      strokeWidth="3"
                      strokeDasharray="72 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-2xl font-semibold text-white">72%</p>
                    <p className="text-[9px] text-white/35">Utilized</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-[10px] text-white/40">
                  <div className="flex justify-between"><span>Zone A — Electronics</span><span className="text-white/60">84%</span></div>
                  <div className="flex justify-between"><span>Zone B — Hardware</span><span className="text-white/60">68%</span></div>
                  <div className="flex justify-between"><span>Zone C — Supplies</span><span className="text-white/60">61%</span></div>
                </div>
              </div>

              <div className="inv-panel inv-panel-pad">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-amber-500/15 p-1.5">
                    <AlertTriangle size={14} className="text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-white">Reorder alerts</h3>
                  <span className="inv-stat-chip text-amber-400">
                    {stats.lowStock} items
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {items
                    .filter((i) => stockStatus(i) !== 'healthy')
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5"
                      >
                        <div>
                          <p className="text-xs font-medium text-white">{item.name}</p>
                          <p className="text-[10px] text-white/35">{item.sku} · {item.location}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold tabular-nums ${stockStatus(item) === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                            {item.qty} left
                          </p>
                          <p className="text-[10px] text-white/30">Reorder at {item.reorderAt}</p>
                        </div>
                      </div>
                    ))}
                  {stats.lowStock === 0 && (
                    <p className="text-xs text-white/35">All items above reorder threshold.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <InventoryCatalogPanel
            items={items}
            filteredItems={filteredItems}
            search={search}
            onSearchChange={setSearch}
            onSelectItem={setSelectedItem}
            stockStatus={stockStatus}
          />
        )}

        {tab === 'shipping' && (
          <div className="space-y-4">
            <ShipmentTrackingWidget
              shipments={shipments}
              variant="full"
              leftColumnFooter={
                <>
                  <div className="inv-panel inv-panel-pad">
                    <h3 className="text-sm font-semibold tracking-tight text-white">Carrier partners</h3>
                    <p className="mt-1 text-[11px] text-white/40">Select a carrier to simulate a label</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {carriers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setShipForm((f) => ({ ...f, carrier: c.id }))}
                          className={`inv-carrier-card ${shipForm.carrier === c.id ? 'inv-carrier-card--active' : ''}`}
                        >
                          <div className="flex h-11 items-center rounded-lg bg-white px-2.5 shadow-sm">
                            <CarrierLogo carrier={c.id} className="h-7 w-full" />
                          </div>
                          <p className="mt-2.5 text-[11px] font-medium text-white/80">{c.name}</p>
                          <p className="mt-0.5 text-[10px] text-white/40">{c.eta} · {c.rate}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleShip} className="inv-panel inv-panel-pad">
                    <h3 className="text-sm font-semibold tracking-tight text-white">Create shipment</h3>
                    <p className="mt-1 text-[11px] text-white/40">Generate a printable shipping label</p>
                    <div className="mt-4 space-y-3.5">
                      <label className="block">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Item</span>
                        <select
                          value={shipForm.itemId}
                          onChange={(e) => setShipForm((f) => ({ ...f, itemId: e.target.value }))}
                          className="inv-input"
                        >
                          {items.filter((i) => i.qty > 0).map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.sku} — {i.name} ({i.qty} avail)
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Quantity</span>
                        <input
                          type="number"
                          min={1}
                          value={shipForm.qty}
                          onChange={(e) => setShipForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                          className="inv-input tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/25 px-3.5 py-2.5">
                        <div className="rounded-lg bg-white px-2.5 py-1.5 shadow-sm">
                          <CarrierLogo carrier={shipForm.carrier} className="h-5 w-16" />
                        </div>
                        <span className="text-[11px] text-white/45">Selected carrier</span>
                      </div>
                      <button type="submit" className="inv-btn-blue">
                        <Truck size={14} />
                        Generate shipping label
                      </button>
                    </div>
                  </form>
                </>
              }
            />

            <div className="inv-panel">
              <div className="inv-panel-head">
                <h3 className="text-sm font-semibold tracking-tight text-white">Recent shipments</h3>
                <p className="mt-1 text-[11px] text-white/40">{shipments.length} labels · simulator</p>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {shipments.map((s) => (
                  <div key={s.id} className="inv-shipment-row flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white px-2.5 py-1.5 shadow-sm">
                        <CarrierLogo carrier={s.carrier} className="h-6 w-20 shrink-0" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{s.orderId}</p>
                        <p className="text-[11px] text-white/50">
                          {s.qty}× {s.itemName}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-white/35">{s.tracking}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[s.status]}`}>
                        {statusLabel[s.status]}
                      </span>
                      <span className="text-[10px] text-white/30">{s.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {labelPreview && (
        <FedExShippingLabel label={labelPreview} onClose={() => setLabelPreview(null)} />
      )}

      {selectedItem && (
        <InventoryItemDetailModal
          item={selectedItem}
          status={stockStatus(selectedItem)}
          onClose={() => setSelectedItem(null)}
          lightMode={lightMode}
        />
      )}

      <AddInventoryModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAddItem}
        lightMode={lightMode}
      />

      <div className="inv-dashboard-footer">
        Simulator data — not connected to live inventory or carrier APIs
      </div>
    </div>
  )
}
