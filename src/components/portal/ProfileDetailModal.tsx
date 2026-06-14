import { FolderKanban, Pencil, X } from 'lucide-react'
import { formatMoneyDisplay } from '../../lib/formatMoney'
import { adminRoleBadgeStyles, roleUsesPreferredPayment } from '../../lib/adminRoles'
import type { AdminUser } from '../../lib/adminUsers'
import {
  getProjectAmountOwed,
  getProjectProgressLabel,
  getProjectSupportCommissionSummary,
  getSupportProfileCommissionTotalsFromProjects,
  type ClientProject,
  type ProfileProjectFinancialTotals,
  type ProfileProjectWorkloadSummary,
} from '../../lib/clientProjects'
import { formatPreferredPaymentDisplay } from '../../lib/preferredPayment'
import { isDataUrlImage } from '../../lib/storedFileData'
import { ProfileWorkloadHeatmapBar } from './ProfileWorkloadHeatmapBar'
import ProfileRevenueDonut from './ProfileRevenueDonut'
import {
  formatSupportCommissionTermsLabel,
} from './ProjectCommissionInfo'

const budgetGlowClass =
  'font-semibold text-[#39ff14] [text-shadow:0_0_10px_rgba(57,255,20,0.75),0_0_22px_rgba(57,255,20,0.35)]'

const balanceOwedGlowClass =
  'font-semibold text-red-400 [text-shadow:0_0_10px_rgba(248,113,113,0.75),0_0_22px_rgba(248,113,113,0.35)]'

const balancePaidGlowClass =
  'font-semibold text-emerald-400 [text-shadow:0_0_10px_rgba(52,211,153,0.55),0_0_20px_rgba(52,211,153,0.25)]'

const projectStatusStyles: Record<string, string> = {
  'In Progress': 'bg-blue-500/20 text-blue-300',
  Planning: 'bg-amber-500/20 text-amber-300',
  Review: 'bg-purple-500/20 text-purple-300',
  Complete: 'bg-emerald-500/20 text-emerald-300',
}

function getProfileInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function ProfileDetailModal({
  admin,
  headerGradient,
  avatarRingClass,
  passwordRevealed,
  onTogglePassword,
  projectFinancials,
  projectWorkload,
  ownerProjects,
  platformTotalBudget,
  formatCreated,
  onClose,
  onEdit,
}: {
  admin: AdminUser
  headerGradient: string
  avatarRingClass: string
  passwordRevealed: boolean
  onTogglePassword: () => void
  projectFinancials?: ProfileProjectFinancialTotals
  projectWorkload?: ProfileProjectWorkloadSummary
  ownerProjects: ClientProject[]
  platformTotalBudget: number
  formatCreated: (createdAt: string) => string
  onClose: () => void
  onEdit: () => void
}) {
  const { name, email, phone, role, password, createdAt, profileImageUrl } = admin

  const totalBudget = projectFinancials?.totalBudget ?? 0
  const balanceDue = projectFinancials?.balanceDue ?? 0
  const runningBalance = projectFinancials?.runningBalance ?? 0
  const amountPaid = Math.max(0, totalBudget - balanceDue)
  const isSupportProfile = role === 'Support'
  const commission = isSupportProfile
    ? getSupportProfileCommissionTotalsFromProjects(ownerProjects)
    : null
  const donutTotal = commission?.potential ?? totalBudget
  const donutPrimary = commission?.earned ?? amountPaid
  const donutPending = commission?.pending ?? balanceDue
  const primaryLabel = isSupportProfile ? 'Commission' : 'Collected'
  const pendingLabel = isSupportProfile ? 'Pending commission' : 'Outstanding'
  const platformShare =
    platformTotalBudget > 0 && totalBudget > 0
      ? Math.round((totalBudget / platformTotalBudget) * 100)
      : 0

  const totalProjects = ownerProjects.length
  const completedProjects = ownerProjects.filter((project) => project.status === 'Complete').length
  const activeProjects = totalProjects - completedProjects

  const sortedProjects = [...ownerProjects].sort((a, b) => {
    if (a.status === 'Complete' && b.status !== 'Complete') return 1
    if (a.status !== 'Complete' && b.status === 'Complete') return -1
    return a.name.localeCompare(b.name)
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(92vh,44rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative flex shrink-0 items-center gap-4 overflow-hidden bg-gradient-to-br px-5 py-4 sm:px-6 ${headerGradient}`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%221%22 cy=%221%22 r=%221%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60" />

          <div
            className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-base font-bold ring-1 ${avatarRingClass}`}
          >
            {profileImageUrl && isDataUrlImage(profileImageUrl) ? (
              <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              getProfileInitials(name)
            )}
          </div>

          <div className="relative z-10 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${adminRoleBadgeStyles[role]}`}
              >
                {role}
              </span>
            </div>
            <h3 className="mt-1 truncate text-xl font-semibold text-white">{name}</h3>
            <p className="truncate text-sm text-slate-300/90">{email}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-5 sm:flex-row sm:gap-6 sm:p-6">
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto pr-0.5 sm:pr-1">
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Profile information
              </h4>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm text-white">{phone ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Onboarded
                  </dt>
                  <dd className="mt-1 text-sm text-white">{formatCreated(createdAt)}</dd>
                </div>
                {roleUsesPreferredPayment(role) && (
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Preferred payment
                    </dt>
                    <dd className="mt-1 text-sm text-white">
                      {formatPreferredPaymentDisplay(admin.preferredPayment)}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Password
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm text-white">
                    <span className="truncate font-mono">
                      {passwordRevealed ? password : '•'.repeat(password.length)}
                    </span>
                    <button
                      type="button"
                      onClick={onTogglePassword}
                      className="shrink-0 text-xs font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      {passwordRevealed ? 'Hide' : 'Show'}
                    </button>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Workload
              </h4>
              <div className="mt-3">
                <ProfileWorkloadHeatmapBar workload={projectWorkload} />
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <dt className="text-[10px] text-slate-500">Active</dt>
                  <dd className="mt-0.5 text-lg font-bold text-white">
                    {projectWorkload?.activeProjects ?? activeProjects}
                  </dd>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <dt className="text-[10px] text-slate-500">Completed</dt>
                  <dd className="mt-0.5 text-lg font-bold text-emerald-300">{completedProjects}</dd>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <dt className="text-[10px] text-slate-500">Avg progress</dt>
                  <dd className="mt-0.5 text-lg font-bold text-blue-300">
                    {projectWorkload?.avgProgress ?? 0}%
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Projects
                </h4>
                <span className="text-[10px] text-slate-500">{totalProjects} total</span>
              </div>
              {sortedProjects.length === 0 ? (
                <p className="text-sm text-slate-500">No projects assigned to this profile yet.</p>
              ) : (
                <ul className="space-y-2">
                  {sortedProjects.map((project) => {
                    const jobCommission = isSupportProfile
                      ? getProjectSupportCommissionSummary(project)
                      : null

                    return (
                    <li
                      key={project.id}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                      <FolderKanban size={14} className="shrink-0 text-slate-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{project.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {getProjectProgressLabel(project)}
                          {project.budget !== undefined && project.budget > 0
                            ? ` · ${formatMoneyDisplay(project.budget)}`
                            : ''}
                        </p>
                        {jobCommission && (
                          <p className="mt-1 text-[11px] text-slate-400">
                            <span className="font-medium text-violet-300">
                              {formatSupportCommissionTermsLabel(jobCommission.terms)}
                            </span>
                            {' · '}
                            <span className="text-[#39ff14]">
                              Earned {formatMoneyDisplay(jobCommission.earned)}
                            </span>
                            {jobCommission.pending > 0 && (
                              <>
                                {' · '}
                                <span className="text-amber-300">
                                  Pending {formatMoneyDisplay(jobCommission.pending)}
                                </span>
                              </>
                            )}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${projectStatusStyles[project.status] ?? 'bg-white/10 text-slate-300'}`}
                      >
                        {project.status}
                      </span>
                      {getProjectAmountOwed(project) > 0 && (
                        <span className="shrink-0 text-[10px] font-medium text-red-300">
                          {formatMoneyDisplay(getProjectAmountOwed(project))} due
                        </span>
                      )}
                      </div>
                    </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-4 sm:w-80">
            <section className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-white/[0.02] p-4">
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-violet-300/90">
                {isSupportProfile ? 'Platform commission' : 'Platform revenue'}
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                {isSupportProfile
                  ? 'Commission earned from projects submitted by this support profile.'
                  : `Money this ${role.toLowerCase()} profile has brought into the platform.`}
              </p>

              <div className="mt-4 flex flex-col items-center gap-4">
                <ProfileRevenueDonut
                  totalBudget={donutTotal}
                  amountPaid={donutPrimary}
                  centerLabel={primaryLabel}
                  metricLabel={isSupportProfile ? 'commission' : 'revenue'}
                />

                <div className="flex w-full flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#39ff14]/20 bg-[#39ff14]/10 px-2 py-0.5 text-[10px] font-medium text-[#39ff14]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14]" />
                    {primaryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[10px] font-medium text-red-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    {pendingLabel}
                  </span>
                </div>
              </div>

              <dl className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Revenue</dt>
                  <dd className={totalBudget > 0 ? budgetGlowClass : 'text-slate-400'}>
                    {totalBudget > 0 ? formatMoneyDisplay(totalBudget) : '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">{primaryLabel}</dt>
                  <dd className={(commission?.earned ?? amountPaid) > 0 ? balancePaidGlowClass : 'text-slate-400'}>
                    {totalBudget > 0
                      ? formatMoneyDisplay(commission?.earned ?? amountPaid)
                      : '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">{pendingLabel}</dt>
                  <dd className={donutPending > 0 ? balanceOwedGlowClass : 'text-slate-400'}>
                    {totalBudget > 0 ? formatMoneyDisplay(donutPending) : '—'}
                  </dd>
                </div>
                {isSupportProfile && commission && totalBudget > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Commission terms</dt>
                    <dd className="font-semibold text-violet-300">
                      {commission.usesCustomAmounts || commission.usesMixedRates
                        ? 'Varies by project'
                        : commission.rate !== null
                          ? `${Math.round(commission.rate * 100)}%`
                          : '—'}
                    </dd>
                  </div>
                )}
                {!isSupportProfile && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Running balance</dt>
                    <dd
                      className={
                        runningBalance < 0
                          ? balanceOwedGlowClass
                          : runningBalance === 0
                            ? 'font-semibold text-slate-300'
                            : balancePaidGlowClass
                      }
                    >
                      {totalBudget > 0 ? formatMoneyDisplay(runningBalance) : '—'}
                    </dd>
                  </div>
                )}
                {platformShare > 0 && (
                  <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <dt className="text-slate-500">Platform share</dt>
                    <dd className="font-semibold text-violet-300">{platformShare}%</dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onEdit}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200 sm:w-auto"
          >
            <Pencil size={15} />
            Edit profile
          </button>
        </div>
      </div>
    </div>
  )
}
