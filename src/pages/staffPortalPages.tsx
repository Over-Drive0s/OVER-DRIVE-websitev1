import ClientPortalPanel from '../components/ClientPortalPanel'
import RolePortalGuard from '../components/RolePortalGuard'
import { getPortalConfig, type PortalVariant } from '../lib/portalConfig'
import type { AdminRole } from '../lib/adminUsers'

type StaffPortalPage = 'dashboard' | 'profiles' | 'projects' | 'archives' | 'uploads' | 'messages' | 'databins'

function createStaffPortalPage(
  variant: Extract<PortalVariant, 'support' | 'administrator'>,
  allowedRole: AdminRole,
  page: StaffPortalPage = 'dashboard',
) {
  const config = getPortalConfig(variant)

  return function StaffPortalPage() {
    return (
      <RolePortalGuard allowedRoles={[allowedRole]}>
        <div data-scroll-root className="relative h-full min-h-0 overflow-hidden bg-[#07111f]">
          <ClientPortalPanel
            badgeLabel={config.badge}
            logoTo={config.base}
            variant={variant}
            page={page}
          />
        </div>
      </RolePortalGuard>
    )
  }
}

export const AdminSupport = createStaffPortalPage('support', 'Support')
export const AdminSupportProfiles = createStaffPortalPage('support', 'Support', 'profiles')
export const AdminSupportProjects = createStaffPortalPage('support', 'Support', 'projects')
export const AdminSupportArchives = createStaffPortalPage('support', 'Support', 'archives')
export const AdminSupportUploads = createStaffPortalPage('support', 'Support', 'uploads')
export const AdminSupportMessages = createStaffPortalPage('support', 'Support', 'messages')
export const AdminSupportDataBins = createStaffPortalPage('support', 'Support', 'databins')

export const AdminPortal = createStaffPortalPage('administrator', 'Administrator')
export const AdminPortalProfiles = createStaffPortalPage('administrator', 'Administrator', 'profiles')
export const AdminPortalProjects = createStaffPortalPage('administrator', 'Administrator', 'projects')
export const AdminPortalArchives = createStaffPortalPage('administrator', 'Administrator', 'archives')
export const AdminPortalUploads = createStaffPortalPage('administrator', 'Administrator', 'uploads')
export const AdminPortalMessages = createStaffPortalPage('administrator', 'Administrator', 'messages')
export const AdminPortalDataBins = createStaffPortalPage('administrator', 'Administrator', 'databins')
