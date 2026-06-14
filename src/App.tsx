import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import PreloaderProvider from './components/PreloaderProvider'
import SiteFrame from './components/SiteFrame'
import Layout from './Layout'
import Index from './pages/Index'
import Company from './pages/Company'
import Home from './pages/Home'
import Platform from './pages/Platform'
import PreloaderPreview from './pages/PreloaderPreview'
import Systems from './pages/Systems'
import RequestDemo from './pages/RequestDemo'
import Dashboards from './pages/Dashboards'
import Metrics from './pages/Metrics'
import TradingSystems from './pages/TradingSystems'
import Inventory from './pages/Inventory'
import Dealers from './pages/Dealers'
import Deployments from './pages/Deployments'
import Solutions from './pages/Solutions'
import AdminDash from './pages/AdminDash'
import AdminPanelPage from './pages/AdminPanel'
import AdminProfiles from './pages/AdminProfiles'
import AdminProjects from './pages/AdminProjects'
import AdminSignIn from './pages/AdminSignIn'
import AdminDataBins from './pages/AdminDataBins'
import ClientPortal from './pages/ClientPortal'
import ClientPortalProjects from './pages/ClientPortalProjects'
import ClientPortalMessages from './pages/ClientPortalMessages'
import ClientPortalUploads from './pages/ClientPortalUploads'
import MasterAdmin from './pages/MasterAdmin'
import MasterAdminDataBins from './pages/MasterAdminDataBins'
import MasterAdminMessages from './pages/MasterAdminMessages'
import MasterAdminProfiles from './pages/MasterAdminProfiles'
import MasterAdminArchives from './pages/MasterAdminArchives'
import MasterAdminProjects from './pages/MasterAdminProjects'
import MasterAdminUploads from './pages/MasterAdminUploads'
import ClientPortalArchives from './pages/ClientPortalArchives'
import {
  AdminPortal,
  AdminPortalArchives,
  AdminPortalDataBins,
  AdminPortalMessages,
  AdminPortalProfiles,
  AdminPortalProjects,
  AdminPortalUploads,
  AdminSupport,
  AdminSupportArchives,
  AdminSupportDataBins,
  AdminSupportMessages,
  AdminSupportProjects,
  AdminSupportUploads,
} from './pages/staffPortalPages'
import ApiManager from './pages/ApiManager'
import Diagrams from './pages/Diagrams'

function PreloaderLayout() {
  return (
    <PreloaderProvider>
      <Outlet />
    </PreloaderProvider>
  )
}

export default function App() {
  return (
    <SiteFrame>
      <BrowserRouter>
        <Routes>
          <Route path="preloader-preview" element={<PreloaderPreview />} />
          <Route element={<PreloaderLayout />}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="admin" element={<AdminPanelPage />} />
              <Route path="adminlogin" element={<AdminSignIn />} />
              <Route path="adminprojects" element={<AdminProjects />} />
              <Route path="adminprofiles" element={<AdminProfiles />} />
              <Route path="admindatabins" element={<AdminDataBins />} />
              <Route path="clientportal" element={<ClientPortal />} />
              <Route path="clientportalprojects" element={<ClientPortalProjects />} />
              <Route path="clientportalarchives" element={<ClientPortalArchives />} />
              <Route path="clientportaluploads" element={<ClientPortalUploads />} />
              <Route path="clientportalmessages" element={<ClientPortalMessages />} />
              <Route path="masteradmin" element={<MasterAdmin />} />
              <Route path="masteradminmessages" element={<MasterAdminMessages />} />
              <Route path="masteradminprofiles" element={<MasterAdminProfiles />} />
              <Route path="masteradminprojects" element={<MasterAdminProjects />} />
              <Route path="masteradminarchives" element={<MasterAdminArchives />} />
              <Route path="masteradminuploads" element={<MasterAdminUploads />} />
              <Route path="masteradmindatabins" element={<MasterAdminDataBins />} />
              <Route path="adminsupport" element={<AdminSupport />} />
              <Route path="adminsupportmessages" element={<AdminSupportMessages />} />
              <Route path="adminsupportprofiles" element={<Navigate to="/adminsupport" replace />} />
              <Route path="adminsupportprojects" element={<AdminSupportProjects />} />
              <Route path="adminsupportarchives" element={<AdminSupportArchives />} />
              <Route path="adminsupportuploads" element={<AdminSupportUploads />} />
              <Route path="adminsupportdatabins" element={<AdminSupportDataBins />} />
              <Route path="adminportal" element={<AdminPortal />} />
              <Route path="adminportalmessages" element={<AdminPortalMessages />} />
              <Route path="adminportalprofiles" element={<AdminPortalProfiles />} />
              <Route path="adminportalprojects" element={<AdminPortalProjects />} />
              <Route path="adminportalarchives" element={<AdminPortalArchives />} />
              <Route path="adminportaluploads" element={<AdminPortalUploads />} />
              <Route path="adminportaldatabins" element={<AdminPortalDataBins />} />
              <Route path="admindash" element={<AdminDash />} />
              <Route path="diagrams" element={<Diagrams />} />
              <Route path="index" element={<Index />} />
              <Route path="platform" element={<Platform />} />
              <Route path="apimanager" element={<ApiManager />} />
              <Route path="solutions" element={<Solutions />} />
              <Route path="dashboards" element={<Dashboards />} />
              <Route path="metrics" element={<Metrics />} />
              <Route path="tradingsystems" element={<TradingSystems />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="dealers" element={<Dealers />} />
              <Route path="deployments" element={<Deployments />} />
              <Route path="resources" element={<Deployments />} />
              <Route path="company" element={<Company />} />
              <Route path="systems" element={<Systems />} />
              <Route path="pricing" element={<Navigate to="/systems" replace />} />
              <Route path="request-demo" element={<RequestDemo />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SiteFrame>
  )
}
