import { FileText, Upload, X } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import {
  buildClientProjectFileFromUpload,
  formatClientProjectFileSize,
  type ClientProject,
  type ClientProjectFile,
} from '../../lib/clientProjects'

const fieldClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50'

export type JobChangesRequestPayload = {
  summary: string
  details: string
  files: ClientProjectFile[]
}

export default function JobChangesRequestModal({
  project,
  onClose,
  onSubmit,
}: {
  project: ClientProject
  onClose: () => void
  onSubmit: (payload: JobChangesRequestPayload) => void
}) {
  const [summary, setSummary] = useState('')
  const [details, setDetails] = useState('')
  const [pendingFiles, setPendingFiles] = useState<ClientProjectFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handlePickFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList?.length) return

    setUploading(true)
    try {
      const built = await Promise.all(
        Array.from(fileList).map((file) => buildClientProjectFileFromUpload(file)),
      )
      setPendingFiles((prev) => [...prev, ...built])
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleSubmit = () => {
    setError('')
    if (!summary.trim()) {
      setError('Describe what needs to be changed.')
      return
    }
    if (!details.trim()) {
      setError('Add details about the requested changes.')
      return
    }

    onSubmit({
      summary: summary.trim(),
      details: details.trim(),
      files: pendingFiles,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(92vh,44rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-red-500/20 bg-[#0a1628] shadow-2xl shadow-red-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-6 py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-300">
              Request changes
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">{project.name}</h3>
            <p className="mt-1 text-sm text-slate-400">
              Describe what needs to be updated. The job will move to Review until changes are
              addressed.
            </p>
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
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              What needs to change?
            </span>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Update hero section copy and button colors"
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Change details
            </span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              placeholder="List each item that needs to be revised, including pages, sections, assets, or behavior."
              className={`${fieldClass} min-h-[7rem] resize-y`}
            />
          </label>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Reference files
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Upload screenshots, mockups, or documents that show what should change.
              </p>
            </div>

            <div className="p-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-8 transition hover:border-blue-500/50 hover:bg-blue-500/[0.04]">
                <div className="rounded-full bg-blue-500/15 p-3 text-blue-300">
                  <Upload size={20} />
                </div>
                <span className="mt-3 text-sm font-medium text-slate-200">
                  Drop files here or click to browse
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  Images, PDFs, documents, and any file type
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => void handlePickFiles(e)}
                />
              </label>

              {pendingFiles.length > 0 && (
                <ul className="mt-3 overflow-hidden rounded-xl border border-white/10">
                  {pendingFiles.map((file, index) => (
                    <li
                      key={file.id}
                      className={`flex items-center justify-between gap-3 px-3 py-2 ${
                        index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-slate-400">
                          <FileText size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-slate-200">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatClientProjectFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((prev) => prev.filter((item) => item.id !== file.id))
                        }
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 px-6 py-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-red-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Preparing files…' : 'Submit changes request'}
          </button>
        </div>
      </div>
    </div>
  )
}
