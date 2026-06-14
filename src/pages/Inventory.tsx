import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import InventoryDashboardSimulator from '../components/InventoryDashboardSimulator'
import InventoryRequestDemoCard from '../components/InventoryRequestDemoCard'
import PlatformBackground from '../components/PlatformBackground'
import { useInventoryTheme } from '../hooks/useInventoryTheme'

export default function Inventory() {
  const location = useLocation()
  const fromSolutionsInventory = Boolean(
    (location.state as { fromSolutionsInventory?: boolean } | null)?.fromSolutionsInventory,
  )
  const { lightMode, setLightMode } = useInventoryTheme()

  return (
    <div
      data-scroll-root
      data-inv-theme={lightMode ? 'light' : 'dark'}
      className="inv-simulator-page relative flex min-h-full flex-col overflow-x-hidden"
    >
      <div className="inv-simulator-bg pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
        <PlatformBackground />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="inv-simulator-hero mb-6">
          <Link
            to={fromSolutionsInventory ? '/solutions' : '/index'}
            className="inv-simulator-back mb-4 inline-flex items-center gap-1.5 text-xs transition"
          >
            <ArrowLeft size={14} />
            {fromSolutionsInventory ? 'Back to solutions' : 'Back to simulators'}
          </Link>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="inv-simulator-eyebrow text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ccff00]">
              Inventory Solutions
            </p>
            <span className="inv-simulator-badge inline-flex items-center gap-1.5 rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]">
              <Sparkles size={10} />
              Live simulator
            </span>
          </div>
          <h1 className="inv-simulator-title text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Inventory & shipping dashboard
          </h1>
          <p className="inv-simulator-desc mt-2 max-w-2xl text-sm leading-relaxed">
            Track stock levels, warehouse capacity, and fulfillment — add catalog items and generate
            simulated shipping labels across USPS, UPS, FedEx, and DHL.
          </p>
        </div>

        <div className="inv-simulator-card glow-brand-lime overflow-hidden rounded-2xl backdrop-blur-md">
          <InventoryDashboardSimulator lightMode={lightMode} onLightModeChange={setLightMode} />
        </div>

        <InventoryRequestDemoCard />
      </div>
    </div>
  )
}
