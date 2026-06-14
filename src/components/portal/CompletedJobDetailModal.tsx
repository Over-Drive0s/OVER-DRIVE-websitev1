import { Archive, CheckCircle, ExternalLink, FileText, X } from 'lucide-react'
import { useState } from 'react'
import { formatMoneyDisplay, formatMoneyInput, parseMoneyValue } from '../../lib/formatMoney'
import {
  formatClientProjectFileSize,
  getProjectAmountOwed,
  getProjectBalance,
  urgencyTagStyles,
  type ClientProject,
} from '../../lib/clientProjects'
import JobChangesRequestModal, {
  type JobChangesRequestPayload,
} from './JobChangesRequestModal'
import { ProjectCommissionPanel } from './ProjectCommissionInfo'

const projectStatusStyles: Record<string, string> = {
  Complete: 'bg-emerald-500/20 text-emerald-300',
}

const portalFieldClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500/50'

const balancePaidGlowClass =
  'font-semibold text-emerald-400 [text-shadow:0_0_10px_rgba(52,211,153,0.55),0_0_20px_rgba(52,211,153,0.25)]'

function formatCompletedAt(value?: string): string {
  if (!value) return 'Recently completed'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatSubmittedAt(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function CompletedJobDetailModal({
  project,
  ownerLabel,
  canTakeAction,
  canUncomplete,
  onClose,
  onConfirmOrder,
  onRequestChanges,
  onApplyPayment,
  onMarkAsPaid,
  onUncomplete,
  onGoToArchives,
  showCommission = false,
}: {
  project: ClientProject
  ownerLabel?: string
  canTakeAction: boolean
  canUncomplete?: boolean
  onClose: () => void
  onConfirmOrder: () => void
  onRequestChanges: (payload: JobChangesRequestPayload) => void
  onApplyPayment?: (amount: number) => void
  onMarkAsPaid?: () => void
  onUncomplete?: () => void
  onGoToArchives?: () => void
  showCommission?: boolean
}) {
  const [changesOpen, setChangesOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const {
    name,
    type,
    urgency,
    progress,
    due,
    description,
    url,
    budget,
    files,
    completedAt,
    orderConfirmed,
    changeRequest,
  } = project
  const runningBalance = getProjectBalance(project)
  const amountOwed = getProjectAmountOwed(project)
  const changeRequestFileIds = new Set(changeRequest?.files.map((file) => file.id) ?? [])
  const deliverableFiles = (files ?? []).filter((file) => !changeRequestFileIds.has(file.id))

  const handleApplyPayment = () => {
    setPaymentError('')
    const amount = parseMoneyValue(paymentAmount)
    if (amount === null || amount <= 0) {
      setPaymentError('Enter a valid payment amount.')
      return
    }
    if (!onApplyPayment) return
    onApplyPayment(amount)
    setPaymentAmount('')
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[min(92vh,44rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0a1628] shadow-2xl shadow-emerald-950/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-6 py-5">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                <CheckCircle size={12} />
                Job complete
              </div>
              <h3 className="text-lg font-semibold">{name}</h3>
              {ownerLabel && (
                <p className="mt-1 text-sm text-blue-300/90">Profile: {ownerLabel}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-xs ${projectStatusStyles.Complete}`}
                >
                  Complete
                </span>
                <span className={`rounded-lg px-2.5 py-0.5 text-xs ${urgencyTagStyles[urgency]}`}>
                  {urgency}
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-0.5 text-xs text-slate-300">
                  {type}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Completed
                </dt>
                <dd className="mt-1 text-sm text-white">{formatCompletedAt(completedAt)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Due date
                </dt>
                <dd className="mt-1 text-sm text-white">{due}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Final progress
                </dt>
                <dd className="mt-1 text-sm font-semibold text-emerald-300">{progress}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Order status
                </dt>
                <dd className="mt-1 text-sm text-white">
                  {orderConfirmed ? 'Confirmed' : 'Awaiting confirmation'}
                </dd>
              </div>
            </dl>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Deliverable URL
              </dt>
              <dd className="mt-2">
                {url?.trim() ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-2 truncate text-sm font-medium text-blue-300 transition hover:text-blue-200"
                  >
                    <ExternalLink size={14} className="shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">No URL provided for this deliverable.</p>
                )}
              </dd>
            </div>

            {showCommission && <ProjectCommissionPanel project={project} />}

            <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-blue-300/80">
                Completion summary
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-300">
                {description?.trim() || 'No project description provided.'}
              </dd>
              {budget !== undefined && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        Budget
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-[#39ff14]">
                        {formatMoneyDisplay(budget)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        Balance
                      </dt>
                      <dd
                        className={`mt-1 text-sm ${
                          runningBalance < 0
                            ? 'font-semibold text-red-400'
                            : runningBalance === 0
                              ? balancePaidGlowClass
                              : 'font-semibold text-slate-300'
                        }`}
                      >
                        {formatMoneyDisplay(runningBalance)}
                        <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                          {runningBalance < 0
                            ? `${formatMoneyDisplay(amountOwed)} remaining on invoice`
                            : runningBalance === 0
                              ? 'Invoice paid in full'
                              : 'Credit balance'}
                        </span>
                      </dd>
                    </div>
                  </div>

                  {amountOwed > 0 && onMarkAsPaid && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={onMarkAsPaid}
                        className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-100 sm:w-auto"
                      >
                        Marked as paid
                      </button>
                      <p className="mt-2 text-[11px] text-slate-500">
                        Squares off the invoice ({formatMoneyDisplay(amountOwed)} remaining).
                      </p>
                    </div>
                  )}
                  {amountOwed > 0 && onApplyPayment && !onMarkAsPaid && (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                      <label className="min-w-0 flex-1">
                        <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          Apply payment
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={paymentAmount}
                          onChange={(e) => {
                            setPaymentAmount(formatMoneyInput(e.target.value))
                            setPaymentError('')
                          }}
                          placeholder={formatMoneyDisplay(amountOwed)}
                          className={portalFieldClass}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleApplyPayment}
                        className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        Pay now
                      </button>
                    </div>
                  )}
                  {paymentError && (
                    <p className="mt-2 text-sm text-red-400">{paymentError}</p>
                  )}
                </div>
              )}
            </div>

            {changeRequest && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
                <dt className="text-[10px] font-medium uppercase tracking-wider text-red-300">
                  Latest change request
                </dt>
                <dd className="mt-2 text-sm font-medium text-white">{changeRequest.summary}</dd>
                <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {changeRequest.details}
                </dd>
                <p className="mt-3 text-[11px] text-slate-500">
                  Submitted {formatSubmittedAt(changeRequest.submittedAt)}
                </p>
                {changeRequest.files.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {changeRequest.files.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300"
                      >
                        <FileText size={14} className="shrink-0 text-slate-500" />
                        <span className="min-w-0 flex-1 truncate">{file.name}</span>
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatClientProjectFileSize(file.size)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {deliverableFiles.length > 0 && (
              <div>
                <dt className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Deliverables
                </dt>
                <ul className="space-y-1.5">
                  {deliverableFiles.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300"
                    >
                      <FileText size={14} className="shrink-0 text-slate-500" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatClientProjectFileSize(file.size)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 px-6 py-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onConfirmOrder}
                disabled={!canTakeAction || orderConfirmed}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {orderConfirmed ? 'Order confirmed' : 'Confirm Order'}
              </button>
              <button
                type="button"
                onClick={() => setChangesOpen(true)}
                disabled={!canTakeAction}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/25 transition hover:from-red-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Edit / Changes
              </button>
            </div>
            {canUncomplete && onUncomplete && (
              <button
                type="button"
                onClick={onUncomplete}
                className="mt-2 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-500/50 hover:bg-amber-500/20 hover:text-amber-100"
              >
                Uncomplete
              </button>
            )}
            {onGoToArchives && (
              <button
                type="button"
                onClick={onGoToArchives}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-500/50 hover:bg-violet-500/20 hover:text-violet-100"
              >
                <Archive size={16} />
                Archives
              </button>
            )}
            {!canTakeAction && (
              <p className="mt-3 text-center text-xs text-slate-500">
                Sign in to confirm orders or request changes on completed jobs.
              </p>
            )}
          </div>
        </div>
      </div>

      {changesOpen && (
        <JobChangesRequestModal
          project={project}
          onClose={() => setChangesOpen(false)}
          onSubmit={(payload) => {
            onRequestChanges(payload)
            setChangesOpen(false)
          }}
        />
      )}
    </>
  )
}
