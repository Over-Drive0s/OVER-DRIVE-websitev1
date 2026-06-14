import { Download, FileText, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  canDownloadClientProjectFile,
  decodeDataUrlText,
  downloadClientProjectFileAsync,
  formatClientProjectFileSize,
  getClientProjectFileDataUrl,
  isClientProjectAudioFile,
  isClientProjectImageFile,
  isClientProjectPdfFile,
  isClientProjectTextFile,
  isClientProjectVideoFile,
  resolveClientProjectFileUrl,
  type ClientProjectFile,
} from '../../lib/clientProjects'
import { getFileBlob } from '../../lib/fileBlobStore'

function formatUploadedAt(uploadedAt?: string) {
  if (!uploadedAt) return '—'
  return new Date(uploadedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function UploadFilePreviewModal({
  file,
  onClose,
}: {
  file: ClientProjectFile & { projectName?: string; uploadedAt?: string }
  onClose: () => void
}) {
  const [fileUrl, setFileUrl] = useState<string | undefined>(() =>
    getClientProjectFileDataUrl(file),
  )
  const [textPreview, setTextPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(!getClientProjectFileDataUrl(file))

  const canDownload = canDownloadClientProjectFile(file)
  const isImage = isClientProjectImageFile(file.type, file.name)
  const isPdf = isClientProjectPdfFile(file.type, file.name)
  const isVideo = isClientProjectVideoFile(file.type, file.name)
  const isAudio = isClientProjectAudioFile(file.type, file.name)
  const isText = isClientProjectTextFile(file.type, file.name)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const url = await resolveClientProjectFileUrl(file)
      if (cancelled) return
      setFileUrl(url)
      setLoading(false)

      if (!url) {
        setTextPreview(null)
        return
      }

      const legacyText = getClientProjectFileDataUrl(file)
      if (legacyText && (isText || isClientProjectTextFile(file.type, file.name))) {
        const decoded = decodeDataUrlText(legacyText)
        if (!cancelled) setTextPreview(decoded)
        return
      }

      if (file.blobStored && isText) {
        const blob = await getFileBlob(file.id)
        if (cancelled || !blob) return
        try {
          const raw = await blob.text()
          const maxChars = 500_000
          setTextPreview(
            raw.length > maxChars ? `${raw.slice(0, maxChars)}\n\n… truncated …` : raw,
          )
        } catch {
          setTextPreview(null)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [file, isText])

  const showTextPreview = useMemo(() => Boolean(textPreview), [textPreview])

  const handleDownload = () => {
    void downloadClientProjectFileAsync(file)
  }

  const useObjectPreview =
    fileUrl &&
    !isImage &&
    !isPdf &&
    !isVideo &&
    !isAudio &&
    !showTextPreview

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{file.name}</h3>
            {file.projectName && (
              <p className="mt-1 text-sm text-slate-400">Project: {file.projectName}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <Download size={16} />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex min-h-[240px] max-h-[70vh] items-center justify-center overflow-auto bg-black/30 p-4">
          {loading && (
            <p className="text-sm text-slate-400">Loading preview…</p>
          )}
          {!loading && fileUrl && isImage && (
            <img
              src={fileUrl}
              alt={file.name}
              className="max-h-[65vh] max-w-full rounded-lg object-contain"
            />
          )}
          {!loading && fileUrl && isPdf && (
            <iframe
              src={fileUrl}
              title={file.name}
              className="h-[65vh] w-full rounded-lg border border-white/10 bg-white"
            />
          )}
          {!loading && fileUrl && isVideo && (
            <video
              src={fileUrl}
              controls
              className="max-h-[65vh] max-w-full rounded-lg"
            >
              Your browser does not support video playback.
            </video>
          )}
          {!loading && fileUrl && isAudio && (
            <div className="flex w-full max-w-md flex-col items-center gap-4 px-4">
              <div className="rounded-2xl bg-white/5 p-6 text-slate-400">
                <FileText size={40} />
              </div>
              <audio src={fileUrl} controls className="w-full max-w-md">
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
          {!loading && fileUrl && showTextPreview && (
            <pre
              className="max-h-[65vh] w-full overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 text-left text-xs leading-relaxed text-slate-200"
            >
              {textPreview}
            </pre>
          )}
          {!loading && useObjectPreview && (
            <object
              data={fileUrl}
              type={file.type || 'application/octet-stream'}
              className="h-[65vh] w-full rounded-lg border border-white/10 bg-white"
            >
              <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
                <div className="rounded-2xl bg-white/5 p-4 text-slate-400">
                  <FileText size={40} />
                </div>
                <p className="text-sm text-slate-300">{file.name}</p>
                <p className="max-w-sm text-xs text-slate-500">
                  Inline preview is not supported for this format in your browser. Download the
                  file to open it with the right application.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                >
                  <Download size={16} />
                  Download file
                </button>
              </div>
            </object>
          )}
          {!loading && !fileUrl && (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <div className="rounded-2xl bg-white/5 p-4 text-slate-400">
                <FileText size={40} />
              </div>
              <p className="text-sm text-slate-300">File data could not be loaded.</p>
              <p className="max-w-sm text-xs text-slate-500">
                Re-upload the file if it was removed from browser storage.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-3 border-t border-white/10 px-5 py-4 text-xs text-slate-400 sm:grid-cols-3">
          <p>
            <span className="text-slate-500">Size · </span>
            {formatClientProjectFileSize(file.size)}
          </p>
          <p>
            <span className="text-slate-500">Type · </span>
            {file.type || 'Unknown'}
          </p>
          <p>
            <span className="text-slate-500">Uploaded · </span>
            {formatUploadedAt(file.uploadedAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
