import type { ProjectFunnelWorkload } from '../../lib/clientProjects'

const stageStyles: Record<
  ProjectFunnelWorkload['stages'][number]['stage'],
  { bar: string; glow: string; label: string }
> = {
  Planning: {
    bar: 'from-amber-500/90 to-amber-400/70',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    label: 'text-amber-300',
  },
  'In Progress': {
    bar: 'from-blue-600/90 to-cyan-400/80',
    glow: 'shadow-[0_0_12px_rgba(37,99,235,0.35)]',
    label: 'text-blue-300',
  },
  Review: {
    bar: 'from-violet-600/90 to-fuchsia-400/75',
    glow: 'shadow-[0_0_12px_rgba(139,92,246,0.35)]',
    label: 'text-violet-300',
  },
  Complete: {
    bar: 'from-emerald-600/90 to-[#39ff14]/70',
    glow: 'shadow-[0_0_12px_rgba(57,255,20,0.3)]',
    label: 'text-emerald-300',
  },
}

export default function ProjectFunnelWidget({
  workload,
}: {
  workload: ProjectFunnelWorkload
}) {
  const { totalProjects, avgProgress, totalFiles, highUrgency, activeProjects, stages } =
    workload

  const radius = 15.9
  const circumference = 2 * Math.PI * radius
  const progressDash = (avgProgress / 100) * circumference

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="grid shrink-0 grid-cols-4 gap-1.5">
        {[
          { label: 'Projects', value: String(totalProjects) },
          { label: 'Avg progress', value: `${avgProgress}%` },
          { label: 'Files', value: String(totalFiles) },
          { label: 'High urgency', value: String(highUrgency) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-1.5 py-1.5 text-center ring-1 ring-inset ring-white/[0.04]"
          >
            <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 rounded-xl border border-white/[0.06] bg-[#060d18]/40 px-3 py-2.5 ring-1 ring-inset ring-white/[0.04]">
        <div className="flex h-full min-h-0 items-stretch gap-3">
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            {stages.map((step) => {
              const style = stageStyles[step.stage]
              const barWidth =
                step.count === 0
                  ? 0
                  : step.progress > 0
                    ? step.progress
                    : step.stage === 'Planning'
                      ? 12
                      : 0

              return (
                <div key={step.stage} className="flex items-center gap-2.5">
                  <div className="w-[5.25rem] shrink-0">
                    <p className={`whitespace-nowrap text-[10px] font-medium leading-tight ${style.label}`}>
                      {step.stage}
                    </p>
                    <p className="mt-0.5 text-[9px] tabular-nums leading-tight text-slate-500">
                      {step.count} · {step.progress}%
                      {step.stage === 'Review' ? ' left' : ''}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-full overflow-hidden rounded-md bg-white/[0.06]">
                      {step.count > 0 ? (
                        <div
                          className={`flex h-full items-center justify-end bg-gradient-to-r px-1.5 transition-all duration-500 ${style.bar} ${step.progress > 0 ? style.glow : 'opacity-80'}`}
                          style={{ width: `${barWidth}%` }}
                        >
                          <span className="text-[9px] font-bold tabular-nums text-white">
                            {step.count}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] px-1 py-2">
            <div className="relative h-14 w-14">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3.2"
                />
                {avgProgress > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.2"
                    strokeDasharray={`${progressDash} ${circumference - progressDash}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.55))' }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold tabular-nums text-white">{avgProgress}%</p>
              </div>
            </div>
            <p className="mt-1 text-center text-[8px] font-semibold uppercase tracking-wider text-slate-500">
              Workload
            </p>
            <p className="mt-0.5 text-[9px] tabular-nums text-slate-400">
              {activeProjects} active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
