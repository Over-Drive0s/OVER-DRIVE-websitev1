import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ADMIN_ROLES,
  adminRoleBadgeStyles,
  type ProfileRoleFilter,
} from '../../lib/adminRoles'

type ProfileRoleFilterSelectProps = {
  value: ProfileRoleFilter
  onChange: (value: ProfileRoleFilter) => void
  id?: string
  className?: string
  compact?: boolean
}

const allProfilesStyle =
  'bg-slate-500/20 text-slate-300 ring-slate-400/30'

export default function ProfileRoleFilterSelect({
  value,
  onChange,
  id,
  className = '',
  compact = false,
}: ProfileRoleFilterSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 })

  const triggerClass = compact
    ? 'w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-2 pr-8 text-xs text-white outline-none transition focus:border-blue-500/50'
    : 'w-full min-w-[12rem] max-w-xs rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-3 pr-9 text-sm text-white outline-none transition focus:border-blue-500/50'

  const menuClass =
    'fixed z-[80] overflow-hidden rounded-lg border border-white/10 bg-[#0a1424] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md'

  const options: { value: ProfileRoleFilter; label: string; style: string }[] = [
    { value: 'all', label: 'All profiles', style: allProfilesStyle },
    ...ADMIN_ROLES.map((role) => ({
      value: role,
      label: role,
      style: adminRoleBadgeStyles[role],
    })),
  ]

  const selected = options.find((option) => option.value === value) ?? options[0]

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, compact ? 168 : 192),
    })
  }, [compact])

  useLayoutEffect(() => {
    if (!open) return
    updateMenuPosition()
  }, [open, updateMenuPosition])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const handleReposition = () => updateMenuPosition()

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown)
    }, 0)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [open, updateMenuPosition])

  const menu = open
    ? createPortal(
        <ul
          id={listId}
          ref={menuRef}
          role="listbox"
          className={menuClass}
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left transition ${
                    compact ? 'px-2' : 'px-3 py-2.5'
                  } ${
                    isSelected
                      ? 'bg-white/[0.06] text-white'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <span
                    className={`inline-flex max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      compact ? 'text-[10px]' : ''
                    } ${option.style}`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check
                      size={14}
                      className="shrink-0 text-blue-300"
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>,
        document.body,
      )
    : null

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={`${triggerClass} relative flex w-full items-center text-left`}
      >
        <span
          className={`inline-flex max-w-full truncate rounded-md px-2 py-0.5 font-medium ring-1 ring-inset ${
            compact ? 'text-[10px]' : 'text-xs'
          } ${selected.style}`}
        >
          {selected.label}
        </span>
        <ChevronDown
          size={compact ? 14 : 16}
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {menu}
    </div>
  )
}
