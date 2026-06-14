import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Package,
  Radio,
  Store,
  Truck,
  Users,
} from 'lucide-react'

export type AccountId = 'main' | 'enterprise' | 'retail'
export type MainTab = 'overview' | 'campaigns' | 'channels' | 'audiences'
export type EnterpriseTab = 'live' | 'routes' | 'vehicles' | 'alerts'
export type RetailTab = 'pulse' | 'products' | 'regions' | 'staff'

export interface MetricsAccount {
  id: AccountId
  label: string
  description: string
  accent: 'lime' | 'blue' | 'amber'
  footerNote: string
}

export const metricsAccounts: MetricsAccount[] = [
  {
    id: 'main',
    label: 'Overdrive IO — Main account',
    description:
      'Explore campaigns, channels, and audience segments — a Google Ads–style metrics panel built on Overdrive IO.',
    accent: 'lime',
    footerNote: 'Simulator data — not connected to live ad accounts',
  },
  {
    id: 'enterprise',
    label: 'Enterprise — Fleet ops',
    description:
      'Monitor live fleet activity, route performance, vehicle health, and dispatch alerts across your logistics network.',
    accent: 'blue',
    footerNote: 'Simulator data — not connected to live telematics',
  },
  {
    id: 'retail',
    label: 'Retail — Store network',
    description:
      'Track store revenue, product mix, regional performance, and staff productivity across your retail locations.',
    accent: 'amber',
    footerNote: 'Simulator data — not connected to live POS systems',
  },
]

export const mainTabs: { id: MainTab; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'channels', label: 'Channels', icon: BarChart3 },
  { id: 'audiences', label: 'Audiences', icon: Users },
]

export const enterpriseTabs: { id: EnterpriseTab; label: string; icon: LucideIcon }[] = [
  { id: 'live', label: 'Fleet live', icon: Radio },
  { id: 'routes', label: 'Routes', icon: MapPin },
  { id: 'vehicles', label: 'Vehicles', icon: Truck },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
]

export const retailTabs: { id: RetailTab; label: string; icon: LucideIcon }[] = [
  { id: 'pulse', label: 'Store pulse', icon: Store },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'regions', label: 'Regions', icon: MapPin },
  { id: 'staff', label: 'Staff', icon: Users },
]

export const accentStyles = {
  lime: {
    tabActive: 'bg-[#ccff00]/15 text-[#ccff00] glow-brand-lime',
    menuActive: 'bg-[#ccff00]/10 text-[#ccff00]',
    menuHover: 'hover:border-[#ccff00]/25',
    icon: 'text-[#ccff00]/70',
    dot: 'fill-[#ccff00] text-[#ccff00]',
    label: 'text-[#ccff00]',
    badge: 'border-[#ccff00]/25 bg-[#ccff00]/10 text-[#ccff00]',
  },
  blue: {
    tabActive: 'bg-[#0080ff]/15 text-[#0080ff] glow-brand-blue',
    menuActive: 'bg-[#0080ff]/10 text-[#0080ff]',
    menuHover: 'hover:border-[#0080ff]/25',
    icon: 'text-[#0080ff]/70',
    dot: 'fill-[#0080ff] text-[#0080ff]',
    label: 'text-[#0080ff]',
    badge: 'border-[#0080ff]/25 bg-[#0080ff]/10 text-[#0080ff]',
  },
  amber: {
    tabActive: 'bg-amber-500/15 text-amber-400 glow-brand-amber',
    menuActive: 'bg-amber-500/10 text-amber-400',
    menuHover: 'hover:border-amber-500/25',
    icon: 'text-amber-400/70',
    dot: 'fill-amber-400 text-amber-400',
    label: 'text-amber-400',
    badge: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  },
} as const
