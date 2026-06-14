import { formatMoneyDisplay } from '../../lib/formatMoney'
import {
  getProjectSupportCommissionSummary,
  type ClientProject,
  type ProjectSupportCommissionSummary,
  type SupportCommissionTerms,
} from '../../lib/clientProjects'

const earnedGlowClass =
  'font-semibold text-[#39ff14] [text-shadow:0_0_8px_rgba(57,255,20,0.65),0_0_16px_rgba(57,255,20,0.3)]'

const pendingGlowClass =
  'font-semibold text-amber-300 [text-shadow:0_0_8px_rgba(251,191,36,0.55),0_0_16px_rgba(251,191,36,0.25)]'

export function formatSupportCommissionTermsLabel(terms: SupportCommissionTerms): string {
  if (terms.type === 'custom') {
    return `${formatMoneyDisplay(terms.amount)} custom`
  }

  return `${Math.round(terms.rate * 100)}%`
}

export function ProjectCommissionTermsBadge({
  summary,
  className = '',
}: {
  summary: ProjectSupportCommissionSummary
  className?: string
}) {
  return (
    <span
      className={`inline-flex rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-200 ${className}`}
    >
      {formatSupportCommissionTermsLabel(summary.terms)}
    </span>
  )
}

export function ProjectCommissionInline({
  project,
  className = '',
}: {
  project: ClientProject
  className?: string
}) {
  const summary = getProjectSupportCommissionSummary(project)

  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] ${className}`}>
      <ProjectCommissionTermsBadge summary={summary} />
      <span className={summary.earned > 0 ? earnedGlowClass : 'text-slate-400'}>
        Earned {formatMoneyDisplay(summary.earned)}
      </span>
      {summary.pending > 0 && (
        <span className={pendingGlowClass}>
          Pending {formatMoneyDisplay(summary.pending)}
        </span>
      )}
    </div>
  )
}

export function ProjectCommissionPanel({
  project,
  className = '',
}: {
  project: ClientProject
  className?: string
}) {
  const summary = getProjectSupportCommissionSummary(project)

  return (
    <div
      className={`rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-white/[0.02] p-4 ${className}`}
    >
      <h4 className="text-[10px] font-medium uppercase tracking-wider text-violet-300/90">
        Support commission
      </h4>
      <p className="mt-1 text-xs text-slate-400">
        Commission terms and earnings for this job.
      </p>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-500">Terms</dt>
          <dd className="font-semibold text-violet-300">
            {formatSupportCommissionTermsLabel(summary.terms)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-500">Earned</dt>
          <dd className={summary.earned > 0 ? earnedGlowClass : 'text-slate-400'}>
            {formatMoneyDisplay(summary.earned)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-500">Pending</dt>
          <dd className={summary.pending > 0 ? pendingGlowClass : 'text-slate-400'}>
            {formatMoneyDisplay(summary.pending)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <dt className="text-slate-500">Total potential</dt>
          <dd className="font-semibold text-slate-200">
            {formatMoneyDisplay(summary.potential)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
