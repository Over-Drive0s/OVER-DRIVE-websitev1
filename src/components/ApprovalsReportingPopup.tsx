import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  RefreshCw,
  Shield,
  X,
} from 'lucide-react'
import { useScrollToTopOnMount } from '../hooks/useScrollToTopOnMount'

interface ApprovalsReportingPopupProps {
  onClose: () => void
}

type TabId = 'overview' | 'metrics' | 'workflow' | 'approvals'

const tabs: { id: TabId; label: string; icon: typeof ClipboardCheck }[] = [
  { id: 'overview', label: 'Overview', icon: ClipboardCheck },
  { id: 'metrics', label: 'Metrics', icon: Activity },
  { id: 'workflow', label: 'Workflow', icon: RefreshCw },
  { id: 'approvals', label: 'Approvals', icon: Shield },
]

const headlineStats = [
  { label: 'Pending', value: '18', accent: 'text-amber-300' },
  { label: 'Completed', value: '142', accent: 'text-[#ccff00]' },
  { label: 'Avg. Time', value: '2.4h', accent: 'text-[#0080ff]' },
  { label: 'Overdue', value: '3', accent: 'text-white' },
]

const features = [
  {
    title: 'Custom Admin Panels',
    text: 'Centralize internal requests, users, documents, permissions, status updates, and operational records in one clean admin workspace.',
    icon: LayoutDashboard,
  },
  {
    title: 'Approval Workflows',
    text: 'Route requests through custom approval stages with assigned reviewers, status tracking, due dates, comments, and decision history.',
    icon: ClipboardCheck,
  },
  {
    title: 'Document Management',
    text: 'Upload, review, approve, organize, and store internal files, forms, contracts, reports, attachments, and business records.',
    icon: FileText,
  },
  {
    title: 'Reporting Tools',
    text: 'Generate visibility reports for pending approvals, completed requests, overdue items, user activity, and operational performance.',
    icon: BarChart3,
  },
]

const metrics = [
  { label: 'Pending approvals', value: '18', trend: '6 urgent' },
  { label: 'Completed requests', value: '142', trend: '↑ 12 this week' },
  { label: 'Average approval time', value: '2.4 hrs', trend: '↓ 18% improved' },
  { label: 'Overdue items', value: '3', trend: 'Needs attention' },
  { label: 'Documents reviewed', value: '89', trend: 'This month' },
  { label: 'Reports generated', value: '24', trend: 'Scheduled + on-demand' },
]

const workflow = [
  'Internal request is submitted',
  'Admin panel logs the request',
  'Reviewer or manager is assigned',
  'Approval decision is recorded',
  'Documents are updated or stored',
  'Reporting dashboard updates automatically',
]

const pendingApprovals = [
  { id: 'REQ-2841', title: 'Vendor Contract — Q3 Renewal', requester: 'Finance Team', stage: 'Manager Review' as const, age: '2h ago' },
  { id: 'REQ-2839', title: 'Expense Report — Field Ops', requester: 'J. Martinez', stage: 'Finance Review' as const, age: '5h ago' },
  { id: 'REQ-2835', title: 'New User Access — CRM', requester: 'HR Admin', stage: 'IT Approval' as const, age: '1d ago' },
  { id: 'REQ-2832', title: 'Policy Update — Safety Manual', requester: 'Compliance', stage: 'Final Sign-off' as const, age: '2d ago' },
]

const recentDocuments = [
  { name: 'Q2 Budget Summary.pdf', type: 'Report', status: 'Approved' as const, updated: 'Today' },
  { name: 'Vendor Agreement — Acme Co.docx', type: 'Contract', status: 'In Review' as const, updated: 'Yesterday' },
  { name: 'Employee Onboarding Form.pdf', type: 'Form', status: 'Pending' as const, updated: 'May 26' },
]

function StageBadge({ stage }: { stage: (typeof pendingApprovals)[number]['stage'] }) {
  const styles = {
    'Manager Review': 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    'Finance Review': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    'IT Approval': 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    'Final Sign-off': 'border-white/20 bg-white/[0.06] text-white/70',
  }

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[stage]}`}>
      {stage}
    </span>
  )
}

function DocStatusBadge({ status }: { status: (typeof recentDocuments)[number]['status'] }) {
  const styles = {
    Approved: 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    'In Review': 'border-[#0080ff]/30 bg-[#0080ff]/10 text-[#0080ff]',
    Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  }

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  )
}

export default function ApprovalsReportingPopup({ onClose }: ApprovalsReportingPopupProps) {
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
      aria-labelledby="approvals-reporting-title"
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
                    Approvals & Reporting
                  </span>
                  <span className="text-[11px] text-white/35">18 pending · 3 overdue</span>
                </div>

                <h1 id="approvals-reporting-title" className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
                  Internal Admin <span className="text-[#0080ff]">Control Center</span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Built for internal admin teams that need structured approval workflows,
                  document control, reporting visibility, and a cleaner way to manage
                  business processes across departments.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Approvals & Reporting"
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
                  <h2 className="text-sm font-semibold text-white">Open Admin Panel</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Manage approval queues, review documents, and generate operational
                    reports from one centralized control center.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to="/admindash"
                      onClick={onClose}
                      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Open Admin View
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
                    HR teams, finance departments, operations managers, compliance teams,
                    back-office admins, document-heavy businesses, and teams that rely on
                    controlled approval processes.
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
                <h2 className="text-base font-semibold text-white">Admin Metrics</h2>
                <p className="mt-1 text-xs text-white/40">Approval and reporting performance indicators</p>
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
                <h2 className="text-base font-semibold text-white">Approval Workflow</h2>
                <p className="mt-1 text-xs text-white/40">From internal request to reporting dashboard update</p>
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

          {activeTab === 'approvals' && (
            <div className="space-y-5 p-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-base font-semibold text-white">Pending Approvals</h2>
                  <p className="mt-1 mb-4 text-xs text-white/40">Requests awaiting reviewer action</p>
                  <div className="space-y-3">
                    {pendingApprovals.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4 transition hover:border-[#0080ff]/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{item.title}</p>
                            <p className="mt-0.5 text-xs text-white/35">
                              {item.id} · {item.requester}
                            </p>
                          </div>
                          <StageBadge stage={item.stage} />
                        </div>
                        <p className="mt-2 text-xs text-white/40">Submitted {item.age}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">Recent Documents</h2>
                  <p className="mt-1 mb-4 text-xs text-white/40">Files in review or recently approved</p>
                  <div className="space-y-3">
                    {recentDocuments.map((doc) => (
                      <div
                        key={doc.name}
                        className="rounded-xl border border-white/[0.08] bg-[#080a0e]/60 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                              <FileText size={16} className="text-[#0080ff]" strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{doc.name}</p>
                              <p className="text-xs text-white/35">{doc.type} · Updated {doc.updated}</p>
                            </div>
                          </div>
                          <DocStatusBadge status={doc.status} />
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                          <CheckCircle2 size={11} className="text-[#0080ff]" />
                          Stored in document library
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
