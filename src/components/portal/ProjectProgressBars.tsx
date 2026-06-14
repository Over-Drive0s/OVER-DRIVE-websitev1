import {
  getChangesProgressPercent,
  getDeliveredProgressPercent,
  getProjectProgressLabel,
  getProjectProgressPercent,
  hasRevisionProgress,
  type ClientProject,
} from '../../lib/clientProjects'

export function ProjectProgressBars({
  project,
  primaryBarClass = 'bg-gradient-to-r from-blue-600 to-cyan-400',
  compact = false,
}: {
  project: ClientProject
  primaryBarClass?: string
  compact?: boolean
}) {
  const barHeight = compact ? 'h-1.5' : 'h-2'
  const labelClass = compact ? 'text-[11px]' : 'text-xs'

  if (!hasRevisionProgress(project)) {
    const progressValue = getProjectProgressPercent(project)
    return (
      <div>
        <div className={`mb-1.5 flex items-center justify-between ${labelClass}`}>
          <span className="text-slate-400">Progress</span>
          <span className="font-semibold text-slate-200">
            {getProjectProgressLabel(project)}
          </span>
        </div>
        <div className={`${barHeight} overflow-hidden rounded-full bg-white/10`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${primaryBarClass}`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    )
  }

  const deliveredValue = getDeliveredProgressPercent(project)
  const changesValue = getChangesProgressPercent(project)

  return (
    <div className="space-y-3">
      <div>
        <div className={`mb-1.5 flex items-center justify-between ${labelClass}`}>
          <span className="text-emerald-400/90">Delivered</span>
          <span className="font-semibold text-emerald-300">{deliveredValue}%</span>
        </div>
        <div className={`${barHeight} overflow-hidden rounded-full bg-white/10`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
            style={{ width: `${deliveredValue}%` }}
          />
        </div>
      </div>
      <div>
        <div className={`mb-1.5 flex items-center justify-between ${labelClass}`}>
          <span className="text-red-300/90">Changes</span>
          <span className="font-semibold text-red-200">{changesValue}%</span>
        </div>
        <div className={`${barHeight} overflow-hidden rounded-full bg-white/10`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-500"
            style={{ width: `${changesValue}%` }}
          />
        </div>
      </div>
    </div>
  )
}
