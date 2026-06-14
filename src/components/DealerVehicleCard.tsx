import { ArrowRight, Gauge } from 'lucide-react'
import { PartnerLogo } from './DealerPartnerLogos'
import {
  formatVehiclePrice,
  listingPlatformMeta,
  statusLabels,
  statusStyles,
  vehicleLabel,
  type DealerVehicle,
} from '../data/dealerDmsData'

const makeGradients: Record<string, string> = {
  BMW: 'from-[#0066b1]/30 to-[#222832]',
  'Mercedes-Benz': 'from-[#1a1a1a]/40 to-[#222832]',
  Toyota: 'from-[#eb0a1e]/20 to-[#222832]',
  Honda: 'from-[#cc0000]/20 to-[#222832]',
  Ford: 'from-[#003478]/25 to-[#222832]',
  Chevrolet: 'from-[#cd9834]/20 to-[#222832]',
  Lamborghini: 'from-[#d4af37]/25 to-[#222832]',
  Ferrari: 'from-[#dc0000]/25 to-[#222832]',
  McLaren: 'from-[#ff8000]/20 to-[#222832]',
  'Rolls-Royce': 'from-[#1a1a1a]/50 to-[#222832]',
  Porsche: 'from-[#911911]/20 to-[#222832]',
  Audi: 'from-[#bb0a30]/20 to-[#222832]',
  Cadillac: 'from-[#0a2a5c]/25 to-[#222832]',
  Mazda: 'from-[#101010]/30 to-[#222832]',
}

interface DealerVehicleCardProps {
  vehicle: DealerVehicle
  active?: boolean
  compact?: boolean
  onClick?: () => void
}

export default function DealerVehicleCard({ vehicle, active, compact, onClick }: DealerVehicleCardProps) {
  const gradient = makeGradients[vehicle.make] ?? 'from-[#0080ff]/15 to-[#222832]'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`dealer-vehicle-card group relative w-full overflow-hidden rounded-xl border text-left transition-all duration-300 ${
        active
          ? 'border-[#0080ff]/50 bg-[#0080ff]/[0.08] shadow-[0_0_32px_rgba(0,128,255,0.12)]'
          : 'border-white/[0.1] bg-[var(--dealer-panel)] hover:border-[#0080ff]/35 hover:bg-[var(--dealer-elevated)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5'
      }`}
    >
      <div className={`relative overflow-hidden border-b border-white/[0.06] ${vehicle.image ? 'h-36' : 'h-16 bg-gradient-to-br'} ${vehicle.image ? '' : gradient}`}>
        {vehicle.image ? (
          <>
            <img
              src={vehicle.image}
              alt={vehicleLabel(vehicle)}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
            {(vehicle.images?.length ?? 0) > 1 && (
              <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold tabular-nums text-white backdrop-blur-sm">
                +{(vehicle.images?.length ?? 1) - 1}
              </span>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        )}
        <div className="relative flex h-full items-end justify-between px-3.5 pb-2.5">
          <span className="font-mono text-[10px] font-semibold tracking-wide text-[#0080ff] drop-shadow-sm">{vehicle.stock}</span>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold backdrop-blur-sm ${statusStyles[vehicle.status]}`}>
            {statusLabels[vehicle.status]}
          </span>
        </div>
      </div>

      <div className={`${compact ? 'p-3' : 'p-3.5'}`}>
        <p className="font-semibold leading-snug text-white">{vehicleLabel(vehicle)}</p>
        <p className="mt-0.5 text-[11px] text-white/40">
          {[vehicle.color, `${vehicle.mileage.toLocaleString()} mi`, vehicle.drive].filter(Boolean).join(' · ')}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-semibold tabular-nums text-white">{formatVehiclePrice(vehicle)}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-white/35">
              <Gauge size={10} />
              {vehicle.daysOnLot}d on lot
            </p>
          </div>
          {vehicle.listings.length > 0 ? (
            <div className="flex flex-wrap justify-end gap-1">
              {vehicle.listings.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center rounded-md border border-white/[0.1] bg-[var(--dealer-inset)] px-1 py-0.5"
                  title={listingPlatformMeta[id].label}
                >
                  <PartnerLogo
                    src={listingPlatformMeta[id].logo}
                    alt={listingPlatformMeta[id].label}
                    className="h-3"
                    lightTile={listingPlatformMeta[id].lightTile}
                  />
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-white/25">Not syndicated</span>
          )}
        </div>

        {!compact && (
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
            <span className="font-mono text-[10px] text-white/30">{vehicle.vin.slice(-8)}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0080ff] opacity-0 transition group-hover:opacity-100">
              View report
              <ArrowRight size={11} className="transition group-hover:translate-x-0.5" />
            </span>
          </div>
        )}
      </div>
    </button>
  )
}
