import type { ProfileProjectWorkloadSummary } from '../../lib/clientProjects'

function workloadHeatmapColor(progress: number): string | undefined {
  if (progress <= 0) return undefined
  const intensity = progress / 100
  if (intensity < 0.15) return '#1e293b'
  if (intensity < 0.35) return '#1d4ed8'
  if (intensity < 0.55) return '#0891b2'
  if (intensity < 0.75) return '#059669'
  return '#34d399'
}

const emptyWorkload: ProfileProjectWorkloadSummary = {
  totalProjects: 0,
  avgProgress: 0,
  activeProjects: 0,
  projectProgress: [],
}

export function ProfileWorkloadHeatmapBar({
  workload = emptyWorkload,
}: {
  workload?: ProfileProjectWorkloadSummary
}) {
  const { totalProjects, avgProgress, activeProjects, projectProgress } = workload
  const segments = projectProgress.length > 0 ? projectProgress : []
  const hasHighlightedProgress = projectProgress.some((progress) => progress > 0)
  const allZeroProgress =
    totalProjects > 0 && projectProgress.every((progress) => progress <= 0)

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-1 transition-opacity ${
        allZeroProgress ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[9px] font-medium uppercase tracking-wider ${
            allZeroProgress ? 'text-white/35' : 'text-white/55'
          }`}
        >
          Progress
        </span>
        <span
          className={`text-[9px] tabular-nums ${
            totalProjects === 0 || avgProgress <= 0
              ? 'text-white/30'
              : 'text-white/80'
          }`}
        >
          {totalProjects === 0 ? '—' : `${avgProgress}%`}
        </span>
      </div>

      <div
        className={`flex h-2.5 gap-0.5 overflow-hidden rounded-md p-px ring-1 ring-inset ${
          allZeroProgress
            ? 'bg-black/15 ring-white/5'
            : 'bg-black/25 ring-white/10'
        }`}
        role="img"
        aria-label={
          totalProjects === 0
            ? 'No project workload'
            : allZeroProgress
              ? `Profile has ${totalProjects} active project(s) at 0% progress`
              : `Profile progress ${avgProgress}% across ${totalProjects} active projects`
        }
      >
        {segments.length === 0 ? (
          <span className="min-w-0 flex-1 rounded-[2px] bg-white/[0.03]" />
        ) : (
          segments.map((progress, index) => {
            const segmentColor = workloadHeatmapColor(progress)
            const isZero = progress <= 0

            return (
              <span
                key={index}
                className="relative min-w-0 flex-1 overflow-hidden rounded-[2px] bg-white/[0.05]"
                title={
                  isZero
                    ? `Project ${index + 1}: 0% (not started)`
                    : `Project ${index + 1}: ${progress}%`
                }
              >
                <span
                  className={`block h-full rounded-[2px] transition-all duration-500 ${
                    isZero ? 'border border-dashed border-white/10 bg-transparent' : ''
                  }`}
                  style={
                    isZero
                      ? undefined
                      : {
                          width: `${progress}%`,
                          backgroundColor: segmentColor,
                        }
                  }
                />
              </span>
            )
          })
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/30">
          {hasHighlightedProgress && avgProgress > 0 ? (
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500/90 to-emerald-400/90 transition-all duration-500"
              style={{ width: `${avgProgress}%` }}
            />
          ) : null}
        </div>
        <span
          className={`shrink-0 text-[8px] tabular-nums ${
            allZeroProgress ? 'text-white/30' : 'text-white/45'
          }`}
        >
          {totalProjects === 0 ? '0 jobs' : `${activeProjects} active`}
        </span>
      </div>
    </div>
  )
}
