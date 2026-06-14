import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function parseIsoDate(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(value: string): string {
  const parsed = parseIsoDate(value)
  if (!parsed) return 'Select due date'
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PortalDatePicker({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const suppressToggleRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => parseIsoDate(value) ?? new Date())
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0 })

  const updateCalendarPosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    setCalendarPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }

  useEffect(() => {
    if (!open) return
    updateCalendarPosition()

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || calendarRef.current?.contains(target)) return
      setOpen(false)
    }

    const onReposition = () => updateCalendarPosition()

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', onPointerDown)
    }, 0)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open, viewMonth])

  useEffect(() => {
    if (value) {
      const parsed = parseIsoDate(value)
      if (parsed) setViewMonth(parsed)
    }
  }, [value])

  const selectDate = (iso: string) => {
    suppressToggleRef.current = true
    onChange(iso)
    setOpen(false)
    window.setTimeout(() => {
      suppressToggleRef.current = false
    }, 0)
  }

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: { iso: string; day: number; inMonth: boolean }[] = []

    for (let i = 0; i < startOffset; i += 1) {
      const date = new Date(year, month, -startOffset + i + 1)
      cells.push({ iso: toIsoDate(date), day: date.getDate(), inMonth: false })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day)
      cells.push({ iso: toIsoDate(date), day, inMonth: true })
    }

    while (cells.length % 7 !== 0) {
      const nextIndex = cells.length - startOffset - daysInMonth + 1
      const date = new Date(year, month + 1, nextIndex)
      cells.push({ iso: toIsoDate(date), day: date.getDate(), inMonth: false })
    }

    return cells
  }, [viewMonth])

  const monthLabel = viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const calendarPanel = open
    ? createPortal(
        <div
          ref={calendarRef}
          className="rounded-xl border border-white/10 bg-[#0a1628] p-4 shadow-2xl"
          style={{
            position: 'fixed',
            top: calendarPosition.top,
            left: calendarPosition.left,
            width: Math.max(calendarPosition.width, 280),
            zIndex: 200,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium">{monthLabel}</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ iso, day, inMonth }) => {
              const isSelected = value === iso
              return (
                <button
                  key={`${iso}-${day}-${inMonth}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    selectDate(iso)
                  }}
                  className={`rounded-lg py-1.5 text-sm transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : inMonth
                        ? 'text-slate-200 hover:bg-white/10'
                        : 'text-slate-600 hover:bg-white/5'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          if (suppressToggleRef.current) return
          if (!open) {
            updateCalendarPosition()
            setOpen(true)
          } else {
            setOpen(false)
          }
        }}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition hover:border-white/20 focus:border-blue-500/50"
      >
        <span className={value ? 'text-white' : 'text-slate-500'}>{formatDisplay(value)}</span>
        <Calendar size={16} className="shrink-0 text-slate-400" />
      </button>
      {calendarPanel}
    </div>
  )
}
