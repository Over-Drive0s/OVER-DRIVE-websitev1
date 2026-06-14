import AdminProjectsPanel from '../components/AdminProjectsPanel'
import ExclusiveAdminGuard from '../components/ExclusiveAdminGuard'

export default function AdminProjects() {
  return (
    <ExclusiveAdminGuard>
      <div data-scroll-root className="relative h-full min-h-0 overflow-hidden bg-[#101d32]">
        <AdminProjectsPanel />
      </div>
    </ExclusiveAdminGuard>
  )
}
