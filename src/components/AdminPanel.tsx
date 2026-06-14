/** Master admin dashboard — /admin only (light mode). */
import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  ListChecks,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  formatPlatformActivityTime,
  filterNotificationActivities,
  listPlatformActivities,
  PLATFORM_ACTIVITY_EVENT,
  type PlatformActivity,
} from '../lib/platformActivity'
import { formatMoneyDisplay } from '../lib/formatMoney'
import {
  getClientProjectFinancialTotals,
  listClientProjects,
  type ClientProject,
} from '../lib/clientProjects'
import MasterAdminShell, { MasterPanel } from './owner/MasterAdminShell'

const meetings = [
  { day: 24, title: 'Project Kickoff Call' },
  { day: 27, title: 'Design Review Meeting' },
  { day: 31, title: 'Monthly Progress Update' },
]

const assets = [
  { label: 'Documents', count: 24 },
  { label: 'Design Files', count: 18 },
  { label: 'Images', count: 47 },
  { label: 'Videos', count: 6 },
  { label: 'Exports', count: 12 },
]

const requests = [
  'Website contact form update',
  'Add dark mode feature',
  'Homepage banner revision',
  'API integration request',
]

const budgetGlowClass =
  'font-bold text-emerald-600 [text-shadow:0_0_12px_rgba(16,185,129,0.45)]'

const balanceOwedGlowClass =
  'font-semibold text-red-600 [text-shadow:0_0_10px_rgba(220,38,38,0.4)]'

export default function AdminPanel() {
  const [activities, setActivities] = useState<PlatformActivity[]>(() =>
    filterNotificationActivities(listPlatformActivities()),
  )
  const [clientProjects, setClientProjects] = useState<ClientProject[]>(() =>
    listClientProjects(),
  )

  const financials = useMemo(
    () => getClientProjectFinancialTotals(clientProjects),
    [clientProjects],
  )

  const activeProjects = clientProjects.filter((p) => p.status === 'In Progress').length
  const avgProgress =
    clientProjects.length > 0
      ? Math.round(
          clientProjects.reduce((sum, p) => {
            const value = Number.parseInt(p.progress.replace(/\D/g, ''), 10)
            return sum + (Number.isFinite(value) ? value : 0)
          }, 0) / clientProjects.length,
        )
      : 0

  const kpis: { label: string; value: string; icon: LucideIcon }[] = [
    { label: 'Active Projects', value: String(activeProjects), icon: Briefcase },
    { label: 'Open Tasks', value: '12', icon: ListChecks },
    { label: 'Pending Approvals', value: '4', icon: Clock },
    {
      label: 'Outstanding Invoices',
      value: formatMoneyDisplay(financials.totalBalance),
      icon: DollarSign,
    },
    { label: 'Upcoming Meetings', value: '2', icon: Calendar },
    { label: 'Project Completion', value: `${avgProgress}%`, icon: BarChart3 },
  ]

  useEffect(() => {
    const refresh = () => {
      setActivities(filterNotificationActivities(listPlatformActivities()))
      setClientProjects(listClientProjects())
    }
    refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener(PLATFORM_ACTIVITY_EVENT, refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener(PLATFORM_ACTIVITY_EVENT, refresh)
    }
  }, [])

  return (
    <MasterAdminShell
      title="Welcome back, Master Admin 👋"
      subtitle="Your exclusive operations command center."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">{label}</p>
                <p className="text-2xl font-semibold text-slate-900">{value}</p>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
            >
              View details <ChevronRight size={15} />
            </button>
          </div>
        ))}
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <MasterPanel title="Project Progress Overview" className="xl:col-span-5">
          <div className="space-y-5">
            {clientProjects.length === 0 ? (
              <p className="text-sm text-slate-500">No projects yet.</p>
            ) : (
              clientProjects.map(({ id, name, type, progress, budget, status }) => (
                <div
                  key={id}
                  className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_90px_90px]"
                >
                  <div>
                    <p className="font-medium text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{type}</p>
                  </div>
                  <div>
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      {status}
                    </span>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: progress }} />
                    </div>
                  </div>
                  <p className={`text-sm md:text-right ${budget !== undefined ? budgetGlowClass : 'font-semibold text-slate-400'}`}>
                    {budget !== undefined ? formatMoneyDisplay(budget) : '—'}
                  </p>
                </div>
              ))
            )}
          </div>
        </MasterPanel>

        <MasterPanel title="Recent Activity" className="xl:col-span-3">
          {activities.length === 0 ? (
            <p className="py-3 text-sm text-slate-500">
              No activity yet. Platform actions will appear here.
            </p>
          ) : (
            activities.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 border-b border-slate-100 py-3 last:border-0"
              >
                <CheckCircle size={18} className="shrink-0 text-green-600" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">{item.message}</p>
                  <p className="text-xs text-slate-400">
                    {formatPlatformActivityTime(item.createdAt)}
                    {item.actorName ? ` · ${item.actorName}` : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </MasterPanel>

        <MasterPanel title="Upcoming Meetings" className="xl:col-span-4">
          {meetings.map(({ day, title }) => (
            <div
              key={day}
              className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 last:mb-0"
            >
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">MAY</p>
                  <p className="text-3xl text-slate-900">{day}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="text-sm text-slate-500">10:00 AM - 11:00 AM</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Join
              </button>
            </div>
          ))}
        </MasterPanel>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
        <MasterPanel title="Assets" className="xl:col-span-2">
          {assets.map(({ label, count }) => (
            <p key={label} className="flex justify-between py-2 text-sm text-slate-600">
              <span>{label}</span>
              <span className="text-slate-900">{count}</span>
            </p>
          ))}
        </MasterPanel>

        <MasterPanel title="Invoices & Payments" className="xl:col-span-3">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className={`text-3xl ${budgetGlowClass}`}>
            {formatMoneyDisplay(financials.totalBudget)}
          </p>
          <p className="mt-4 text-sm text-slate-500">Balance Due</p>
          <p
            className={`text-xl ${
              financials.totalBalance > 0 ? balanceOwedGlowClass : 'font-semibold text-slate-400'
            }`}
          >
            {formatMoneyDisplay(financials.totalBalance)}
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Pay Now
          </button>
        </MasterPanel>

        <MasterPanel title="Requests & Revisions" className="xl:col-span-3">
          {requests.map((item) => (
            <p key={item} className="border-b border-slate-100 py-3 text-sm text-slate-700 last:border-0">
              {item}
            </p>
          ))}
        </MasterPanel>

        <MasterPanel title="Reports & Analytics" className="xl:col-span-4">
          <p className="text-sm text-slate-500">Website Traffic This Month</p>
          <p className="text-3xl font-semibold text-slate-900">
            23,456 <span className="text-sm text-green-600">+12.5%</span>
          </p>
          <div className="mt-6 h-28 rounded-xl bg-gradient-to-t from-blue-100 to-transparent" />
        </MasterPanel>
      </section>

      <section className="mt-5 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xl font-bold text-white">
          AI
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900">Need something done?</h3>
          <p className="text-sm text-slate-500">
            Our AI assistant can help you find information, track progress, and more.
          </p>
        </div>
        <div className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:max-w-[520px]">
          <input
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Ask anything about your projects..."
          />
          <Send size={20} className="shrink-0 text-blue-600" />
        </div>
      </section>
    </MasterAdminShell>
  )
}
