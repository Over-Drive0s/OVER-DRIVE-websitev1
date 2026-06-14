/** Light-mode master admin shell — /admin only. */
import { SITE_COPYRIGHT } from '../../config/site'
import { Bell, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOutAdmin } from '../../lib/adminUsers'
import { ownerAdminNav } from './ownerAdminNav'

export function MasterPanel({
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
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {actionLabel}
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function MasterLogoHeader({
  subtitleClassName = 'mt-2 text-xs tracking-[0.4em] text-blue-600',
}: {
  subtitleClassName?: string
}) {
  return (
    <div>
      <Link to="/admin" className="block transition-opacity hover:opacity-90">
        <img
          src="/overdrive-logo.png"
          alt="Overdrive IO"
          className="w-full max-w-[242px] h-auto object-contain object-left"
        />
      </Link>
      <div className={subtitleClassName}>MASTER ADMIN</div>
    </div>
  )
}

function MasterToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex w-full min-w-[220px] max-w-[330px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
      <button
        type="button"
        className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:bg-slate-50"
      >
        <Bell size={20} className="text-slate-700" />
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white">3</span>
      </button>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-orange-400" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Master Admin</p>
          <p className="text-xs text-slate-500">Owner</p>
        </div>
      </div>
    </div>
  )
}

export default function MasterAdminShell({
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
  const chromeBg = 'border-slate-200 bg-white'

  return (
    <div className="relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-slate-50 text-slate-900">
      <div className="relative z-10 flex h-full min-h-0 w-full flex-col">
        <div className={`flex items-center justify-between border-b px-6 py-4 lg:hidden ${chromeBg}`}>
          <MasterLogoHeader subtitleClassName="mt-1 text-[10px] tracking-[0.35em] text-blue-600" />
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Menu
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className={`hidden w-[290px] shrink-0 flex-col border-r p-6 lg:flex ${chromeBg}`}>
            <div className="mb-8 shrink-0">
              <MasterLogoHeader />
            </div>

            <nav className="mt-10 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {ownerAdminNav.map(({ label, icon: Icon, to, signOut }, i) => {
                const isRouteActive = to && !signOut && pathname === to
                const isButtonActive = !to && activeNav === i
                const navItemClass = `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                  isRouteActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <p className="mt-4 shrink-0 text-xs text-slate-400">
              © 1999–{new Date().getFullYear()} {SITE_COPYRIGHT}
            </p>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                <p className="text-slate-500">{subtitle}</p>
              </div>
              <MasterToolbar />
            </header>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
