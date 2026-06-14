import { CarFront, CheckCircle2, ChevronLeft, ChevronRight, ImagePlus, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  statusLabels,
  type DealerVehicle,
  type ListingPlatform,
} from '../data/dealerDmsData'

export interface UploadedVehiclePhoto {
  id: string
  url: string
  name: string
}

export interface NewDealerVehicleForm {
  vin: string
  stock: string
  year: number
  make: string
  model: string
  trim: string
  color: string
  mileageInput: string
  drive: string
  callForPrice: boolean
  priceInput: string
  status: DealerVehicle['status']
  photos: UploadedVehiclePhoto[]
  listings: ListingPlatform[]
}

interface AddDealerVehicleModalProps {
  open: boolean
  onClose: () => void
  onAdd: (vehicle: DealerVehicle) => void
}

const STEPS = [
  { id: 1, title: 'VIN & stock', hint: 'Identify the unit' },
  { id: 2, title: 'Vehicle', hint: 'Year, make & specs' },
  { id: 3, title: 'Lot & price', hint: 'Status & syndication' },
] as const

const LISTING_OPTIONS: { id: ListingPlatform; label: string }[] = [
  { id: 'carscom', label: 'Cars.com' },
  { id: 'autotrader', label: 'AutoTrader' },
  { id: 'carvana', label: 'Carvana' },
]

const emptyForm: NewDealerVehicleForm = {
  vin: '',
  stock: '',
  year: new Date().getFullYear(),
  make: '',
  model: '',
  trim: '',
  color: '',
  mileageInput: '',
  drive: 'AWD',
  callForPrice: false,
  priceInput: '',
  status: 'frontline',
  photos: [],
  listings: [],
}

function sanitizePriceInput(raw: string) {
  return raw.replace(/[^\d]/g, '')
}

function formatPriceDisplay(raw: string) {
  const digits = sanitizePriceInput(raw)
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

function formatAskingPrice(raw: string) {
  const digits = sanitizePriceInput(raw)
  if (!digits) return ''
  return `$${Number(digits).toLocaleString('en-US')}`
}

function parsePriceInput(raw: string) {
  return Number.parseInt(sanitizePriceInput(raw), 10) || 0
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function readFileAsDataUrl(file: File): Promise<{ url: string; name: string } | null> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return Promise.resolve(null)

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(
        typeof reader.result === 'string'
          ? { url: reader.result, name: file.name }
          : null,
      )
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export function createDealerVehicleFromForm(form: NewDealerVehicleForm): DealerVehicle {
  const vin = form.vin.trim().toUpperCase()
  const price = form.callForPrice ? 0 : parsePriceInput(form.priceInput)
  const imageUrls = form.photos.map((p) => p.url)

  return {
    id: `v${Date.now()}`,
    stock: form.stock.trim() || `STK-${vin.slice(-5)}`,
    vin,
    year: form.year,
    make: form.make.trim(),
    model: form.model.trim(),
    trim: form.trim.trim(),
    mileage: parsePriceInput(form.mileageInput),
    price,
    priceLabel: form.callForPrice ? 'Call for Price' : undefined,
    drive: form.drive,
    image: imageUrls[0],
    images: imageUrls.length > 0 ? imageUrls : undefined,
    status: form.status,
    daysOnLot: 0,
    color: form.color.trim() || '—',
    listings: form.listings,
    carfax: {
      owners: 1,
      accidents: 0,
      serviceRecords: 0,
      title: 'Clean',
      lastReport: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  }
}

export default function AddDealerVehicleModal({ open, onClose, onAdd }: AddDealerVehicleModalProps) {
  const [step, setStep] = useState(1)
  const [lotTab, setLotTab] = useState<'price' | 'upload'>('price')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<NewDealerVehicleForm>(emptyForm)

  useEffect(() => {
    if (!open) return
    setStep(1)
    setLotTab('price')
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

  const canAdvanceStep1 = form.vin.trim().length >= 11
  const canAdvanceStep2 = form.make.trim().length > 0 && form.model.trim().length > 0 && form.year >= 1900
  const canSubmit = form.callForPrice || parsePriceInput(form.priceInput) > 0

  const handlePriceChange = (raw: string) => {
    setForm((f) => ({ ...f, priceInput: formatAskingPrice(raw) }))
  }

  const handleImageFiles = async (files: FileList | File[] | null) => {
    if (!files?.length) return

    const results = await Promise.all(Array.from(files).map(readFileAsDataUrl))
    const uploaded = results.filter((r): r is { url: string; name: string } => r !== null)
    if (!uploaded.length) return

    setForm((f) => ({
      ...f,
      photos: [
        ...f.photos,
        ...uploaded.map((item, i) => ({
          id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          url: item.url,
          name: item.name,
        })),
      ],
    }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = (id: string) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p.id !== id) }))
  }

  const setCoverPhoto = (id: string) => {
    setForm((f) => {
      const photo = f.photos.find((p) => p.id === id)
      if (!photo) return f
      return { ...f, photos: [photo, ...f.photos.filter((p) => p.id !== id)] }
    })
  }

  const clearPhotos = () => {
    setForm((f) => ({ ...f, photos: [] }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleListing = (id: ListingPlatform) => {
    setForm((f) => ({
      ...f,
      listings: f.listings.includes(id) ? f.listings.filter((l) => l !== id) : [...f.listings, id],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAdvanceStep1 || !canAdvanceStep2 || !canSubmit) return
    onAdd(createDealerVehicleFromForm(form))
    onClose()
  }

  return createPortal(
    <div
      className="dealer-add-modal-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="dealer-add-modal w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-dealer-vehicle-title"
      >
        <div className="dealer-add-modal-header">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="dealer-add-modal-icon">
                  <CarFront size={15} className="text-[#0080ff]" />
                </div>
                <span className="dealer-add-modal-badge">ONBOARD</span>
              </div>
              <h3 id="add-dealer-vehicle-title" className="mt-2 text-base font-semibold tracking-tight text-white">
                Add car to inventory
              </h3>
              <p className="mt-1 text-[11px] text-white/40">
                Step {step} of {STEPS.length} · {STEPS[step - 1]?.hint}
              </p>
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
                      <span className={`font-mono text-[9px] font-bold ${active ? 'text-[#0080ff]' : 'text-white/25'}`}>
                        0{s.id}
                      </span>
                    )}
                    <span
                      className={`truncate text-[9px] font-semibold uppercase tracking-wider ${active ? 'text-white/70' : 'text-white/30'}`}
                    >
                      {s.title}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dealer-add-modal-body">
          {step === 1 && (
            <div className="space-y-3.5">
              <label className="dealer-add-field">
                <span className="dealer-add-label">VIN</span>
                <input
                  required
                  autoFocus
                  value={form.vin}
                  onChange={(e) => setForm((f) => ({ ...f, vin: e.target.value.toUpperCase() }))}
                  placeholder="1HGCV1F34NA012345"
                  maxLength={17}
                  className="dealer-add-input font-mono uppercase tracking-wide"
                />
              </label>
              <label className="dealer-add-field">
                <span className="dealer-add-label">Stock #</span>
                <input
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="STK-1052 (auto from VIN if blank)"
                  className="dealer-add-input font-mono"
                />
              </label>
              <p className="rounded-lg border border-[#0080ff]/20 bg-[#0080ff]/[0.06] px-3 py-2 text-[11px] leading-relaxed text-white/45">
                Frazer DMS will decode the VIN and attach a CARFAX report after the unit is saved to the lot.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <label className="dealer-add-field">
                  <span className="dealer-add-label">Year</span>
                  <input
                    required
                    autoFocus
                    type="number"
                    min={1900}
                    max={2030}
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) || f.year }))}
                    className="dealer-add-input tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </label>
                <label className="dealer-add-field">
                  <span className="dealer-add-label">Mileage</span>
                  <input
                    inputMode="numeric"
                    value={form.mileageInput}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mileageInput: formatPriceDisplay(e.target.value) }))
                    }
                    placeholder="18,420"
                    className="dealer-add-input tabular-nums"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="dealer-add-field">
                  <span className="dealer-add-label">Make</span>
                  <input
                    required
                    value={form.make}
                    onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                    placeholder="Lamborghini"
                    className="dealer-add-input"
                  />
                </label>
                <label className="dealer-add-field">
                  <span className="dealer-add-label">Model</span>
                  <input
                    required
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    placeholder="Huracan"
                    className="dealer-add-input"
                  />
                </label>
              </div>
              <label className="dealer-add-field">
                <span className="dealer-add-label">Trim</span>
                <input
                  value={form.trim}
                  onChange={(e) => setForm((f) => ({ ...f, trim: e.target.value }))}
                  placeholder="EVO Spyder"
                  className="dealer-add-input"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="dealer-add-field">
                  <span className="dealer-add-label">Exterior color</span>
                  <input
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    placeholder="Verde Mantis"
                    className="dealer-add-input"
                  />
                </label>
                <label className="dealer-add-field">
                  <span className="dealer-add-label">Drivetrain</span>
                  <select
                    value={form.drive}
                    onChange={(e) => setForm((f) => ({ ...f, drive: e.target.value }))}
                    className="dealer-add-input dealer-add-select"
                  >
                    <option value="AWD">AWD</option>
                    <option value="RWD">RWD</option>
                    <option value="FWD">FWD</option>
                    <option value="4WD">4WD</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div className="dealer-add-subtabs flex gap-1 rounded-lg border border-white/[0.08] bg-[var(--dealer-inset)] p-1">
                <button
                  type="button"
                  onClick={() => setLotTab('price')}
                  className={`flex-1 rounded-md px-3 py-2 text-[11px] font-medium transition ${
                    lotTab === 'price'
                      ? 'bg-[#0080ff]/15 text-[#0080ff] ring-1 ring-[#0080ff]/25'
                      : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  Lot & price
                </button>
                <button
                  type="button"
                  onClick={() => setLotTab('upload')}
                  className={`flex-1 rounded-md px-3 py-2 text-[11px] font-medium transition ${
                    lotTab === 'upload'
                      ? 'bg-[#0080ff]/15 text-[#0080ff] ring-1 ring-[#0080ff]/25'
                      : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  Upload image
                </button>
              </div>

              {lotTab === 'price' ? (
                <>
                  <label className="dealer-add-field">
                    <span className="dealer-add-label">Lot status</span>
                    <select
                      autoFocus
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, status: e.target.value as DealerVehicle['status'] }))
                      }
                      className="dealer-add-input dealer-add-select"
                    >
                      {(Object.keys(statusLabels) as DealerVehicle['status'][]).map((key) => (
                        <option key={key} value={key}>
                          {statusLabels[key]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-white/55">
                      <input
                        type="checkbox"
                        checked={form.callForPrice}
                        onChange={(e) => setForm((f) => ({ ...f, callForPrice: e.target.checked }))}
                        className="rounded border-white/20 bg-[var(--dealer-inset)] text-[#0080ff] focus:ring-[#0080ff]/30"
                      />
                      Call for price
                    </label>
                    {!form.callForPrice && (
                      <label className="dealer-add-field">
                        <span className="dealer-add-label">Asking price</span>
                        <input
                          inputMode="numeric"
                          value={form.priceInput}
                          onChange={(e) => handlePriceChange(e.target.value)}
                          placeholder="$52,900"
                          className="dealer-add-input tabular-nums"
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <span className="dealer-add-label">Syndicate to</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {LISTING_OPTIONS.map(({ id, label }) => {
                        const active = form.listings.includes(id)
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleListing(id)}
                            className={`rounded-full border px-3 py-1.5 text-[10px] font-medium transition ${
                              active
                                ? 'border-[#0080ff]/40 bg-[#0080ff]/15 text-[#0080ff]'
                                : 'border-white/[0.1] bg-[var(--dealer-inset)] text-white/45 hover:border-white/20 hover:text-white/70'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="dealer-add-summary">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Review</p>
                    <dl className="mt-2 space-y-1.5 text-[11px]">
                      <div className="flex justify-between gap-2">
                        <dt className="text-white/45">VIN</dt>
                        <dd className="font-mono text-white/80">{form.vin.trim().toUpperCase() || '—'}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-white/45">Vehicle</dt>
                        <dd className="truncate font-medium text-white">
                          {form.year} {form.make} {form.model} {form.trim}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-white/45">Status</dt>
                        <dd className="text-[#0080ff]">{statusLabels[form.status]}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-white/45">Price</dt>
                        <dd className="tabular-nums text-white">
                          {form.callForPrice
                            ? 'Call for Price'
                            : form.priceInput || '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-white/45">Photos</dt>
                        <dd className={form.photos.length ? 'text-[#ccff00]' : 'text-white/35'}>
                          {form.photos.length ? `${form.photos.length} attached` : 'None'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </>
              ) : (
                <div className="space-y-3.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    className="sr-only"
                    onChange={(e) => void handleImageFiles(e.target.files)}
                  />

                  {form.photos.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {form.photos.map((photo, index) => (
                          <div
                            key={photo.id}
                            className="group relative overflow-hidden rounded-lg border border-white/[0.1] bg-black/30"
                          >
                            <img src={photo.url} alt={photo.name} className="aspect-[4/3] w-full object-cover" />
                            {index === 0 && (
                              <span className="absolute left-1.5 top-1.5 rounded bg-[#0080ff]/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white">
                                Cover
                              </span>
                            )}
                            <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/90 to-transparent p-1.5 pt-6 opacity-0 transition group-hover:opacity-100">
                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => setCoverPhoto(photo.id)}
                                  className="flex-1 rounded bg-white/10 px-1 py-0.5 text-[8px] font-medium text-white hover:bg-white/20"
                                >
                                  Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removePhoto(photo.id)}
                                className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] font-medium text-white hover:bg-red-500/40"
                                aria-label={`Remove ${photo.name}`}
                              >
                                <X size={10} className="mx-auto" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-[var(--dealer-inset)] px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-white">
                            {form.photos.length} photo{form.photos.length === 1 ? '' : 's'} ready
                          </p>
                          <p className="text-[10px] text-white/35">First photo is the inventory card cover</p>
                        </div>
                        <button
                          type="button"
                          onClick={clearPhotos}
                          className="shrink-0 rounded-md border border-white/10 px-2.5 py-1 text-[10px] text-white/50 transition hover:border-white/20 hover:text-white"
                        >
                          Clear all
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="dealer-add-btn-secondary w-full"
                      >
                        <Upload size={14} />
                        Add more photos
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        void handleImageFiles(e.dataTransfer.files)
                      }}
                      className="dealer-add-upload-zone flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.15] bg-[var(--dealer-inset)] px-4 py-10 text-center transition hover:border-[#0080ff]/35 hover:bg-[#0080ff]/[0.04]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0080ff]/25 bg-[#0080ff]/10">
                        <ImagePlus size={20} className="text-[#0080ff]" />
                      </div>
                      <p className="text-sm font-medium text-white">Upload vehicle photos</p>
                      <p className="max-w-[240px] text-[11px] leading-relaxed text-white/40">
                        Drag & drop or click to browse · Select multiple at once · JPG, PNG, WebP, GIF
                      </p>
                    </button>
                  )}

                  <p className="text-[10px] leading-relaxed text-white/35">
                    Photos appear on the inventory card after the unit is added. You can skip this and add photos later.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 flex gap-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="dealer-add-btn-secondary flex-1">
                <ChevronLeft size={14} />
                Back
              </button>
            ) : (
              <button type="button" onClick={onClose} className="dealer-add-btn-secondary flex-1">
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 ? !canAdvanceStep1 : !canAdvanceStep2}
                onClick={() => setStep((s) => s + 1)}
                className="dealer-add-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className="dealer-add-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add to lot
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
