import OwnerAdminShell from './owner/OwnerAdminShell'
import { ProfilesMain } from './ClientPortalPanel'

export default function AdminProfilesPanel() {
  return (
    <OwnerAdminShell
      title="Profiles"
      subtitle="View and manage admin team profiles, roles, and access."
    >
      <ProfilesMain />
    </OwnerAdminShell>
  )
}
