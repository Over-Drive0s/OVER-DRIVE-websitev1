import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import PlatformBackground from '../components/PlatformBackground'
import TradingPanelCards from '../components/TradingPanelCards'
import CustomTradingIndicatorsSection from '../components/CustomTradingIndicatorsSection'

export default function TradingSystems() {
  return (
    <div
      data-scroll-root
      className="relative flex min-h-full flex-col overflow-x-hidden bg-[#050607]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
        <PlatformBackground />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-8">
          <Link
            to="/index"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to simulators
          </Link>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
              Trading Systems
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]">
              <Sparkles size={10} />
              Live simulator
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Trading terminal preview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
            Custom trading systems engineered for everyone — from independent retail traders to emerging
            hedge funds. We build scalable tools, automation, analytics, and infrastructure tailored to any
            level of trading operation.
          </p>
        </div>

        <TradingPanelCards />

        <CustomTradingIndicatorsSection />
      </div>
    </div>
  )
}
