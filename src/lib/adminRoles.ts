import type { AdminRole } from './adminUsers'

export const ADMIN_ROLES: AdminRole[] = ['Customer', 'Administrator', 'Support']

export type ProfileRoleFilter = 'all' | AdminRole

export const adminRoleBadgeStyles: Record<AdminRole, string> = {
  Customer: 'bg-violet-500/20 text-violet-300 ring-violet-400/30',
  Administrator: 'bg-blue-500/20 text-blue-300 ring-blue-400/30',
  Support: 'bg-amber-500/20 text-amber-300 ring-amber-400/30',
}

export const adminRoleBadgeStylesSignIn: Record<AdminRole, string> = {
  Customer: 'bg-violet-500/25 text-violet-200 ring-violet-400/40',
  Administrator: 'bg-blue-500/25 text-blue-200 ring-blue-400/40',
  Support: 'bg-amber-500/25 text-amber-200 ring-amber-400/40',
}

export function normalizeAdminRole(role: string): AdminRole {
  if (role === 'Customer' || role === 'Administrator' || role === 'Support') {
    return role
  }
  if (role === 'Operations') return 'Support'
  return 'Customer'
}

export function roleUsesPreferredPayment(role: AdminRole): boolean {
  return role === 'Administrator' || role === 'Support'
}
