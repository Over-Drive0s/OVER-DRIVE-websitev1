import AdminProfilesPanel from '../components/AdminProfilesPanel'
import ExclusiveAdminGuard from '../components/ExclusiveAdminGuard'

export default function AdminProfiles() {
  return (
    <ExclusiveAdminGuard>
      <div data-scroll-root className="relative h-full min-h-0 overflow-hidden bg-[#101d32]">
        <AdminProfilesPanel />
      </div>
    </ExclusiveAdminGuard>
  )
}
