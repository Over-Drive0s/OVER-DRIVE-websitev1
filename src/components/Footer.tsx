import { Link } from 'react-router-dom'
import { SITE_COPYRIGHT, SITE_DOMAIN, SITE_NAME, SITE_URL } from '../config/site'

const links = [
  { label: 'Platform', to: '/platform' },
  { label: 'Systems', to: '/systems' },
  { label: 'Company', to: '/company' },
  { label: 'Request Demo', to: '/request-demo' },
]

export default function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={`shrink-0 border-t border-white/[0.06] bg-[#050607] px-6 py-5 ${
        compact ? '' : 'mt-auto'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">{SITE_NAME}</p>
          <a
            href={SITE_URL}
            className="mt-0.5 block text-xs text-white/45 transition-colors hover:text-white"
          >
            {SITE_DOMAIN}
          </a>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/40">
            Operational software consulting and engineering.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-1.5">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs text-white/45 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-white/30 sm:text-right">
          © {new Date().getFullYear()} {SITE_COPYRIGHT}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
