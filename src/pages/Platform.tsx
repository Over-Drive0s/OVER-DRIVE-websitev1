import { useState, type ReactNode } from 'react'
import { ArrowUpRight, BarChart3, Boxes, Layers, Link2, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { IllustrationType } from '../components/ModuleIllustrations'
import PlatformBackground from '../components/PlatformBackground'
import PlatformHeroVisual from '../components/PlatformHeroVisual'
import PlatformModuleCard from '../components/PlatformModuleCard'
import AutomationHubPopup from '../components/AutomationHubPopup'
import DashboardEnginePopup from '../components/DashboardEnginePopup'
import IntegrationLayerPopup from '../components/IntegrationLayerPopup'
import SystemsCorePopup from '../components/SystemsCorePopup'

const coreModules: {
  title: string
  description: string
  illustration: IllustrationType
  icon: ReactNode
  metric: string
  metricLabel: string
}[] = [
  {
    title: 'Systems Core',
    description: 'Centralized management for operational tools, data sources, and workflows.',
    illustration: 'systems',
    icon: <Boxes size={16} strokeWidth={1.5} />,
    metric: '12',
    metricLabel: 'Tools connected',
  },
  {
    title: 'Dashboard Engine',
    description: 'Configurable views for KPIs, job status, revenue, and team performance.',
    illustration: 'dashboard',
    icon: <BarChart3 size={16} strokeWidth={1.5} />,
    metric: '24',
    metricLabel: 'Live dashboard views',
  },
  {
    title: 'Automation Hub',
    description: 'Trigger-based workflows that eliminate repetitive manual processes.',
    illustration: 'automation',
    icon: <Workflow size={16} strokeWidth={1.5} />,
    metric: '847',
    metricLabel: 'Runs today',
  },
  {
    title: 'Integration Layer',
    description: 'Connect CRMs, ERPs, inventory systems, and third-party APIs.',
    illustration: 'integration',
    icon: <Link2 size={16} strokeWidth={1.5} />,
    metric: '99.4%',
    metricLabel: 'Sync success rate',
  },
]

export default function Platform() {
  const [activeModule, setActiveModule] = useState<IllustrationType>('systems')
  const [systemsCoreOpen, setSystemsCoreOpen] = useState(false)
  const [dashboardEngineOpen, setDashboardEngineOpen] = useState(false)
  const [automationHubOpen, setAutomationHubOpen] = useState(false)
  const [integrationLayerOpen, setIntegrationLayerOpen] = useState(false)

  const handleModuleClick = (illustration: IllustrationType) => {
    setActiveModule(illustration)
    setSystemsCoreOpen(illustration === 'systems')
    setDashboardEngineOpen(illustration === 'dashboard')
    setAutomationHubOpen(illustration === 'automation')
    setIntegrationLayerOpen(illustration === 'integration')
  }

  return (
    <div
      data-scroll-root
      className="relative flex flex-col overflow-x-hidden bg-[#050607]"
    >
      {/* Hero — takes majority of card height */}
      <div className="relative flex min-h-0 shrink-0 flex-col border-b border-white/[0.06] lg:min-h-[52%]">
        <PlatformBackground />

        <section className="relative mx-auto grid h-full min-h-0 max-w-7xl gap-8 px-6 pb-5 pt-6 lg:grid-cols-[40%_60%] lg:items-center lg:gap-8 lg:pb-5 lg:pt-8">
          <div className="z-10 flex flex-col justify-center">
            <div className="mb-5">
              <div className="mb-3 h-px w-8 bg-[#0080ff]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
                Platform
              </p>
            </div>

            <h1 className="max-w-md text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white lg:text-[2.85rem]">
              One platform for{' '}
              <span className="text-[#0080ff]">operational control</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-[1.7] text-white/50">
              Overdrive IO unifies systems, dashboards, automations, and integrations into a
              unified layer built for how operations teams actually work.
            </p>

            <div className="mt-8">
              <Link
                to="/index"
                className="group inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98]"
              >
                Launch Simulators
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-8">
              {[
                { label: 'Uptime', value: '99.9%', color: 'text-[#ccff00]' },
                { label: 'Integrations', value: '12+', color: 'text-[#0080ff]' },
                { label: 'Automations/day', value: '847', color: 'text-[#ccff00]' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex min-h-0 items-center lg:-mr-2">
            <PlatformHeroVisual
              activeModule={activeModule}
              onModuleChange={setActiveModule}
            />
          </div>
        </section>
      </div>

      {/* Overview + slim module cards */}
      <section id="overview" className="relative shrink-0 border-t border-white/[0.06] bg-[#050607]">
        <div className="pointer-events-none absolute inset-0 bg-cross-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 pb-2 pt-10 lg:pb-3 lg:pt-14">
          <div className="mb-5">
            <div className="mb-5 flex items-center gap-3 text-[#0080ff]">
              <Layers size={18} strokeWidth={1.5} />
              <span className="text-[12px] font-semibold uppercase tracking-[0.22em]">
                Overview
              </span>
            </div>

            <h2 className="text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-white lg:text-[2.35rem]">
              Platform <span className="text-[#0080ff]">overview</span>
            </h2>

            <div className="mt-5 max-w-none border-l-2 border-[#0080ff]/25 pl-5">
              <p className="text-[15px] leading-[1.6] text-white/55 lg:whitespace-nowrap lg:text-[15.5px]">
                Overdrive IO is not a single app — it is an operational infrastructure layer.
              </p>
              <p className="mt-1 text-[15px] leading-[1.6] text-white/55 lg:whitespace-nowrap lg:text-[15.5px]">
                We design and build the systems that connect your tools, surface the metrics that matter, and automate the work that slows your team down.
              </p>
            </div>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ccff00]/55">
              Click a module below to preview live metrics →
            </p>
          </div>

          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreModules.map((module) => (
              <PlatformModuleCard
                key={module.title}
                {...module}
                active={activeModule === module.illustration}
                onClick={() => handleModuleClick(module.illustration)}
                slim
              />
            ))}
          </div>
        </div>
      </section>

      {systemsCoreOpen && <SystemsCorePopup onClose={() => setSystemsCoreOpen(false)} />}
      {dashboardEngineOpen && <DashboardEnginePopup onClose={() => setDashboardEngineOpen(false)} />}
      {automationHubOpen && <AutomationHubPopup onClose={() => setAutomationHubOpen(false)} />}
      {integrationLayerOpen && <IntegrationLayerPopup onClose={() => setIntegrationLayerOpen(false)} />}
    </div>
  )
}
