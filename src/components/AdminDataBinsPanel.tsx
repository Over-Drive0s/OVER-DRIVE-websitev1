import {
  Database,
  Download,
  HardDrive,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DATA_BIN_DEFINITIONS,
  formatDataBinSize,
  syncAllDataBins,
  type DataBinSnapshot,
} from '../lib/dataBins'
import { exportInternalDatabase, INTERNAL_DATABASE_EVENT } from '../lib/internalDatabase'
import OwnerAdminShell, { OwnerPanel } from './owner/OwnerAdminShell'

const categoryStyles: Record<string, string> = {
  admin: 'bg-blue-500/15 text-blue-300',
  portal: 'bg-violet-500/15 text-violet-300',
  system: 'bg-cyan-500/15 text-cyan-300',
  leads: 'bg-emerald-500/15 text-emerald-300',
  files: 'bg-amber-500/15 text-amber-300',
}

function formatTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DataBinsContent({
  variant = 'owner',
}: {
  variant?: 'owner' | 'portal'
}) {
  const [bins, setBins] = useState<DataBinSnapshot[]>([])
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [syncing, setSyncing] = useState(false)

  const refreshBins = useCallback(async () => {
    setSyncing(true)
    try {
      const snapshots = await syncAllDataBins()
      setBins(snapshots)
      if (!selectedBinId && snapshots[0]) {
        setSelectedBinId(snapshots[0].id)
      }
    } finally {
      setSyncing(false)
    }
  }, [selectedBinId])

  useEffect(() => {
    void refreshBins()
    const onUpdate = () => {
      void refreshBins()
    }
    window.addEventListener(INTERNAL_DATABASE_EVENT, onUpdate)
    window.addEventListener('focus', onUpdate)
    return () => {
      window.removeEventListener(INTERNAL_DATABASE_EVENT, onUpdate)
      window.removeEventListener('focus', onUpdate)
    }
  }, [refreshBins])

  const filteredBins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return bins
    return bins.filter(
      (bin) =>
        bin.label.toLowerCase().includes(query) ||
        bin.description.toLowerCase().includes(query) ||
        bin.category.toLowerCase().includes(query),
    )
  }, [bins, searchQuery])

  const selectedBin =
    filteredBins.find((bin) => bin.id === selectedBinId) ??
    bins.find((bin) => bin.id === selectedBinId) ??
    null

  const totalRecords = bins.reduce((sum, bin) => sum + bin.recordCount, 0)
  const totalSize = bins.reduce((sum, bin) => sum + bin.sizeBytes, 0)

  const cardClass =
    variant === 'portal'
      ? 'rounded-2xl border border-white/10 bg-white/[0.03]'
      : 'rounded-2xl border border-white/10 bg-white/5'

  const handleExport = async () => {
    const payload = await exportInternalDatabase()
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `overdrive-data-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const Panel = variant === 'owner' ? OwnerPanel : PortalDataBinsPanel

  return (
    <>
      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Data bins',
            value: DATA_BIN_DEFINITIONS.length,
            icon: Database,
            iconClass: 'bg-blue-500/15 text-blue-300',
          },
          {
            label: 'Stored records',
            value: totalRecords,
            icon: HardDrive,
            iconClass: 'bg-violet-500/15 text-violet-300',
          },
          {
            label: 'Database size',
            value: formatDataBinSize(totalSize),
            icon: HardDrive,
            iconClass: 'bg-cyan-500/15 text-cyan-300',
          },
          {
            label: 'Last sync',
            value: bins[0] ? formatTimestamp(bins[0].syncedAt) : '—',
            icon: RefreshCw,
            iconClass: 'bg-emerald-500/15 text-emerald-300',
          },
        ].map((stat) => (
          <div key={stat.label} className={`${cardClass} p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${stat.iconClass}`}>
                <stat.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search bins…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50"
          />
        </div>
        <button
          type="button"
          onClick={() => void refreshBins()}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync database'}
        </button>
        <button
          type="button"
          onClick={() => void handleExport()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Download size={16} />
          Export JSON
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Storage bins" className="xl:col-span-5">
          <div className="space-y-2">
            {filteredBins.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No bins match your search.</p>
            ) : (
              filteredBins.map((bin) => (
                <button
                  key={bin.id}
                  type="button"
                  onClick={() => setSelectedBinId(bin.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    selectedBin?.id === bin.id
                      ? 'border-blue-500/40 bg-blue-500/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{bin.label}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          categoryStyles[bin.category] ?? 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {bin.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{bin.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {bin.recordCount} record{bin.recordCount === 1 ? '' : 's'} ·{' '}
                      {formatDataBinSize(bin.sizeBytes)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[10px] text-slate-500">
                    {formatTimestamp(bin.syncedAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Bin contents" className="xl:col-span-7">
          {!selectedBin ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Select a bin to inspect stored data.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                <p>
                  <span className="text-slate-500">Storage key:</span> {selectedBin.storageKey}
                </p>
                <p className="mt-1">
                  <span className="text-slate-500">Records:</span> {selectedBin.recordCount}
                </p>
                <p className="mt-1">
                  <span className="text-slate-500">Size:</span>{' '}
                  {formatDataBinSize(selectedBin.sizeBytes)}
                </p>
              </div>
              <pre className="max-h-[min(28rem,55vh)] overflow-auto rounded-xl border border-white/10 bg-[#060b14] p-4 text-xs leading-relaxed text-slate-300">
                {JSON.stringify(selectedBin.data, null, 2) ?? 'null'}
              </pre>
            </div>
          )}
        </Panel>
      </div>
    </>
  )
}

function PortalDataBinsPanel({
  title,
  className = '',
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}
    >
      <h2 className="mb-5 font-semibold text-white">{title}</h2>
      {children}
    </div>
  )
}

export default function AdminDataBinsPanel({
  variant = 'owner',
}: {
  variant?: 'owner' | 'portal'
}) {
  if (variant === 'portal') {
    return <DataBinsContent variant="portal" />
  }

  return (
    <OwnerAdminShell
      title="Data & Info Bins"
      subtitle="Internal database storage for all profiles, projects, uploads, messages, and form input."
    >
      <DataBinsContent variant="owner" />
    </OwnerAdminShell>
  )
}
