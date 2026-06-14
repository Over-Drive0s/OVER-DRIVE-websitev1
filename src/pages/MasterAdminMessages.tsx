import ClientPortalPanel from '../components/ClientPortalPanel'

export default function MasterAdminMessages() {
  return (
    <div data-scroll-root className="relative h-full min-h-0 overflow-hidden bg-[#07111f]">
      <ClientPortalPanel
        badgeLabel="MASTER ADMIN"
        logoTo="/masteradmin"
        variant="master"
        page="messages"
      />
    </div>
  )
}
