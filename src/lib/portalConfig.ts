import {
  Archive,
  Database,
  FolderKanban,
  HelpCircle,
  Home,
  Image,
  LogOut,
  MessageSquare,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type PortalVariant = 'client' | 'master' | 'support' | 'administrator'

export type PortalNavItem = {
  label: string
  icon: LucideIcon
  to?: string
  signOut?: boolean
}

export type StaffPortalPaths = {
  dashboard: string
  profiles: string
  projects: string
  archives: string
  uploads: string
  databins: string
  messages: string
}

export type PortalConfig = {
  variant: PortalVariant
  badge: string
  base: string
  paths: StaffPortalPaths | null
}

const STAFF_SUFFIXES = {
  profiles: 'profiles',
  projects: 'projects',
  archives: 'archives',
  uploads: 'uploads',
  databins: 'databins',
  messages: 'messages',
} as const

export function getStaffPortalPaths(base: string): StaffPortalPaths {
  return {
    dashboard: base,
    profiles: `${base}${STAFF_SUFFIXES.profiles}`,
    projects: `${base}${STAFF_SUFFIXES.projects}`,
    archives: `${base}${STAFF_SUFFIXES.archives}`,
    uploads: `${base}${STAFF_SUFFIXES.uploads}`,
    databins: `${base}${STAFF_SUFFIXES.databins}`,
    messages: `${base}${STAFF_SUFFIXES.messages}`,
  }
}

export function buildStaffNav(paths: StaffPortalPaths, variant?: PortalVariant): PortalNavItem[] {
  return [
    { label: 'Dashboard', icon: Home, to: paths.dashboard },
    ...(variant === 'support'
      ? []
      : [{ label: 'Profiles', icon: Users, to: paths.profiles }]),
    { label: 'Projects', icon: FolderKanban, to: paths.projects },
    { label: 'Archives', icon: Archive, to: paths.archives },
    { label: 'Uploads', icon: Image, to: paths.uploads },
    { label: 'Data Bins', icon: Database, to: paths.databins },
    { label: 'Invoices & Payments', icon: Receipt },
    { label: 'Messages', icon: MessageSquare, to: paths.messages },
    { label: 'Support Center', icon: HelpCircle },
    { label: 'Settings', icon: Settings },
    { label: 'Log Out', icon: LogOut, to: '/adminlogin', signOut: true },
  ]
}

export const clientNav: PortalNavItem[] = [
  { label: 'Dashboard', icon: Home, to: '/clientportal' },
  { label: 'Projects', icon: FolderKanban, to: '/clientportalprojects' },
  { label: 'Archives', icon: Archive, to: '/clientportalarchives' },
  { label: 'Uploads', icon: Image, to: '/clientportaluploads' },
  { label: 'Invoices & Payments', icon: Receipt },
  { label: 'Messages', icon: MessageSquare, to: '/clientportalmessages' },
  { label: 'Support Center', icon: HelpCircle },
  { label: 'Settings', icon: Settings },
  { label: 'Log Out', icon: LogOut, to: '/adminlogin', signOut: true },
]

const PORTAL_CONFIGS: Record<PortalVariant, PortalConfig> = {
  client: {
    variant: 'client',
    badge: 'CLIENT PORTAL',
    base: '/clientportal',
    paths: null,
  },
  master: {
    variant: 'master',
    badge: 'MASTER ADMIN',
    base: '/masteradmin',
    paths: getStaffPortalPaths('/masteradmin'),
  },
  support: {
    variant: 'support',
    badge: 'SUPPORT',
    base: '/adminsupport',
    paths: getStaffPortalPaths('/adminsupport'),
  },
  administrator: {
    variant: 'administrator',
    badge: 'ADMINISTRATOR',
    base: '/adminportal',
    paths: getStaffPortalPaths('/adminportal'),
  },
}

export function getPortalConfig(variant: PortalVariant): PortalConfig {
  return PORTAL_CONFIGS[variant]
}

export function isStaffPortalVariant(variant: PortalVariant): boolean {
  return variant === 'master' || variant === 'support' || variant === 'administrator'
}

export function showsStaffProfileControls(variant: PortalVariant): boolean {
  return variant === 'master' || variant === 'administrator'
}

export function getAllStaffPortalBases(): string[] {
  return ['/masteradmin', '/adminsupport', '/adminportal']
}

export function getAllStaffPortalPaths(): string[] {
  return getAllStaffPortalBases().flatMap((base) => Object.values(getStaffPortalPaths(base)))
}
