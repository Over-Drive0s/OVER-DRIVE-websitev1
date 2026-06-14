export type SystemType = 'Dashboard' | 'Admin Panel' | 'Website' | 'Dashboard / Website'

export type DeploymentCategory = 'dashboards' | 'websites' | 'admin'

export interface SystemPortfolioItem {
  id: string
  name: string
  type: SystemType
  logo: string
  logoAlt: string
  accent: 'blue' | 'lime'
  logoClassName?: string
  externalUrl?: string
  description: string
  highlights: string[]
  preview: { label: string; lines: string[] }
  metric: { value: string; label: string }
}

export const systemsPortfolio: SystemPortfolioItem[] = [
  {
    id: 'over-drive',
    name: 'Overdrive IO Roadmapp',
    type: 'Dashboard',
    logo: '/systems/over-drive.png',
    logoAlt: 'Overdrive IO logo',
    accent: 'blue',
    externalUrl: 'https://roadmappv2.vercel.app/#/',
    description:
      'Roadmap dashboard for planning, tracking, and shipping operational systems across phases and milestones.',
    highlights: ['Phase-based roadmaps', 'Milestone tracking', 'System build visibility'],
    preview: {
      label: 'roadmappv2.vercel.app',
      lines: ['Active phases · 4 in progress', 'Milestones · 12 completed', 'Next release · Q3 systems core'],
    },
    metric: { value: 'Live', label: 'Production demo' },
  },
  {
    id: 'odb',
    name: 'Overdrive IO Systems',
    type: 'Website',
    logo: '/systems/odb.png',
    logoAlt: 'Overdrive IO Systems logo',
    accent: 'lime',
    externalUrl: 'https://build-source.vercel.app',
    description:
      'Construction management platform with project roadmaps, tasks, scheduling, budget tracking, and team workflows.',
    highlights: ['Project dashboard', 'Task & schedule views', 'Budget & estimates'],
    preview: {
      label: 'build-source.vercel.app',
      lines: ['Active projects · Portfolio view', 'Tasks & schedule · Unified', 'Budget tracking · Live'],
    },
    metric: { value: 'Live', label: 'Production demo' },
  },
  {
    id: 'trade-stryke',
    name: 'Trade Stryke Terminal',
    type: 'Dashboard',
    logo: '/systems/trade-stryke.png',
    logoAlt: 'Trade Stryke Terminal logo',
    accent: 'blue',
    logoClassName: 'max-h-[108%] max-w-[112%]',
    externalUrl: 'https://trade-stryke.vercel.app',
    description:
      'Trading terminal with confluence scoreboard, live charts, and multi-timeframe analysis for active traders.',
    highlights: ['Confluence scoreboard', 'Live charting', 'Multi-timeframe analysis'],
    preview: {
      label: 'trade-stryke.vercel.app',
      lines: ['Scoreboard · Live signals', 'Charts · Multi-timeframe', 'Watchlist · Active'],
    },
    metric: { value: 'Live', label: 'Production demo' },
  },
  {
    id: 'tickr',
    name: 'Tickr Auctions',
    type: 'Dashboard / Website',
    logo: '/systems/tickr.png',
    logoAlt: 'Tickr Auctions logo',
    accent: 'lime',
    logoClassName: 'max-h-[108%] max-w-[112%]',
    externalUrl: 'https://tickr-watchfloor.vercel.app',
    description:
      'Luxury watch trading floor with live auctions, inventory visibility, and a premium dealer-facing experience.',
    highlights: ['Watch floor terminal', 'Live auction flow', 'Inventory & bidding'],
    preview: {
      label: 'tickr-watchfloor.vercel.app',
      lines: ['Watch floor · Live', 'Auctions · Active lots', 'Inventory · Premium SKUs'],
    },
    metric: { value: 'Live', label: 'Production demo' },
  },
  {
    id: 'brooklyn-auto-sales',
    name: 'Brooklyn Auto Sales',
    type: 'Website',
    logo: '/systems/brooklyn-auto-sales.png',
    logoAlt: 'Brooklyn Auto Sales logo',
    accent: 'blue',
    logoClassName: 'max-h-[108%] max-w-[112%]',
    externalUrl: 'https://brooklynas.vercel.app',
    description:
      'Automotive retail website for Staten Island with inventory search, financing, trade-ins, and lead capture.',
    highlights: ['Inventory search', 'Financing & trade-in', 'Lead capture & CRM ready'],
    preview: {
      label: 'brooklynas.vercel.app',
      lines: ['Inventory · Luxury & sports', 'Financing · Apply online', 'Trade-in · Instant value'],
    },
    metric: { value: 'Live', label: 'Production demo' },
  },
  {
    id: 'sneakr-wall',
    name: 'Sneakr Wall',
    type: 'Admin Panel',
    logo: '/systems/sneakr-wall.png',
    logoAlt: 'Sneakr Wall logo',
    accent: 'blue',
    description:
      'Sneaker inventory and resale admin panel for catalog management, listings, and marketplace operations.',
    highlights: ['Inventory catalog', 'Listing management', 'Resale workflows'],
    preview: {
      label: 'sneakr-wall · admin',
      lines: ['Catalog · Sneaker inventory', 'Listings · Marketplace ready', 'Status · In development'],
    },
    metric: { value: 'Soon', label: 'Demo pending' },
  },
  {
    id: 'quantdeck-pro',
    name: 'Quant Deck Pro',
    type: 'Dashboard',
    logo: '/systems/quantdeck-pro.png',
    logoAlt: 'Quant Deck Pro logo',
    accent: 'lime',
    description:
      'Quantitative analytics dashboard with power-systems visualization, KPI monitoring, and operational controls.',
    highlights: ['Systems monitoring', 'KPI dashboards', 'Control deck UI'],
    preview: {
      label: 'quantdeck-pro · dashboard',
      lines: ['Systems · Power monitoring', 'KPIs · Live metrics', 'Status · In development'],
    },
    metric: { value: 'Soon', label: 'Demo pending' },
  },
]

export const linkedSystems = systemsPortfolio.filter((system) => system.externalUrl)
export const upcomingSystems = systemsPortfolio.filter((system) => !system.externalUrl)

export function systemMatchesCategory(type: SystemType, category: DeploymentCategory): boolean {
  if (category === 'dashboards') {
    return type === 'Dashboard' || type === 'Dashboard / Website'
  }
  if (category === 'websites') {
    return type === 'Website' || type === 'Dashboard / Website'
  }
  return type === 'Admin Panel'
}
