import ClientPortalGuard from '../components/ClientPortalGuard'
import ClientPortalPanel from '../components/ClientPortalPanel'

export default function ClientPortalUploads() {
  return (
    <ClientPortalGuard>
      <div data-scroll-root className="relative h-full min-h-0 overflow-hidden bg-[#07111f]">
        <ClientPortalPanel logoTo="/clientportal" page="uploads" />
      </div>
    </ClientPortalGuard>
  )
}
