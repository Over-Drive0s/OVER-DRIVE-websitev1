import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSiteLayout } from './context/SiteLayoutContext'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'

import { getAllStaffPortalPaths } from './lib/portalConfig'

const navbarExcludedPaths = new Set([
  '/admin',
  '/adminprojects',
  '/adminprofiles',
  '/clientportal',
  '/clientportalprojects',
  '/clientportalarchives',
  '/clientportaluploads',
  '/masteradmin',
  '/masteradminprofiles',
  '/masteradminprojects',
  '/masteradminarchives',
  '/masteradminuploads',
  ...getAllStaffPortalPaths().filter((path) => path !== '/masteradmin'),
])
const footerExcludedPaths = new Set([
  '/adminlogin',
  '/request-demo',
  '/admin',
  '/adminprojects',
  '/adminprofiles',
  '/clientportal',
  '/clientportalprojects',
  '/clientportalarchives',
  '/clientportaluploads',
  '/masteradmin',
  '/masteradminprofiles',
  '/masteradminprojects',
  '/masteradminarchives',
  '/masteradminuploads',
  ...getAllStaffPortalPaths().filter((path) => path !== '/masteradmin'),
  '/admindash',
  '/diagrams',
])
const compactFooterPaths = new Set(['/index'])
const portalPaths = new Set([
  '/admin',
  '/adminprojects',
  '/adminprofiles',
  '/clientportal',
  '/clientportalprojects',
  '/clientportalarchives',
  '/clientportaluploads',
  '/masteradmin',
  '/masteradminprofiles',
  '/masteradminprojects',
  '/masteradminarchives',
  '/masteradminuploads',
  ...getAllStaffPortalPaths(),
])
const masterAdminPaths = new Set(['/admin'])
const ownerSubPanelPaths = new Set(['/adminprojects', '/adminprofiles'])

function Layout() {
  const { isResponsive } = useSiteLayout()
  const { pathname } = useLocation()
  const isPortal = portalPaths.has(pathname)
  const showNavbar = !navbarExcludedPaths.has(pathname)
  const showFooter = !footerExcludedPaths.has(pathname)
  const compactFooter = compactFooterPaths.has(pathname)
  const isDiagrams = pathname === '/diagrams'

  const isMasterAdmin = masterAdminPaths.has(pathname)
  const isOwnerSubPanel = ownerSubPanelPaths.has(pathname)

  useEffect(() => {
    if (isMasterAdmin) {
      document.documentElement.dataset.pageMode = 'master-admin'
    } else if (isOwnerSubPanel) {
      document.documentElement.dataset.pageMode = 'admin-panel'
    } else if (isPortal) {
      document.documentElement.dataset.pageMode = 'admin-portal'
    } else {
      delete document.documentElement.dataset.pageMode
    }

    return () => {
      delete document.documentElement.dataset.pageMode
    }
  }, [isMasterAdmin, isOwnerSubPanel, isPortal])

  return (
    <div
      className={`site-app-shell flex flex-col ${
        isMasterAdmin
          ? 'h-dvh min-h-0 overflow-hidden bg-slate-50 text-slate-900'
          : isOwnerSubPanel
            ? 'h-dvh min-h-0 overflow-hidden bg-[#101d32] text-white'
          : isPortal
            ? 'h-dvh min-h-0 overflow-hidden bg-[#07111f] text-white'
          : compactFooter
            ? 'h-auto min-h-0 bg-[#050607] text-white'
            : isResponsive
              ? 'min-h-dvh bg-[#050607] text-white'
              : 'h-full min-h-0 flex-1 bg-[#050607] text-white'
      }`}
    >
      <ScrollToTop />
      {showNavbar && <Navbar />}
      <main
        id="app-main"
        tabIndex={0}
        className={
          isDiagrams
            ? 'min-h-0 flex-1 overflow-hidden focus:outline-none'
            : isPortal
              ? 'min-h-0 flex-1 overflow-hidden focus:outline-none'
              : compactFooter
                ? 'shrink-0 overflow-x-hidden focus:outline-none'
                : isResponsive
                  ? 'min-h-0 flex-1 overflow-x-hidden focus:outline-none'
                  : 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain focus:outline-none'
        }
      >
        <Outlet />
      </main>
      {showFooter && <Footer compact={compactFooter} />}
    </div>
  )
}

export default Layout
