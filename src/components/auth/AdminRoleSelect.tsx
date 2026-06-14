import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import {
  ADMIN_ROLES,
  adminRoleBadgeStyles,
  adminRoleBadgeStylesSignIn,
} from '../../lib/adminRoles'
import type { AdminRole } from '../../lib/adminUsers'

type AdminRoleSelectProps = {
  value: AdminRole
  onChange: (role: AdminRole) => void
  id?: string
  variant?: 'signin' | 'portal'
  className?: string
}

export default function AdminRoleSelect({
  value,
  onChange,
  id,
  variant = 'portal',
  className = '',
}: AdminRoleSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const badgeStyles =
    variant === 'signin' ? adminRoleBadgeStylesSignIn : adminRoleBadgeStyles

  const triggerClass =
    variant === 'signin'
      ? 'w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#0080ff]/50'
      : 'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500/50'

  const menuClass =
    variant === 'signin'
      ? 'absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-lg border border-white/[0.1] bg-[#0a0e14]/95 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md'
      : 'absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-lg border border-white/10 bg-[#0a1424] shadow-xl'

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={`${triggerClass} flex items-center justify-between gap-2`}
      >
        <span
          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeStyles[value]}`}
        >
          {value}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul id={listId} role="listbox" className={menuClass}>
          {ADMIN_ROLES.map((role) => {
            const selected = role === value
            return (
              <li key={role} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(role)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition ${
                    selected
                      ? 'bg-white/[0.06] text-white'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeStyles[role]}`}
                  >
                    {role}
                  </span>
                  {selected && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-blue-300">
                      Selected
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
