import { useNavigate } from 'react-router-dom'
import OwnerAdminShell, { OwnerPanel } from './owner/OwnerAdminShell'

const projects = [
  {
    name: 'Overdrive IO Website Redesign',
    type: 'Website Development',
    client: 'Overdrive IO',
    progress: '75%',
    status: 'In Progress',
    due: 'Mar 28, 2026',
  },
  {
    name: 'Smart Builds Pro Platform',
    type: 'Web Application',
    client: 'Smart Builds Pro',
    progress: '60%',
    status: 'In Progress',
    due: 'Apr 12, 2026',
  },
  {
    name: 'Acme Mobile App',
    type: 'Mobile Development',
    client: 'Acme Industries',
    progress: '40%',
    status: 'In Progress',
    due: 'May 02, 2026',
  },
  {
    name: 'Dealer Dashboard System',
    type: 'Dashboard Development',
    client: 'Metro Auto Group',
    progress: '20%',
    status: 'Planning',
    due: 'Jun 15, 2026',
  },
  {
    name: 'Marketing Campaign',
    type: 'Digital Marketing',
    client: 'Acme Industries',
    progress: '90%',
    status: 'Review',
    due: 'Mar 10, 2026',
  },
]

const statusStyles: Record<string, string> = {
  'In Progress': 'bg-blue-500/20 text-blue-300',
  Planning: 'bg-amber-500/20 text-amber-300',
  Review: 'bg-purple-500/20 text-purple-300',
}

export default function AdminProjectsPanel() {
  const navigate = useNavigate()
  const activeCount = projects.filter((p) => p.status === 'In Progress').length
  const planningCount = projects.filter((p) => p.status === 'Planning').length
  const reviewCount = projects.filter((p) => p.status === 'Review').length

  return (
    <OwnerAdminShell
      title="Projects"
      subtitle="Manage active client projects, timelines, and delivery status."
    >
      <section className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Projects', value: projects.length },
          { label: 'In Progress', value: activeCount },
          { label: 'In Review', value: reviewCount },
          { label: 'Planning', value: planningCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <OwnerPanel title="All Projects" actionLabel="Back to dashboard" onActionClick={() => navigate('/admin')}>
        <div className="space-y-3">
          {projects.map(({ name, type, client, progress, status, due }) => (
            <div
              key={name}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{name}</p>
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-xs ${statusStyles[status] ?? 'bg-white/10 text-slate-300'}`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{type}</p>
                  <p className="mt-1 text-xs text-slate-500">Client: {client}</p>
                </div>

                <div className="flex flex-col gap-2 sm:w-48">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{progress}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: progress }} />
                  </div>
                  <p className="text-xs text-slate-500">Due {due}</p>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </OwnerPanel>
    </OwnerAdminShell>
  )
}
