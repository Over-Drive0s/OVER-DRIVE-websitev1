import { Eye, FileText, X } from 'lucide-react'
import { useState } from 'react'
import { formatMoneyDisplay, formatMoneyInput, parseMoneyValue } from '../../lib/formatMoney'
import {
  formatClientProjectFileSize,
  getProjectAmountOwed,
  getProjectBalance,
  getProjectProgressPercent,
  hasRevisionProgress,
  isClientProjectImageFile,
  urgencyTagStyles,
  type ClientProject,
  type ClientProjectFile,
} from '../../lib/clientProjects'
import UploadFilePreviewModal from './UploadFilePreviewModal'
import { ProjectProgressBars } from './ProjectProgressBars'
import { ProjectCommissionPanel } from './ProjectCommissionInfo'

const projectStatusStyles: Record<string, string> = {
  'In Progress': 'bg-blue-500/20 text-blue-300',
  Planning: 'bg-amber-500/20 text-amber-300',
  Review: 'bg-purple-500/20 text-purple-300',
  Complete: 'bg-emerald-500/20 text-emerald-300',
}

const MASTER_PROGRESS_STEPS = [0, 20, 40, 60, 80, 100]

const budgetGlowClass =
  'font-semibold text-[#39ff14] [text-shadow:0_0_10px_rgba(57,255,20,0.75),0_0_22px_rgba(57,255,20,0.35)]'

const balanceOwedGlowClass =
  'font-semibold text-red-400 [text-shadow:0_0_10px_rgba(248,113,113,0.75),0_0_22px_rgba(248,113,113,0.35)]'

const balancePaidGlowClass =
  'font-semibold text-emerald-400 [text-shadow:0_0_10px_rgba(52,211,153,0.55),0_0_20px_rgba(52,211,153,0.25)]'

const portalFieldClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500/50'

export default function ProjectDetailModal({
  project,
  ownerLabel,
  onClose,
  allowProgressQuickSet = false,
  onSetProgress,
  onApplyPayment,
  onMarkAsPaid,
  showCommission = false,
}: {
  project: ClientProject
  ownerLabel?: string
  onClose: () => void
  allowProgressQuickSet?: boolean
  onSetProgress?: (percent: number) => void
  onApplyPayment?: (amount: number) => void
  onMarkAsPaid?: () => void
  showCommission?: boolean
}) {
  const [previewFile, setPreviewFile] = useState<ClientProjectFile | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const {
    name,
    type,
    urgency,
    status,
    progress,
    due,
    description,
    budget,
    files,
    changeRequest,
  } = project
  const progressValue = getProjectProgressPercent(project)
  const progressLabel = hasRevisionProgress(project)
    ? `${progressValue}% changes`
    : progress
  const runningBalance = getProjectBalance(project)
  const amountOwed = getProjectAmountOwed(project)

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
      {previewFile && (
        <UploadFilePreviewModal
          file={{ ...previewFile, projectName: name }}
          onClose={() => setPreviewFile(null)}
        />
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[min(90vh,40rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{name}</h3>
              {ownerLabel && (
                <p className="mt-1 text-sm text-blue-300/90">Profile: {ownerLabel}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-xs ${projectStatusStyles[status] ?? 'bg-white/10 text-slate-300'}`}
                >
                  {status}
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
              className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:gap-5 sm:p-6">
            <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto pr-0.5 sm:pr-1">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Due date
                  </dt>
                  <dd className="mt-1 text-sm text-white">{due}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Budget
                  </dt>
                  <dd
                    className={`mt-1 text-sm ${budget !== undefined ? budgetGlowClass : 'text-slate-400'}`}
                  >
                    {budget !== undefined ? formatMoneyDisplay(budget) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Progress
                  </dt>
                  <dd className="mt-1 text-sm text-white">
                    {progressLabel}
                  </dd>
                </div>
              </dl>

              {showCommission && <ProjectCommissionPanel project={project} />}

              <div>
                <ProjectProgressBars project={project} />
                {allowProgressQuickSet && onSetProgress && (
                  <div className="mt-3">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {hasRevisionProgress(project) ? 'Set changes progress' : 'Set progress'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MASTER_PROGRESS_STEPS.map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => {
                            if (step > 0 && progressValue === step) {
                              onSetProgress(0)
                            } else {
                              onSetProgress(step)
                            }
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            progressValue === step
                              ? 'border-blue-500 bg-blue-600 text-white'
                              : 'border-white/10 text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200'
                          }`}
                        >
                          {step}%
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">
                      {hasRevisionProgress(project)
                        ? 'Tracks revision work. Stays at 0% until you set progress. 100% marks the job complete again.'
                        : '0% keeps Planning. 20%+ moves to In Progress. 100% marks the job complete.'}
                    </p>
                  </div>
                )}
              </div>

              {changeRequest && hasRevisionProgress(project) && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-red-300">
                    Requested changes
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">{changeRequest.summary}</dd>
                  <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {changeRequest.details}
                  </dd>
                </div>
              )}

              <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <dt className="text-[10px] font-medium uppercase tracking-wider text-blue-300/80">
                  Project description
                </dt>
                <dd className="mt-2 rounded-lg border border-white/10 bg-[#0a1424]/70 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
                  {description?.trim() ? description : 'No description provided.'}
                </dd>

                {budget !== undefined && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          Balance
                        </dt>
                        <dd
                          className={`mt-1 text-xl tabular-nums ${
                            runningBalance < 0
                              ? balanceOwedGlowClass
                              : runningBalance > 0
                                ? balancePaidGlowClass
                                : 'font-semibold text-slate-300'
                          }`}
                        >
                          {formatMoneyDisplay(runningBalance)}
                        </dd>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {runningBalance < 0
                            ? `${formatMoneyDisplay(amountOwed)} remaining on invoice`
                            : runningBalance === 0
                              ? 'Invoice paid in full'
                              : 'Credit balance'}
                        </p>
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
            </div>

            <div className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] sm:w-72">
              <div className="shrink-0 border-b border-white/10 px-4 py-3">
                <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Uploaded files
                </dt>
                <dd className="mt-0.5 text-xs text-slate-400">
                  {files?.length ?? 0} file{(files?.length ?? 0) === 1 ? '' : 's'}
                </dd>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {files && files.length > 0 ? (
                  <ul className="space-y-2">
                    {files.map((file) => {
                      const thumbUrl = file.previewUrl ?? file.dataUrl
                      const showThumb =
                        thumbUrl && isClientProjectImageFile(file.type, file.name)

                      return (
                        <li key={file.id}>
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
                          >
                            {showThumb ? (
                              <img
                                src={thumbUrl}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="rounded-lg bg-blue-500/15 p-2 text-blue-300">
                                <FileText size={16} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-slate-200">{file.name}</p>
                              <p className="text-xs text-slate-500">
                                {formatClientProjectFileSize(file.size)}
                                {file.type ? ` · ${file.type}` : ''}
                              </p>
                            </div>
                            <Eye size={16} className="shrink-0 text-slate-500" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No files uploaded for this project.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
