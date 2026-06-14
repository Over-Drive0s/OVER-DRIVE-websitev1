import {
  PREFERRED_PAYMENT_METHODS,
  preferredPaymentDetailLabel,
  preferredPaymentNeedsDetail,
  type PreferredPayment,
  type PreferredPaymentMethod,
} from '../../lib/preferredPayment'

type PreferredPaymentSelectorProps = {
  value: PreferredPayment | undefined
  onChange: (value: PreferredPayment | undefined) => void
  variant?: 'signin' | 'portal'
}

const signinButtonClass = (selected: boolean) =>
  `rounded-md border px-3 py-2 text-xs font-semibold transition ${
    selected
      ? 'border-[#0080ff]/60 bg-[#0080ff]/15 text-white'
      : 'border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
  }`

const portalButtonClass = (selected: boolean) =>
  `rounded-lg border px-3 py-2 text-xs font-semibold transition ${
    selected
      ? 'border-blue-500/50 bg-blue-500/15 text-blue-100'
      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
  }`

const signinInputClass =
  'w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#0080ff]/50'

const portalInputClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500/50'

export default function PreferredPaymentSelector({
  value,
  onChange,
  variant = 'portal',
}: PreferredPaymentSelectorProps) {
  const selectedMethod = value?.method
  const buttonClass = variant === 'signin' ? signinButtonClass : portalButtonClass
  const inputClass = variant === 'signin' ? signinInputClass : portalInputClass
  const labelClass =
    variant === 'signin'
      ? 'mb-1 block text-[10px] font-medium uppercase tracking-wider text-white/40'
      : 'mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500'

  const selectMethod = (method: PreferredPaymentMethod) => {
    if (selectedMethod === method) {
      onChange(undefined)
      return
    }

    onChange({
      method,
      detail: preferredPaymentNeedsDetail(method) ? value?.detail ?? '' : undefined,
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <span className={labelClass}>Preferred payment</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PREFERRED_PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => selectMethod(method)}
              className={buttonClass(selectedMethod === method)}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {selectedMethod && preferredPaymentNeedsDetail(selectedMethod) && (
        <label className="block">
          <span className={labelClass}>{preferredPaymentDetailLabel(selectedMethod)}</span>
          <input
            type="text"
            value={value?.detail ?? ''}
            onChange={(event) =>
              onChange({
                method: selectedMethod,
                detail: event.target.value,
              })
            }
            placeholder={preferredPaymentDetailLabel(selectedMethod)}
            className={inputClass}
            required
          />
        </label>
      )}

      {selectedMethod === 'Cash' && (
        <p className="text-[11px] text-slate-500">No additional payment details required.</p>
      )}
    </div>
  )
}
