import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Radio,
  Truck,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'

interface DispatchFieldOpsPopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'metrics' | 'workflow' | 'dispatch'

const tabs: { id: TabId; label: string; icon: typeof Truck }[] = [
  { id: 'overview', label: 'Overview', icon: Truck },
  { id: 'metrics', label: 'Metrics', icon: Activity },
  { id: 'workflow', label: 'Workflow', icon: CheckCircle2 },
  { id: 'dispatch', label: 'Dispatch', icon: Radio },
]

const headlineStats = [
  { label: 'Avg. Response', value: '18m', accent: 'text-[#ccff00]' },
  { label: 'Jobs Today', value: '47', accent: 'text-[#0080ff]' },
  { label: 'Utilization', value: '84%', accent: 'text-white' },
  { label: 'First-Time Fix', value: '92%', accent: 'text-[#ccff00]' },
]

const features = [
  {
    title: 'Live Dispatch Board',
    text: 'Assign, reschedule, and monitor field jobs from one operational command view.',
    icon: Radio,
  },
  {
    title: 'Technician Tracking',
    text: 'Track technician status, location, availability, and current job progress in real time.',
    icon: MapPin,
  },
  {
    title: 'Job Completion Workflows',
    text: 'Capture checklists, photos, notes, signatures, and closeout details before a job is marked complete.',
    icon: CheckCircle2,
  },
  {
    title: 'Customer Updates',
    text: 'Send appointment confirmations, arrival windows, job updates, and completion notifications.',
    icon: Users,
  },
]

const metrics = [
  { label: 'Average response time', value: '18 min', trend: '↓ 4 min improved' },
  { label: 'Jobs completed today', value: '47', trend: '↑ 9 vs yesterday' },
  { label: 'Technician utilization', value: '84%', trend: '12 techs active' },
  { label: 'Open / delayed jobs', value: '6', trend: '2 overdue' },
  { label: 'Customer satisfaction', value: '4.8/5', trend: '↑ 0.2 this month' },
  { label: 'First-time fix rate', value: '92%', trend: 'Industry leading' },
]

const workflow = [
  'New service request is created',
  'Dispatcher assigns technician',
  'Technician receives mobile job card',
  'Field work is completed with proof',
  'Customer receives update or invoice',
  'Operations dashboard updates automatically',
]

const activeJobs = [
  { id: 'JOB-2841', customer: 'Westside HVAC', tech: 'M. Torres', status: 'En Route' as const, eta: '12 min' },
  { id: 'JOB-2840', customer: 'Parkview Plumbing', tech: 'J. Allen', status: 'On Site' as const, eta: 'In progress' },
  { id: 'JOB-2839', customer: 'Lakeside Electric', tech: 'S. Kim', status: 'Assigned' as const, eta: '2:30 PM' },
  { id: 'JOB-2838', customer: 'Metro Install Co.', tech: 'D. Wright', status: 'Completed' as const, eta: 'Done' },
]

const technicians = [
  { name: 'M. Torres', status: 'En Route', jobs: 3, utilization: 88 },
  { name: 'J. Allen', status: 'On Site', jobs: 2, utilization: 92 },
  { name: 'S. Kim', status: 'Available', jobs: 1, utilization: 65 },
  { name: 'D. Wright', status: 'Available', jobs: 4, utilization: 78 },
]

function JobStatusBadge({ status }: { status: (typeof activeJobs)[number]['status'] }) {
  const styles = {
    'En Route': 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    'On Site': 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    Assigned: 'border-white/20 bg-white/[0.06] text-white/60',
    Completed: 'border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00]',
  }

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  )
}

export default function DispatchFieldOpsPopup({ onClose }: DispatchFieldOpsPopupProps) {
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
      aria-labelledby="dispatch-field-ops-title"
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
                    Dispatch & Field Ops
                  </span>
                  <span className="text-[11px] text-white/35">47 jobs today · 12 technicians active</span>
                </div>

                <h1 id="dispatch-field-ops-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Field Service <span className="text-[#0080ff]">Command Center</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Built for field service companies that need faster dispatching, better technician
                  visibility, cleaner job completion, and stronger customer communication.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Dispatch & Field Ops"
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
                  <h2 className="text-sm font-semibold text-white">Open Command Center</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Manage dispatch boards, track technicians, and monitor field job progress from one
                    operational dashboard.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <a
                      href="https://build-source.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Open Dispatch Board
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
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
                    HVAC, plumbing, electrical, mobile repair, logistics support, installation teams,
                    inspection teams, and any company managing technicians in the field.
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
                <h2 className="text-base font-semibold text-white">Operational Metrics</h2>
                <p className="mt-1 text-xs text-white/40">Live field service performance indicators</p>
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
                <h2 className="text-base font-semibold text-white">Field Job Workflow</h2>
                <p className="mt-1 text-xs text-white/40">End-to-end flow from request to completion</p>
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

          {activeTab === 'dispatch' && (
            <div className="space-y-5 p-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-base font-semibold text-white">Live Dispatch Board</h2>
                  <p className="mt-1 mb-4 text-xs text-white/40">Active field jobs right now</p>
                  <div className="space-y-3">
                    {activeJobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{job.customer}</p>
                            <p className="mt-0.5 text-xs text-white/35">
                              {job.id} · {job.tech}
                            </p>
                          </div>
                          <JobStatusBadge status={job.status} />
                        </div>
                        <p className="mt-2 text-xs text-white/40">ETA: {job.eta}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">Technician Status</h2>
                  <p className="mt-1 mb-4 text-xs text-white/40">12 technicians · 4 shown</p>
                  <div className="space-y-3">
                    {technicians.map((tech) => (
                      <div
                        key={tech.name}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                              <Wrench size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{tech.name}</p>
                              <p className="text-xs text-white/35">{tech.status} · {tech.jobs} jobs</p>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${tech.utilization > 85 ? 'text-amber-300' : 'text-[#ccff00]'}`}>
                            {tech.utilization}%
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={`h-full rounded-full ${tech.utilization > 85 ? 'bg-amber-400' : 'bg-[#0080ff]'}`}
                            style={{ width: `${tech.utilization}%` }}
                          />
                        </div>
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
