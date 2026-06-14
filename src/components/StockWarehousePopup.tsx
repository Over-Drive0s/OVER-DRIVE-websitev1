import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Link2,
  Package,
  RefreshCw,
  Truck,
  Warehouse,
  X,
} from 'lucide-react'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'

interface StockWarehousePopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'metrics' | 'workflow' | 'warehouse'

const tabs: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: 'overview', label: 'Overview', icon: Package },
  { id: 'metrics', label: 'Metrics', icon: Activity },
  { id: 'workflow', label: 'Workflow', icon: RefreshCw },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse },
]

const headlineStats = [
  { label: 'Stock Value', value: '$1.2M', accent: 'text-[#ccff00]' },
  { label: 'Low-Stock SKUs', value: '24', accent: 'text-amber-300' },
  { label: 'Reorder Alerts', value: '11', accent: 'text-[#0080ff]' },
  { label: 'Inbound', value: '8', accent: 'text-white' },
]

const features = [
  {
    title: 'Stock Level Monitoring',
    text: 'Track available inventory, reserved stock, low-stock items, damaged goods, and incoming supply across locations.',
    icon: Boxes,
  },
  {
    title: 'Reorder Triggers',
    text: 'Set minimum stock thresholds, automatic reorder alerts, supplier reminders, and purchasing workflows.',
    icon: RefreshCw,
  },
  {
    title: 'Supplier Integrations',
    text: 'Connect vendor catalogs, purchase orders, lead times, shipment updates, and supplier performance data.',
    icon: Link2,
  },
  {
    title: 'Warehouse Visibility',
    text: 'View bin locations, receiving status, picking activity, transfer requests, and fulfillment bottlenecks.',
    icon: Warehouse,
  },
]

const metrics = [
  { label: 'Current stock value', value: '$1.24M', trend: '↑ 3.2% this month' },
  { label: 'Low-stock SKUs', value: '24', trend: '11 need reorder' },
  { label: 'Reorder alerts', value: '11', trend: 'Auto-triggered' },
  { label: 'Inbound shipments', value: '8', trend: '3 arriving today' },
  { label: 'Inventory turnover', value: '6.4x', trend: 'Annual rate' },
  { label: 'Supplier lead time', value: '4.2 days', trend: '↓ 0.8d improved' },
]

const workflow = [
  'Inventory item is received',
  'Stock count updates automatically',
  'Warehouse location is assigned',
  'Low-stock threshold is monitored',
  'Reorder alert is triggered',
  'Supplier order is created',
]

const stockItems = [
  { sku: 'SKU-4821', name: 'Brake Pad Set — Front', qty: 142, status: 'In Stock' as const, location: 'A-12-04' },
  { sku: 'SKU-3910', name: 'Oil Filter — Universal', qty: 18, status: 'Low Stock' as const, location: 'B-03-11' },
  { sku: 'SKU-2208', name: 'Alternator — 120A', qty: 6, status: 'Reorder' as const, location: 'C-08-02' },
  { sku: 'SKU-7744', name: 'Transmission Fluid (Case)', qty: 0, status: 'Out of Stock' as const, location: 'D-01-07' },
]

const inboundShipments = [
  { po: 'PO-8842', supplier: 'AutoParts Direct', items: 48, eta: 'Today', status: 'In Transit' as const },
  { po: 'PO-8839', supplier: 'Midwest Supply Co.', items: 120, eta: 'Tomorrow', status: 'Confirmed' as const },
  { po: 'PO-8835', supplier: 'Pacific Wholesale', items: 32, eta: 'May 30', status: 'Processing' as const },
]

function StockStatusBadge({ status }: { status: (typeof stockItems)[number]['status'] }) {
  const styles = {
    'In Stock': 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    'Low Stock': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    Reorder: 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    'Out of Stock': 'border-red-500/30 bg-red-500/10 text-red-300',
  }

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  )
}

export default function StockWarehousePopup({ onClose }: StockWarehousePopupProps) {
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
      aria-labelledby="stock-warehouse-title"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0080ff]/30 bg-[#0080ff]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0080ff]">
                    <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
                    Stock & Warehouse
                  </span>
                  <span className="text-[11px] text-white/35">1,842 SKUs tracked · 11 reorder alerts</span>
                </div>

                <h1 id="stock-warehouse-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Inventory Operations <span className="text-[#0080ff]">Hub</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Built for inventory-driven businesses that need tighter control over stock levels,
                  reorder timing, supplier activity, and warehouse movement.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Stock & Warehouse"
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
                <div className="rounded-xl border border-[#0080ff]/20 bg-[#0080ff]/[0.06] p-5">
                  <h2 className="text-sm font-semibold text-white">Open Inventory Hub</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Monitor stock levels, manage reorder triggers, and track warehouse activity from
                    one operational dashboard.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to="/inventory"
                      state={{ fromSolutionsInventory: true }}
                      onClick={onClose}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Open Inventory View
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveTab('workflow')}
                      className="inline-flex flex-1 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      View Workflow
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#ccff00]/20 bg-[#ccff00]/[0.06] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ccff00]/80">
                    Best For
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    Retail stockrooms, parts departments, distributors, warehouses, repair shops,
                    fulfillment teams, supply companies, and any business where inventory is the
                    core operation.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {features.map(({ title, text, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5 transition hover:border-[#0080ff]/25"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[#0080ff]/20 bg-[#0080ff]/10">
                      <Icon size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/45">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Inventory Metrics</h2>
                <p className="mt-1 text-xs text-white/40">Live stock and supply chain indicators</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5 transition hover:border-[#0080ff]/25"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-xs text-[#ccff00]/70">{item.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-base font-semibold text-white">Warehouse Workflow</h2>
                <p className="mt-1 text-xs text-white/40">From receiving to supplier reorder</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {workflow.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                  >
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#0080ff]">
                      Step {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'warehouse' && (
            <div className="space-y-5 p-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-base font-semibold text-white">Stock Snapshot</h2>
                  <p className="mt-1 mb-4 text-xs text-white/40">Priority SKUs requiring attention</p>
                  <div className="space-y-3">
                    {stockItems.map((item) => (
                      <div
                        key={item.sku}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="mt-0.5 text-xs text-white/35">
                              {item.sku} · Bin {item.location}
                            </p>
                          </div>
                          <StockStatusBadge status={item.status} />
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                          Qty on hand: <span className="font-semibold text-white">{item.qty}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">Inbound Shipments</h2>
                  <p className="mt-1 mb-4 text-xs text-white/40">Active purchase orders from suppliers</p>
                  <div className="space-y-3">
                    {inboundShipments.map((shipment) => (
                      <div
                        key={shipment.po}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                              <Truck size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{shipment.supplier}</p>
                              <p className="text-xs text-white/35">{shipment.po} · {shipment.items} items</p>
                            </div>
                          </div>
                          <span className="text-xs text-[#ccff00]">{shipment.eta}</span>
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                          <CheckCircle2 size={11} className="text-[#0080ff]" />
                          {shipment.status}
                        </p>
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
