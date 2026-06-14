import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CTASectionProps {
  title: string
  description: string
  primaryLabel: string
  primaryTo?: string
  secondaryLabel?: string
  secondaryTo?: string
}

export default function CTASection({
  title,
  description,
  primaryLabel,
  primaryTo = '/request-demo',
  secondaryLabel,
  secondaryTo,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="glow-blue rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-14 text-center backdrop-blur-sm md:px-16">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/55">{description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={primaryTo}
              className="inline-flex items-center gap-3 rounded-md bg-[#0080ff] px-8 py-4 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              {primaryLabel} <ArrowUpRight size={16} />
            </Link>
            {secondaryLabel && secondaryTo && (
              <Link
                to={secondaryTo}
                className="inline-flex items-center gap-3 px-6 py-4 text-sm font-medium text-white transition-colors hover:text-white/80"
              >
                {secondaryLabel} <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
