import type { PartnerId } from '../data/dealerDmsData'

export function PartnerLogo({
  src,
  alt,
  className = 'h-6',
  lightTile = false,
  wide = false,
}: {
  src: string
  alt: string
  className?: string
  lightTile?: boolean
  wide?: boolean
}) {
  const isWide = wide ?? (src.includes('cars-com') || src.includes('manheim') || src.includes('westlake') || src.includes('nextgear') || src.includes('adesa') || src.includes('acv'))

  const img = (
    <img
      src={src}
      alt={alt}
      className={`max-h-full object-contain object-center ${isWide ? 'w-auto min-w-[3.5rem]' : 'max-w-full'} ${className}`}
      draggable={false}
    />
  )

  if (!lightTile) return img

  return (
    <span className="dealer-logo-tile inline-flex items-center justify-center rounded-lg bg-white px-2.5 py-1.5">
      {img}
    </span>
  )
}

export function PartnerLogoById({
  id,
  integrations,
  className,
  lightTile,
}: {
  id: PartnerId
  integrations: { id: PartnerId; logo: string; name: string; lightTile?: boolean }[]
  className?: string
  lightTile?: boolean
}) {
  const partner = integrations.find((p) => p.id === id)
  if (!partner) return null
  return (
    <PartnerLogo
      src={partner.logo}
      alt={partner.name}
      className={className}
      lightTile={lightTile ?? partner.lightTile}
    />
  )
}
