import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardPreview from '../components/DashboardPreview'
import { FloatingWidget, widgetPresets } from '../components/InfographicWidgets'
import PlatformBackground from '../components/PlatformBackground'
import TestimonialCarousel from '../components/TestimonialCarousel'

const metrics = [
  { value: '99.9%', label: 'Uptime', color: 'text-[#ccff00]' },
  { value: '847', label: 'Automations / day', color: 'text-[#ccff00]' },
  { value: '12+', label: 'Integrations', color: 'text-[#0080ff]' },
  { value: '< 2s', label: 'Sync latency', color: 'text-[#0080ff]' },
]

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#050607]">
      <div className="relative flex min-h-0 flex-1 flex-col border-b border-white/[0.06]">
        <PlatformBackground />

        <section className="relative mx-auto grid min-h-0 flex-1 max-w-7xl gap-8 px-6 py-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-10 lg:py-8 lg:pt-10">
          <div className="relative z-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="mb-3 h-px w-8 bg-[#0080ff]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
                Overdrive IO
              </p>
            </div>

            <h1 className="max-w-2xl text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.04em] text-white lg:text-[3.25rem]">
              Operational software
              <span className="block text-[#0080ff]">that drives results.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-[1.65] text-white/50 lg:text-lg">
              Overdrive IO unifies systems, dashboards, and automations to help
              operations teams work smarter and scale with confidence.
            </p>

            <div className="mt-7">
              <Link
                to="/platform"
                className="group inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98]"
              >
                Explore Platform
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-white/[0.08] bg-[#080a0e]/80 px-3 py-2.5 backdrop-blur-sm transition-colors hover:border-[#0080ff]/30 hover:glow-brand-blue"
                >
                  <p className={`text-base font-semibold lg:text-lg ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex min-h-0 items-center">
            <FloatingWidget
              {...widgetPresets.automation}
              className="right-2 -top-5 animate-float z-20"
            />
            <FloatingWidget
              {...widgetPresets.integration}
              className="-right-2 top-1/3 animate-float-delayed z-20"
            />
            <FloatingWidget
              {...widgetPresets.growth}
              className="-left-2 bottom-16 animate-float-slow z-20"
            />
            <FloatingWidget
              {...widgetPresets.alert}
              className="-right-4 bottom-8 animate-float z-20"
            />
            <div className="w-full origin-top scale-[0.94] lg:scale-[0.97]">
              <DashboardPreview />
            </div>
          </div>
        </section>

        <TestimonialCarousel compact />
      </div>
    </div>
  )
}
