/** Exclusive owner shell — /admin, /adminprojects, /adminprofiles only. */
import { SITE_COPYRIGHT } from '../../config/site'
import { Bell, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOutAdmin } from '../../lib/adminUsers'
import { ownerAdminNav } from './ownerAdminNav'

export function OwnerPanel({
  title,
  className = '',
  children,
  actionLabel = 'View all',
  onActionClick,
}: {
  title: string
  className?: string
  children: ReactNode
  actionLabel?: string
  onActionClick?: () => void
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            {actionLabel}
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function AdminLogoHeader({
  subtitleClassName = 'mt-2 text-xs tracking-[0.4em] text-blue-400',
}: {
  subtitleClassName?: string
}) {
  return (
    <div>
      <Link to="/clientportal" className="block transition-opacity hover:opacity-90">
        <img
          src="/overdrive-logo.png"
          alt="Overdrive IO"
          className="w-full max-w-[242px] h-auto object-contain object-left"
        />
      </Link>
      <div className={subtitleClassName}>ADMIN</div>
    </div>
  )
}

function OwnerToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex w-full min-w-[220px] max-w-[330px] flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>
      <button
        type="button"
        className="relative rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
      >
        <Bell size={20} />
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs">3</span>
      </button>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-orange-400" />
        <div>
          <p className="text-sm font-semibold">Admin</p>
          <p className="text-xs text-slate-400">Administrator</p>
        </div>
      </div>
    </div>
  )
}

export default function OwnerAdminShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  const [activeNav, setActiveNav] = useState(0)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const chromeBg = 'border-white/12 bg-[#152238]/85 backdrop-blur-sm'

  return (
    <div className="relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-[#101d32] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-admin-glow-grid opacity-45" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(0,148,255,0.28),transparent_55%)]"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_100%,rgba(0,128,255,0.12),transparent_60%)]"
        />
      </div>

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col">
        <div className={`flex items-center justify-between border-b px-6 py-4 lg:hidden ${chromeBg}`}>
          <AdminLogoHeader subtitleClassName="mt-1 text-[10px] tracking-[0.35em] text-blue-400" />
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold"
          >
            Menu
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className={`hidden w-[290px] shrink-0 flex-col border-r p-6 lg:flex ${chromeBg}`}>
            <div className="mb-8 shrink-0">
              <AdminLogoHeader />
            </div>

            <nav className="mt-10 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {ownerAdminNav.map(({ label, icon: Icon, to, signOut }, i) => {
                const isRouteActive = to && !signOut && pathname === to
                const isButtonActive = !to && activeNav === i
                const navItemClass = `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                  isRouteActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`

                if (to && signOut) {
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        signOutAdmin()
                        navigate(to)
                      }}
                      className={navItemClass}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  )
                }

                if (to) {
                  return (
                    <Link key={label} to={to} className={navItemClass}>
                      <Icon size={18} />
                      {label}
                    </Link>
                  )
                }

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveNav(i)}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                      isButtonActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <p className="mt-4 shrink-0 text-xs text-slate-500">
              © 1999–{new Date().getFullYear()} {SITE_COPYRIGHT}
            </p>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-slate-400">{subtitle}</p>
              </div>
              <OwnerToolbar />
            </header>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
