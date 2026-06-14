import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'

const navLinks = [
  { label: 'Platform', to: '/platform' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Systems', to: '/systems' },
  { label: 'Deployments', to: '/deployments' },
  { label: 'Company', to: '/company' },
]

function NavItem({
  to,
  label,
  onClick,
  mobile = false,
}: {
  to: string
  label: string
  onClick?: () => void
  mobile?: boolean
}) {
  if (mobile) {
    return (
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          `group flex items-center justify-between px-4 py-3.5 text-sm transition-all duration-200 ${
            isActive
              ? 'text-[#ccff00] [text-shadow:0_0_10px_rgba(204,255,0,0.55),0_0_22px_rgba(204,255,0,0.22)]'
              : 'text-white/60 hover:text-[#ccff00] hover:[text-shadow:0_0_8px_rgba(204,255,0,0.4),0_0_16px_rgba(204,255,0,0.15)]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="font-medium">{label}</span>
            <span className="flex items-center gap-2">
              {isActive && (
                <span className="h-1.5 w-1.5 animate-pulse-brand rounded-full bg-[#ccff00]" />
              )}
              <ArrowUpRight
                size={14}
                className={`transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                  isActive ? 'text-[#ccff00]' : 'text-white/25 group-hover:text-[#ccff00]/80'
                }`}
              />
            </span>
          </>
        )}
      </NavLink>
    )
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative px-1 py-2 text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? 'text-[#ccff00] [text-shadow:0_0_10px_rgba(204,255,0,0.55),0_0_22px_rgba(204,255,0,0.22)]'
            : 'text-white/50 hover:text-[#ccff00] hover:[text-shadow:0_0_8px_rgba(204,255,0,0.4),0_0_16px_rgba(204,255,0,0.15)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.75),0_0_18px_rgba(204,255,0,0.35)]" />
          )}
          {!isActive && (
            <span className="absolute inset-x-2 -bottom-0.5 h-px scale-x-0 rounded-full bg-[#ccff00]/60 shadow-[0_0_6px_rgba(204,255,0,0.55),0_0_12px_rgba(204,255,0,0.25)] transition-transform duration-200 group-hover:scale-x-100" />
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050607]/85 backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#0080ff]/30 to-transparent"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" aria-hidden="true" />

      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 lg:h-[5.25rem]">
        <Logo size="md" onClick={() => setMobileOpen(false)} />

        <nav className="hidden items-center gap-10 lg:flex xl:gap-14">
          {navLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </nav>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/adminlogin"
            className="text-[13px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
          >
            Admin
          </Link>
          <Link
            to="/request-demo"
            className="group flex items-center gap-1.5 rounded-md bg-[#0080ff] px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98]"
          >
            Request Demo
            <ArrowUpRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <button
          type="button"
          className={`rounded-lg border p-2 transition-all duration-200 md:hidden ${
            mobileOpen
              ? 'border-[#0080ff]/40 bg-[#0080ff]/10 text-[#0080ff]'
              : 'border-white/[0.1] bg-white/[0.03] text-white/70 hover:border-[#0080ff]/30 hover:text-white'
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-white/[0.06] transition-all duration-300 md:hidden ${
          mobileOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
        }`}
      >
        <nav className="relative flex flex-col gap-2 px-6 py-4">
          <div className="pointer-events-none absolute inset-0 bg-cross-pattern opacity-20" aria-hidden="true" />
          {navLinks.map((link) => (
            <NavItem
              key={link.to}
              {...link}
              mobile
              onClick={() => setMobileOpen(false)}
            />
          ))}
          <div className="relative mt-2 grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/adminlogin"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-center text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              Admin
            </Link>
            <Link
              to="/request-demo"
              onClick={() => setMobileOpen(false)}
              className="group flex items-center justify-center gap-1.5 rounded-lg bg-[#0080ff] py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              Request Demo
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
