export const PREFERRED_PAYMENT_METHODS = [
  'Zelle',
  'Venmo',
  'Cashapp',
  'Crypto',
  'Cash',
] as const

export type PreferredPaymentMethod = (typeof PREFERRED_PAYMENT_METHODS)[number]

export type PreferredPayment = {
  method: PreferredPaymentMethod
  detail?: string
}

export function preferredPaymentNeedsDetail(method: PreferredPaymentMethod): boolean {
  return method !== 'Cash'
}

export function preferredPaymentDetailLabel(method: PreferredPaymentMethod): string {
  switch (method) {
    case 'Zelle':
    case 'Venmo':
      return 'Phone, handle, or email'
    case 'Cashapp':
      return 'Cash App handle'
    case 'Crypto':
      return 'Wallet address'
    default:
      return ''
  }
}

export function validatePreferredPayment(
  payment: PreferredPayment | undefined,
): string | null {
  if (!payment?.method) {
    return 'Select a preferred payment method.'
  }

  if (!preferredPaymentNeedsDetail(payment.method)) {
    return null
  }

  const detail = payment.detail?.trim()
  if (!detail) {
    return `Enter ${preferredPaymentDetailLabel(payment.method).toLowerCase()}.`
  }

  return null
}

export function formatPreferredPaymentDisplay(payment?: PreferredPayment): string {
  if (!payment?.method) return '—'
  if (!payment.detail?.trim() || payment.method === 'Cash') {
    return payment.method
  }
  return `${payment.method} · ${payment.detail.trim()}`
}
