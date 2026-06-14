import {
  BarChart3,
  BookOpen,
  Calendar,
  Database,
  FolderKanban,
  HelpCircle,
  Home,
  Image,
  ListChecks,
  LogOut,
  Map,
  MessageSquare,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type OwnerNavItem = {
  label: string
  icon: LucideIcon
  to?: string
  signOut?: boolean
}

export const ownerAdminNav: OwnerNavItem[] = [
  { label: 'Dashboard', icon: Home, to: '/admin' },
  { label: 'Projects', icon: FolderKanban, to: '/adminprojects' },
  { label: 'Profiles', icon: Users, to: '/adminprofiles' },
  { label: 'Data Bins', icon: Database, to: '/admindatabins' },
  { label: 'Roadmap', icon: Map },
  { label: 'Tasks & Requests', icon: ListChecks },
  { label: 'Assets', icon: Image },
  { label: 'Invoices & Payments', icon: Receipt },
  { label: 'Meetings', icon: Calendar },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Reports & Analytics', icon: BarChart3 },
  { label: 'Knowledge Base', icon: BookOpen },
  { label: 'Support Center', icon: HelpCircle },
  { label: 'Settings', icon: Settings },
  { label: 'Exit to Website', icon: LogOut, to: '/adminlogin', signOut: true },
]
