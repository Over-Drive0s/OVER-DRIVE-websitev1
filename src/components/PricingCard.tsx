import { ArrowUpRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-8 ${
        highlighted
          ? 'border-blue-500/40 bg-white/[0.04]'
          : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div className="mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white">{name}</h3>
        <div className="mt-4 text-3xl font-semibold text-white">{price}</div>
        <p className="mt-3 text-sm leading-7 text-white/50">{description}</p>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-white/55">
            <Check size={16} className="mt-0.5 shrink-0 text-blue-400" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        to="/request-demo"
        className={`inline-flex items-center justify-center gap-2 rounded px-6 py-4 text-sm font-medium transition-all duration-200 ${
          highlighted
            ? 'bg-[#0080ff] text-white hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)]'
            : 'border border-white/20 text-white hover:bg-white hover:text-black'
        }`}
      >
        Request Quote <ArrowUpRight size={16} />
      </Link>
    </div>
  )
}
