/** Client portal UI — /clientportal only (separate from owner /admin). */
import { SITE_COPYRIGHT } from '../config/site'
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  FolderKanban,
  FolderOpen,
  HardDrive,
  Image,
  MoreVertical,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  Upload,
  X,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { formatMoneyDisplay, formatMoneyInput, parseMoneyValue } from '../lib/formatMoney'
import { getClientDataScope } from '../lib/clientDataScope'
import {
  activityMatchesScope,
  countUnreadActivities,
  filterNotificationActivities,
  filterPlatformActivitiesForScope,
  formatPlatformActivityTime,
  getNotificationsReadAt,
  isActivityUnread,
  listPlatformActivities,
  markNotificationsRead,
  PLATFORM_ACTIVITY_EVENT,
  readAllPlatformActivities,
  type PlatformActivity,
} from '../lib/platformActivity'
import PortalMessenger from './portal/PortalMessenger'
import AdminDataBinsPanel from './AdminDataBinsPanel'
import {
  addFileManagerFiles,
  deleteFileManagerFile,
  duplicateFileManagerFile,
  FILE_MANAGER_TARGET_ID,
  findFileManagerFileOwner,
  listFileManagerFiles,
  listFileManagerFilesForOwnerIds,
  moveFileManagerFileToProject,
  type FileManagerFile,
} from '../lib/fileManager'
import { formatPhoneNumber } from '../lib/formatPhoneNumber'
import {
  buildStaffNav,
  clientNav,
  getPortalConfig,
  isStaffPortalVariant,
  showsStaffProfileControls,
  type PortalVariant,
} from '../lib/portalConfig'
import { validatePreferredPayment, type PreferredPayment } from '../lib/preferredPayment'
import { adminRoleBadgeStyles, type ProfileRoleFilter, roleUsesPreferredPayment } from '../lib/adminRoles'
import {
  adminUserMatchesRoleFilter,
  createAdminUser,
  deleteAdminUser,
  findAdminUserById,
  getAdminOwnerIdsByRole,
  getAdminSession,
  isExclusiveOwnerEmail,
  isOwnerSession,
  listAdminUsers,
  readProfileImageDataUrl,
  signOutAdmin,
  updateAdminUser,
  type AdminRole,
  type AdminSession,
  type AdminUser,
} from '../lib/adminUsers'
import AdminRoleSelect from './auth/AdminRoleSelect'
import PreferredPaymentSelector from './auth/PreferredPaymentSelector'
import ProfileRoleFilterSelect from './auth/ProfileRoleFilterSelect'
import PortalDatePicker from './portal/PortalDatePicker'
import CompletedJobDetailModal from './portal/CompletedJobDetailModal'
import PendingProjectApprovalModal from './portal/PendingProjectApprovalModal'
import type { JobChangesRequestPayload } from './portal/JobChangesRequestModal'
import ProjectDetailModal from './portal/ProjectDetailModal'
import { ProjectProgressBars } from './portal/ProjectProgressBars'
import { ProfileWorkloadHeatmapBar } from './portal/ProfileWorkloadHeatmapBar'
import InvoicePaymentDonut from './portal/InvoicePaymentDonut'
import ProjectFunnelWidget from './portal/ProjectFunnelWidget'
import ProfileDetailModal from './portal/ProfileDetailModal'
import { ProjectCommissionInline } from './portal/ProjectCommissionInfo'
import UploadFilePreviewModal from './portal/UploadFilePreviewModal'
import {
  CLIENT_PROJECT_TYPES,
  SUPPORT_CLIENT_PROJECT_TYPES,
  CLIENT_PROJECT_URGENCIES,
  buildClientProjectFileFromUpload,
  canDownloadClientProjectFile,
  applyProjectPayment,
  markClientProjectInvoicePaid,
  approveClientProject,
  declineClientProject,
  createClientProject,
  deleteClientProject,
  deleteClientProjectFile,
  duplicateClientProjectFile,
  downloadClientProjectFileAsync,
  moveClientProjectFileToFileManager,
  formatClientProjectFileSize,
  getClientProjectFileDataUrl,
  isClientProjectImageFile,
  isDataUrlImage,
  moveClientProjectFile,
  resolveClientProjectFileUrl,
  updateClientProject,
  updateClientProjectProgress,
  getClientUploadsSummary,
  getClientProjectFinancialTotals,
  getProjectFunnelWorkload,
  getProfileProjectFinancialTotalsMap,
  getProfileProjectWorkloadMap,
  getProfileSupportCommissionTotalsMap,
  getProjectSupportCommissionParts,
  getSupportProfileCommissionTotalsFromProjects,
  getProjectProgressLabel,
  getProjectProgressPercent,
  confirmClientProjectOrder,
  canRequestProjectChanges,
  canUncompleteClientProject,
  uncompleteClientProject,
  findCompletedProjectForActivity,
  filterListedClientProjects,
  isActiveProject,
  isJobCompleteNotification,
  isProjectComplete,
  isProjectPendingApproval,
  requestClientProjectChanges,
  getProjectBalance,
  getTodayIsoDate,
  listClientProjects,
  listClientUploadGroups,
  urgencyTagStyles,
  type ClientProject,
  type ClientProjectFile,
  type ProfileProjectFinancialTotals,
  type ProfileProjectWorkloadSummary,
  type ClientProjectType,
  type ClientProjectUrgency,
  type ClientProjectUploadGroup,
  type ClientUpload,
  type SupportProjectCommissionInput,
  type SupportProfileCommissionTotals,
} from '../lib/clientProjects'

function shouldShowProjectCommission(
  project: ClientProject,
  variant: PortalVariant,
): boolean {
  if (variant === 'support') return true

  if (variant === 'master') {
    const owner = findAdminUserById(project.ownerId)
    return owner?.role === 'Support'
  }

  return false
}

function getStaffPathsForVariant(variant: PortalVariant) {
  return isStaffPortalVariant(variant) ? getPortalConfig(variant).paths! : null
}

const projectStatusStyles: Record<string, string> = {
  'In Progress': 'bg-blue-500/20 text-blue-300 ring-blue-400/20',
  Planning: 'bg-amber-500/20 text-amber-300 ring-amber-400/20',
  Review: 'bg-purple-500/20 text-purple-300 ring-purple-400/20',
  Complete: 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/20',
}

const dashboardActivityAccent: Record<string, string> = {
  project: 'bg-blue-500/15 text-blue-300 ring-blue-500/25',
  upload: 'bg-violet-500/15 text-violet-300 ring-violet-500/25',
  profile: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
  message: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/25',
}

const dashboardTopCardThemes = {
  funnel: {
    icon: Filter,
    border: 'border-cyan-500/20',
    glow: 'from-cyan-500/[0.12] via-transparent to-transparent',
    iconWrap: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/20',
    accentLine: 'bg-gradient-to-r from-cyan-500/80 via-blue-400/50 to-transparent',
  },
  projects: {
    icon: FolderKanban,
    border: 'border-blue-500/20',
    glow: 'from-blue-500/[0.12] via-transparent to-transparent',
    iconWrap: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
    accentLine: 'bg-gradient-to-r from-blue-500/80 via-cyan-400/50 to-transparent',
  },
  activity: {
    icon: Activity,
    border: 'border-violet-500/20',
    glow: 'from-violet-500/[0.12] via-transparent to-transparent',
    iconWrap: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
    accentLine: 'bg-gradient-to-r from-violet-500/80 via-fuchsia-400/50 to-transparent',
  },
  invoices: {
    icon: Receipt,
    border: 'border-emerald-500/20',
    glow: 'from-emerald-500/[0.12] via-transparent to-transparent',
    iconWrap: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
    accentLine: 'bg-gradient-to-r from-emerald-500/80 via-[#39ff14]/40 to-transparent',
  },
} as const

function DashboardTopCard({
  title,
  theme,
  className = '',
  children,
}: {
  title: string
  theme: keyof typeof dashboardTopCardThemes
  className?: string
  children: ReactNode
}) {
  const { icon: Icon, border, glow, iconWrap, accentLine } = dashboardTopCardThemes[theme]

  return (
    <div
      className={`relative flex h-[250px] min-h-0 flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-white/[0.07] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_40px_rgba(2,8,23,0.35)] backdrop-blur-sm ${border} ${className}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${glow}`} />
      <div className={`relative h-px w-full shrink-0 ${accentLine}`} />
      <div className="relative flex min-h-0 flex-1 flex-col p-3">
        <div className="mb-2 flex shrink-0 items-center gap-2.5">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${iconWrap}`}
          >
            <Icon size={14} />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Fixed profile label on /masteradmin — never reflects other signed-in names. */
const MASTER_ADMIN_PROFILE_NAME = 'Admin'

function getProfileLabelForOwner(ownerId: string): string {
  const user = findAdminUserById(ownerId)
  if (!user) return 'Unknown profile'
  if (isExclusiveOwnerEmail(user.email)) return MASTER_ADMIN_PROFILE_NAME
  return user.name
}

function buildOwnerLabelMap(projects: ClientProject[]): Record<string, string> {
  const labels: Record<string, string> = {}

  for (const user of listAdminUsers()) {
    labels[user.id] = isExclusiveOwnerEmail(user.email)
      ? MASTER_ADMIN_PROFILE_NAME
      : user.name
  }

  for (const project of projects) {
    if (!labels[project.ownerId]) {
      labels[project.ownerId] = getProfileLabelForOwner(project.ownerId)
    }
  }

  return labels
}

const projectTypeThemes: Record<
  string,
  { gradient: string; glow: string; iconWrap: string; icon: string; bar: string }
> = {
  Website: {
    gradient: 'from-blue-600/30 via-blue-500/10 to-transparent',
    glow: 'bg-blue-500/20',
    iconWrap: 'bg-blue-500/25 text-blue-300 ring-blue-400/20',
    icon: 'text-blue-300',
    bar: 'bg-blue-500',
  },
  App: {
    gradient: 'from-emerald-600/30 via-emerald-500/10 to-transparent',
    glow: 'bg-emerald-500/20',
    iconWrap: 'bg-emerald-500/25 text-emerald-300 ring-emerald-400/20',
    icon: 'text-emerald-300',
    bar: 'bg-emerald-500',
  },
  'Web/App': {
    gradient: 'from-cyan-600/30 via-blue-500/10 to-transparent',
    glow: 'bg-cyan-500/20',
    iconWrap: 'bg-cyan-500/25 text-cyan-300 ring-cyan-400/20',
    icon: 'text-cyan-300',
    bar: 'bg-cyan-500',
  },
  Systems: {
    gradient: 'from-violet-600/30 via-violet-500/10 to-transparent',
    glow: 'bg-violet-500/20',
    iconWrap: 'bg-violet-500/25 text-violet-300 ring-violet-400/20',
    icon: 'text-violet-300',
    bar: 'bg-violet-500',
  },
  Other: {
    gradient: 'from-orange-600/30 via-orange-500/10 to-transparent',
    glow: 'bg-orange-500/20',
    iconWrap: 'bg-orange-500/25 text-orange-300 ring-orange-400/20',
    icon: 'text-orange-300',
    bar: 'bg-orange-500',
  },
}

const defaultProjectTheme = projectTypeThemes.Other

function ProjectCard({
  project,
  onOpen,
  onEdit,
  onDelete,
  ownerLabel,
  showCommission = false,
}: {
  project: ClientProject
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  ownerLabel?: string
  showCommission?: boolean
}) {
  const { name, type, urgency, status, due, budget, files } = project
  const runningBalance = getProjectBalance(project)
  const theme = projectTypeThemes[type] ?? defaultProjectTheme
  const fileCount = files?.length ?? 0

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a1424] text-left transition duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg hover:shadow-blue-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500/60"
    >
      <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        <div
          className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${theme.glow}`}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%221%22 cy=%221%22 r=%221%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60" />

        <div className="relative flex items-start justify-between gap-2 p-3">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${projectStatusStyles[status] ?? 'bg-white/10 text-slate-300'}`}
          >
            {status}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${urgencyTagStyles[urgency]}`}
          >
            {urgency}
          </span>
        </div>

        <div
          className={`absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${theme.iconWrap}`}
        >
          <FolderKanban size={22} className={theme.icon} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {ownerLabel && (
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-blue-300/90">
              {ownerLabel}
            </p>
          )}
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{name}</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {type}
          </p>
        </div>

        <ProjectProgressBars project={project} primaryBarClass={theme.bar} compact />

        {showCommission && <ProjectCommissionInline project={project} className="mt-1" />}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0 text-slate-500" />
            <span>Due {due}</span>
          </span>
          {fileCount > 0 && (
            <span className="flex items-center gap-1.5">
              <FileText size={12} className="shrink-0 text-slate-500" />
              <span>
                {fileCount} file{fileCount === 1 ? '' : 's'}
              </span>
            </span>
          )}
          {budget !== undefined && (
            <span
              className={`font-semibold tabular-nums ${
                runningBalance < 0
                  ? 'text-red-400 [text-shadow:0_0_8px_rgba(248,113,113,0.65),0_0_16px_rgba(248,113,113,0.3)]'
                  : runningBalance === 0
                    ? 'text-emerald-400 [text-shadow:0_0_8px_rgba(52,211,153,0.45),0_0_16px_rgba(52,211,153,0.2)]'
                    : 'text-slate-400'
              }`}
            >
              Balance {formatMoneyDisplay(runningBalance)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 transition group-hover:text-blue-300">
          <Eye size={13} />
          View details
        </span>
        <div
          className="flex items-center gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-blue-300"
            aria-label={`Edit ${name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-red-400"
            aria-label={`Delete ${name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  )
}

function PortalLogoHeader({
  badgeLabel,
  logoTo,
  subtitleClassName = 'mt-2 text-xs tracking-[0.4em] text-blue-400',
}: {
  badgeLabel: string
  logoTo: string
  subtitleClassName?: string
}) {
  return (
    <div>
      <Link to={logoTo} className="block transition-opacity hover:opacity-90">
        <img
          src="/overdrive-logo.png"
          alt="Overdrive IO"
          className="w-full max-w-[242px] h-auto object-contain object-left"
        />
      </Link>
      <div className={subtitleClassName}>{badgeLabel}</div>
    </div>
  )
}

function Panel({
  title,
  className = '',
  children,
  actionLabel = 'View all',
  onActionClick,
  compact = false,
}: {
  title: string
  className?: string
  children: ReactNode
  actionLabel?: string
  onActionClick?: () => void
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 ${compact ? 'p-3' : 'p-5'} ${className}`}
    >
      <div
        className={`flex shrink-0 items-center justify-between ${compact ? 'mb-2' : 'mb-5'}`}
      >
        <h2 className={compact ? 'text-sm font-semibold' : 'font-semibold'}>{title}</h2>
        {onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function PortalToolbar({
  clientSession,
  notifications,
  messagesTo,
  onOpenCompletedJob,
}: {
  clientSession?: AdminSession | null
  notifications: PlatformActivity[]
  messagesTo: string
  onOpenCompletedJob?: (activity: PlatformActivity) => void
}) {
  const displayName = clientSession?.name ?? 'John Smith'
  const displaySubtitle = clientSession?.role ?? 'Acme Industries'
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const unreadCount = countUnreadActivities(notifications)

  useEffect(() => {
    if (!notificationsOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (notificationsRef.current?.contains(event.target as Node)) return
      setNotificationsOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [notificationsOpen])

  const toggleNotifications = () => {
    setNotificationsOpen((open) => {
      const next = !open
      if (next) {
        markNotificationsRead()
      }
      return next
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex w-full min-w-[220px] max-w-[330px] flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>
      <div ref={notificationsRef} className="relative">
        <button
          type="button"
          onClick={toggleNotifications}
          className="relative rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-red-500 px-1.5 text-center text-xs font-semibold leading-5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {notificationsOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-white/10 bg-[#0a1628] shadow-2xl"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-white">Notifications</p>
              <p className="text-xs text-slate-400">
                Project progress, uploads, and profiles
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  No notifications yet.
                </p>
              ) : (
                notifications.slice(0, 20).map((item) => {
                  const isJobComplete = isJobCompleteNotification(item.message)
                  const itemClass =
                    'block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-0 hover:bg-white/[0.04]'

                  if (isJobComplete && onOpenCompletedJob) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onOpenCompletedJob(item)
                          setNotificationsOpen(false)
                        }}
                        className={itemClass}
                      >
                        <p className="text-sm text-slate-200">{item.message}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          <span className="uppercase tracking-wider text-emerald-500/80">
                            Open job complete
                          </span>
                          {' · '}
                          {formatPlatformActivityTime(item.createdAt)}
                          {item.actorName ? ` · ${item.actorName}` : ''}
                        </p>
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      to={messagesTo}
                      onClick={() => setNotificationsOpen(false)}
                      className={itemClass}
                    >
                      <p className="text-sm text-slate-200">{item.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        <span className="uppercase tracking-wider text-slate-600">
                          {item.category}
                        </span>
                        {' · '}
                        {formatPlatformActivityTime(item.createdAt)}
                        {item.actorName ? ` · ${item.actorName}` : ''}
                      </p>
                    </Link>
                  )
                })
              )}
            </div>
            <div className="border-t border-white/10 px-4 py-3">
              <Link
                to={messagesTo}
                onClick={() => setNotificationsOpen(false)}
                className="block rounded-lg border border-white/10 py-2 text-center text-sm text-blue-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                View all messages
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {clientSession?.profileImageUrl && isDataUrlImage(clientSession.profileImageUrl) ? (
          <img
            src={clientSession.profileImageUrl}
            alt=""
            className="h-11 w-11 rounded-full object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-orange-400" />
        )}
        <div>
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="text-xs text-slate-400">{displaySubtitle}</p>
        </div>
      </div>
    </div>
  )
}

function PortalDashboardShell({
  children,
  variant = 'client',
}: {
  children: ReactNode
  variant?: PortalVariant
}) {
  const accentGradient =
    isStaffPortalVariant(variant)
      ? 'from-blue-500/20 via-transparent to-cyan-400/10'
      : 'from-blue-500/15 via-transparent to-violet-500/10'

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060b14] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)] lg:p-6"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentGradient}`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />
      <div className="relative rounded-xl border border-white/[0.06] bg-[#07101c]/95 backdrop-blur-sm">
        <div className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-3 lg:px-8 lg:py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Dashboard overview
          </p>
        </div>
        <div className="p-5 lg:p-8">{children}</div>
      </div>
    </div>
  )
}

function NewProjectButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
    >
      <Plus size={16} />
      New Project
    </button>
  )
}

function NewProfileButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
    >
      <Plus size={16} />
      Add new profile
    </button>
  )
}

function MessagesMain({
  activities,
  variant = 'client',
}: {
  activities: PlatformActivity[]
  variant?: PortalVariant
}) {
  const [readAt, setReadAt] = useState(() => getNotificationsReadAt())

  useEffect(() => {
    const syncReadAt = () => setReadAt(getNotificationsReadAt())
    syncReadAt()
    window.addEventListener(PLATFORM_ACTIVITY_EVENT, syncReadAt)
    return () => window.removeEventListener(PLATFORM_ACTIVITY_EVENT, syncReadAt)
  }, [])

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 xl:col-span-5">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold">All notifications</h2>
          <p className="text-sm text-slate-400">
            Project progress, uploads, and profiles
          </p>
        </div>
        {activities.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">
            No notifications yet. Activity from your portal will appear here.
          </p>
        ) : (
          <div className="max-h-[min(32rem,60vh)] divide-y divide-white/10 overflow-y-auto">
            {activities.map((item) => {
              const unread = isActivityUnread(item, readAt)
              return (
                <div
                  key={item.id}
                  className={`flex gap-3 px-5 py-4 ${unread ? 'bg-white/[0.03]' : ''}`}
                >
                  <CheckCircle
                    size={18}
                    className={`mt-0.5 shrink-0 ${unread ? 'text-green-400' : 'text-slate-500'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      <span className="uppercase tracking-wider text-slate-600">
                        {item.category}
                      </span>
                      {' · '}
                      {formatPlatformActivityTime(item.createdAt)}
                      {item.actorName ? ` · ${item.actorName}` : ''}
                    </p>
                  </div>
                  {unread && (
                    <span className="shrink-0 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-300">
                      New
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="xl:col-span-7">
        <PortalMessenger variant={variant} />
      </div>
    </div>
  )
}

function PendingProjectApprovalsPanel({
  projects,
  ownerLabels,
  onApprove,
  onDecline,
  canApprove,
}: {
  projects: ClientProject[]
  ownerLabels?: Record<string, string>
  onApprove?: (project: ClientProject, commission: SupportProjectCommissionInput) => void
  onDecline?: (project: ClientProject) => void
  canApprove?: boolean
}) {
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null)

  if (projects.length === 0) return null

  return (
    <>
      <section className="mb-5 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-white/[0.02] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25">
            <Clock size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {canApprove ? 'Pending project approvals' : 'Awaiting master admin approval'}
            </h2>
            <p className="text-xs text-slate-400">
              {canApprove
                ? 'Open a submission to review details, then approve or decline it.'
                : 'These submissions are queued until master admin approves them.'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                type="button"
                onClick={() => canApprove && setSelectedProject(project)}
                disabled={!canApprove}
                className={`min-w-0 flex-1 text-left ${
                  canApprove
                    ? 'cursor-pointer transition hover:opacity-90'
                    : 'cursor-default'
                }`}
              >
                {ownerLabels?.[project.ownerId] && (
                  <p className="text-[10px] font-medium uppercase tracking-wider text-blue-300/80">
                    {ownerLabels[project.ownerId]}
                  </p>
                )}
                <p className="truncate text-sm font-semibold text-white">{project.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {project.type}
                  {project.budget !== undefined ? ` · ${formatMoneyDisplay(project.budget)}` : ''}
                  {project.submittedAt
                    ? ` · Submitted ${new Date(project.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}`
                    : ''}
                </p>
              </button>
              {canApprove ? (
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="shrink-0 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-500/50 hover:bg-amber-500/20"
                >
                  Review
                </button>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                  <Clock size={12} />
                  Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedProject && canApprove && onApprove && onDecline && (
        <PendingProjectApprovalModal
          project={selectedProject}
          ownerLabel={ownerLabels?.[selectedProject.ownerId]}
          onClose={() => setSelectedProject(null)}
          onApprove={(commission) => {
            onApprove(selectedProject, commission)
            setSelectedProject(null)
          }}
          onDecline={() => {
            onDecline(selectedProject)
            setSelectedProject(null)
          }}
        />
      )}
    </>
  )
}

function DashboardMain({
  projects,
  activities,
  onOpenProject,
  variant = 'client',
  pendingApprovalProjects = [],
  ownerLabels,
  onApproveProject,
  onDeclineProject,
}: {
  projects: ClientProject[]
  activities: PlatformActivity[]
  onOpenProject: (project: ClientProject) => void
  variant?: PortalVariant
  pendingApprovalProjects?: ClientProject[]
  ownerLabels?: Record<string, string>
  onApproveProject?: (project: ClientProject, commission: SupportProjectCommissionInput) => void
  onDeclineProject?: (project: ClientProject) => void
}) {
  const activeProjects = useMemo(() => projects.filter(isActiveProject), [projects])

  const financials = useMemo(
    () => getClientProjectFinancialTotals(projects),
    [projects],
  )

  const funnelWorkload = useMemo(() => getProjectFunnelWorkload(projects), [projects])

  const commissionTotals = useMemo(
    () =>
      variant === 'support'
        ? getSupportProfileCommissionTotalsFromProjects(projects)
        : null,
    [projects, variant],
  )

  const budgetGlowClass =
    'font-bold text-[#39ff14] [text-shadow:0_0_12px_rgba(57,255,20,0.75),0_0_24px_rgba(57,255,20,0.35)]'

  const balanceOwedGlowClass =
    'font-semibold text-red-400 [text-shadow:0_0_10px_rgba(248,113,113,0.75),0_0_20px_rgba(248,113,113,0.35)]'

  const dashboardScrollMask =
    'h-full overflow-y-auto overscroll-contain pr-0.5 [mask-image:linear-gradient(to_bottom,black_0%,black_62%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_62%,transparent_100%)]'

  const dashboardListShell = (content: ReactNode) => (
    <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/[0.06] bg-[#060d18]/40 p-1.5 ring-1 ring-inset ring-white/[0.04]">
      <div className={dashboardScrollMask}>{content}</div>
    </div>
  )

  return (
    <>
      {(variant === 'master' || variant === 'support') && (
        <PendingProjectApprovalsPanel
          projects={pendingApprovalProjects}
          ownerLabels={ownerLabels}
          onApprove={onApproveProject}
          onDecline={onDeclineProject}
          canApprove={variant === 'master'}
        />
      )}

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <DashboardTopCard title="Project Funnel" theme="funnel" className="xl:col-span-5">
          <ProjectFunnelWidget workload={funnelWorkload} />
        </DashboardTopCard>

        <DashboardTopCard title="Recent Activity" theme="activity" className="xl:col-span-4">
          {dashboardListShell(
            activities.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">
                No activity yet. Project, upload, and profile actions will appear here.
              </p>
            ) : (
              <div className="space-y-1.5">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 transition hover:border-violet-500/20 hover:bg-violet-500/[0.06]"
                  >
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ${
                        dashboardActivityAccent[item.category] ??
                        'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25'
                      }`}
                    >
                      <CheckCircle size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-snug text-slate-200">
                        {item.message}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                        {formatPlatformActivityTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </DashboardTopCard>

        <DashboardTopCard title="Invoices & Payments" theme="invoices" className="xl:col-span-3">
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex min-h-0 flex-1 items-center gap-3 rounded-xl border border-white/[0.06] bg-[#060d18]/40 p-2 ring-1 ring-inset ring-white/[0.04]">
              <div className="rounded-full bg-white/[0.03] p-1 ring-1 ring-white/10">
                <InvoicePaymentDonut
                  totalBudget={
                    variant === 'support' && commissionTotals
                      ? commissionTotals.potential
                      : financials.totalBudget
                  }
                  balanceDue={
                    variant === 'support' && commissionTotals
                      ? commissionTotals.pending
                      : financials.totalBalance
                  }
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {variant === 'support' ? 'Commission potential' : 'Revenue'}
                  </p>
                  <p className={`text-xl leading-tight ${budgetGlowClass}`}>
                    {formatMoneyDisplay(
                      variant === 'support' && commissionTotals
                        ? commissionTotals.potential
                        : financials.totalBudget,
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {variant === 'support' ? 'Commission earned' : 'Balance due'}
                  </p>
                  <p
                    className={`text-base leading-tight ${
                      variant === 'support' && commissionTotals
                        ? commissionTotals.earned > 0
                          ? budgetGlowClass
                          : 'font-semibold text-slate-500'
                        : financials.totalBalance > 0
                          ? balanceOwedGlowClass
                          : 'font-semibold text-slate-500'
                    }`}
                  >
                    {formatMoneyDisplay(
                      variant === 'support' && commissionTotals
                        ? commissionTotals.earned
                        : financials.totalBalance,
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#39ff14]/20 bg-[#39ff14]/10 px-2 py-0.5 text-[10px] font-medium text-[#39ff14]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_6px_rgba(57,255,20,0.65)]" />
                {variant === 'support' ? 'Earned' : 'Revenue'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[10px] font-medium text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.55)]" />
                {variant === 'support' ? 'Pending' : 'Owed'}
              </span>
            </div>
            {variant === 'client' && (
              <button
                type="button"
                className="w-full shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition hover:from-blue-500 hover:to-blue-400"
              >
                Pay Now
              </button>
            )}
          </div>
        </DashboardTopCard>
      </section>

      <section className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <DashboardTopCard
          title="Project Progress Overview"
          theme="projects"
          className="xl:col-span-12"
        >
          {dashboardListShell(
            activeProjects.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">No active projects yet.</p>
            ) : (
              <div className="space-y-1.5">
                {activeProjects.map((project) => {
                  const { id, name, type, status } = project
                  const progressValue = getProjectProgressPercent(project)
                  const progressLabel = getProjectProgressLabel(project)
                  const showSupportCommission = shouldShowProjectCommission(project, variant)
                  const masterPendingNet =
                    variant === 'master' &&
                    showSupportCommission &&
                    project.budget !== undefined &&
                    project.budget > 0
                      ? Math.max(
                          0,
                          project.budget -
                            getProjectSupportCommissionParts(project).potential,
                        )
                      : null

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onOpenProject(project)}
                      className="group flex w-full items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-blue-500/25 hover:bg-blue-500/[0.07]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-100 group-hover:text-white">
                          {name}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">{type}</p>
                        {showSupportCommission && variant !== 'master' && (
                          <div className="mt-1">
                            <ProjectCommissionInline project={project} />
                          </div>
                        )}
                      </div>
                      <div className="w-28 shrink-0">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${projectStatusStyles[status] ?? 'bg-white/10 text-slate-300 ring-white/10'}`}
                        >
                          {status}
                        </span>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                      </div>
                      {masterPendingNet !== null ? (
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            Pending
                          </p>
                          <p className="text-xs font-semibold tabular-nums text-sky-300 [text-shadow:0_0_10px_rgba(125,211,252,0.75),0_0_22px_rgba(125,211,252,0.35)]">
                            {formatMoneyDisplay(masterPendingNet)}
                          </p>
                        </div>
                      ) : (
                        <p className="shrink-0 text-xs font-semibold tabular-nums text-slate-300">
                          {progressLabel}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          )}
        </DashboardTopCard>
      </section>

      <section className="mt-5 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
        <Panel title="Reports & Analytics" className="h-full xl:col-span-12">
          <p className="text-sm text-slate-400">Website Traffic This Month</p>
          <p className="text-3xl font-semibold">
            23,456 <span className="text-sm text-green-400">+12.5%</span>
          </p>
          <div className="mt-6 h-28 rounded-xl bg-gradient-to-t from-blue-600/30 to-transparent" />
        </Panel>
      </section>
    </>
  )
}

function CompletedJobCard({
  project,
  ownerLabel,
  onOpen,
  canUncomplete,
  onUncomplete,
  onGoToArchives,
  showCommission = false,
}: {
  project: ClientProject
  ownerLabel?: string
  onOpen: () => void
  canUncomplete?: boolean
  onUncomplete?: (project: ClientProject) => void
  onGoToArchives?: () => void
  showCommission?: boolean
}) {
  const completedLabel = project.completedAt
    ? new Date(project.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : 'Completed'

  return (
    <div className="flex items-stretch gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.09]">
      <button
        type="button"
        onClick={onOpen}
        className="group flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/25">
          <CheckCircle size={18} className="text-emerald-300" />
        </div>
        <div className="min-w-0 flex-1">
          {ownerLabel && (
            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-300/80">
              {ownerLabel}
            </p>
          )}
          <p className="truncate text-sm font-semibold text-white">{project.name}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {completedLabel}
            {project.orderConfirmed ? ' · Order confirmed' : ' · Awaiting confirmation'}
          </p>
          {showCommission && (
            <div className="mt-1.5">
              <ProjectCommissionInline project={project} />
            </div>
          )}
        </div>
        <span className="shrink-0 text-xs font-medium text-emerald-300 transition group-hover:text-emerald-200">
          View details
        </span>
      </button>
      <div className="m-2 flex shrink-0 flex-col justify-center gap-2 self-center">
        {onGoToArchives && (
          <button
            type="button"
            onClick={onGoToArchives}
            className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:border-violet-500/50 hover:bg-violet-500/20 hover:text-violet-100"
          >
            Archives
          </button>
        )}
        {canUncomplete && onUncomplete && (
          <button
            type="button"
            onClick={() => onUncomplete(project)}
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:border-amber-500/50 hover:bg-amber-500/20 hover:text-amber-100"
          >
            Uncomplete
          </button>
        )}
      </div>
    </div>
  )
}

function ProjectsMain({
  projects,
  completedProjects,
  onOpenProject,
  onOpenCompletedProject,
  onEditProject,
  onDeleteProject,
  canUncomplete,
  onUncompleteProject,
  variant = 'client',
  ownerLabels,
  profileFilter,
  onProfileFilterChange,
  pendingApprovalProjects = [],
  onApproveProject,
  onDeclineProject,
}: {
  projects: ClientProject[]
  completedProjects: ClientProject[]
  onOpenProject: (project: ClientProject) => void
  onOpenCompletedProject: (project: ClientProject) => void
  onEditProject: (project: ClientProject) => void
  onDeleteProject: (project: ClientProject) => void
  canUncomplete?: boolean
  onUncompleteProject?: (project: ClientProject) => void
  variant?: PortalVariant
  ownerLabels?: Record<string, string>
  profileFilter?: ProfileRoleFilter
  onProfileFilterChange?: (filter: ProfileRoleFilter) => void
  pendingApprovalProjects?: ClientProject[]
  onApproveProject?: (project: ClientProject, commission: SupportProjectCommissionInput) => void
  onDeclineProject?: (project: ClientProject) => void
}) {
  const navigate = useNavigate()
  const staffPaths = getStaffPathsForVariant(variant)
  const activeCount = projects.filter((p) => p.status === 'In Progress').length
  const reviewCount = projects.filter((p) => p.status === 'Review').length
  const completeCount = completedProjects.length
  const profileCount = new Set([...projects, ...completedProjects].map((project) => project.ownerId)).size
  const staffProfileControls = showsStaffProfileControls(variant)

  return (
    <>
      {(variant === 'master' || variant === 'support') && (
        <PendingProjectApprovalsPanel
          projects={pendingApprovalProjects}
          ownerLabels={ownerLabels}
          onApprove={onApproveProject}
          onDecline={onDeclineProject}
          canApprove={variant === 'master'}
        />
      )}

      <section className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(staffProfileControls
          ? [
              { label: 'Active Projects', value: projects.length },
              { label: 'Profiles', value: profileCount },
              { label: 'In Progress', value: activeCount },
              { label: 'Completed', value: completeCount },
            ]
          : [
              { label: 'Active Projects', value: projects.length },
              { label: 'In Progress', value: activeCount },
              { label: 'In Review', value: reviewCount },
              { label: 'Completed', value: completeCount },
            ]).map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <Panel
        title={staffProfileControls ? 'All Profile Projects' : 'My Projects'}
        actionLabel={staffProfileControls ? 'Back to profiles' : 'Back to dashboard'}
        onActionClick={() =>
          navigate(
            staffPaths
              ? staffProfileControls
                ? staffPaths.profiles
                : staffPaths.dashboard
              : '/clientportal',
          )
        }
      >
        {staffProfileControls && onProfileFilterChange && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="shrink-0 text-sm text-slate-400">Profile</span>
            <ProfileRoleFilterSelect
              id="master-profile-filter"
              value={profileFilter ?? 'all'}
              onChange={onProfileFilterChange}
            />
          </div>
        )}

        {projects.length === 0 ? (
          <p className="text-sm text-slate-400">No active projects found for this view.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                ownerLabel={ownerLabels?.[project.ownerId]}
                showCommission={shouldShowProjectCommission(project, variant)}
                onOpen={() => onOpenProject(project)}
                onEdit={() => onEditProject(project)}
                onDelete={() => onDeleteProject(project)}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="Completed Jobs"
        className="mt-5"
        actionLabel="Archives"
        onActionClick={() =>
          navigate(staffPaths ? staffPaths.archives : '/clientportalarchives')
        }
      >
        {completedProjects.length === 0 ? (
          <p className="text-sm text-slate-400">
            No completed jobs yet. Jobs appear here after an admin marks them complete at 100%.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {completedProjects.map((project) => (
              <CompletedJobCard
                key={project.id}
                project={project}
                ownerLabel={ownerLabels?.[project.ownerId]}
                showCommission={shouldShowProjectCommission(project, variant)}
                onOpen={() => onOpenCompletedProject(project)}
                canUncomplete={canUncomplete}
                onUncomplete={onUncompleteProject}
                onGoToArchives={() =>
                  navigate(staffPaths ? staffPaths.archives : '/clientportalarchives')
                }
              />
            ))}
          </div>
        )}
      </Panel>
    </>
  )
}

function ArchivesMain({
  completedProjects,
  onOpenCompletedProject,
  canUncomplete,
  onUncompleteProject,
  variant = 'client',
  ownerLabels,
  profileFilter,
  onProfileFilterChange,
}: {
  completedProjects: ClientProject[]
  onOpenCompletedProject: (project: ClientProject) => void
  canUncomplete?: boolean
  onUncompleteProject?: (project: ClientProject) => void
  variant?: PortalVariant
  ownerLabels?: Record<string, string>
  profileFilter?: ProfileRoleFilter
  onProfileFilterChange?: (filter: ProfileRoleFilter) => void
}) {
  const navigate = useNavigate()
  const staffPaths = getStaffPathsForVariant(variant)
  const staffProfileControls = showsStaffProfileControls(variant)
  const confirmedCount = completedProjects.filter((project) => project.orderConfirmed).length
  const awaitingCount = completedProjects.length - confirmedCount

  return (
    <>
      <section className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: 'Archived jobs', value: completedProjects.length },
          { label: 'Orders confirmed', value: confirmedCount },
          { label: 'Awaiting confirmation', value: awaitingCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <Panel
        title="Completed Jobs"
        actionLabel={isStaffPortalVariant(variant) ? 'Back to projects' : 'Back to dashboard'}
        onActionClick={() =>
          navigate(staffPaths ? staffPaths.projects : '/clientportal')
        }
      >
        {staffProfileControls && onProfileFilterChange && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="shrink-0 text-sm text-slate-400">Profile</span>
            <ProfileRoleFilterSelect
              id="master-archives-profile-filter"
              value={profileFilter ?? 'all'}
              onChange={onProfileFilterChange}
            />
          </div>
        )}

        {completedProjects.length === 0 ? (
          <p className="text-sm text-slate-400">
            No archived jobs yet. Completed projects appear here after a job is marked complete.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {completedProjects.map((project) => (
              <CompletedJobCard
                key={project.id}
                project={project}
                ownerLabel={ownerLabels?.[project.ownerId]}
                showCommission={shouldShowProjectCommission(project, variant)}
                onOpen={() => onOpenCompletedProject(project)}
                canUncomplete={canUncomplete}
                onUncomplete={onUncompleteProject}
              />
            ))}
          </div>
        )}
      </Panel>
    </>
  )
}

function formatUploadTimestamp(uploadedAt: string) {
  return new Date(uploadedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getUploadThumbMeta(type: string, name: string): {
  icon: LucideIcon
  tileClass: string
  iconClass: string
} {
  const mime = type.toLowerCase()
  const ext = name.split('.').pop()?.toLowerCase() ?? ''

  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
  ) {
    return {
      icon: Image,
      tileClass: 'bg-violet-500/15',
      iconClass: 'text-violet-300',
    }
  }

  if (mime.includes('pdf') || ext === 'pdf') {
    return {
      icon: FileText,
      tileClass: 'bg-red-500/15',
      iconClass: 'text-red-300',
    }
  }

  if (
    mime.includes('sheet') ||
    mime.includes('excel') ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  ) {
    return {
      icon: FileText,
      tileClass: 'bg-emerald-500/15',
      iconClass: 'text-emerald-300',
    }
  }

  return {
    icon: FileText,
    tileClass: 'bg-blue-500/10',
    iconClass: 'text-blue-300',
  }
}

function getFileListThumbUrl(file: ClientProjectFile): string | undefined {
  const dataUrl = getClientProjectFileDataUrl(file)
  if (!dataUrl) return undefined
  if (isClientProjectImageFile(file.type, file.name) || isDataUrlImage(dataUrl)) {
    return dataUrl
  }
  return undefined
}

function FileRowActionsMenu({
  fileName,
  menuContent,
}: {
  fileName: string
  menuContent: ReactNode
}) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ visibility: 'hidden' })

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current
    const menu = menuRef.current
    if (!anchor || !menu) return

    const rect = anchor.getBoundingClientRect()
    const menuRect = menu.getBoundingClientRect()
    const gap = 4
    const padding = 8

    let top = rect.bottom + gap
    if (top + menuRect.height > window.innerHeight - padding) {
      top = rect.top - menuRect.height - gap
    }
    top = Math.max(padding, Math.min(top, window.innerHeight - menuRect.height - padding))

    let left = rect.right
    if (left - menuRect.width < padding) {
      left = rect.left + menuRect.width
    }

    setMenuStyle({
      position: 'fixed',
      top,
      left,
      transform: 'translateX(-100%)',
      zIndex: 9999,
      visibility: 'visible',
    })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    const raf = requestAnimationFrame(updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (anchorRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
        aria-label={`File actions for ${fileName}`}
        title="Duplicate, move, or delete"
        aria-expanded={open}
      >
        <MoreVertical size={15} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="max-h-[min(16rem,calc(100vh-2rem))] min-w-[180px] max-w-[14rem] overflow-y-auto rounded-lg border border-white/10 bg-[#0a1628] py-1 shadow-xl"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('button')) {
                setOpen(false)
              }
            }}
          >
            {menuContent}
          </div>,
          document.body,
        )}
    </>
  )
}

function UploadFileRow({
  upload,
  moveTargets,
  onPreview,
  onDelete,
  onDuplicate,
  onMoveToFileManager,
  onMove,
  rowIndex,
}: {
  upload: ClientUpload
  moveTargets: { id: string; name: string }[]
  onPreview: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveToFileManager: () => void
  onMove: (toProjectId: string) => void
  rowIndex: number
}) {
  const { icon: Icon, iconClass } = getUploadThumbMeta(upload.type, upload.name)
  const [thumbUrl, setThumbUrl] = useState<string | undefined>(() => getFileListThumbUrl(upload))
  const canDownload = canDownloadClientProjectFile(upload)

  useEffect(() => {
    const legacy = getFileListThumbUrl(upload)
    if (legacy) {
      setThumbUrl(legacy)
      return
    }
    if (!upload.blobStored) {
      setThumbUrl(undefined)
      return
    }

    let cancelled = false
    resolveClientProjectFileUrl(upload).then((url) => {
      if (cancelled || !url) return
      if (isClientProjectImageFile(upload.type, upload.name) || isDataUrlImage(url)) {
        setThumbUrl(url)
      }
    })
    return () => {
      cancelled = true
    }
  }, [upload])

  return (
    <div
      className={`flex min-w-[min(100%,20rem)] items-center gap-2 px-3 py-2.5 ${
        rowIndex % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.06]'
      }`}
    >
      <button
        type="button"
        onClick={onPreview}
        className="flex min-w-0 flex-1 items-center gap-3 text-left transition hover:opacity-90"
        aria-label={`Preview ${upload.name}`}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/5">
            <Icon size={16} className={iconClass} />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-200">{upload.name}</p>
          <p className="text-xs text-slate-500">
            {formatClientProjectFileSize(upload.size)}
            {upload.uploadedAt
              ? ` · ${formatUploadTimestamp(upload.uploadedAt)}`
              : ''}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onPreview}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-300"
          aria-label={`Preview ${upload.name}`}
          title="Preview"
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          onClick={() => void downloadClientProjectFileAsync(upload)}
          disabled={!canDownload}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-300 disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Download ${upload.name}`}
          title="Download"
        >
          <Download size={15} />
        </button>
        <FileRowActionsMenu
          fileName={upload.name}
          menuContent={
            <>
              <button
                type="button"
                onClick={onDuplicate}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-white/10"
              >
                <Copy size={13} className="shrink-0 text-slate-400" />
                Duplicate
              </button>
              <button
                type="button"
                onClick={onMoveToFileManager}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-white/10"
              >
                <FolderOpen size={13} className="shrink-0 text-slate-400" />
                Move to File Manager
              </button>
              {moveTargets.length > 0 && (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Move to project
                  </p>
                  {moveTargets.map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => onMove(target.id)}
                      className="flex w-full items-center gap-2 truncate px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-white/10"
                    >
                      <FolderKanban size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{target.name}</span>
                    </button>
                  ))}
                </>
              )}
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                onClick={onDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-300 transition hover:bg-red-500/10"
              >
                <Trash2 size={13} className="shrink-0 text-red-400" />
                Delete
              </button>
            </>
          }
        />
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          aria-label={`Delete ${upload.name}`}
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

function UploadsStatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  iconClassName: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5">
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${iconClassName}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

function UploadsWorkspaceCard({
  title,
  subtitle,
  badge,
  icon: Icon,
  iconClassName = 'bg-blue-500/15 text-blue-300',
  className = '',
  children,
}: {
  title: string
  subtitle?: string
  badge?: string | number
  icon: LucideIcon
  iconClassName?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_12px_40px_rgba(0,0,0,0.25)] ${className}`}
    >
      <div className="flex shrink-0 items-start gap-3 overflow-hidden rounded-t-2xl border-b border-white/10 px-5 py-4">
        <div className={`rounded-xl p-2.5 ${iconClassName}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-white">{title}</h2>
            {badge !== undefined && (
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-auto p-5">{children}</div>
    </div>
  )
}

function FileManagerFileRow({
  file,
  rowIndex,
  moveTargets,
  onPreview,
  onDelete,
  onDuplicate,
  onMove,
}: {
  file: FileManagerFile
  rowIndex: number
  moveTargets: { id: string; name: string }[]
  onPreview: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMove: (toProjectId: string) => void
}) {
  const { icon: Icon, iconClass } = getUploadThumbMeta(file.type, file.name)
  const [thumbUrl, setThumbUrl] = useState<string | undefined>(() => getFileListThumbUrl(file))
  const canDownload = canDownloadClientProjectFile(file)

  useEffect(() => {
    const legacy = getFileListThumbUrl(file)
    if (legacy) {
      setThumbUrl(legacy)
      return
    }
    if (!file.blobStored) {
      setThumbUrl(undefined)
      return
    }

    let cancelled = false
    resolveClientProjectFileUrl(file).then((url) => {
      if (cancelled || !url) return
      if (isClientProjectImageFile(file.type, file.name) || isDataUrlImage(url)) {
        setThumbUrl(url)
      }
    })
    return () => {
      cancelled = true
    }
  }, [file])

  return (
    <div
      className={`flex min-w-[min(100%,20rem)] items-center gap-2 px-4 py-3 ${
        rowIndex % 2 === 0 ? 'bg-white/[0.03]' : 'bg-white/[0.07]'
      }`}
    >
      <button
        type="button"
        onClick={onPreview}
        className="flex min-w-0 flex-1 items-center gap-3 text-left transition hover:opacity-90"
        aria-label={`Preview ${file.name}`}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/5">
            <Icon size={16} className={iconClass} />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-200">{file.name}</p>
          <p className="text-xs text-slate-500">
            {formatClientProjectFileSize(file.size)}
            {` · ${formatUploadTimestamp(file.uploadedAt)}`}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onPreview}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-300"
          aria-label={`Preview ${file.name}`}
          title="Preview"
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          onClick={() => void downloadClientProjectFileAsync(file)}
          disabled={!canDownload}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-300 disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Download ${file.name}`}
          title="Download"
        >
          <Download size={15} />
        </button>
        <FileRowActionsMenu
          fileName={file.name}
          menuContent={
            <>
              <button
                type="button"
                onClick={onDuplicate}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-white/10"
              >
                <Copy size={13} className="shrink-0 text-slate-400" />
                Duplicate
              </button>
              {moveTargets.length > 0 && (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Move to project
                  </p>
                  {moveTargets.map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => onMove(target.id)}
                      className="flex w-full items-center gap-2 truncate px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-white/10"
                    >
                      <FolderKanban size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{target.name}</span>
                    </button>
                  ))}
                </>
              )}
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                onClick={onDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-300 transition hover:bg-red-500/10"
              >
                <Trash2 size={13} className="shrink-0 text-red-400" />
                Delete
              </button>
            </>
          }
        />
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          aria-label={`Delete ${file.name}`}
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

function PortalFileManagerCard({
  files,
  moveTargets,
  onRefresh,
  actingOwnerId,
}: {
  files: FileManagerFile[]
  moveTargets: { id: string; name: string }[]
  onRefresh: () => void
  actingOwnerId?: string
}) {
  const [previewFile, setPreviewFile] = useState<FileManagerFile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const visibleFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return files
    return files.filter((file) => file.name.toLowerCase().includes(query))
  }, [files, searchQuery])

  const handleDelete = (fileId: string, fileName: string) => {
    const confirmed = window.confirm(`Remove "${fileName}" from File Manager?`)
    if (!confirmed) return

    const ownerId = actingOwnerId ?? findFileManagerFileOwner(fileId)
    const result = deleteFileManagerFile(fileId, ownerId)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    onRefresh()
  }

  const handleDuplicate = async (fileId: string) => {
    const ownerId = actingOwnerId ?? findFileManagerFileOwner(fileId)
    const result = await duplicateFileManagerFile(fileId, ownerId)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    onRefresh()
  }

  const handleMoveToProject = (fileId: string, projectId: string) => {
    const ownerId = actingOwnerId ?? findFileManagerFileOwner(fileId)
    const result = moveFileManagerFileToProject(fileId, projectId, ownerId)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    onRefresh()
  }

  return (
    <>
      {previewFile && (
        <UploadFilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      <UploadsWorkspaceCard
        title="File Manager"
        subtitle="Quick-access files stored outside project folders"
        badge={files.length}
        icon={FolderOpen}
        iconClassName="bg-violet-500/15 text-violet-300"
      >
        <div className="relative mb-3">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50"
          />
        </div>

        {files.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center">
            <FolderOpen size={28} className="text-slate-500" />
            <p className="mt-3 text-sm font-medium text-slate-300">No files yet</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Choose File Manager as the destination and upload files from the panel on the left.
            </p>
          </div>
        ) : visibleFiles.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No files match &ldquo;{searchQuery}&rdquo;.
          </p>
        ) : (
          <div className="min-h-[16rem] flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-white/10">
            {visibleFiles.map((file, index) => (
              <FileManagerFileRow
                key={file.id}
                file={file}
                rowIndex={index}
                moveTargets={moveTargets}
                onPreview={() => setPreviewFile(file)}
                onDelete={() => handleDelete(file.id, file.name)}
                onDuplicate={() => void handleDuplicate(file.id)}
                onMove={(projectId) => handleMoveToProject(file.id, projectId)}
              />
            ))}
          </div>
        )}
      </UploadsWorkspaceCard>
    </>
  )
}

function PortalUploadCard({
  projects,
  uploadTarget,
  onUploadTargetChange,
  onUploaded,
  actingOwnerId,
  variant = 'client',
  ownerLabels,
}: {
  projects: ClientProject[]
  uploadTarget: string
  onUploadTargetChange: (target: string) => void
  onUploaded: () => void
  actingOwnerId?: string
  variant?: PortalVariant
  ownerLabels?: Record<string, string>
}) {
  const navigate = useNavigate()
  const staffPaths = getStaffPathsForVariant(variant)
  const projectsPath = staffPaths ? staffPaths.projects : '/clientportalprojects'
  const [pendingFiles, setPendingFiles] = useState<ClientProjectFile[]>([])
  const [previewFile, setPreviewFile] = useState<ClientProjectFile | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)

  const isFileManager = uploadTarget === FILE_MANAGER_TARGET_ID

  const handlePickFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList?.length) return

    try {
      const added = await Promise.all(
        Array.from(fileList).map((file) => buildClientProjectFileFromUpload(file)),
      )
      setPendingFiles((prev) => [...prev, ...added])
      setUploadError('')
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Could not add files. Please try again.',
      )
    } finally {
      event.target.value = ''
    }
  }

  const handleUpload = async () => {
    setUploadError('')
    if (!uploadTarget) {
      setUploadError('Select a destination first.')
      return
    }
    if (pendingFiles.length === 0) {
      setUploadError('Add at least one file to upload.')
      return
    }

    setUploading(true)

    try {
      if (isFileManager) {
        const result = addFileManagerFiles(pendingFiles, actingOwnerId)
        if (!result.ok) {
          setUploadError(result.error)
          return
        }
        setPendingFiles([])
        onUploaded()
        return
      }

      const project = projects.find((item) => item.id === uploadTarget)
      if (!project) {
        setUploadError('Project not found.')
        return
      }

      const result = updateClientProject(project.id, {
        name: project.name,
        type: project.type as ClientProjectType,
        urgency: project.urgency,
        date: project.date ?? getTodayIsoDate(),
        description: project.description,
        budget: project.budget,
        files: [...(project.files ?? []), ...pendingFiles],
      })

      if (!result.ok) {
        setUploadError(result.error)
        return
      }

      setPendingFiles([])
      onUploaded()
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const destinationPillClass = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
      active
        ? 'border-blue-500/50 bg-blue-500/20 text-blue-200'
        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
    }`

  return (
    <>
      {previewFile && (
        <UploadFilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      <UploadsWorkspaceCard
        title="Upload files"
        subtitle="Send files to File Manager or attach them to a project"
        icon={Upload}
      >
        {projects.length === 0 && !isFileManager ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center">
            <Upload size={28} className="text-slate-500" />
            <p className="mt-3 text-sm font-medium text-slate-300">No projects yet</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Create a project or upload directly to File Manager.
            </p>
            <button
              type="button"
              onClick={() => onUploadTargetChange(FILE_MANAGER_TARGET_ID)}
              className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Use File Manager
            </button>
            <button
              type="button"
              onClick={() => navigate(projectsPath)}
              className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Go to Projects
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Destination
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => onUploadTargetChange(FILE_MANAGER_TARGET_ID)}
                  className={destinationPillClass(isFileManager)}
                >
                  <FolderOpen size={13} />
                  File Manager
                </button>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onUploadTargetChange(project.id)}
                    className={destinationPillClass(uploadTarget === project.id)}
                    title={
                      showsStaffProfileControls(variant)
                        ? `${ownerLabels?.[project.ownerId] ?? getProfileLabelForOwner(project.ownerId)} · ${project.name}`
                        : project.name
                    }
                  >
                    <FolderKanban size={13} />
                    <span className="max-w-[10rem] truncate">{project.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-10 transition hover:border-blue-500/50 hover:bg-blue-500/[0.04]">
              <div className="rounded-full bg-blue-500/15 p-3 text-blue-300">
                <Upload size={22} />
              </div>
              <span className="mt-3 text-sm font-medium text-slate-200">
                Drop files here or click to browse
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Images, PDFs, documents, and any file type
              </span>
              <input type="file" multiple className="hidden" onChange={handlePickFiles} />
            </label>

            {pendingFiles.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <p className="border-b border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Ready to upload ({pendingFiles.length})
                </p>
                <ul>
                  {pendingFiles.map((file, index) => (
                    <li
                      key={file.id}
                      className={`flex items-center justify-between gap-3 px-3 py-2 ${
                        index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.05]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left transition hover:opacity-90"
                      >
                        {getFileListThumbUrl(file) ? (
                          <img
                            src={getFileListThumbUrl(file)}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-slate-400">
                            <FileText size={14} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm text-slate-200">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatClientProjectFileSize(file.size)}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((prev) => prev.filter((item) => item.id !== file.id))
                        }
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleUpload()}
              disabled={uploading || pendingFiles.length === 0 || !uploadTarget}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <Upload size={16} />
              {uploading
                ? 'Uploading…'
                : isFileManager
                  ? 'Upload to File Manager'
                  : 'Upload to project'}
            </button>

            {uploadError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {uploadError}
              </p>
            )}
          </div>
        )}
      </UploadsWorkspaceCard>
    </>
  )
}

function PortalUploadsSection({
  projects,
  onUploaded,
  fileManagerSyncKey,
  actingOwnerId,
  fileManagerOwnerIds,
  variant = 'client',
  ownerLabels,
}: {
  projects: ClientProject[]
  onUploaded: () => void
  fileManagerSyncKey?: number
  actingOwnerId?: string
  fileManagerOwnerIds?: string[]
  variant?: PortalVariant
  ownerLabels?: Record<string, string>
}) {
  const [uploadTarget, setUploadTarget] = useState(FILE_MANAGER_TARGET_ID)
  const loadFileManagerFiles = useCallback(() => {
    if (fileManagerOwnerIds && fileManagerOwnerIds.length > 0) {
      return listFileManagerFilesForOwnerIds(fileManagerOwnerIds)
    }
    return listFileManagerFiles(actingOwnerId)
  }, [actingOwnerId, fileManagerOwnerIds])
  const [fileManagerFiles, setFileManagerFiles] = useState(() => loadFileManagerFiles())

  const moveTargets = useMemo(
    () => projects.map((project) => ({ id: project.id, name: project.name })),
    [projects],
  )

  useEffect(() => {
    if (
      uploadTarget === FILE_MANAGER_TARGET_ID ||
      projects.some((project) => project.id === uploadTarget)
    ) {
      return
    }
    setUploadTarget(projects[0]?.id ?? FILE_MANAGER_TARGET_ID)
  }, [projects, uploadTarget])

  const refreshAll = useCallback(() => {
    onUploaded()
    setFileManagerFiles(loadFileManagerFiles())
  }, [loadFileManagerFiles, onUploaded])

  useEffect(() => {
    if (fileManagerSyncKey === undefined) return
    setFileManagerFiles(loadFileManagerFiles())
  }, [fileManagerSyncKey, loadFileManagerFiles])

  useEffect(() => {
    setFileManagerFiles(loadFileManagerFiles())
  }, [loadFileManagerFiles])

  return (
    <section className="mb-6 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
      <PortalUploadCard
        projects={projects}
        uploadTarget={uploadTarget}
        onUploadTargetChange={setUploadTarget}
        onUploaded={refreshAll}
        actingOwnerId={actingOwnerId}
        variant={variant}
        ownerLabels={ownerLabels}
      />
      <PortalFileManagerCard
        files={fileManagerFiles}
        moveTargets={moveTargets}
        onRefresh={refreshAll}
        actingOwnerId={actingOwnerId}
      />
    </section>
  )
}

function UploadsMain({
  variant = 'client',
  ownerLabels,
  profileFilter,
  onProfileFilterChange,
}: {
  variant?: PortalVariant
  ownerLabels?: Record<string, string>
  profileFilter?: ProfileRoleFilter
  onProfileFilterChange?: (filter: ProfileRoleFilter) => void
} = {}) {
  const navigate = useNavigate()
  const staffPaths = getStaffPathsForVariant(variant)
  const staffProfileControls = showsStaffProfileControls(variant)
  const [uploadGroups, setUploadGroups] = useState<ClientProjectUploadGroup[]>(
    () => listClientUploadGroups(),
  )
  const [allProjects, setAllProjects] = useState(() => listClientProjects())
  const [previewUpload, setPreviewUpload] = useState<ClientUpload | null>(null)
  const [fileManagerSyncKey, setFileManagerSyncKey] = useState(0)
  const summary = getClientUploadsSummary()

  const bumpFileManagerSync = useCallback(() => {
    setFileManagerSyncKey((key) => key + 1)
  }, [])

  const projectOwnerById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const project of allProjects) {
      map[project.id] = ownerLabels?.[project.ownerId] ?? getProfileLabelForOwner(project.ownerId)
    }
    return map
  }, [allProjects, ownerLabels])

  const visibleGroups = useMemo(() => {
    if (!staffProfileControls || !profileFilter || profileFilter === 'all') {
      return uploadGroups
    }

    const ownedProjectIds = new Set(
      allProjects
        .filter((project) => adminUserMatchesRoleFilter(project.ownerId, profileFilter))
        .map((p) => p.id),
    )
    return uploadGroups.filter((group) => ownedProjectIds.has(group.projectId))
  }, [uploadGroups, allProjects, profileFilter, staffProfileControls])

  const uploadProjects = useMemo(() => {
    if (!staffProfileControls || !profileFilter || profileFilter === 'all') {
      return allProjects
    }
    return allProjects.filter((project) =>
      adminUserMatchesRoleFilter(project.ownerId, profileFilter),
    )
  }, [allProjects, profileFilter, staffProfileControls])

  const refreshUploads = useCallback(() => {
    setUploadGroups(listClientUploadGroups())
    setAllProjects(listClientProjects())
  }, [])

  useEffect(() => {
    refreshUploads()
    const onFocus = () => refreshUploads()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshUploads])

  const handleDeleteUpload = (projectId: string, fileId: string, fileName: string) => {
    const confirmed = window.confirm(`Remove "${fileName}" from this project?`)
    if (!confirmed) return

    const result = deleteClientProjectFile(projectId, fileId)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    refreshUploads()
  }

  const handleMoveUpload = (
    fromProjectId: string,
    fileId: string,
    toProjectId: string,
  ) => {
    const result = moveClientProjectFile(fromProjectId, fileId, toProjectId)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    refreshUploads()
  }

  const handleDuplicateUpload = async (projectId: string, fileId: string) => {
    const result = await duplicateClientProjectFile(projectId, fileId)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    refreshUploads()
  }

  const handleMoveUploadToFileManager = (projectId: string, fileId: string) => {
    const result = moveClientProjectFileToFileManager(projectId, fileId)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    refreshUploads()
    bumpFileManagerSync()
  }

  const fileManagerOwnerIds =
    staffProfileControls && profileFilter && profileFilter !== 'all'
      ? getAdminOwnerIdsByRole(profileFilter)
      : undefined

  const fileManagerCount = fileManagerOwnerIds
    ? listFileManagerFilesForOwnerIds(fileManagerOwnerIds).length
    : listFileManagerFiles().length

  const uploadsBody = (
    <>
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total files',
            value: summary.count + fileManagerCount,
            icon: FileText,
            iconClassName: 'bg-blue-500/15 text-blue-300',
          },
          {
            label: 'File Manager',
            value: fileManagerCount,
            icon: FolderOpen,
            iconClassName: 'bg-violet-500/15 text-violet-300',
          },
          {
            label: 'Total size',
            value: formatClientProjectFileSize(summary.totalBytes),
            icon: HardDrive,
            iconClassName: 'bg-cyan-500/15 text-cyan-300',
          },
          {
            label: 'Projects with files',
            value: uploadGroups.length,
            icon: FolderKanban,
            iconClassName: 'bg-emerald-500/15 text-emerald-300',
          },
        ].map((stat) => (
          <UploadsStatCard key={stat.label} {...stat} />
        ))}
      </section>

      <PortalUploadsSection
        projects={uploadProjects}
        onUploaded={refreshUploads}
        fileManagerSyncKey={fileManagerSyncKey}
        fileManagerOwnerIds={fileManagerOwnerIds}
        variant={variant}
        ownerLabels={ownerLabels}
      />

      <Panel
        title="Project library"
        actionLabel={staffProfileControls ? 'Back to profiles' : isStaffPortalVariant(variant) ? 'Back to dashboard' : undefined}
        onActionClick={
          staffPaths
            ? () =>
                navigate(
                  staffProfileControls ? staffPaths.profiles : staffPaths.dashboard,
                )
            : undefined
        }
        className="border-white/[0.08] bg-white/[0.03]"
      >
        <p className="-mt-3 mb-5 text-sm text-slate-400">
          {staffProfileControls
            ? 'All files organized by project and profile — preview, download, move, or remove.'
            : 'All files organized by project — preview, download, move, or remove.'}
        </p>
        {staffProfileControls && onProfileFilterChange && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="shrink-0 text-sm text-slate-400">Profile</span>
            <ProfileRoleFilterSelect
              id="master-uploads-profile-filter"
              value={profileFilter ?? 'all'}
              onChange={onProfileFilterChange}
            />
          </div>
        )}

        {visibleGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center">
            <FolderKanban size={28} className="mx-auto text-slate-500" />
            <p className="mt-3 text-sm text-slate-300">No project files yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Upload files above or attach them when creating a project.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {visibleGroups.map((group, stageIndex) => {
              const groupOwnerId = allProjects.find((p) => p.id === group.projectId)?.ownerId
              const theme =
                profileStageThemes[stageIndex % profileStageThemes.length]
              return (
                <article
                  key={group.projectId}
                  className="rounded-2xl border border-white/10 bg-[#0a1424] transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg hover:shadow-blue-950/30"
                >
                  <div
                    className={`relative overflow-hidden rounded-t-2xl border-b border-white/10 bg-gradient-to-br ${theme.gradient} px-4 py-3`}
                  >
                    <div
                      className={`pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full blur-2xl ${theme.glow}`}
                    />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%221%22 cy=%221%22 r=%221%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`rounded-lg p-2 ring-1 ring-inset ${theme.avatarWrap}`}
                        >
                          <FolderKanban size={16} />
                        </div>
                        <div className="min-w-0">
                          {staffProfileControls && projectOwnerById[group.projectId] && (
                            <p className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                              {projectOwnerById[group.projectId]}
                            </p>
                          )}
                          <h3 className="truncate font-semibold text-white">
                            {group.projectName}
                          </h3>
                          <p className="mt-0.5 text-xs text-white/65">{group.projectType}</p>
                        </div>
                      </div>
                      <div className="shrink-0 rounded-lg bg-black/20 px-2.5 py-1.5 text-right text-xs backdrop-blur-sm">
                        <p className="font-medium text-white/90">
                          {group.files.length} file{group.files.length === 1 ? '' : 's'}
                        </p>
                        <p className="mt-0.5 text-white/60">
                          {formatClientProjectFileSize(group.totalBytes)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {group.files.map((upload, rowIndex) => (
                      <UploadFileRow
                        key={upload.id}
                        upload={upload}
                        rowIndex={rowIndex}
                        moveTargets={allProjects
                          .filter(
                            (project) =>
                              project.id !== group.projectId &&
                              project.ownerId === groupOwnerId,
                          )
                          .map((project) => ({ id: project.id, name: project.name }))}
                        onPreview={() => setPreviewUpload(upload)}
                        onDelete={() =>
                          handleDeleteUpload(group.projectId, upload.id, upload.name)
                        }
                        onDuplicate={() =>
                          void handleDuplicateUpload(group.projectId, upload.id)
                        }
                        onMoveToFileManager={() =>
                          handleMoveUploadToFileManager(group.projectId, upload.id)
                        }
                        onMove={(toProjectId) =>
                          handleMoveUpload(group.projectId, upload.id, toProjectId)
                        }
                      />
                    ))}
                  </div>
                  {group.files[0] && (
                    <p className="border-t border-white/10 px-4 py-2 text-[10px] text-slate-500">
                      Latest upload {formatUploadTimestamp(group.files[0].uploadedAt)}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </Panel>
    </>
  )

  return (
    <>
      {previewUpload && (
        <UploadFilePreviewModal
          file={previewUpload}
          onClose={() => setPreviewUpload(null)}
        />
      )}

      <PortalDashboardShell variant={variant}>{uploadsBody}</PortalDashboardShell>
    </>
  )
}

const portalFieldClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500/50'

const profileRoleBadgeStyles = adminRoleBadgeStyles

const profileStageThemes = [
  {
    gradient: 'from-blue-600/80 via-indigo-700/60 to-slate-900',
    glow: 'bg-blue-400/30',
    avatarWrap: 'bg-blue-500/25 ring-blue-400/35 text-blue-100',
  },
  {
    gradient: 'from-violet-600/80 via-purple-700/60 to-slate-900',
    glow: 'bg-violet-400/30',
    avatarWrap: 'bg-violet-500/25 ring-violet-400/35 text-violet-100',
  },
  {
    gradient: 'from-fuchsia-600/80 via-pink-700/60 to-slate-900',
    glow: 'bg-fuchsia-400/30',
    avatarWrap: 'bg-fuchsia-500/25 ring-fuchsia-400/35 text-fuchsia-100',
  },
  {
    gradient: 'from-rose-600/80 via-red-700/60 to-slate-900',
    glow: 'bg-rose-400/30',
    avatarWrap: 'bg-rose-500/25 ring-rose-400/35 text-rose-100',
  },
  {
    gradient: 'from-orange-600/80 via-amber-700/60 to-slate-900',
    glow: 'bg-orange-400/30',
    avatarWrap: 'bg-orange-500/25 ring-orange-400/35 text-orange-100',
  },
  {
    gradient: 'from-amber-500/80 via-yellow-700/50 to-slate-900',
    glow: 'bg-amber-400/30',
    avatarWrap: 'bg-amber-500/25 ring-amber-400/35 text-amber-100',
  },
  {
    gradient: 'from-lime-600/80 via-green-700/60 to-slate-900',
    glow: 'bg-lime-400/30',
    avatarWrap: 'bg-lime-500/25 ring-lime-400/35 text-lime-100',
  },
  {
    gradient: 'from-emerald-600/80 via-teal-700/60 to-slate-900',
    glow: 'bg-emerald-400/30',
    avatarWrap: 'bg-emerald-500/25 ring-emerald-400/35 text-emerald-100',
  },
  {
    gradient: 'from-cyan-600/80 via-sky-700/60 to-slate-900',
    glow: 'bg-cyan-400/30',
    avatarWrap: 'bg-cyan-500/25 ring-cyan-400/35 text-cyan-100',
  },
]

function getProfileInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function ProfileCard({
  admin,
  stageIndex,
  isOwnerProfile,
  passwordRevealed,
  onTogglePassword,
  onOpenDetails,
  onEdit,
  onDelete,
  formatCreated,
  projectFinancials,
  projectWorkload,
  commissionTotals,
}: {
  admin: AdminUser
  stageIndex: number
  isOwnerProfile: boolean
  passwordRevealed: boolean
  onTogglePassword: () => void
  onOpenDetails: () => void
  onEdit: () => void
  onDelete: () => void
  formatCreated: (createdAt: string) => string
  projectFinancials?: ProfileProjectFinancialTotals
  projectWorkload?: ProfileProjectWorkloadSummary
  commissionTotals?: SupportProfileCommissionTotals
}) {
  const { name, email, phone, role, password, createdAt, profileImageUrl } = admin
  const theme = profileStageThemes[stageIndex % profileStageThemes.length]
  const isSupportProfile = role === 'Support'

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a1424] text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg hover:shadow-blue-950/40">
      <button
        type="button"
        onClick={onOpenDetails}
        className="flex w-full flex-col text-left"
      >
        <div
          className={`relative flex shrink-0 items-center gap-2.5 overflow-hidden bg-gradient-to-br p-2.5 ${theme.gradient}`}
        >
        <div
          className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl ${theme.glow}`}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%221%22 cy=%221%22 r=%221%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60" />

        <div
          className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-bold ring-1 ${theme.avatarWrap}`}
        >
          {profileImageUrl && isDataUrlImage(profileImageUrl) ? (
            <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            getProfileInitials(name)
          )}
        </div>

        <div className="relative z-10 min-w-0 flex-1">
          <ProfileWorkloadHeatmapBar workload={projectWorkload} />
        </div>
      </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="relative z-10 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${profileRoleBadgeStyles[role]}`}
          >
            {role}
          </span>
          {isOwnerProfile && (
            <span className="inline-flex rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-inset ring-white/20">
              Master
            </span>
          )}
        </div>

        <div>
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{name}</p>
          <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">{email}</p>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Phone</span>
            <span className="truncate text-slate-300">{phone ?? '—'}</span>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3 text-[11px]">
          {isSupportProfile && commissionTotals ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">Commission earned</span>
                <span
                  className={`shrink-0 tabular-nums ${
                    commissionTotals.earned > 0
                      ? 'font-semibold text-[#39ff14] [text-shadow:0_0_8px_rgba(57,255,20,0.65),0_0_16px_rgba(57,255,20,0.3)]'
                      : 'text-slate-400'
                  }`}
                >
                  {commissionTotals.potential > 0 || commissionTotals.earned > 0
                    ? formatMoneyDisplay(commissionTotals.earned)
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">Pending commission</span>
                <span
                  className={`shrink-0 tabular-nums ${
                    commissionTotals.pending > 0
                      ? 'font-semibold text-amber-300 [text-shadow:0_0_8px_rgba(251,191,36,0.55),0_0_16px_rgba(251,191,36,0.25)]'
                      : 'text-slate-400'
                  }`}
                >
                  {commissionTotals.potential > 0 || commissionTotals.pending > 0
                    ? formatMoneyDisplay(commissionTotals.pending)
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">Revenue</span>
                <span
                  className={`shrink-0 tabular-nums ${
                    projectFinancials && projectFinancials.totalBudget > 0
                      ? 'font-semibold text-slate-300'
                      : 'text-slate-400'
                  }`}
                >
                  {projectFinancials && projectFinancials.totalBudget > 0
                    ? formatMoneyDisplay(projectFinancials.totalBudget)
                    : '—'}
                </span>
              </div>
            </>
          ) : (
            <>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Revenue</span>
            <span
              className={`shrink-0 tabular-nums ${
                projectFinancials && projectFinancials.totalBudget > 0
                  ? 'font-semibold text-[#39ff14] [text-shadow:0_0_8px_rgba(57,255,20,0.65),0_0_16px_rgba(57,255,20,0.3)]'
                  : 'text-slate-400'
              }`}
            >
              {projectFinancials && projectFinancials.totalBudget > 0
                ? formatMoneyDisplay(projectFinancials.totalBudget)
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Balance</span>
            <span
              className={`shrink-0 tabular-nums ${
                projectFinancials && projectFinancials.totalBudget > 0
                  ? projectFinancials.runningBalance < 0
                    ? 'font-semibold text-red-400 [text-shadow:0_0_8px_rgba(248,113,113,0.65),0_0_16px_rgba(248,113,113,0.3)]'
                    : projectFinancials.runningBalance === 0
                      ? 'font-semibold text-emerald-400 [text-shadow:0_0_8px_rgba(52,211,153,0.45),0_0_16px_rgba(52,211,153,0.2)]'
                      : 'font-semibold text-slate-300'
                  : 'text-slate-400'
              }`}
            >
              {projectFinancials && projectFinancials.totalBudget > 0
                ? formatMoneyDisplay(projectFinancials.runningBalance)
                : '—'}
            </span>
          </div>
            </>
          )}
        </div>

        <p className="text-[10px] text-slate-500">Onboarded {formatCreated(createdAt)}</p>
        <p className="text-[10px] font-medium text-blue-400/90 transition group-hover:text-blue-300">
          View profile details →
        </p>
      </div>
      </button>

      <div className="space-y-2 px-4 pb-3 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Password</span>
          <span className="flex items-center gap-2 truncate text-slate-300">
            <span className="truncate">
              {passwordRevealed ? password : '•'.repeat(password.length)}
            </span>
            <button
              type="button"
              onClick={onTogglePassword}
              className="shrink-0 text-blue-400 transition hover:text-blue-300"
            >
              {passwordRevealed ? 'Hide' : 'Show'}
            </button>
          </span>
        </div>
      </div>

        <div className="flex items-center gap-2 border-t border-white/10 px-4 pb-4">
          <button
            type="button"
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isOwnerProfile}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:pointer-events-none disabled:opacity-30"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
    </article>
  )
}

export function ProfilesMain({
  createOpen: createOpenProp,
  onCreateOpenChange,
  profileFilter: profileFilterProp,
  onProfileFilterChange,
  showCreateProfileButton = true,
}: {
  createOpen?: boolean
  onCreateOpenChange?: (open: boolean) => void
  profileFilter?: ProfileRoleFilter
  onProfileFilterChange?: (filter: ProfileRoleFilter) => void
  showCreateProfileButton?: boolean
} = {}) {
  const [admins, setAdmins] = useState(() => listAdminUsers())
  const [clientProjects, setClientProjects] = useState(() => listClientProjects())
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set())
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editRole, setEditRole] = useState<AdminRole>('Administrator')
  const [editProfileImageUrl, setEditProfileImageUrl] = useState('')
  const [formError, setFormError] = useState('')
  const editProfileImageInputRef = useRef<HTMLInputElement>(null)
  const [internalCreateOpen, setInternalCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPhone, setCreatePhone] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createConfirm, setCreateConfirm] = useState('')
  const [createRole, setCreateRole] = useState<AdminRole>('Administrator')
  const [createPreferredPayment, setCreatePreferredPayment] = useState<PreferredPayment | undefined>()
  const [createProfileImageUrl, setCreateProfileImageUrl] = useState('')
  const [createFormError, setCreateFormError] = useState('')
  const createProfileImageInputRef = useRef<HTMLInputElement>(null)
  const [internalProfileFilter, setInternalProfileFilter] = useState<ProfileRoleFilter>('all')
  const [selectedProfile, setSelectedProfile] = useState<AdminUser | null>(null)

  const profileFilter = profileFilterProp ?? internalProfileFilter
  const setProfileFilter = onProfileFilterChange ?? setInternalProfileFilter

  const isCreatingProfile = createOpenProp ?? internalCreateOpen
  const setCreateOpen = onCreateOpenChange ?? setInternalCreateOpen

  const refreshProfiles = useCallback(() => {
    setAdmins(listAdminUsers())
  }, [])

  const refreshProjects = useCallback(() => {
    setClientProjects(listClientProjects())
  }, [])

  const listedClientProjects = useMemo(
    () => filterListedClientProjects(clientProjects),
    [clientProjects],
  )

  const profileFinancialsMap = useMemo(
    () => getProfileProjectFinancialTotalsMap(listedClientProjects),
    [listedClientProjects],
  )

  const profileWorkloadMap = useMemo(
    () => getProfileProjectWorkloadMap(listedClientProjects),
    [listedClientProjects],
  )

  const profileCommissionMap = useMemo(
    () => getProfileSupportCommissionTotalsMap(listedClientProjects),
    [listedClientProjects],
  )

  const platformTotalBudget = useMemo(
    () => getClientProjectFinancialTotals(listedClientProjects).totalBudget,
    [listedClientProjects],
  )

  useEffect(() => {
    refreshProfiles()
    refreshProjects()
    const onFocus = () => {
      refreshProfiles()
      refreshProjects()
    }
    const onActivity = () => refreshProjects()
    window.addEventListener('focus', onFocus)
    window.addEventListener(PLATFORM_ACTIVITY_EVENT, onActivity)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(PLATFORM_ACTIVITY_EVENT, onActivity)
    }
  }, [refreshProfiles, refreshProjects])

  const togglePassword = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openEdit = (user: AdminUser) => {
    setFormError('')
    setEditingUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditPhone(user.phone?.replace(/\D/g, '') ?? '')
    setEditPassword('')
    setEditRole(user.role)
    setEditProfileImageUrl(user.profileImageUrl ?? '')
    if (editProfileImageInputRef.current) {
      editProfileImageInputRef.current.value = ''
    }
  }

  const closeEdit = () => {
    setEditingUser(null)
    setFormError('')
  }

  const openCreate = () => {
    setCreateFormError('')
    setCreateName('')
    setCreateEmail('')
    setCreatePhone('')
    setCreatePassword('')
    setCreateConfirm('')
    setCreateRole('Administrator')
    setCreatePreferredPayment(undefined)
    setCreateProfileImageUrl('')
    if (createProfileImageInputRef.current) {
      createProfileImageInputRef.current.value = ''
    }
    setCreateOpen(true)
  }

  const closeCreate = () => {
    setCreateOpen(false)
    setCreateFormError('')
    setCreateProfileImageUrl('')
    if (createProfileImageInputRef.current) {
      createProfileImageInputRef.current.value = ''
    }
  }

  const handleCreateProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCreateFormError('')
    const result = await readProfileImageDataUrl(file)
    if (!result.ok) {
      setCreateFormError(result.error)
      event.target.value = ''
      return
    }

    setCreateProfileImageUrl(result.dataUrl)
  }

  const handleCreateProfile = () => {
    setCreateFormError('')

    if (isExclusiveOwnerEmail(createEmail)) {
      setCreateFormError('This email is reserved for the master admin profile.')
      return
    }

    if (createPassword !== createConfirm) {
      setCreateFormError('Passwords do not match.')
      return
    }

    if (createPassword.length < 8) {
      setCreateFormError('Password must be at least 8 characters.')
      return
    }

    const paymentError = roleUsesPreferredPayment(createRole)
      ? validatePreferredPayment(createPreferredPayment)
      : null
    if (paymentError) {
      setCreateFormError(paymentError)
      return
    }

    const result = createAdminUser({
      name: createName,
      email: createEmail,
      phone: createPhone,
      password: createPassword,
      role: createRole,
      ...(createProfileImageUrl ? { profileImageUrl: createProfileImageUrl } : {}),
      ...(roleUsesPreferredPayment(createRole) && createPreferredPayment
        ? { preferredPayment: createPreferredPayment }
        : {}),
    })

    if (!result.ok) {
      setCreateFormError(result.error)
      return
    }

    closeCreate()
    refreshProfiles()
  }

  const handleSaveEdit = () => {
    if (!editingUser) return
    setFormError('')

    const result = updateAdminUser(editingUser.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      password: editPassword || undefined,
      role: editRole,
      profileImageUrl: editProfileImageUrl,
    })

    if (!result.ok) {
      setFormError(result.error)
      return
    }

    closeEdit()
    refreshProfiles()
  }

  const handleDelete = (user: AdminUser) => {
    if (isExclusiveOwnerEmail(user.email)) return

    const confirmed = window.confirm(`Delete profile for ${user.name}? This cannot be undone.`)
    if (!confirmed) return

    const result = deleteAdminUser(user.id)
    if (!result.ok) {
      window.alert(result.error)
      return
    }

    refreshProfiles()
  }

  const formatCreated = (createdAt: string) =>
    new Date(createdAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const listedAdmins = useMemo(
    () => admins.filter((admin) => !isExclusiveOwnerEmail(admin.email)),
    [admins],
  )

  const filteredAdmins = useMemo(() => {
    if (profileFilter === 'all') return listedAdmins
    return listedAdmins.filter((admin) => admin.role === profileFilter)
  }, [listedAdmins, profileFilter])

  const selectedProfileStageIndex = useMemo(() => {
    if (!selectedProfile) return 0
    const index = filteredAdmins.findIndex((admin) => admin.id === selectedProfile.id)
    return index >= 0 ? index : 0
  }, [selectedProfile, filteredAdmins])

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="shrink-0 text-sm text-slate-400">Profile</span>
          <ProfileRoleFilterSelect
            id="profiles-role-filter"
            value={profileFilter}
            onChange={setProfileFilter}
          />
        </div>
        {showCreateProfileButton && <NewProfileButton onClick={openCreate} />}
      </div>

      <section className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: 'Total profiles', value: filteredAdmins.length },
          {
            label: 'Administrators',
            value: filteredAdmins.filter((a) => a.role === 'Administrator').length,
          },
          {
            label: 'Customers & Support',
            value: filteredAdmins.filter((a) => a.role !== 'Administrator').length,
          },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <Panel title="Admin Profiles">
        {filteredAdmins.length === 0 ? (
          <p className="text-sm text-slate-400">
            {listedAdmins.length === 0
              ? showCreateProfileButton
                ? 'No team profiles yet. Use Add profile to onboard someone manually.'
                : 'No team profiles yet.'
              : 'No profiles match this role filter.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAdmins.map((admin, index) => (
              <ProfileCard
                key={admin.id}
                admin={admin}
                stageIndex={index}
                isOwnerProfile={false}
                passwordRevealed={revealedIds.has(admin.id)}
                onTogglePassword={() => togglePassword(admin.id)}
                onOpenDetails={() => setSelectedProfile(admin)}
                onEdit={() => openEdit(admin)}
                onDelete={() => handleDelete(admin)}
                formatCreated={formatCreated}
                projectFinancials={profileFinancialsMap[admin.id]}
                projectWorkload={profileWorkloadMap[admin.id]}
                commissionTotals={
                  admin.role === 'Support' ? profileCommissionMap[admin.id] : undefined
                }
              />
            ))}
          </div>
        )}
      </Panel>

      {showCreateProfileButton && isCreatingProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeCreate}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Onboard new profile</h3>
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-400">
              Create a team profile manually. The new user can sign in at the admin login page.
            </p>

            <div className="space-y-3">
              <div>
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Profile file (optional)
                </span>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                    {createProfileImageUrl && isDataUrlImage(createProfileImageUrl) ? (
                      <img
                        src={createProfileImageUrl}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                        {createProfileImageUrl ? 'File set' : 'No file'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={createProfileImageInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleCreateProfileImageChange}
                    />
                    <button
                      type="button"
                      onClick={() => createProfileImageInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500/40 hover:text-white"
                    >
                      <Upload size={14} />
                      Upload image
                    </button>
                    {createProfileImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCreateProfileImageUrl('')
                          if (createProfileImageInputRef.current) {
                            createProfileImageInputRef.current.value = ''
                          }
                        }}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:text-white"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">
                  Any file type. Images show as the profile avatar.
                </p>
              </div>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Full name
                </span>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className={portalFieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Email
                </span>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className={portalFieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Phone
                </span>
                <input
                  type="tel"
                  value={formatPhoneNumber(createPhone)}
                  onChange={(e) =>
                    setCreatePhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  className={portalFieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Role
                </span>
                <AdminRoleSelect
                  value={createRole}
                  onChange={(role) => {
                    setCreateRole(role)
                    if (!roleUsesPreferredPayment(role)) {
                      setCreatePreferredPayment(undefined)
                    }
                  }}
                  variant="portal"
                />
              </label>
              {roleUsesPreferredPayment(createRole) && (
                <PreferredPaymentSelector
                  value={createPreferredPayment}
                  onChange={setCreatePreferredPayment}
                  variant="portal"
                />
              )}
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Password
                </span>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className={portalFieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Confirm password
                </span>
                <input
                  type="password"
                  value={createConfirm}
                  onChange={(e) => setCreateConfirm(e.target.value)}
                  className={portalFieldClass}
                />
              </label>
            </div>

            {createFormError && (
              <p className="mt-3 text-sm text-red-400">{createFormError}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={closeCreate}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProfile}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Create profile
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Edit profile</h3>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Profile file (optional)
                </span>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                    {editProfileImageUrl && isDataUrlImage(editProfileImageUrl) ? (
                      <img
                        src={editProfileImageUrl}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                        {editProfileImageUrl ? 'File set' : 'No file'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={editProfileImageInputRef}
                      type="file"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        setFormError('')
                        const result = await readProfileImageDataUrl(file)
                        if (!result.ok) {
                          setFormError(result.error)
                          event.target.value = ''
                          return
                        }
                        setEditProfileImageUrl(result.dataUrl)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => editProfileImageInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500/40 hover:text-white"
                    >
                      <Upload size={14} />
                      Upload file
                    </button>
                    {editProfileImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditProfileImageUrl('')
                          if (editProfileImageInputRef.current) {
                            editProfileImageInputRef.current.value = ''
                          }
                        }}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:text-white"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Full name
                </span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={portalFieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Email
                </span>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={portalFieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Phone
                </span>
                <input
                  type="tel"
                  value={formatPhoneNumber(editPhone)}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={portalFieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Role
                </span>
                <AdminRoleSelect
                  value={editRole}
                  onChange={setEditRole}
                  variant="portal"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  New password (optional)
                </span>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className={portalFieldClass}
                />
              </label>
            </div>

            {formError && (
              <p className="mt-3 text-sm text-red-400">{formError}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={closeEdit}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProfile && (
        <ProfileDetailModal
          admin={selectedProfile}
          headerGradient={profileStageThemes[selectedProfileStageIndex % profileStageThemes.length].gradient}
          avatarRingClass={
            profileStageThemes[selectedProfileStageIndex % profileStageThemes.length].avatarWrap
          }
          passwordRevealed={revealedIds.has(selectedProfile.id)}
          onTogglePassword={() => togglePassword(selectedProfile.id)}
          projectFinancials={profileFinancialsMap[selectedProfile.id]}
          projectWorkload={profileWorkloadMap[selectedProfile.id]}
          ownerProjects={clientProjects.filter(
            (project) => project.ownerId === selectedProfile.id,
          )}
          platformTotalBudget={platformTotalBudget}
          formatCreated={formatCreated}
          onClose={() => setSelectedProfile(null)}
          onEdit={() => {
            const profile = selectedProfile
            setSelectedProfile(null)
            openEdit(profile)
          }}
        />
      )}
    </>
  )
}

export default function ClientPortalPanel({
  badgeLabel = 'CLIENT PORTAL',
  logoTo = '/',
  variant = 'client',
  page = 'dashboard',
}: {
  badgeLabel?: string
  logoTo?: string
  variant?: PortalVariant
  page?: 'dashboard' | 'profiles' | 'projects' | 'archives' | 'uploads' | 'messages' | 'databins'
}) {
  const [activeNav, setActiveNav] = useState(0)
  const [clientProjects, setClientProjects] = useState(() => listClientProjects())
  const [platformActivities, setPlatformActivities] = useState<PlatformActivity[]>(() =>
    listPlatformActivities(100),
  )
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectType, setNewProjectType] = useState<ClientProjectType>('Website')
  const [newProjectUrgency, setNewProjectUrgency] = useState<ClientProjectUrgency>('Med')
  const [newProjectDate, setNewProjectDate] = useState(() => getTodayIsoDate())
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectUrl, setNewProjectUrl] = useState('')
  const [newProjectBudget, setNewProjectBudget] = useState('')
  const [newProjectFiles, setNewProjectFiles] = useState<ClientProjectFile[]>([])
  const [newProjectError, setNewProjectError] = useState('')
  const [projectSubmitNotice, setProjectSubmitNotice] = useState('')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null)
  const [selectedCompletedProject, setSelectedCompletedProject] =
    useState<ClientProject | null>(null)
  const [formFilePreview, setFormFilePreview] = useState<ClientProjectFile | null>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const session = getAdminSession()
  const portalConfig = getPortalConfig(variant)
  const staffPaths = portalConfig.paths
  const navItems = staffPaths ? buildStaffNav(staffPaths, variant) : clientNav
  const messagesPath = staffPaths ? staffPaths.messages : '/clientportalmessages'
  const archivesPath = staffPaths ? staffPaths.archives : '/clientportalarchives'
  const isMasterAdminDashboard = variant === 'master' && pathname === portalConfig.base
  const isStaffProjectProgressEdit =
    isStaffPortalVariant(variant) && (page === 'dashboard' || page === 'projects')
  const portalSession = isStaffPortalVariant(variant)
    ? session
    : session && !isOwnerSession(session)
      ? session
      : null
  const toolbarSession =
    isMasterAdminDashboard && session
      ? { ...session, name: MASTER_ADMIN_PROFILE_NAME }
      : portalSession
  const defaultWelcome = isStaffPortalVariant(variant)
    ? variant === 'master'
      ? `Welcome back, ${MASTER_ADMIN_PROFILE_NAME} 👋`
      : `Welcome back, ${session?.name ?? portalConfig.badge} 👋`
    : 'Welcome back, John 👋'
  const showNewProjectButton =
    (variant === 'client' || variant === 'support') &&
    (page === 'dashboard' || page === 'projects')
  const showNewProfileButton =
    showsStaffProfileControls(variant) && page === 'profiles'
  const [profileCreateOpen, setProfileCreateOpen] = useState(false)
  const [masterProfileFilter, setMasterProfileFilter] = useState<ProfileRoleFilter>('all')
  const staffProfileControls = showsStaffProfileControls(variant)

  const ownerLabels = useMemo(() => buildOwnerLabelMap(clientProjects), [clientProjects])

  const listedClientProjects = useMemo(
    () => filterListedClientProjects(clientProjects),
    [clientProjects],
  )

  const displayedProjects = useMemo(() => {
    const base = listedClientProjects
    if (!staffProfileControls || masterProfileFilter === 'all') return base
    return base.filter((project) =>
      adminUserMatchesRoleFilter(project.ownerId, masterProfileFilter),
    )
  }, [listedClientProjects, masterProfileFilter, staffProfileControls])

  const pendingApprovalProjects = useMemo(() => {
    const pending = clientProjects.filter(isProjectPendingApproval)
    if (variant === 'master') return pending
    if (variant === 'support' && session?.id) {
      return pending.filter((project) => project.ownerId === session.id)
    }
    return []
  }, [clientProjects, session?.id, variant])

  const displayedActiveProjects = useMemo(
    () => displayedProjects.filter(isActiveProject),
    [displayedProjects],
  )

  const displayedCompletedProjects = useMemo(
    () =>
      displayedProjects
        .filter(isProjectComplete)
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime(),
        ),
    [displayedProjects],
  )

  const customerCanActOnCompletedJobs = canRequestProjectChanges()
  const canUncompleteJobs = isStaffPortalVariant(variant) && canUncompleteClientProject()

  useEffect(() => {
    if (variant === 'support' && page === 'profiles' && staffPaths) {
      navigate(staffPaths.dashboard, { replace: true })
    }
  }, [navigate, page, staffPaths, variant])

  const notificationActivities = useMemo(
    () => filterNotificationActivities(platformActivities),
    [platformActivities],
  )

  const refreshPlatformActivities = useCallback(() => {
    const scope = getClientDataScope()
    setPlatformActivities(
      filterPlatformActivitiesForScope(readAllPlatformActivities(), scope, 100),
    )
  }, [])

  useEffect(() => {
    if (page === 'messages') {
      markNotificationsRead()
    }
  }, [page])

  const refreshClientProjects = useCallback(() => {
    setClientProjects(listClientProjects())
    refreshPlatformActivities()
  }, [refreshPlatformActivities])

  useEffect(() => {
    const onActivity = (event: Event) => {
      const entry = (event as CustomEvent<PlatformActivity>).detail
      const scope = getClientDataScope()

      if (entry && activityMatchesScope(entry, scope)) {
        setPlatformActivities((prev) => {
          const next = [entry, ...prev.filter((item) => item.id !== entry.id)]
          return filterPlatformActivitiesForScope(next, scope)
        })
      } else {
        refreshPlatformActivities()
      }

      setClientProjects(listClientProjects())
    }

    const onFocus = () => {
      refreshPlatformActivities()
      setClientProjects(listClientProjects())
    }

    refreshPlatformActivities()
    window.addEventListener('focus', onFocus)
    window.addEventListener(PLATFORM_ACTIVITY_EVENT, onActivity)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(PLATFORM_ACTIVITY_EVENT, onActivity)
    }
  }, [refreshPlatformActivities])

  const openNewProject = () => {
    setEditingProjectId(null)
    setNewProjectError('')
    setNewProjectName('')
    setNewProjectType(variant === 'support' ? 'Web/App' : 'Website')
    setNewProjectUrgency('Med')
    setNewProjectDate(getTodayIsoDate())
    setNewProjectDescription('')
    setNewProjectUrl('')
    setNewProjectBudget('')
    setNewProjectFiles([])
    setNewProjectOpen(true)
  }

  const openEditProject = (project: ClientProject) => {
    setNewProjectError('')
    setEditingProjectId(project.id)
    setNewProjectName(project.name)
    setNewProjectType(
      (variant === 'support' ? SUPPORT_CLIENT_PROJECT_TYPES : CLIENT_PROJECT_TYPES).includes(
        project.type as ClientProjectType,
      )
        ? (project.type as ClientProjectType)
        : variant === 'support'
          ? 'Web/App'
          : 'Other',
    )
    setNewProjectUrgency(project.urgency)
    setNewProjectDate(project.date ?? getTodayIsoDate())
    setNewProjectDescription(project.description ?? '')
    setNewProjectUrl(project.url ?? '')
    setNewProjectBudget(
      project.budget !== undefined ? formatMoneyDisplay(project.budget) : '',
    )
    setNewProjectFiles(project.files ? [...project.files] : [])
    setNewProjectOpen(true)
  }

  const handleDeleteProject = (project: ClientProject) => {
    const confirmed = window.confirm(
      `Delete project "${project.name}"? This cannot be undone.`,
    )
    if (!confirmed) return

    const result = deleteClientProject(project.id)
    if (!result.ok) {
      window.alert(result.error)
      return
    }

    if (selectedProject?.id === project.id) setSelectedProject(null)
    if (editingProjectId === project.id) closeNewProject()
    refreshClientProjects()
  }

  const handleNewProjectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList?.length) return

    try {
      const added = await Promise.all(
        Array.from(fileList).map((file) => buildClientProjectFileFromUpload(file)),
      )
      setNewProjectFiles((prev) => [...prev, ...added])
      setNewProjectError('')
    } catch (error) {
      setNewProjectError(
        error instanceof Error ? error.message : 'Could not add files. Please try again.',
      )
    } finally {
      event.target.value = ''
    }
  }

  const removeNewProjectFile = (id: string) => {
    setNewProjectFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const closeNewProject = () => {
    setNewProjectOpen(false)
    setEditingProjectId(null)
    setFormFilePreview(null)
    setNewProjectError('')
  }

  const handleSaveProject = () => {
    setNewProjectError('')
    const budget = parseMoneyValue(newProjectBudget)
    const payload = {
      name: newProjectName,
      type: newProjectType,
      urgency: newProjectUrgency,
      date: newProjectDate,
      description: newProjectDescription,
      url: newProjectUrl.trim() || undefined,
      budget: newProjectBudget.trim() ? budget ?? undefined : undefined,
      files: newProjectFiles,
    }

    const result = editingProjectId
      ? updateClientProject(editingProjectId, payload)
      : createClientProject(payload)

    if (!result.ok) {
      setNewProjectError(result.error)
      return
    }

    if (selectedProject?.id === editingProjectId && result.ok) {
      setSelectedProject(result.project)
    }

    const submittedForApproval =
      variant === 'support' && !editingProjectId && isProjectPendingApproval(result.project)

    closeNewProject()
    refreshClientProjects()
    refreshPlatformActivities()

    if (submittedForApproval) {
      setProjectSubmitNotice(
        `"${result.project.name}" was submitted. Master admin must approve it before it appears in the project list.`,
      )
    }
  }

  const handleApproveProject = (
    project: ClientProject,
    commission: SupportProjectCommissionInput,
  ) => {
    const result = approveClientProject(project.id, commission)
    if (!result.ok) {
      window.alert(result.error)
      return
    }

    refreshClientProjects()
    refreshPlatformActivities()
  }

  const handleDeclineProject = (project: ClientProject) => {
    const result = declineClientProject(project.id)
    if (!result.ok) {
      window.alert(result.error)
      return
    }

    refreshClientProjects()
    refreshPlatformActivities()
  }

  useEffect(() => {
    setSelectedCompletedProject((current) => {
      if (!current) return current
      const fresh = clientProjects.find((project) => project.id === current.id)
      if (!fresh || fresh.status !== 'Complete') return null
      return fresh
    })
  }, [clientProjects])

  const handleQuickSetProgress = (projectId: string, percent: number) => {
    const result = updateClientProjectProgress(projectId, percent, {
      allowMarkComplete: isStaffProjectProgressEdit,
    })
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    if (isStaffProjectProgressEdit && percent === 100 && result.project.status === 'Complete') {
      setSelectedProject(null)
      setSelectedCompletedProject(null)
    } else if (result.project.status === 'Complete') {
      setSelectedProject(null)
      setSelectedCompletedProject(result.project)
    } else {
      setSelectedProject(result.project)
    }
    refreshClientProjects()
    refreshPlatformActivities()
  }

  const handleOpenCompletedJobFromNotification = (activity: PlatformActivity) => {
    const project = findCompletedProjectForActivity(activity, listClientProjects())
    if (!project) {
      window.alert('This completed job could not be found. It may have moved to Review.')
      return
    }
    setSelectedCompletedProject(project)
  }

  const handleConfirmOrder = () => {
    if (!selectedCompletedProject) return
    const result = confirmClientProjectOrder(selectedCompletedProject.id)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    setSelectedCompletedProject(null)
    refreshClientProjects()
    refreshPlatformActivities()
  }

  const handleRequestChanges = (payload: JobChangesRequestPayload) => {
    if (!selectedCompletedProject) return

    const result = requestClientProjectChanges(selectedCompletedProject.id, payload)
    if (!result.ok) {
      window.alert(result.error)
      return
    }
    setSelectedCompletedProject(null)
    refreshClientProjects()
    refreshPlatformActivities()
  }

  const handleUncompleteProject = (project: ClientProject) => {
    const confirmed = window.confirm(
      `Move "${project.name}" back to active projects at 80%?`,
    )
    if (!confirmed) return

    const result = uncompleteClientProject(project.id)
    if (!result.ok) {
      window.alert(result.error)
      return
    }

    if (selectedCompletedProject?.id === project.id) {
      setSelectedCompletedProject(null)
    }
    refreshClientProjects()
    refreshPlatformActivities()
  }

  const handleGoToArchives = () => {
    setSelectedCompletedProject(null)
    navigate(archivesPath)
  }

  return (
    <div className="relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-[#07111f] text-white">
      <div className="relative z-10 flex h-full min-h-0 w-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#07101c] px-6 py-4 lg:hidden">
          <PortalLogoHeader
            badgeLabel={badgeLabel}
            logoTo={logoTo}
            subtitleClassName="mt-1 text-[10px] tracking-[0.35em] text-blue-400"
          />
          <button
            type="button"
            onClick={() => setActiveNav(0)}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold"
          >
            Menu
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[290px] shrink-0 flex-col border-r border-white/10 bg-[#07101c] p-6 lg:flex">
            <div className="mb-8 shrink-0">
              <PortalLogoHeader badgeLabel={badgeLabel} logoTo={logoTo} />
            </div>

            <nav className="mt-10 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {navItems.map(({ label, icon: Icon, to, signOut }, i) => {
                const isRouteActive = to && !signOut && pathname === to
                const isButtonActive = !to && activeNav === i
                const navItemClass = `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                  isRouteActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`

                if (to && signOut) {
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        signOutAdmin()
                        navigate(to)
                      }}
                      className={navItemClass}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  )
                }

                if (to) {
                  return (
                    <Link key={label} to={to} className={navItemClass}>
                      <Icon size={18} />
                      {label}
                    </Link>
                  )
                }

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveNav(i)}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                      isButtonActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <p className="mt-4 shrink-0 text-xs text-slate-500">
              © 1999–{new Date().getFullYear()} {SITE_COPYRIGHT}
            </p>
          </aside>

          <main
            className={`min-w-0 flex-1 overflow-y-auto ${
              page === 'dashboard' || page === 'uploads'
                ? 'bg-[#050a14] p-4 lg:p-6'
                : 'p-6 lg:p-8'
            }`}
          >
            {page === 'dashboard' ? (
              <PortalDashboardShell variant={variant}>
                <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {isMasterAdminDashboard
                        ? `Welcome back, ${MASTER_ADMIN_PROFILE_NAME} 👋`
                        : portalSession
                          ? `Welcome back, ${portalSession.name} 👋`
                          : defaultWelcome}
                    </h1>
                    <p className="text-slate-400">
                      {variant === 'support'
                        ? 'Submit projects for approval and track your active and completed jobs.'
                        : "Here's what's happening with your projects today."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {showNewProjectButton && (
                      <NewProjectButton onClick={openNewProject} />
                    )}
                    <PortalToolbar
                      clientSession={toolbarSession}
                      notifications={notificationActivities}
                      messagesTo={messagesPath}
                      onOpenCompletedJob={handleOpenCompletedJobFromNotification}
                    />
                  </div>
                </header>

                {projectSubmitNotice && variant === 'support' && (
                  <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
                    <p className="text-sm text-amber-100">{projectSubmitNotice}</p>
                    <button
                      type="button"
                      onClick={() => setProjectSubmitNotice('')}
                      className="shrink-0 rounded-lg p-1 text-amber-200/80 transition hover:bg-amber-500/15 hover:text-amber-100"
                      aria-label="Dismiss"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <DashboardMain
                  projects={displayedProjects}
                  activities={notificationActivities}
                  onOpenProject={setSelectedProject}
                  variant={variant}
                  pendingApprovalProjects={pendingApprovalProjects}
                  ownerLabels={ownerLabels}
                  onApproveProject={handleApproveProject}
                  onDeclineProject={handleDeclineProject}
                />
              </PortalDashboardShell>
            ) : (
              <>
                <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    {page === 'profiles' ? (
                      <>
                        <h1 className="text-3xl font-bold">Profiles</h1>
                        <p className="text-slate-400">
                          View and manage admin team profiles, roles, and access.
                        </p>
                      </>
                    ) : page === 'projects' ? (
                      <>
                        <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-slate-400">
                      {variant === 'support'
                        ? 'Track projects you submit and completed jobs after master admin approval.'
                        : isStaffPortalVariant(variant)
                          ? 'View and manage projects, files, and project data across every profile.'
                          : 'Manage active client projects, timelines, and delivery status.'}
                    </p>
                      </>
                    ) : page === 'archives' ? (
                      <>
                        <h1 className="text-3xl font-bold">Archives</h1>
                        <p className="text-slate-400">
                          {variant === 'support'
                            ? 'Completed jobs from projects you submitted.'
                            : isStaffPortalVariant(variant)
                              ? 'Browse completed jobs and order history across every profile.'
                              : 'View completed jobs, confirmations, and past deliverables.'}
                        </p>
                      </>
                    ) : page === 'messages' ? (
                      <>
                        <h1 className="text-3xl font-bold">Messages</h1>
                        <p className="text-slate-400">
                          Notifications and activity updates from your portal.
                        </p>
                      </>
                    ) : page === 'databins' ? (
                      <>
                        <h1 className="text-3xl font-bold">Data & Info Bins</h1>
                        <p className="text-slate-400">
                          Internal database storage for profiles, projects, uploads, messages, and form input.
                        </p>
                      </>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold">Uploads</h1>
                        <p className="text-slate-400">
                          Upload, organize, and manage files across File Manager and your projects.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {showNewProjectButton && (
                      <NewProjectButton onClick={openNewProject} />
                    )}
                    {showNewProfileButton && (
                      <NewProfileButton onClick={() => setProfileCreateOpen(true)} />
                    )}
                    <PortalToolbar
                      clientSession={toolbarSession}
                      notifications={notificationActivities}
                      messagesTo={messagesPath}
                      onOpenCompletedJob={handleOpenCompletedJobFromNotification}
                    />
                  </div>
                </header>

                {page === 'profiles' ? (
                  <ProfilesMain
                    createOpen={profileCreateOpen}
                    onCreateOpenChange={setProfileCreateOpen}
                    profileFilter={staffProfileControls ? masterProfileFilter : undefined}
                    onProfileFilterChange={
                      staffProfileControls ? setMasterProfileFilter : undefined
                    }
                    showCreateProfileButton={staffProfileControls}
                  />
                ) : page === 'projects' ? (
                  <ProjectsMain
                    projects={displayedActiveProjects}
                    completedProjects={displayedCompletedProjects}
                    variant={variant}
                    ownerLabels={staffProfileControls ? ownerLabels : undefined}
                    profileFilter={staffProfileControls ? masterProfileFilter : undefined}
                    onProfileFilterChange={
                      staffProfileControls ? setMasterProfileFilter : undefined
                    }
                    pendingApprovalProjects={pendingApprovalProjects}
                    onApproveProject={handleApproveProject}
                  onDeclineProject={handleDeclineProject}
                    onOpenProject={setSelectedProject}
                    onOpenCompletedProject={setSelectedCompletedProject}
                    onEditProject={openEditProject}
                    onDeleteProject={handleDeleteProject}
                    canUncomplete={canUncompleteJobs}
                    onUncompleteProject={handleUncompleteProject}
                  />
                ) : page === 'archives' ? (
                  <ArchivesMain
                    completedProjects={displayedCompletedProjects}
                    variant={variant}
                    ownerLabels={staffProfileControls ? ownerLabels : undefined}
                    profileFilter={staffProfileControls ? masterProfileFilter : undefined}
                    onProfileFilterChange={
                      staffProfileControls ? setMasterProfileFilter : undefined
                    }
                    onOpenCompletedProject={setSelectedCompletedProject}
                    canUncomplete={canUncompleteJobs}
                    onUncompleteProject={handleUncompleteProject}
                  />
                ) : page === 'messages' ? (
                  <MessagesMain activities={notificationActivities} variant={variant} />
                ) : page === 'databins' ? (
                  <AdminDataBinsPanel variant="portal" />
                ) : (
                  <UploadsMain
                    variant={variant}
                    ownerLabels={staffProfileControls ? ownerLabels : undefined}
                    profileFilter={staffProfileControls ? masterProfileFilter : undefined}
                    onProfileFilterChange={
                      staffProfileControls ? setMasterProfileFilter : undefined
                    }
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          ownerLabel={
            staffProfileControls ? ownerLabels[selectedProject.ownerId] : undefined
          }
          showCommission={shouldShowProjectCommission(selectedProject, variant)}
          allowProgressQuickSet={isStaffProjectProgressEdit}
          onSetProgress={
            isStaffProjectProgressEdit
              ? (percent) => handleQuickSetProgress(selectedProject.id, percent)
              : undefined
          }
          onClose={() => setSelectedProject(null)}
          onApplyPayment={
            !isStaffPortalVariant(variant)
              ? (amount) => {
                  const result = applyProjectPayment(selectedProject.id, amount)
                  if (!result.ok) {
                    window.alert(result.error)
                    return
                  }
                  setSelectedProject(result.project)
                  refreshClientProjects()
                }
              : undefined
          }
          onMarkAsPaid={
            isStaffPortalVariant(variant)
              ? () => {
                  const result = markClientProjectInvoicePaid(selectedProject.id)
                  if (!result.ok) {
                    window.alert(result.error)
                    return
                  }
                  setSelectedProject(result.project)
                  refreshClientProjects()
                }
              : undefined
          }
        />
      )}

      {selectedCompletedProject && (
        <CompletedJobDetailModal
          project={selectedCompletedProject}
          ownerLabel={
            staffProfileControls ? ownerLabels[selectedCompletedProject.ownerId] : undefined
          }
          showCommission={shouldShowProjectCommission(selectedCompletedProject, variant)}
          canTakeAction={customerCanActOnCompletedJobs}
          canUncomplete={canUncompleteJobs}
          onUncomplete={() => handleUncompleteProject(selectedCompletedProject)}
          onClose={() => setSelectedCompletedProject(null)}
          onConfirmOrder={handleConfirmOrder}
          onRequestChanges={handleRequestChanges}
          onGoToArchives={handleGoToArchives}
          onApplyPayment={
            !isStaffPortalVariant(variant)
              ? (amount) => {
                  if (!selectedCompletedProject) return
                  const result = applyProjectPayment(selectedCompletedProject.id, amount)
                  if (!result.ok) {
                    window.alert(result.error)
                    return
                  }
                  setSelectedCompletedProject(result.project)
                  refreshClientProjects()
                }
              : undefined
          }
          onMarkAsPaid={
            isStaffPortalVariant(variant)
              ? () => {
                  if (!selectedCompletedProject) return
                  const result = markClientProjectInvoicePaid(selectedCompletedProject.id)
                  if (!result.ok) {
                    window.alert(result.error)
                    return
                  }
                  setSelectedCompletedProject(result.project)
                  refreshClientProjects()
                }
              : undefined
          }
        />
      )}

      {formFilePreview && (
        <UploadFilePreviewModal
          file={formFilePreview}
          onClose={() => setFormFilePreview(null)}
        />
      )}

      {newProjectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
          onClick={closeNewProject}
        >
          <div
            className="flex max-h-[min(92vh,44rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">
                  {editingProjectId ? 'Edit Project' : 'New Project'}
                </h3>
                {!editingProjectId && (
                  <p className="mt-1 text-sm text-slate-400">
                    {variant === 'support'
                      ? 'Submit a support project for master admin approval before it appears in the project list.'
                      : 'Onboard a new project with details, budget, and deliverables.'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeNewProject}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:gap-6 sm:p-6">
              <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto pr-0.5 sm:pr-1">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Project name
                  </span>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className={portalFieldClass}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Type
                    </span>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value as ClientProjectType)}
                      className={portalFieldClass}
                    >
                      {(variant === 'support'
                        ? SUPPORT_CLIENT_PROJECT_TYPES
                        : CLIENT_PROJECT_TYPES
                      ).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Budget
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newProjectBudget}
                      onChange={(e) => setNewProjectBudget(formatMoneyInput(e.target.value))}
                      placeholder="$0.00"
                      className={portalFieldClass}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    URL
                  </span>
                  <input
                    type="url"
                    value={newProjectUrl}
                    onChange={(e) => setNewProjectUrl(e.target.value)}
                    placeholder="https://example.com"
                    className={portalFieldClass}
                  />
                </label>

                <div className="block">
                  <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Urgency
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CLIENT_PROJECT_URGENCIES.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setNewProjectUrgency(level)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          newProjectUrgency === level
                            ? urgencyTagStyles[level]
                            : 'border border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="block">
                  <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Due date
                  </span>
                  <PortalDatePicker value={newProjectDate} onChange={setNewProjectDate} />
                </div>
              </div>

              <div className="flex min-h-0 w-full shrink-0 flex-col gap-4 overflow-hidden sm:w-80">
                <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-blue-300/80">
                    Project description
                  </span>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={6}
                    placeholder="Brief overview, goals, or scope..."
                    className="w-full resize-none rounded-lg border border-white/10 bg-[#0a1424]/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50"
                  />
                  {(() => {
                    const previewBudget = parseMoneyValue(newProjectBudget)
                    if (previewBudget === null || previewBudget <= 0) return null
                    return (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          Starting balance
                        </span>
                        <p className="mt-1 text-lg font-semibold tabular-nums text-red-400 [text-shadow:0_0_10px_rgba(248,113,113,0.75),0_0_20px_rgba(248,113,113,0.35)]">
                          {formatMoneyDisplay(-previewBudget)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Full budget owed until payments are applied to the invoice.
                        </p>
                      </div>
                    )
                  })()}
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="shrink-0 border-b border-white/10 px-4 py-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Upload files
                    </span>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {newProjectFiles.length} file{newProjectFiles.length === 1 ? '' : 's'} attached
                    </p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto p-3">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-4 py-4 transition hover:border-blue-500/40 hover:bg-white/[0.04]">
                      <Upload size={20} className="text-slate-400" />
                      <span className="mt-2 text-sm text-slate-300">Click to upload files</span>
                      <span className="mt-1 text-xs text-slate-500">PDF, images, docs, and more</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleNewProjectFiles}
                      />
                    </label>
                    {newProjectFiles.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {newProjectFiles.map((file) => (
                          <li
                            key={file.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                          >
                            <button
                              type="button"
                              onClick={() => setFormFilePreview(file)}
                              className="flex min-w-0 flex-1 items-center gap-2 text-left transition hover:opacity-90"
                            >
                              {getFileListThumbUrl(file) ? (
                                <img
                                  src={getFileListThumbUrl(file)}
                                  alt=""
                                  className="h-8 w-8 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="rounded-lg bg-white/5 p-1.5 text-slate-400">
                                  <FileText size={14} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-sm text-slate-200">{file.name}</p>
                                <p className="text-xs text-slate-500">
                                  {formatClientProjectFileSize(file.size)}
                                </p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeNewProjectFile(file.id)}
                              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                              aria-label={`Remove ${file.name}`}
                            >
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/10 px-5 py-4 sm:px-6">
              {newProjectError && (
                <p className="mb-3 text-sm text-red-400">{newProjectError}</p>
              )}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeNewProject}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 sm:min-w-[7.5rem]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProject}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 sm:min-w-[10rem]"
                >
                  {editingProjectId ? 'Save changes' : 'Submit Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
