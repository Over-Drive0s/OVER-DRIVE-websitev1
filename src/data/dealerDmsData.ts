export type ListingPlatform = 'carscom' | 'autotrader' | 'carvana'
export type AuctionPartnerId = 'manheim' | 'acv' | 'adesa'
export type FloorPlanPartnerId = 'westlake' | 'nextgear'
export type PartnerId = 'frazer' | '700credit' | 'carfax' | ListingPlatform | AuctionPartnerId | FloorPlanPartnerId

export interface DealerPartnerRef {
  id: string
  name: string
  logo: string
  lightTile?: boolean
}

export interface DealerVehicle {
  id: string
  stock: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  mileage: number
  price: number
  priceLabel?: string
  drive?: string
  image?: string
  images?: string[]
  status: 'frontline' | 'recon' | 'listed' | 'pending' | 'photos'
  daysOnLot: number
  color: string
  listings: ListingPlatform[]
  carfax: {
    owners: number
    accidents: number
    serviceRecords: number
    title: 'Clean' | 'Salvage' | 'Rebuilt'
    lastReport: string
  }
}

export const dealerIntegrations: {
  id: PartnerId
  name: string
  logo: string
  category: 'dms' | 'credit' | 'listing' | 'history'
  description: string
  url: string
  connected: boolean
  lastSync: string
  metric: string
  lightTile?: boolean
}[] = [
  {
    id: 'frazer',
    name: 'Frazer',
    logo: '/partners/frazer.png',
    category: 'dms',
    description: 'Core DMS sync — inventory, deals, and accounting',
    url: 'https://frazer.com',
    connected: true,
    lastSync: '2 min ago',
    metric: '186 units synced',
  },
  {
    id: '700credit',
    name: '700Credit',
    logo: '/partners/700credit.png',
    category: 'credit',
    description: 'Credit reports, soft pulls, and compliance',
    url: 'https://www.700credit.com',
    connected: true,
    lastSync: '8 min ago',
    metric: '14 pulls today',
  },
  {
    id: 'carscom',
    name: 'Cars.com',
    logo: '/partners/cars-com.svg',
    category: 'listing',
    description: 'Syndicate inventory to Cars.com listings',
    url: 'https://www.cars.com',
    connected: true,
    lastSync: '12 min ago',
    metric: '142 active ads',
    lightTile: true,
  },
  {
    id: 'autotrader',
    name: 'AutoTrader',
    logo: '/partners/autotrader.svg',
    category: 'listing',
    description: 'Premium placement & market pricing insights',
    url: 'https://www.autotrader.com',
    connected: true,
    lastSync: '12 min ago',
    metric: '138 active ads',
    lightTile: true,
  },
  {
    id: 'carvana',
    name: 'Carvana',
    logo: '/partners/carvana.svg',
    category: 'listing',
    description: 'Wholesale & retail acquisition channel',
    url: 'https://www.carvana.com',
    connected: true,
    lastSync: '1 hr ago',
    metric: '24 wholesale bids',
    lightTile: true,
  },
  {
    id: 'carfax',
    name: 'CARFAX',
    logo: '/partners/carfax.svg',
    category: 'history',
    description: 'Vehicle history reports & buyer transparency',
    url: 'https://www.carfax.com',
    connected: true,
    lastSync: 'Live',
    metric: '312 reports YTD',
    lightTile: true,
  },
]

export const dealerOverviewSparklines = {
  inventory: [88, 90, 89, 92, 91, 94, 93, 95, 94, 96, 95, 98],
  syndication: [8, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 22],
  leads: [12, 15, 14, 18, 22, 19, 24, 28, 26, 31, 29, 34],
  creditPulls: [2, 3, 1, 4, 5, 3, 6, 4, 7, 5, 8, 6],
  auctions: [6, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15, 18],
  floorPlan: [820, 835, 810, 860, 845, 880, 870, 910, 895, 920, 905, 940],
}

export const dealerAuctionPartners: DealerPartnerRef[] = [
  { id: 'manheim', name: 'Manheim', logo: '/partners/manheim.svg', lightTile: true },
  { id: 'acv', name: 'ACV Auctions', logo: '/partners/acv.svg' },
  { id: 'adesa', name: 'ADESA', logo: '/partners/adesa.svg', lightTile: true },
]

export const dealerFloorPlanPartners: DealerPartnerRef[] = [
  { id: 'westlake', name: 'Westlake Financial', logo: '/partners/westlake.svg', lightTile: true },
  { id: 'nextgear', name: 'NextGear Capital', logo: '/partners/nextgear.png', lightTile: true },
]

export const dealerActivityFeed = [
  { time: '2m', event: 'Frazer DMS sync completed', type: 'sync' as const, partner: 'frazer' as PartnerId },
  { time: '8m', event: '700Credit soft pull — STK-1052', type: 'credit' as const, partner: '700credit' as PartnerId },
  { time: '12m', event: 'Cars.com + AutoTrader feed refreshed', type: 'listing' as const, partner: 'carscom' as PartnerId },
  { time: '18m', event: 'CARFAX report attached — Huracan EVO Spyder', type: 'history' as const, partner: 'carfax' as PartnerId },
  { time: '1h', event: 'Carvana wholesale bid received — 765LT', type: 'listing' as const, partner: 'carvana' as PartnerId },
]

/** Live inventory synced from Brooklyn Auto Sales (brooklynas.vercel.app) */
export const dealerVehicles: DealerVehicle[] = [
  {
    id: 'v1',
    stock: 'STK-29641',
    vin: 'ZHWUT4ZF9RLA29641',
    year: 2024,
    make: 'Lamborghini',
    model: 'Huracan',
    trim: 'EVO Spyder',
    mileage: 320,
    price: 0,
    priceLabel: 'Call for Price',
    drive: 'AWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23703242/639100580042964993.jpg',
    status: 'frontline',
    daysOnLot: 5,
    color: 'Green',
    listings: ['carscom', 'autotrader'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 2, title: 'Clean', lastReport: 'Jun 1, 2026' },
  },
  {
    id: 'v2',
    stock: 'STK-0248503',
    vin: 'ZFF90HLA3L0248503',
    year: 2020,
    make: 'Ferrari',
    model: '488',
    trim: 'PISTA Coupe',
    mileage: 16934,
    price: 799999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23849542/639135848346650628.jpg',
    status: 'listed',
    daysOnLot: 14,
    color: 'Silver',
    listings: ['carscom', 'autotrader', 'carvana'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 6, title: 'Clean', lastReport: 'May 30, 2026' },
  },
  {
    id: 'v3',
    stock: 'STK-01863',
    vin: 'ZHWUC1ZM1RLA01863',
    year: 2024,
    make: 'Lamborghini',
    model: 'Revuelto',
    trim: 'Coupe',
    mileage: 4262,
    price: 644999,
    drive: 'AWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23870923/639141123311094812.jpg',
    status: 'frontline',
    daysOnLot: 8,
    color: 'Yellow',
    listings: ['carscom', 'autotrader'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 3, title: 'Clean', lastReport: 'Jun 2, 2026' },
  },
  {
    id: 'v4',
    stock: 'STK-76556823',
    vin: 'SBM14RCA3MW765568',
    year: 2021,
    make: 'McLaren',
    model: '765LT',
    trim: 'Coupe',
    mileage: 5750,
    price: 509999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23899786/639148028687540339.jpg',
    status: 'listed',
    daysOnLot: 21,
    color: 'Blue',
    listings: ['carscom', 'autotrader', 'carvana'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 4, title: 'Clean', lastReport: 'May 28, 2026' },
  },
  {
    id: 'v5',
    stock: 'STK-07672',
    vin: 'ZHWUV4ZD2JLA07672',
    year: 2018,
    make: 'Lamborghini',
    model: 'Aventador',
    trim: 'LP750-4 S Roadster',
    mileage: 9285,
    price: 499999,
    drive: 'AWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23870508/639141075621762114.jpg',
    status: 'listed',
    daysOnLot: 18,
    color: 'Yellow',
    listings: ['carscom', 'carvana'],
    carfax: { owners: 2, accidents: 0, serviceRecords: 7, title: 'Clean', lastReport: 'May 27, 2026' },
  },
  {
    id: 'v6',
    stock: 'STK-227882',
    vin: 'SLA13HA04SU227882',
    year: 2025,
    make: 'Rolls-Royce',
    model: 'Cullinan',
    trim: 'RR',
    mileage: 15263,
    price: 419999,
    drive: 'AWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23889887/639144675318336315.jpg',
    status: 'frontline',
    daysOnLot: 3,
    color: 'Black',
    listings: ['carscom', 'autotrader'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 2, title: 'Clean', lastReport: 'Jun 3, 2026' },
  },
  {
    id: 'v7',
    stock: 'STK-0233486',
    vin: 'ZFF82WNA3J0233486',
    year: 2018,
    make: 'Ferrari',
    model: 'GTC4Lusso',
    trim: 'Coupe',
    mileage: 10104,
    price: 319999,
    drive: 'AWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23896376/639147276312707645.jpg',
    status: 'listed',
    daysOnLot: 25,
    color: 'Black',
    listings: ['autotrader', 'carvana'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 9, title: 'Clean', lastReport: 'May 26, 2026' },
  },
  {
    id: 'v8',
    stock: 'STK-17481',
    vin: 'ZHWUF5ZF0MLA17481',
    year: 2021,
    make: 'Lamborghini',
    model: 'Huracan',
    trim: 'EVO Coupe',
    mileage: 3573,
    price: 314999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23765150/639114394990037026.jpg',
    status: 'pending',
    daysOnLot: 9,
    color: 'Gray',
    listings: ['carscom', 'autotrader'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 5, title: 'Clean', lastReport: 'Jun 1, 2026' },
  },
  {
    id: 'v9',
    stock: 'STK-20735621',
    vin: 'BAS20735621',
    year: 1960,
    make: 'Cadillac',
    model: '62',
    trim: '62 Series Convertible',
    mileage: 46689,
    price: 84999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/20735621/638428114894736927.jpg',
    status: 'listed',
    daysOnLot: 42,
    color: 'Classic White',
    listings: ['carscom', 'autotrader'],
    carfax: { owners: 3, accidents: 0, serviceRecords: 12, title: 'Clean', lastReport: 'May 20, 2026' },
  },
  {
    id: 'v10',
    stock: 'STK-23361049',
    vin: 'BAS23361049',
    year: 1983,
    make: 'Porsche',
    model: '911',
    trim: 'Turbo',
    mileage: 64893,
    price: 169999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23361049/639016617302334998.jpg',
    status: 'frontline',
    daysOnLot: 31,
    color: 'Guards Red',
    listings: ['carscom', 'carvana'],
    carfax: { owners: 2, accidents: 0, serviceRecords: 8, title: 'Clean', lastReport: 'May 22, 2026' },
  },
  {
    id: 'v11',
    stock: 'STK-22093004',
    vin: 'BAS22093004',
    year: 2002,
    make: 'Mazda',
    model: 'RX-7',
    trim: 'Spirit R 1207/1500',
    mileage: 40704,
    price: 109999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/22093004/638714216764693139.jpg',
    status: 'listed',
    daysOnLot: 16,
    color: 'Competition Yellow',
    listings: ['carscom', 'autotrader', 'carvana'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 6, title: 'Clean', lastReport: 'May 29, 2026' },
  },
  {
    id: 'v12',
    stock: 'STK-23815041',
    vin: 'BAS23815041',
    year: 2007,
    make: 'Mazda',
    model: 'MX-5',
    trim: 'Miata Grand Touring Hard Top',
    mileage: 62193,
    price: 14999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23815041/639126536245188371.jpg',
    status: 'frontline',
    daysOnLot: 11,
    color: 'Stormy Blue',
    listings: ['carscom', 'autotrader'],
    carfax: { owners: 2, accidents: 0, serviceRecords: 14, title: 'Clean', lastReport: 'Jun 1, 2026' },
  },
  {
    id: 'v13',
    stock: 'STK-23671281',
    vin: 'BAS23671281',
    year: 2007,
    make: 'Porsche',
    model: '911',
    trim: 'GT3',
    mileage: 44532,
    price: 209999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23671281/639093598139243030.jpg',
    status: 'listed',
    daysOnLot: 22,
    color: 'GT Silver',
    listings: ['carscom', 'autotrader', 'carvana'],
    carfax: { owners: 2, accidents: 0, serviceRecords: 10, title: 'Clean', lastReport: 'May 24, 2026' },
  },
  {
    id: 'v14',
    stock: 'STK-23713440',
    vin: 'BAS23713440',
    year: 2015,
    make: 'Chevrolet',
    model: 'Corvette',
    trim: '3LZ Z06 Coupe',
    mileage: 18754,
    price: 71999,
    drive: 'RWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23713440/639102285192676782.jpg',
    status: 'recon',
    daysOnLot: 6,
    color: 'Torch Red',
    listings: [],
    carfax: { owners: 1, accidents: 0, serviceRecords: 7, title: 'Clean', lastReport: 'Jun 2, 2026' },
  },
  {
    id: 'v15',
    stock: 'STK-23746237',
    vin: 'BAS23746237',
    year: 2017,
    make: 'Audi',
    model: 'R8',
    trim: 'V10 Plus quattro 7A',
    mileage: 43170,
    price: 179999,
    drive: 'AWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23746237/639110979097486178.jpg',
    status: 'listed',
    daysOnLot: 19,
    color: 'Daytona Gray',
    listings: ['carscom', 'autotrader'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 5, title: 'Clean', lastReport: 'May 31, 2026' },
  },
  {
    id: 'v16',
    stock: 'STK-23659882',
    vin: 'BAS23659882',
    year: 2017,
    make: 'Mercedes-Benz',
    model: 'G-Class',
    trim: 'G550 4MATIC',
    mileage: 22168,
    price: 154999,
    drive: 'AWD',
    image: 'https://imagescdn.dealercarsearch.com/Media/1483/23659882/639090180517674674.jpg',
    status: 'photos',
    daysOnLot: 4,
    color: 'Designo Magno',
    listings: ['carvana'],
    carfax: { owners: 1, accidents: 0, serviceRecords: 11, title: 'Clean', lastReport: 'Jun 3, 2026' },
  },
]

export const listingPlatformMeta: Record<ListingPlatform, { label: string; logo: string; lightTile?: boolean }> = {
  carscom: { label: 'Cars.com', logo: '/partners/cars-com.svg', lightTile: true },
  autotrader: { label: 'AutoTrader', logo: '/partners/autotrader.svg', lightTile: true },
  carvana: { label: 'Carvana', logo: '/partners/carvana.svg', lightTile: true },
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function formatVehiclePrice(vehicle: Pick<DealerVehicle, 'price' | 'priceLabel'>) {
  if (vehicle.priceLabel) return vehicle.priceLabel
  if (vehicle.price <= 0) return 'Call for Price'
  return formatPrice(vehicle.price)
}

export function vehicleLabel(v: DealerVehicle) {
  return `${v.year} ${v.make} ${v.model} ${v.trim}`
}

export const statusLabels: Record<DealerVehicle['status'], string> = {
  frontline: 'Front Line Ready',
  recon: 'Recon',
  listed: 'Listed',
  pending: 'Pending Sale',
  photos: 'Needs Photos',
}

export const statusStyles: Record<DealerVehicle['status'], string> = {
  frontline: 'bg-[#ccff00]/15 text-[#ccff00]',
  recon: 'bg-amber-500/15 text-amber-400',
  listed: 'bg-[#0080ff]/15 text-[#0080ff]',
  pending: 'bg-violet-500/15 text-violet-400',
  photos: 'bg-white/10 text-white/50',
}
