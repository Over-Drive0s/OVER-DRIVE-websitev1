import { useState } from 'react'
import { Clock, Download, ExternalLink, Eye, FileText, X } from 'lucide-react'
import { formatMoneyDisplay, formatMoneyInput, parseMoneyValue } from '../../lib/formatMoney'
import {
  canDownloadClientProjectFile,
  canPreviewClientProjectFile,
  downloadClientProjectFileAsync,
  formatClientProjectFileSize,
  isClientProjectImageFile,
  SUPPORT_PROJECT_COMMISSION_PRESETS,
  urgencyTagStyles,
  type ClientProject,
  type ClientProjectFile,
  type SupportProjectCommissionInput,
} from '../../lib/clientProjects'
import UploadFilePreviewModal from './UploadFilePreviewModal'

function formatProjectUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const budgetGlowClass =
  'font-semibold text-[#39ff14] [text-shadow:0_0_10px_rgba(57,255,20,0.75),0_0_22px_rgba(57,255,20,0.35)]'

const commissionButtonClass = (selected: boolean) =>
  selected
    ? 'border-violet-400/70 bg-violet-500/20 text-violet-100 shadow-[0_0_14px_rgba(139,92,246,0.45)] ring-1 ring-violet-400/50'
    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200'

type CommissionChoice = '20' | '25' | '30' | 'custom'

export default function PendingProjectApprovalModal({
  project,
  ownerLabel,
  onClose,
  onApprove,
  onDecline,
}: {
  project: ClientProject
  ownerLabel?: string
  onClose: () => void
  onApprove: (commission: SupportProjectCommissionInput) => void
  onDecline: () => void
}) {
  const {
    name,
    type,
    urgency,
    due,
    description,
    url,
    budget,
    files,
    submittedAt,
  } = project
  const projectUrl = url?.trim()
  const href = projectUrl ? formatProjectUrl(projectUrl) : ''
  const [previewFile, setPreviewFile] = useState<ClientProjectFile | null>(null)
  const [commissionChoice, setCommissionChoice] = useState<CommissionChoice>('20')
  const [customCommission, setCustomCommission] = useState('')
  const [formError, setFormError] = useState('')

  const selectedRate =
    commissionChoice === '20' || commissionChoice === '25' || commissionChoice === '30'
      ? Number(commissionChoice) / 100
      : null

  const commissionPreviewAmount =
    selectedRate !== null && budget !== undefined && budget > 0
      ? budget * selectedRate
      : null

  const buildCommissionInput = (): SupportProjectCommissionInput | null => {
    if (commissionChoice === 'custom') {
      const amount = parseMoneyValue(customCommission)
      if (amount === null || amount < 0) {
        setFormError('Enter a valid custom commission amount.')
        return null
      }
      return { type: 'custom', amount }
    }

    const rate = Number(commissionChoice) / 100
    if (!SUPPORT_PROJECT_COMMISSION_PRESETS.some((preset) => preset === rate)) {
      setFormError('Choose a commission rate.')
      return null
    }

    return { type: 'rate', rate }
  }

  const handleApprove = () => {
    setFormError('')
    const commission = buildCommissionInput()
    if (!commission) return
    onApprove(commission)
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
          className="flex max-h-[min(90vh,44rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-amber-500/25 bg-[#0a1628] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-amber-500/[0.08] to-transparent px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                <Clock size={12} />
                Pending approval
              </div>
              <h3 className="truncate text-lg font-semibold text-white">{name}</h3>
              {ownerLabel && (
                <p className="mt-1 text-sm text-blue-300/90">Submitted by {ownerLabel}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
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

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
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
                  Submitted
                </dt>
                <dd className="mt-1 text-sm text-white">
                  {submittedAt
                    ? new Date(submittedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  URL submitted
                </dt>
                <dd className="mt-1 text-sm">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 break-all text-blue-400 transition hover:text-blue-300 hover:underline"
                    >
                      <span>{projectUrl}</span>
                      <ExternalLink size={14} className="shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </dd>
              </div>
            </dl>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Support commission
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Set the commission for this project before approving.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {(['20', '25', '30'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setCommissionChoice(value)
                      setFormError('')
                    }}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${commissionButtonClass(commissionChoice === value)}`}
                  >
                    {value}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCommissionChoice('custom')
                    setFormError('')
                  }}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${commissionButtonClass(commissionChoice === 'custom')}`}
                >
                  Custom
                </button>
                {commissionChoice === 'custom' && (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customCommission}
                    onChange={(e) => {
                      setCustomCommission(formatMoneyInput(e.target.value))
                      setFormError('')
                    }}
                    placeholder="$0.00"
                    aria-label="Custom commission amount"
                    className="min-w-[8.5rem] flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-violet-500/50 sm:max-w-[10rem] sm:flex-none"
                  />
                )}
              </div>
              {selectedRate !== null && (
                <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-violet-300/80">
                    Commission preview
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {commissionPreviewAmount !== null ? (
                      <>
                        <span className={budgetGlowClass}>
                          {formatMoneyDisplay(commissionPreviewAmount)}
                        </span>
                        <span className="text-slate-400">
                          {' '}
                          at {commissionChoice}% of {formatMoneyDisplay(budget!)}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">
                        Add a project budget to preview the commission amount.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {description && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-slate-200">
                  {description}
                </p>
              </div>
            )}

            {files && files.length > 0 && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Attached files ({files.length})
                </p>
                <ul className="mt-2 space-y-2">
                  {files.map((file) => {
                    const thumbUrl = file.previewUrl ?? file.dataUrl
                    const showThumb =
                      thumbUrl && isClientProjectImageFile(file.type, file.name)
                    const canPreview = canPreviewClientProjectFile(file)
                    const canDownload = canDownloadClientProjectFile(file)

                    return (
                      <li
                        key={file.id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                      >
                        {showThumb ? (
                          <img
                            src={thumbUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                            <FileText size={16} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatClientProjectFileSize(file.size)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {canPreview && (
                            <button
                              type="button"
                              onClick={() => setPreviewFile(file)}
                              className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                              aria-label={`Preview ${file.name}`}
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          {canDownload && (
                            <button
                              type="button"
                              onClick={() => void downloadClientProjectFileAsync(file)}
                              className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                              aria-label={`Download ${file.name}`}
                            >
                              <Download size={15} />
                            </button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {formError && <p className="text-sm text-red-400">{formError}</p>}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-500/50 hover:bg-red-500/20"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
