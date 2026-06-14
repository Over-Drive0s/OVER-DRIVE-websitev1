import { CheckCircle2, ChevronLeft, ChevronRight, PackagePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface NewItemForm {
  sku: string
  name: string
  category: string
  location: string
  qty: number
  reorderAt: number
  unitCostInput: string
  markupPct: number
}

export interface NewInventoryPayload {
  sku: string
  name: string
  category: string
  location: string
  qty: number
  reorderAt: number
  unitCost: number
}

interface AddInventoryModalProps {
  open: boolean
  onClose: () => void
  onAdd: (payload: NewInventoryPayload) => void
  lightMode?: boolean
}

const STEPS = [
  { id: 1, title: 'Product', hint: 'SKU & catalog details' },
  { id: 2, title: 'Pricing', hint: 'Cost & markup' },
  { id: 3, title: 'Stock', hint: 'Quantity & reorder' },
] as const

const emptyForm: NewItemForm = {
  sku: '',
  name: '',
  category: 'Electronics',
  location: '',
  qty: 10,
  reorderAt: 20,
  unitCostInput: '',
  markupPct: 0,
}

function sanitizeMoneyInput(raw: string) {
  let value = raw.replace(/[^\d.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) value = `${parts[0]}.${parts.slice(1).join('')}`
  if (parts[1] && parts[1].length > 2) value = `${parts[0]}.${parts[1].slice(0, 2)}`
  return value
}

function parseMoneyInput(raw: string) {
  const parsed = Number.parseFloat(sanitizeMoneyInput(raw))
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoneyDisplay(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function AddInventoryModal({ open, onClose, onAdd, lightMode = false }: AddInventoryModalProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<NewItemForm>(emptyForm)

  const unitCost = parseMoneyInput(form.unitCostInput)
  const retailPrice = unitCost * (1 + form.markupPct / 100)
  const markupAmount = retailPrice - unitCost

  useEffect(() => {
    if (!open) return
    setStep(1)
    setForm(emptyForm)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const canAdvanceStep1 = form.sku.trim().length > 0 && form.name.trim().length > 0
  const canAdvanceStep2 = unitCost > 0
  const canSubmit = form.qty >= 1 && form.reorderAt >= 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAdvanceStep1 || !canAdvanceStep2 || !canSubmit) return

    onAdd({
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      category: form.category,
      location: form.location.trim() || 'D-01',
      qty: Math.max(1, form.qty),
      reorderAt: Math.max(1, form.reorderAt),
      unitCost: Math.max(0, unitCost),
    })
  }

  return createPortal(
    <div data-inv-theme={lightMode ? 'light' : 'dark'} className="inv-simulator-page">
      <div
        className="inv-add-modal-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-md sm:items-center"
        onClick={onClose}
        role="presentation"
      >
      <div
        className="inv-add-modal w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-inventory-title"
      >
        <div className="inv-add-modal-header">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="inv-add-modal-icon">
                  <PackagePlus size={15} className="text-[#ccff00]" />
                </div>
                <span className="inv-add-modal-badge">ONBOARD</span>
              </div>
              <h3 id="add-inventory-title" className="mt-2 text-base font-semibold tracking-tight text-white">
                Add inventory item
              </h3>
              <p className="mt-1 text-[11px] text-white/40">Step {step} of {STEPS.length} · {STEPS[step - 1]?.hint}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {STEPS.map((s) => {
              const done = step > s.id
              const active = step === s.id
              return (
                <div key={s.id} className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      done ? 'bg-[#ccff00]' : active ? 'bg-[#0080ff]' : 'bg-white/[0.08]'
                    }`}
                  />
                  <div className="flex items-center gap-1">
                    {done ? (
                      <CheckCircle2 size={10} className="shrink-0 text-[#ccff00]" />
                    ) : (
                      <span
                        className={`font-mono text-[9px] font-bold ${active ? 'text-[#0080ff]' : 'text-white/25'}`}
                      >
                        0{s.id}
                      </span>
                    )}
                    <span className={`truncate text-[9px] font-semibold uppercase tracking-wider ${active ? 'text-white/70' : 'text-white/30'}`}>
                      {s.title}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="inv-add-modal-body">
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <label className="inv-add-field">
                  <span className="inv-add-label">SKU</span>
                  <input
                    required
                    autoFocus
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="OD-7001"
                    className="inv-input font-mono uppercase"
                  />
                </label>
                <label className="inv-add-field">
                  <span className="inv-add-label">Location</span>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="A-01"
                    className="inv-input font-mono"
                  />
                </label>
              </div>
              <label className="inv-add-field">
                <span className="inv-add-label">Product name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Widget assembly"
                  className="inv-input"
                />
              </label>
              <label className="inv-add-field">
                <span className="inv-add-label">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="inv-input inv-select"
                >
                  <option>Electronics</option>
                  <option>Hardware</option>
                  <option>Supplies</option>
                </select>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <label className="inv-add-field">
                <span className="inv-add-label">Unit cost</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">$</span>
                  <input
                    autoFocus
                    inputMode="decimal"
                    value={form.unitCostInput}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, unitCostInput: sanitizeMoneyInput(e.target.value) }))
                    }
                    onBlur={() =>
                      setForm((f) => ({
                        ...f,
                        unitCostInput:
                          f.unitCostInput === '' ? '' : parseMoneyInput(f.unitCostInput).toFixed(2),
                      }))
                    }
                    placeholder="0.00"
                    className="inv-input pl-7 tabular-nums placeholder:text-white/25"
                  />
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="inv-add-field">
                  <span className="inv-add-label">Markup %</span>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={999}
                      step={0.1}
                      value={form.markupPct}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, markupPct: Math.max(0, Number(e.target.value) || 0) }))
                      }
                      className="inv-input pr-7 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">%</span>
                  </div>
                </label>
                <div className="inv-add-field">
                  <span className="inv-add-label">Retail price</span>
                  <div className="inv-add-retail-preview">
                    <p className="text-sm font-semibold tabular-nums text-[#ccff00]">
                      {formatMoneyDisplay(retailPrice)}
                    </p>
                    <p className="text-[10px] tabular-nums text-white/35">
                      +{formatMoneyDisplay(markupAmount)} markup
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <label className="inv-add-field">
                  <span className="inv-add-label">Quantity</span>
                  <input
                    autoFocus
                    type="number"
                    min={1}
                    value={form.qty}
                    onChange={(e) => setForm((f) => ({ ...f, qty: Math.max(1, Number(e.target.value) || 1) }))}
                    className="inv-input tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </label>
                <label className="inv-add-field">
                  <span className="inv-add-label">Reorder at</span>
                  <input
                    type="number"
                    min={1}
                    value={form.reorderAt}
                    onChange={(e) => setForm((f) => ({ ...f, reorderAt: Math.max(1, Number(e.target.value) || 1) }))}
                    className="inv-input tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </label>
              </div>

              <div className="inv-add-summary">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Review</p>
                <dl className="mt-2 space-y-1.5 text-[11px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/45">SKU</dt>
                    <dd className="font-mono font-semibold text-[#ccff00]/90">{form.sku.trim().toUpperCase() || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/45">Product</dt>
                    <dd className="truncate font-medium text-white">{form.name.trim() || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/45">On-hand value</dt>
                    <dd className="font-mono tabular-nums text-white">{formatMoneyDisplay(unitCost * form.qty)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inv-add-btn-secondary flex-1"
              >
                <ChevronLeft size={14} />
                Back
              </button>
            ) : (
              <button type="button" onClick={onClose} className="inv-add-btn-secondary flex-1">
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 ? !canAdvanceStep1 : !canAdvanceStep2}
                onClick={() => setStep((s) => s + 1)}
                className="inv-btn-lime flex-1 justify-center py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className="inv-btn-lime flex-1 justify-center py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add to catalog
              </button>
            )}
          </div>
        </form>
      </div>
      </div>
    </div>,
    document.body,
  )
}
