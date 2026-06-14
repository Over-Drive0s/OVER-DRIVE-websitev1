import { ArrowUpRight, CalendarCheck, Package, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

const highlights = [
  'Multi-carrier shipping & label workflows',
  'Real-time stock, capacity, and reorder alerts',
  'Custom warehouse dashboards for your ops stack',
]

export default function InventoryRequestDemoCard() {
  return (
    <div className="inv-demo-card">
      <div className="inv-demo-card-glow" aria-hidden />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inv-demo-card-icon">
              <Package size={16} className="text-[#ccff00]" />
            </div>
            <p className="inv-demo-card-eyebrow">Inventory solutions</p>
            <span className="inv-demo-card-badge">
              <CalendarCheck size={10} />
              24–48 hr follow-up
            </span>
          </div>
          <h2 className="inv-demo-card-title mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
            Request a demo
          </h2>
          <p className="inv-demo-card-desc mt-2 text-sm leading-relaxed">
            See how Overdrive IO connects catalog management, warehouse telemetry, and carrier
            fulfillment into one operational dashboard — tailored to your SKUs, hubs, and shipping
            partners.
          </p>
          <ul className="inv-demo-card-list mt-4 space-y-2">
            {highlights.map((item) => (
              <li key={item} className="inv-demo-card-list-item flex items-start gap-2 text-sm">
                <Truck size={14} className="mt-0.5 shrink-0 text-[#0080ff]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
          <Link to="/request-demo" className="inv-demo-card-btn">
            Request a demo
            <ArrowUpRight size={16} />
          </Link>
          <p className="inv-demo-card-note text-center text-[11px] lg:text-left">
            No commitment · simulator walkthrough included
          </p>
        </div>
      </div>
    </div>
  )
}
