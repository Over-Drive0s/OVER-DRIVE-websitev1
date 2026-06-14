/** Format user input as USD, e.g. $1,234.56 */
export function formatMoneyInput(value: string): string {
  const stripped = value.replace(/[^\d.]/g, '')
  if (!stripped) return ''

  const dotIndex = stripped.indexOf('.')
  const intPart = (dotIndex === -1 ? stripped : stripped.slice(0, dotIndex)).replace(/\D/g, '')
  const decPart =
    dotIndex === -1 ? '' : stripped.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2)

  if (!intPart && !decPart) return ''

  const formattedInt = intPart ? Number(intPart).toLocaleString('en-US') : '0'
  if (dotIndex !== -1) {
    return `$${formattedInt}.${decPart}`
  }
  return `$${formattedInt}`
}

export function parseMoneyValue(value: string): number | null {
  const cleaned = value.replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const amount = Number.parseFloat(cleaned)
  return Number.isFinite(amount) ? amount : null
}

export function formatMoneyDisplay(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
