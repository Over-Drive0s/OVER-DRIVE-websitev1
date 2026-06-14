import type { ReactNode } from 'react'
import { ModuleIllustration, type IllustrationType } from './ModuleIllustrations'

interface PlatformModuleCardProps {
  title: string
  description: string
  illustration: IllustrationType
  icon: ReactNode
  metric: string
  metricLabel: string
  active?: boolean
  compact?: boolean
  slim?: boolean
  onClick?: () => void
}

export default function PlatformModuleCard({
  title,
  description,
  illustration,
  icon,
  metric,
  metricLabel,
  active = false,
  compact = false,
  slim = false,
  onClick,
}: PlatformModuleCardProps) {
  if (slim) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group flex h-full min-h-[208px] w-full flex-col overflow-hidden rounded-xl text-left transition-all duration-300 ${
          active
            ? 'border border-[#0080ff]/40 bg-[#080a0e] glow-brand-blue'
            : 'border border-white/[0.08] bg-[#080a0e] hover:border-[#0080ff]/30 hover:glow-brand-blue'
        }`}
      >
        <div className="relative h-[88px] shrink-0 overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-[#0a1420] to-[#080a0e]">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              active
                ? 'bg-[radial-gradient(ellipse_at_center,rgba(0,128,255,0.14)_0%,transparent_75%)] opacity-100'
                : 'bg-[radial-gradient(ellipse_at_center,rgba(0,128,255,0.06)_0%,transparent_70%)] opacity-60 group-hover:opacity-100'
            }`}
          />
          <div className="absolute inset-0 bg-dot-pattern opacity-25" />
          <div className="relative flex h-full items-center justify-center px-4 py-2">
            <ModuleIllustration type={illustration} active={active} />
          </div>
          {active && <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0080ff]" />}
        </div>

        <div className="flex flex-1 flex-col gap-2 px-3.5 py-3">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-[11px] font-bold uppercase leading-tight tracking-[0.1em] transition-colors ${
                active ? 'text-[#0080ff]' : 'text-white/90 group-hover:text-[#0080ff]'
              }`}
            >
              {title}
            </h3>
            <div className="flex shrink-0 items-center gap-1.5">
              {active && (
                <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
              )}
              <span
                className={`transition-colors ${
                  active ? 'text-[#0080ff]' : 'text-white/25 group-hover:text-[#ccff00]/60'
                }`}
              >
                {icon}
              </span>
            </div>
          </div>

          <p className="text-[14px] font-semibold leading-none text-white">
            {metric}
            <span className="ml-1.5 text-[10px] font-normal uppercase tracking-wider text-[#ccff00]/65">
              {metricLabel}
            </span>
          </p>

          <p className="text-[11px] leading-[1.6] text-white/45">{description}</p>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full flex-col overflow-hidden rounded-xl text-left transition-all duration-300 ${
        active
          ? 'border border-[#0080ff]/40 bg-[#080a0e] glow-brand-blue scale-[1.02]'
          : 'border border-white/[0.08] bg-[#080a0e] hover:border-[#0080ff]/30 hover:glow-brand-blue hover:scale-[1.01]'
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-[#0a1420] to-[#080a0e] ${
          compact ? 'h-28' : 'h-36'
        }`}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            active
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(0,128,255,0.12)_0%,rgba(204,255,0,0.06)_50%,transparent_80%)] opacity-100'
              : 'bg-[radial-gradient(ellipse_at_center,rgba(0,128,255,0.06)_0%,transparent_70%)] opacity-60 group-hover:opacity-100'
          }`}
        />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div
          className={`relative h-full px-4 py-3 transition-transform duration-300 ${
            active ? 'scale-105' : 'group-hover:scale-[1.02]'
          }`}
        >
          <ModuleIllustration type={illustration} active={active} />
        </div>
        {active && (
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0080ff]" />
        )}
      </div>

      <div className={`flex flex-1 flex-col ${compact ? 'px-4 pb-3 pt-2' : 'px-4 pb-4 pt-3'}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3
            className={`text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
              active ? 'text-[#0080ff]' : 'text-white group-hover:text-[#0080ff]'
            }`}
          >
            {title}
          </h3>
          {active && (
            <span className="flex h-1.5 w-1.5 shrink-0 animate-pulse-brand rounded-full bg-[#ccff00]" />
          )}
        </div>

        <div
          className={`mb-2 overflow-hidden transition-all duration-300 ${
            active ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100'
          }`}
        >
          <p className="text-lg font-semibold text-white">{metric}</p>
          <p className="text-[10px] uppercase tracking-wider text-[#ccff00]/70">{metricLabel}</p>
        </div>

        <p
          className={`flex-1 text-[12px] leading-[1.6] text-white/45 ${
            compact ? 'line-clamp-2' : ''
          }`}
        >
          {description}
        </p>
        <div
          className={`mt-3 transition-colors ${active ? 'text-[#0080ff]' : 'text-white/25 group-hover:text-[#ccff00]/60'}`}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}
