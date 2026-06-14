export type CarrierId = 'usps' | 'ups' | 'fedex' | 'dhl'

const carrierMeta: Record<CarrierId, { label: string; logo: string }> = {
  usps: { label: 'USPS', logo: '/carriers/usps.svg' },
  ups: { label: 'UPS', logo: '/carriers/ups.svg' },
  fedex: { label: 'FedEx', logo: '/carriers/fedex.svg' },
  dhl: { label: 'DHL', logo: '/carriers/dhl.svg' },
}

export function CarrierLogo({
  carrier,
  className = 'h-7',
}: {
  carrier: CarrierId
  className?: string
}) {
  const meta = carrierMeta[carrier]

  return (
    <img
      src={meta.logo}
      alt={meta.label}
      className={`object-contain object-left ${className}`}
      draggable={false}
    />
  )
}

export const carriers: { id: CarrierId; name: string; eta: string; rate: string }[] = [
  { id: 'usps', name: 'USPS Priority', eta: '2–3 days', rate: '$8.40' },
  { id: 'ups', name: 'UPS Ground', eta: '3–5 days', rate: '$11.20' },
  { id: 'fedex', name: 'FedEx Express', eta: '1–2 days', rate: '$14.85' },
  { id: 'dhl', name: 'DHL International', eta: '4–7 days', rate: '$22.50' },
]

export function carrierLabel(id: CarrierId) {
  return carrierMeta[id].label
}

export function carrierLogoPath(id: CarrierId) {
  return carrierMeta[id].logo
}

export function carrierServiceName(id: CarrierId) {
  return carriers.find((c) => c.id === id)?.name ?? carrierMeta[id].label
}
