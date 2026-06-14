import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Loader2,
  Monitor,
  Rocket,
  Search,
  Server,
  Shield,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformBackground from '../components/PlatformBackground'
import {
  linkedSystems,
  systemMatchesCategory,
  systemsPortfolio,
  type DeploymentCategory,
  type SystemPortfolioItem,
} from '../data/systemsPortfolio'

type CategoryId = 'all' | DeploymentCategory

type ProjectStatus = 'live' | 'template'

interface DeploymentProject extends SystemPortfolioItem {
  status: ProjectStatus
  tag: string
}

const categories: { id: CategoryId; label: string; icon: typeof Globe }[] = [
  { id: 'all', label: 'All Projects', icon: Sparkles },
  { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard },
  { id: 'websites', label: 'Websites', icon: Globe },
  { id: 'admin', label: 'Admin Panels', icon: Shield },
]

const projects: DeploymentProject[] = [...linkedSystems, ...systemsPortfolio.filter((s) => !s.externalUrl)].map(
  (system) => ({
    ...system,
    status: system.externalUrl ? ('live' as const) : ('template' as const),
    tag: system.type,
  }),
)

const portfolioStats = [
  { value: '7', label: 'Systems built', color: 'text-[#ccff00]' },
  { value: '5', label: 'Live demos', color: 'text-[#0080ff]' },
  { value: '3', label: 'Websites', color: 'text-[#ccff00]' },
  { value: '99.9%', label: 'Uptime SLA', color: 'text-[#0080ff]' },
]

const deploySteps = [
  'Provisioning environment',
  'Loading project assets',
  'Connecting integrations',
  'Demo environment ready',
]

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles = {
    live: 'border-[#ccff00]/40 bg-[#ccff00]/15 text-[#ccff00]',
    template: 'border-white/20 bg-white/[0.06] text-white/60',
  }
  const labels = { live: 'Live', template: 'Coming Soon' }

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function openLiveDemo(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function DeployPreviewPanel({
  project,
  onDeploy,
  onViewDetails,
}: {
  project: DeploymentProject
  onDeploy: () => void
  onViewDetails: () => void
}) {
  const accentClass = project.accent === 'lime' ? 'text-[#ccff00]' : 'text-[#0080ff]'

  return (
    <div className="relative w-full">
      <div className="absolute -inset-4 rounded-full bg-[#0080ff]/[0.06] blur-[50px]" />
      <div className="glow-brand relative overflow-hidden rounded-2xl border border-white/10 bg-[#080a0f]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,128,255,0.12),transparent_55%)]" />

        <div className="relative p-5 lg:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Live project preview
            </p>
            <StatusBadge status={project.status} />
          </div>

          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#050607]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-red-400/70" />
              <span className="h-2 w-2 rounded-full bg-amber-400/70" />
              <span className="h-2 w-2 rounded-full bg-[#ccff00]/70" />
              <span className="ml-2 truncate text-[10px] text-white/35">{project.preview.label}</span>
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-black">
                    <img
                      src={project.logo}
                      alt={project.logoAlt}
                      className={`max-h-[80%] max-w-[80%] object-contain ${project.logoClassName ?? ''}`}
                    />
                  </div>
                  <p className="text-sm font-semibold text-white">{project.name}</p>
                </div>
                <Monitor size={14} className="shrink-0 text-white/25" />
              </div>
              {project.preview.lines.map((line) => (
                <div
                  key={line}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white/50"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0080ff]" />
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div key={project.id} className="mt-5 animate-fade-up">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]/70">
              {project.tag}
            </span>
            <h3 className="mt-1 text-lg font-semibold text-white">{project.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/45">{project.description}</p>

            <ul className="mt-4 space-y-1.5">
              {project.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-white/55">
                  <ChevronRight size={12} className="shrink-0 text-[#0080ff]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <div>
                <p className={`text-xl font-semibold ${accentClass}`}>{project.metric.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/35">{project.metric.label}</p>
              </div>
              <button
                type="button"
                onClick={onViewDetails}
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#0080ff] transition hover:text-white"
              >
                Full details
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onDeploy}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
              >
                <Rocket size={15} />
                {project.externalUrl ? 'Open Live Demo' : 'Deploy Live Demo'}
              </button>
              <Link
                to="/request-demo"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition-all duration-200 hover:bg-white hover:text-black"
              >
                Request Similar Build
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeployModal({
  project,
  onClose,
}: {
  project: DeploymentProject
  onClose: () => void
}) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (step >= deploySteps.length) {
      setDone(true)
      return
    }

    const timer = window.setTimeout(() => setStep((s) => s + 1), 900)
    return () => window.clearTimeout(timer)
  }, [step])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#06080c] shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-[#0080ff]" />
            <p className="text-sm font-semibold text-white">Deploying demo</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close deploy modal"
            className="rounded-lg border border-white/10 p-1.5 text-white/50 transition hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-white/40">{project.name}</p>
          <p className="mt-1 text-base font-semibold text-white">
            {done ? 'Demo environment ready' : deploySteps[Math.min(step, deploySteps.length - 1)]}
          </p>

          <div className="mt-5 space-y-3">
            {deploySteps.map((label, index) => {
              const complete = done || index < step
              const active = !done && index === step

              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                    complete
                      ? 'border-[#ccff00]/25 bg-[#ccff00]/[0.06] text-white/70'
                      : active
                        ? 'border-[#0080ff]/30 bg-[#0080ff]/[0.06] text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/30'
                  }`}
                >
                  {complete ? (
                    <CheckCircle2 size={16} className="shrink-0 text-[#ccff00]" />
                  ) : active ? (
                    <Loader2 size={16} className="shrink-0 animate-spin text-[#0080ff]" />
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px]">
                      {index + 1}
                    </span>
                  )}
                  {label}
                </div>
              )
            })}
          </div>

          {done && (
            <div className="mt-5 flex flex-col gap-2">
              {project.externalUrl ? (
                <button
                  type="button"
                  onClick={() => openLiveDemo(project.externalUrl!)}
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                >
                  Open Live Demo
                  <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ) : (
                <Link
                  to="/request-demo"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                >
                  Request early access
                </Link>
              )}
              <Link
                to="/request-demo"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md border border-white/10 px-4 py-2.5 text-sm text-white/50 transition-all duration-200 hover:bg-white hover:text-black"
              >
                Request a custom deployment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectDetailDrawer({
  project,
  onClose,
  onDeploy,
}: {
  project: DeploymentProject
  onClose: () => void
  onDeploy: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85%] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#080a0e] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-white/[0.08] bg-[#080a0e]/95 px-6 py-5 backdrop-blur-sm">
          <div>
            <StatusBadge status={project.status} />
            <h2 className="mt-2 text-xl font-semibold text-white">{project.name}</h2>
            <p className="text-sm text-white/40">{project.type} · {project.tag}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-white/50 transition hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <p className="text-sm leading-relaxed text-white/55">{project.description}</p>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Capabilities</p>
            <ul className="mt-3 space-y-2">
              {project.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle2 size={14} className="text-[#0080ff]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">Key metric</p>
              <p className={`mt-1 text-2xl font-semibold ${project.accent === 'lime' ? 'text-[#ccff00]' : 'text-[#0080ff]'}`}>
                {project.metric.value}
              </p>
              <p className="text-xs text-white/40">{project.metric.label}</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/35">System type</p>
              <p className="mt-2 text-sm font-medium text-white/70">{project.type}</p>
              {project.externalUrl && (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#0080ff] transition hover:text-white"
                >
                  Open live demo
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {project.externalUrl ? (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  openLiveDemo(project.externalUrl!)
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
              >
                <ExternalLink size={15} />
                Open Live Demo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onDeploy()
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0080ff] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
              >
                <Rocket size={15} />
                Deploy Live Demo
              </button>
            )}
            <Link
              to="/request-demo"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-white/10 px-4 py-2.5 text-sm text-white/50 transition-all duration-200 hover:bg-white hover:text-black"
            >
              Request Similar Build
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function PortfolioProjectRow({
  project,
  isExpanded,
  isSelected,
  onToggle,
  onDeploy,
}: {
  project: DeploymentProject
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onDeploy: () => void
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'border-[#0080ff]/40 bg-[#0080ff]/[0.06] shadow-[0_0_20px_rgba(0,128,255,0.08)]'
          : 'border-white/[0.08] bg-white/[0.02] hover:border-[#0080ff]/20'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="group flex w-full items-center gap-3 px-4 py-3 text-left sm:gap-4 sm:px-5 sm:py-3.5"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border sm:h-10 sm:w-10 ${
            isSelected ? 'border-[#0080ff]/30 bg-black' : 'border-white/[0.08] bg-black'
          }`}
        >
          <img
            src={project.logo}
            alt={project.logoAlt}
            className={`max-h-[80%] max-w-[80%] object-contain ${project.logoClassName ?? ''}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="truncate text-sm font-semibold text-white sm:text-base">{project.name}</h3>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ccff00]/60 sm:text-[11px]">
              {project.tag}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-white/35">{project.type}</p>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className={`text-sm font-semibold ${project.accent === 'lime' ? 'text-[#ccff00]' : 'text-[#0080ff]'}`}>
            {project.metric.value}
          </p>
          <p className="text-[10px] text-white/30">{project.metric.label}</p>
        </div>

        <StatusBadge status={project.status} />

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
            isExpanded
              ? 'border-[#0080ff]/30 bg-[#0080ff]/10'
              : 'border-white/[0.08] bg-white/[0.03] group-hover:border-[#0080ff]/20'
          }`}
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isExpanded ? 'rotate-180 text-[#0080ff]' : 'text-white/50 group-hover:text-[#0080ff]'
            }`}
          />
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
            <p className="text-sm leading-relaxed text-white/45">{project.description}</p>

            <ul className="mt-3 space-y-1.5">
              {project.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-white/55">
                  <ChevronRight size={12} className="shrink-0 text-[#0080ff]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="sm:hidden">
                <p className={`text-base font-semibold ${project.accent === 'lime' ? 'text-[#ccff00]' : 'text-[#0080ff]'}`}>
                  {project.metric.value}
                </p>
                <p className="text-[10px] text-white/30">{project.metric.label}</p>
              </div>

              {project.externalUrl ? (
                <button
                  type="button"
                  onClick={() => openLiveDemo(project.externalUrl!)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#0080ff] px-3 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-black"
                >
                  <ExternalLink size={12} />
                  Open live demo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onDeploy}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#0080ff]/10 px-3 py-2 text-xs font-medium text-[#0080ff] transition hover:bg-[#0080ff] hover:text-white"
                >
                  <Rocket size={12} />
                  Deploy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Deployments() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [selectedId, setSelectedId] = useState(projects[0].id)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deployTarget, setDeployTarget] = useState<DeploymentProject | null>(null)
  const [detailTarget, setDetailTarget] = useState<DeploymentProject | null>(null)

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === 'all' || systemMatchesCategory(project.type, activeCategory)
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query) ||
        project.tag.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const selectedProject =
    filteredProjects.find((p) => p.id === selectedId) ??
    projects.find((p) => p.id === selectedId) ??
    filteredProjects[0] ??
    projects[0]

  useEffect(() => {
    if (!filteredProjects.some((p) => p.id === selectedId) && filteredProjects[0]) {
      setSelectedId(filteredProjects[0].id)
    }
  }, [filteredProjects, selectedId])

  return (
    <div
      data-scroll-root
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#050607]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
      <div className="relative flex min-h-0 shrink-0 flex-col border-b border-white/[0.06] lg:min-h-[52%]">
        <PlatformBackground />

        <section className="relative mx-auto grid h-full min-h-0 max-w-7xl gap-8 px-6 pb-5 pt-6 lg:grid-cols-[42%_58%] lg:items-center lg:gap-8 lg:pb-5 lg:pt-8">
          <div className="z-10 flex flex-col justify-center">
            <div className="mb-5">
              <div className="mb-3 h-px w-8 bg-[#0080ff]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0080ff]">
                Deployments
              </p>
            </div>

            <h1 className="max-w-lg text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white lg:text-[2.85rem]">
              Our portfolio,{' '}
              <span className="text-[#0080ff]">ready to deploy</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-[1.7] text-white/50">
              Browse websites, dashboards, and operational systems we've designed and built.
              Deploy live demos instantly — or request a custom version for your business.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setDeployTarget(selectedProject)}
                className="group inline-flex items-center gap-2 rounded-md bg-[#0080ff] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
              >
                <Rocket size={15} />
                {selectedProject.externalUrl ? 'Open live demo' : 'Deploy selected demo'}
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <Link
                to="/request-demo"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/60 transition-all duration-200 hover:bg-white hover:text-black"
              >
                Request custom build
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {portfolioStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/[0.08] bg-[#080a0e]/80 px-3 py-2.5 backdrop-blur-sm transition-colors hover:border-[#0080ff]/30"
                >
                  <p className={`text-base font-semibold lg:text-lg ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex min-h-0 items-center">
            <DeployPreviewPanel
              project={selectedProject}
              onDeploy={() => setDeployTarget(selectedProject)}
              onViewDetails={() => setDetailTarget(selectedProject)}
            />
          </div>
        </section>
      </div>

      <section className="relative shrink-0 border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-cross-pattern opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-6 lg:py-7">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ccff00]/70">
                Portfolio
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white lg:text-[1.75rem]">
                Browse & <span className="text-[#0080ff]">deploy</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/40">
                Expand a project to see details. Click a row to preview it in the hero panel.
              </p>
            </div>

            <div className="relative w-full max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#0080ff]/40 focus:ring-1 focus:ring-[#0080ff]/20"
              />
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {categories.map(({ id, label, icon: Icon }) => {
              const isActive = activeCategory === id
              const count =
                id === 'all'
                  ? projects.length
                  : projects.filter((p) => systemMatchesCategory(p.type, id)).length

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition-all ${
                    isActive
                      ? 'border-[#0080ff]/40 bg-[#0080ff]/15 text-[#0080ff] shadow-[0_0_16px_rgba(0,128,255,0.15)]'
                      : 'border-white/[0.08] bg-white/[0.03] text-white/45 hover:border-[#0080ff]/25 hover:text-white'
                  }`}
                >
                  <Icon size={13} strokeWidth={1.5} />
                  {label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-[#0080ff]/20' : 'bg-white/[0.06]'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            {filteredProjects.map((project) => {
              const isExpanded = expandedId === project.id
              const isSelected = selectedId === project.id

              return (
                <PortfolioProjectRow
                  key={project.id}
                  project={project}
                  isExpanded={isExpanded}
                  isSelected={isSelected}
                  onToggle={() => {
                    setSelectedId(project.id)
                    setExpandedId((current) => (current === project.id ? null : project.id))
                  }}
                  onDeploy={() => setDeployTarget(project)}
                />
              )
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
              <p className="text-sm text-white/50">No projects match your search.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('all')
                }}
                className="mt-3 text-sm text-[#0080ff] transition hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
      </div>

      {deployTarget && (
        <DeployModal project={deployTarget} onClose={() => setDeployTarget(null)} />
      )}
      {detailTarget && (
        <ProjectDetailDrawer
          project={detailTarget}
          onClose={() => setDetailTarget(null)}
          onDeploy={() => setDeployTarget(detailTarget)}
        />
      )}
    </div>
  )
}
