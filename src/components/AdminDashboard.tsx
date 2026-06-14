import {
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Mail,
  Phone,
  Plane,
  Search,
  Shield,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { MiniSparkline } from './InfographicWidgets'
import PlatformBackground from './PlatformBackground'

type AdminRole = 'gm' | 'crm' | 'hr' | 'secretary'

type GmTab = 'overview' | 'approvals' | 'reports'
type CrmTab = 'pipeline' | 'contacts' | 'followups'
type HrTab = 'employees' | 'leave' | 'onboarding'
type SecretaryTab = 'calendar' | 'documents' | 'travel'

const roles: { id: AdminRole; label: string; description: string }[] = [
  { id: 'gm', label: 'General Manager', description: 'Cross-department command view' },
  { id: 'crm', label: 'CRM', description: 'Clients, pipeline & follow-ups' },
  { id: 'hr', label: 'HR', description: 'People, leave & onboarding' },
  { id: 'secretary', label: 'Secretary', description: 'Calendar, docs & travel' },
]

const gmStats = [
  { title: 'Pending approvals', value: '18', trend: '6 urgent', sparkline: [22, 20, 19, 18, 18, 17, 18], accent: 'text-amber-300' },
  { title: 'Open CRM deals', value: '47', trend: '$1.2M pipeline', sparkline: [32, 35, 38, 40, 42, 45, 47], accent: 'text-[#0080ff]' },
  { title: 'Team headcount', value: '86', trend: '4 open roles', sparkline: [78, 80, 81, 83, 84, 85, 86], accent: 'text-[#ccff00]' },
  { title: 'Meetings today', value: '12', trend: '3 need prep', sparkline: [8, 9, 10, 11, 10, 11, 12], accent: 'text-white' },
]

const pendingApprovals = [
  { id: 'APR-1042', title: 'Vendor contract — Q3 renewal', dept: 'Finance', requester: 'M. Chen', amount: '$48,000', urgent: true, age: '2h' },
  { id: 'APR-1040', title: 'PTO request — J. Rivera (5 days)', dept: 'HR', requester: 'J. Rivera', amount: 'Jun 10–14', urgent: false, age: '4h' },
  { id: 'APR-1038', title: 'New CRM seat — Sales team', dept: 'CRM', requester: 'A. Singh', amount: '1 license', urgent: false, age: '1d' },
  { id: 'APR-1035', title: 'Travel booking — Client summit', dept: 'Secretary', requester: 'L. Brooks', amount: '$3,240', urgent: true, age: '1d' },
  { id: 'APR-1032', title: 'Headcount — Operations associate', dept: 'HR', requester: 'Ops Lead', amount: '1 role', urgent: false, age: '2d' },
]

const crmContacts = [
  { id: '1', name: 'Northpoint Logistics', contact: 'Marcus Chen', stage: 'Proposal' as const, value: '$84,000', lastTouch: 'Today', owner: 'Sales' },
  { id: '2', name: 'Summit Manufacturing', contact: 'Sarah Whitfield', stage: 'Qualified' as const, value: '$52,000', lastTouch: 'Yesterday', owner: 'Sales' },
  { id: '3', name: 'Covalent Systems', contact: 'James Okonkwo', stage: 'Negotiation' as const, value: '$128,000', lastTouch: '2d ago', owner: 'CRM' },
  { id: '4', name: 'Brooklyn Auto Sales', contact: 'Adam K.', stage: 'Closed Won' as const, value: '$36,000', lastTouch: '3d ago', owner: 'CRM' },
  { id: '5', name: 'Pacific Wholesale', contact: 'R. Kim', stage: 'Lead' as const, value: '$18,500', lastTouch: '5d ago', owner: 'Sales' },
]

const followUps = [
  { id: '1', account: 'Northpoint Logistics', task: 'Send revised SOW', due: 'Today 2:00 PM', priority: 'High' as const },
  { id: '2', account: 'Summit Manufacturing', task: 'Schedule demo call', due: 'Today 4:30 PM', priority: 'High' as const },
  { id: '3', account: 'Covalent Systems', task: 'Follow up on pricing', due: 'Tomorrow', priority: 'Normal' as const },
  { id: '4', account: 'Pacific Wholesale', task: 'Intro email + deck', due: 'Jun 4', priority: 'Normal' as const },
]

const employees = [
  { id: '1', name: 'M. Chen', role: 'Operations Manager', dept: 'Operations', status: 'Active' as const, tenure: '3.2 yrs' },
  { id: '2', name: 'Sarah Whitfield', role: 'Account Executive', dept: 'Sales', status: 'Active' as const, tenure: '1.8 yrs' },
  { id: '3', name: 'J. Rivera', role: 'Field Technician', dept: 'Field Ops', status: 'On Leave' as const, tenure: '2.1 yrs' },
  { id: '4', name: 'A. Singh', role: 'HR Coordinator', dept: 'HR', status: 'Active' as const, tenure: '4.0 yrs' },
  { id: '5', name: 'L. Brooks', role: 'Executive Assistant', dept: 'Admin', status: 'Active' as const, tenure: '2.6 yrs' },
]

const leaveRequests: {
  id: string
  employee: string
  type: string
  dates: string
  days: number
  status: 'Pending' | 'Approved' | 'Denied'
}[] = [
  { id: '1', employee: 'J. Rivera', type: 'PTO', dates: 'Jun 10 – Jun 14', days: 5, status: 'Pending' as const },
  { id: '2', employee: 'M. Torres', type: 'Sick', dates: 'May 30', days: 1, status: 'Approved' as const },
  { id: '3', employee: 'Jen L.', type: 'PTO', dates: 'Jun 18 – Jun 21', days: 4, status: 'Pending' as const },
]

const onboarding = [
  { id: '1', name: 'Alex Nguyen', role: 'CRM Specialist', start: 'Jun 9', progress: 72, tasks: '4 of 6 complete' },
  { id: '2', name: 'Priya Shah', role: 'HR Analyst', start: 'Jun 16', progress: 28, tasks: '2 of 7 complete' },
]

const meetings = [
  { id: '1', time: '9:00 AM', title: 'Leadership standup', attendees: 'GM, Dept heads', location: 'Conf Room A', type: 'Internal' as const },
  { id: '2', time: '10:30 AM', title: 'Northpoint — contract review', attendees: 'Sales, Legal', location: 'Zoom', type: 'Client' as const },
  { id: '3', time: '1:00 PM', title: 'HR — quarterly review prep', attendees: 'HR, GM', location: 'Conf Room B', type: 'Internal' as const },
  { id: '4', time: '3:30 PM', title: 'Board materials deadline', attendees: 'Secretary, Finance', location: 'Office', type: 'Deadline' as const },
]

const documents = [
  { id: '1', name: 'Q2 Board Packet.pdf', type: 'Report', status: 'In Review' as const, owner: 'Finance', updated: 'Today' },
  { id: '2', name: 'Employee Handbook v4.docx', type: 'Policy', status: 'Pending' as const, owner: 'HR', updated: 'Yesterday' },
  { id: '3', name: 'Client NDA — Covalent.pdf', type: 'Legal', status: 'Approved' as const, owner: 'Legal', updated: 'May 30' },
  { id: '4', name: 'Travel Itinerary — Summit.xlsx', type: 'Travel', status: 'Draft' as const, owner: 'Secretary', updated: 'Today' },
]

const travelItems = [
  { id: '1', traveler: 'GM + Sales lead', trip: 'Client summit — Chicago', dates: 'Jun 12–14', status: 'Pending approval' as const, cost: '$3,240' },
  { id: '2', traveler: 'Field Ops team', trip: 'Site visit — Newark', dates: 'Jun 6', status: 'Confirmed' as const, cost: '$890' },
]

const activityFeed = [
  { id: '1', text: 'CRM: Northpoint moved to Proposal stage', time: '12 min ago', dept: 'CRM' },
  { id: '2', text: 'HR: PTO request submitted by J. Rivera', time: '34 min ago', dept: 'HR' },
  { id: '3', text: 'Secretary: Board packet uploaded for review', time: '1 hr ago', dept: 'Admin' },
  { id: '4', text: 'GM: Vendor contract flagged for approval', time: '2 hr ago', dept: 'Finance' },
  { id: '5', text: 'CRM: 3 follow-ups due today', time: '3 hr ago', dept: 'CRM' },
]

const stageStyles: Record<(typeof crmContacts)[number]['stage'], string> = {
  Lead: 'bg-white/10 text-white/55',
  Qualified: 'bg-[#0080ff]/15 text-[#0080ff]',
  Proposal: 'bg-[#ccff00]/15 text-[#ccff00]',
  Negotiation: 'bg-amber-500/15 text-amber-300',
  'Closed Won': 'bg-emerald-500/15 text-emerald-400',
}

const docStatusStyles: Record<(typeof documents)[number]['status'], string> = {
  Draft: 'border-white/15 bg-white/[0.04] text-white/50',
  Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  'In Review': 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
  Approved: 'border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00]',
}

function StatCard({
  title,
  value,
  trend,
  sparkline,
  accent,
}: {
  title: string
  value: string
  trend: string
  sparkline: number[]
  accent: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/80 p-4 transition hover:border-[#0080ff]/25">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{title}</p>
          <p className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</p>
          <p className="mt-1 text-[11px] text-white/40">{trend}</p>
        </div>
        <MiniSparkline points={sparkline} color="#0080ff" />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [role, setRole] = useState<AdminRole>('gm')
  const [gmTab, setGmTab] = useState<GmTab>('overview')
  const [crmTab, setCrmTab] = useState<CrmTab>('pipeline')
  const [hrTab, setHrTab] = useState<HrTab>('employees')
  const [secretaryTab, setSecretaryTab] = useState<SecretaryTab>('calendar')
  const [search, setSearch] = useState('')
  const [approvals, setApprovals] = useState(pendingApprovals)
  const [leave, setLeave] = useState(leaveRequests)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return crmContacts
    return crmContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.stage.toLowerCase().includes(q),
    )
  }, [search])

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.dept.toLowerCase().includes(q),
    )
  }, [search])

  const approveItem = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id))
    showToast('Request approved')
  }

  const denyItem = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id))
    showToast('Request declined')
  }

  const resolveLeave = (id: string, approved: boolean) => {
    setLeave((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: approved ? 'Approved' : 'Denied' } : r)),
    )
    showToast(approved ? 'Leave approved' : 'Leave denied')
  }

  const activeRole = roles.find((r) => r.id === role)!

  return (
    <div className="relative min-h-full overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
        <PlatformBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050607]/50 to-[#050607]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Page intro */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0080ff]/25 bg-[#0080ff]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0080ff]">
                <Shield size={10} />
                Admin workspace
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ccff00]/20 bg-[#ccff00]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#ccff00]">
                Live
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Operations admin dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              CRM, HR, secretary, and general management tools — approvals, people, clients, and
              calendar in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-white/55 transition hover:border-white/20 hover:text-white"
            >
              <Bell size={14} />
              <span className="hidden sm:inline">Notifications</span>
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                6
              </span>
            </button>
          </div>
        </div>

        {/* Role switcher */}
        <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                role === r.id
                  ? 'border-[#0080ff]/40 bg-[#0080ff]/10 shadow-[0_0_24px_rgba(0,128,255,0.08)]'
                  : 'border-white/[0.08] bg-[#080a0e]/60 hover:border-white/15 hover:bg-[#080a0e]'
              }`}
            >
              <p className={`text-sm font-semibold ${role === r.id ? 'text-white' : 'text-white/70'}`}>
                {r.label}
              </p>
              <p className="mt-0.5 text-[11px] text-white/40">{r.description}</p>
            </button>
          ))}
        </div>

        {/* Shell */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#06080c]/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
          {/* Top bar */}
          <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Building2 size={16} className="text-[#0080ff]" />
              <span className="text-sm font-medium text-white">{activeRole.label}</span>
              <ChevronRight size={14} className="text-white/25" />
              <span className="text-xs text-white/40">Overdrive IO</span>
            </div>
            <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records…"
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/35 outline-none transition focus:border-[#0080ff]/50"
              />
            </div>
          </div>

          {/* GM view */}
          {role === 'gm' && (
            <>
              <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 sm:px-6">
                {(
                  [
                    ['overview', 'Overview'],
                    ['approvals', 'Approvals'],
                    ['reports', 'Reports'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setGmTab(id)}
                    className={`relative shrink-0 px-4 py-3 text-xs font-medium transition ${
                      gmTab === id ? 'text-[#0080ff]' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {label}
                    {gmTab === id && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0080ff]" />}
                  </button>
                ))}
              </div>

              <div className="space-y-5 p-4 sm:p-6">
                {gmTab === 'overview' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {gmStats.map((s) => (
                        <StatCard key={s.title} {...s} />
                      ))}
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-white">Priority approvals</h2>
                          <button
                            type="button"
                            onClick={() => setGmTab('approvals')}
                            className="text-xs text-[#0080ff] hover:text-white"
                          >
                            View all
                          </button>
                        </div>
                        <div className="space-y-2">
                          {approvals.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">{item.title}</p>
                                <p className="mt-0.5 text-[11px] text-white/35">
                                  {item.dept} · {item.requester} · {item.age} ago
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.urgent && (
                                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                    Urgent
                                  </span>
                                )}
                                <span className="text-xs font-semibold text-[#ccff00]">{item.amount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                        <h2 className="mb-4 text-sm font-semibold text-white">Department activity</h2>
                        <div className="space-y-3">
                          {activityFeed.map((item) => (
                            <div key={item.id} className="flex items-start gap-3">
                              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0080ff]" />
                              <div>
                                <p className="text-sm text-white/60">{item.text}</p>
                                <p className="mt-0.5 text-[11px] text-white/30">
                                  {item.dept} · {item.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5">
                      <h2 className="mb-4 text-sm font-semibold text-white">Today&apos;s schedule</h2>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {meetings.slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-[#0080ff]">{m.time}</span>
                              <span className="text-[10px] text-white/35">{m.type}</span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-white">{m.title}</p>
                            <p className="mt-0.5 text-[11px] text-white/40">{m.attendees}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {gmTab === 'approvals' && (
                  <div className="space-y-3">
                    {approvals.length === 0 ? (
                      <div className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-6 py-12 text-center text-sm text-white/45">
                        All caught up — no pending approvals.
                      </div>
                    ) : (
                      approvals.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] text-[#0080ff]">{item.id}</span>
                              {item.urgent && (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-medium text-white">{item.title}</p>
                            <p className="mt-0.5 text-xs text-white/40">
                              {item.dept} · {item.requester} · submitted {item.age} ago
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="mr-2 text-sm font-semibold text-[#ccff00]">{item.amount}</span>
                            <button
                              type="button"
                              onClick={() => denyItem(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-red-500/30 hover:text-red-300"
                            >
                              <XCircle size={14} />
                              Deny
                            </button>
                            <button
                              type="button"
                              onClick={() => approveItem(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#0080ff] px-3 py-1.5 text-xs font-medium text-white hover:bg-white hover:text-black"
                            >
                              <CheckCircle2 size={14} />
                              Approve
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {gmTab === 'reports' && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { title: 'Approval throughput', value: '142/mo', detail: 'Avg 2.4h turnaround' },
                      { title: 'CRM conversion', value: '38%', detail: 'Lead → closed won' },
                      { title: 'HR attrition', value: '4.2%', detail: 'Rolling 12 months' },
                      { title: 'PTO utilization', value: '68%', detail: 'Of allocated balance' },
                      { title: 'Doc turnaround', value: '1.8 days', detail: 'Secretary queue' },
                      { title: 'Meeting load', value: '12/day', detail: 'Avg across leadership' },
                    ].map((r) => (
                      <div
                        key={r.title}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-5 transition hover:border-[#0080ff]/25"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                          {r.title}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">{r.value}</p>
                        <p className="mt-1 text-xs text-[#ccff00]/70">{r.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* CRM view */}
          {role === 'crm' && (
            <>
              <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 sm:px-6">
                {(
                  [
                    ['pipeline', 'Pipeline'],
                    ['contacts', 'Contacts'],
                    ['followups', 'Follow-ups'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCrmTab(id)}
                    className={`relative shrink-0 px-4 py-3 text-xs font-medium transition ${
                      crmTab === id ? 'text-[#0080ff]' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {label}
                    {crmTab === id && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0080ff]" />}
                  </button>
                ))}
              </div>

              <div className="space-y-4 p-4 sm:p-6">
                {(crmTab === 'pipeline' || crmTab === 'contacts') && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Pipeline value', value: '$1.2M' },
                        { label: 'Active deals', value: '47' },
                        { label: 'Follow-ups due', value: String(followUps.length) },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-white/35">{s.label}</p>
                          <p className="mt-1 text-xl font-semibold text-[#0080ff]">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                      <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.6fr] gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35 max-lg:hidden">
                        <span>Account</span>
                        <span>Contact</span>
                        <span>Stage</span>
                        <span>Value</span>
                        <span>Last touch</span>
                      </div>
                      {filteredContacts.map((c) => (
                        <div
                          key={c.id}
                          className="flex flex-col gap-2 border-b border-white/[0.04] px-4 py-3 last:border-0 hover:bg-white/[0.02] lg:grid lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.6fr] lg:items-center lg:gap-2"
                        >
                          <p className="text-sm font-medium text-white">{c.name}</p>
                          <p className="text-xs text-white/45 lg:text-sm">{c.contact}</p>
                          <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${stageStyles[c.stage]}`}>
                            {c.stage}
                          </span>
                          <p className="text-sm font-semibold text-[#ccff00]">{c.value}</p>
                          <p className="text-xs text-white/35">{c.lastTouch}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {crmTab === 'followups' && (
                  <div className="space-y-2">
                    {followUps.map((f) => (
                      <div
                        key={f.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{f.task}</p>
                          <p className="mt-0.5 text-xs text-white/40">{f.account}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-white/45">
                            <Clock size={12} />
                            {f.due}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              f.priority === 'High'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {f.priority}
                          </span>
                          <button
                            type="button"
                            onClick={() => showToast(`Follow-up logged for ${f.account}`)}
                            className="rounded-lg bg-[#0080ff]/15 px-3 py-1.5 text-xs font-medium text-[#0080ff] hover:bg-[#0080ff]/25"
                          >
                            Mark done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* HR view */}
          {role === 'hr' && (
            <>
              <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 sm:px-6">
                {(
                  [
                    ['employees', 'Employees'],
                    ['leave', 'Leave'],
                    ['onboarding', 'Onboarding'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setHrTab(id)}
                    className={`relative shrink-0 px-4 py-3 text-xs font-medium transition ${
                      hrTab === id ? 'text-[#0080ff]' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {label}
                    {hrTab === id && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0080ff]" />}
                  </button>
                ))}
              </div>

              <div className="space-y-4 p-4 sm:p-6">
                {hrTab === 'employees' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Headcount', value: '86' },
                        { label: 'Open roles', value: '4' },
                        { label: 'On leave', value: '3' },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-white/35">{s.label}</p>
                          <p className="mt-1 text-xl font-semibold text-[#ccff00]">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {filteredEmployees.map((e) => (
                        <div
                          key={e.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                              <Users size={16} className="text-[#0080ff]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{e.name}</p>
                              <p className="text-xs text-white/40">
                                {e.role} · {e.dept}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-white/35">{e.tenure}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 font-semibold ${
                                e.status === 'Active'
                                  ? 'bg-[#ccff00]/15 text-[#ccff00]'
                                  : 'bg-amber-500/15 text-amber-300'
                              }`}
                            >
                              {e.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {hrTab === 'leave' && (
                  <div className="space-y-2">
                    {leave.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{r.employee}</p>
                          <p className="mt-0.5 text-xs text-white/40">
                            {r.type} · {r.dates} ({r.days} days)
                          </p>
                        </div>
                        {r.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => resolveLeave(r.id, false)}
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-red-300"
                            >
                              Deny
                            </button>
                            <button
                              type="button"
                              onClick={() => resolveLeave(r.id, true)}
                              className="rounded-lg bg-[#0080ff] px-3 py-1.5 text-xs font-medium text-white hover:bg-white hover:text-black"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className="rounded-full bg-[#ccff00]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#ccff00]">
                            {r.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {hrTab === 'onboarding' && (
                  <div className="space-y-3">
                    {onboarding.map((o) => (
                      <div
                        key={o.id}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ccff00]/25 bg-[#ccff00]/10">
                              <UserPlus size={16} className="text-[#ccff00]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{o.name}</p>
                              <p className="text-xs text-white/40">
                                {o.role} · starts {o.start}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-white/35">{o.tasks}</span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-[#0080ff] transition-all"
                            style={{ width: `${o.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Secretary view */}
          {role === 'secretary' && (
            <>
              <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 sm:px-6">
                {(
                  [
                    ['calendar', 'Calendar'],
                    ['documents', 'Documents'],
                    ['travel', 'Travel'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSecretaryTab(id)}
                    className={`relative shrink-0 px-4 py-3 text-xs font-medium transition ${
                      secretaryTab === id ? 'text-[#0080ff]' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {label}
                    {secretaryTab === id && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0080ff]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4 p-4 sm:p-6">
                {secretaryTab === 'calendar' && (
                  <div className="space-y-2">
                    {meetings.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0080ff]/25 bg-[#0080ff]/10">
                            <Calendar size={16} className="text-[#0080ff]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{m.title}</p>
                            <p className="mt-0.5 text-xs text-white/40">{m.attendees}</p>
                            <p className="mt-1 text-[11px] text-white/35">{m.location}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[#0080ff]">{m.time}</span>
                      </div>
                    ))}
                  </div>
                )}

                {secretaryTab === 'documents' && (
                  <div className="space-y-2">
                    {documents.map((d) => (
                      <div
                        key={d.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-[#0080ff]" />
                          <div>
                            <p className="text-sm font-medium text-white">{d.name}</p>
                            <p className="text-xs text-white/40">
                              {d.type} · {d.owner} · {d.updated}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${docStatusStyles[d.status]}`}>
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {secretaryTab === 'travel' && (
                  <div className="space-y-2">
                    {travelItems.map((t) => (
                      <div
                        key={t.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Plane size={16} className="text-[#ccff00]" />
                          <div>
                            <p className="text-sm font-medium text-white">{t.trip}</p>
                            <p className="text-xs text-white/40">
                              {t.traveler} · {t.dates}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#ccff00]">{t.cost}</p>
                          <p className="text-[11px] text-white/35">{t.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Phone, label: 'Messages', value: '8 unread' },
                    { icon: Mail, label: 'Inbox queue', value: '14 items' },
                    { icon: ClipboardList, label: 'Tasks due', value: '5 today' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#080a0e]/60 px-4 py-3"
                    >
                      <Icon size={16} className="text-[#0080ff]" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/35">{label}</p>
                        <p className="text-sm font-medium text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[#0080ff]/30 bg-[#080a0e] px-4 py-2.5 text-sm text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {toast}
        </div>
      )}
    </div>
  )
}
