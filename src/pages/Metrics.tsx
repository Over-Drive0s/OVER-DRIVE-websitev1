import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Circle,
  Sparkles,
  Target,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import EnterpriseFleetMetricsView from '../components/EnterpriseFleetMetricsView'
import MetricsPanelView from '../components/MetricsPanelView'
import RetailStoreMetricsView from '../components/RetailStoreMetricsView'
import {
  accentStyles,
  enterpriseTabs,
  mainTabs,
  metricsAccounts,
  retailTabs,
  type AccountId,
  type EnterpriseTab,
  type MainTab,
  type RetailTab,
} from '../data/metricsAccounts'
import PlatformBackground from '../components/PlatformBackground'

export default function Metrics() {
  const location = useLocation()
  const fromSolutionsOps = Boolean(
    (location.state as { fromSolutionsOps?: boolean } | null)?.fromSolutionsOps,
  )
  const [selectedAccount, setSelectedAccount] = useState<AccountId>('main')
  const [mainTab, setMainTab] = useState<MainTab>('overview')
  const [enterpriseTab, setEnterpriseTab] = useState<EnterpriseTab>('live')
  const [retailTab, setRetailTab] = useState<RetailTab>('pulse')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const account = metricsAccounts.find((a) => a.id === selectedAccount)!
  const accent = accentStyles[account.accent]

  const currentTabs =
    selectedAccount === 'main'
      ? mainTabs
      : selectedAccount === 'enterprise'
        ? enterpriseTabs
        : retailTabs

  const activeTabId =
    selectedAccount === 'main' ? mainTab : selectedAccount === 'enterprise' ? enterpriseTab : retailTab

  const handleAccountChange = (id: AccountId) => {
    setSelectedAccount(id)
    setAccountMenuOpen(false)
  }

  const handleTabChange = (id: string) => {
    if (selectedAccount === 'main') setMainTab(id as MainTab)
    else if (selectedAccount === 'enterprise') setEnterpriseTab(id as EnterpriseTab)
    else setRetailTab(id as RetailTab)
  }

  useEffect(() => {
    setAccountMenuOpen(false)
  }, [selectedAccount])

  return (
    <div
      data-scroll-root
      className="relative flex min-h-full flex-col overflow-x-hidden bg-[#050607]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
        <PlatformBackground />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6">
          <Link
            to={fromSolutionsOps ? '/solutions' : '/index'}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            {fromSolutionsOps ? 'Back to solutions' : 'Back to simulators'}
          </Link>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${accent.label}`}>
              Tracking Metrics
            </p>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${accent.badge}`}>
              <Sparkles size={10} />
              Live simulator
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Performance metrics preview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">{account.description}</p>
        </div>

        <div className="glow-brand overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080a0e]/95 shadow-2xl backdrop-blur-sm">
          <div className="border-b border-white/[0.06] bg-[#050607]/60 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-1">
                {currentTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      activeTabId === tab.id
                        ? accent.tabActive
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((open) => !open)}
                    className={`flex max-w-[240px] items-center gap-2 truncate rounded-md border border-white/[0.08] px-3 py-2 text-xs text-white/60 transition-colors ${accent.menuHover} hover:text-white/80 sm:max-w-none`}
                  >
                    <Target size={13} className={`shrink-0 ${accent.icon}`} />
                    <span className="truncate">{account.label}</span>
                    <ChevronDown size={13} className={`shrink-0 ${accountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 z-20 mt-1 min-w-[240px] overflow-hidden rounded-lg border border-white/10 bg-[#0a0c10] py-1 shadow-xl">
                      {metricsAccounts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAccountChange(item.id)}
                          className={`block w-full px-3 py-2.5 text-left text-xs transition ${
                            selectedAccount === item.id
                              ? accentStyles[item.accent].menuActive
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="mt-0.5 block text-[10px] text-white/35">
                            {item.id === 'main' && 'Campaigns & audiences'}
                            {item.id === 'enterprise' && 'Fleet, routes & alerts'}
                            {item.id === 'retail' && 'Stores, products & staff'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-xs text-white/60 transition-colors ${accent.menuHover} hover:text-white/80`}
                >
                  <Calendar size={13} />
                  Last 30 days
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {selectedAccount === 'main' && <MetricsPanelView activeTab={mainTab} />}
            {selectedAccount === 'enterprise' && <EnterpriseFleetMetricsView activeTab={enterpriseTab} />}
            {selectedAccount === 'retail' && <RetailStoreMetricsView activeTab={retailTab} />}
          </div>

          <div className="border-t border-white/[0.06] bg-[#050607]/40 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/35">
              <span className="flex items-center gap-2">
                <Circle size={8} className={accent.dot} />
                {account.footerNote}
              </span>
              <span>
                Account: <span className="text-white/55">{account.label}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
