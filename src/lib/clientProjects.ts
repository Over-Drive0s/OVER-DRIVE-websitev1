import { getAdminSession, isOwnerSession } from './adminUsers'
import { normalizeAdminRole } from './adminRoles'
import { getClientDataScope } from './clientDataScope'
import { logPlatformActivity } from './platformActivityLog'
import { notifyDataBinUpdated } from './dataBins'
import {
  copyFileBlob,
  deleteFileBlob,
  deleteFileBlobs,
  getFileBlob,
  getFileBlobObjectUrl,
  putFileBlob,
} from './fileBlobStore'
import { addFileManagerFiles } from './fileManager'
import { decodeDataUrlText, isDataUrlImage, readStoredFileDataUrl } from './storedFileData'

export { decodeDataUrlText, isDataUrlImage }

export type ClientProjectType = 'Website' | 'App' | 'Web/App' | 'Systems' | 'Other'
export type ClientProjectUrgency = 'High' | 'Med' | 'Low'
export type ClientProjectStatus =
  | 'In Progress'
  | 'Planning'
  | 'Review'
  | 'Complete'

export const CLIENT_PROJECT_TYPES: ClientProjectType[] = [
  'Website',
  'App',
  'Systems',
  'Other',
]

export const SUPPORT_CLIENT_PROJECT_TYPES: ClientProjectType[] = [
  'Web/App',
  'Website',
  'App',
  'Systems',
  'Other',
]

export const CLIENT_PROJECT_URGENCIES: ClientProjectUrgency[] = ['High', 'Med', 'Low']

export const urgencyTagStyles: Record<ClientProjectUrgency, string> = {
  High: 'bg-red-500/20 text-red-300',
  Med: 'bg-amber-500/20 text-amber-300',
  Low: 'bg-emerald-500/20 text-emerald-300',
}

export type ClientProjectFile = {
  id: string
  name: string
  size: number
  type: string
  projectId?: string
  projectName?: string
  uploadedAt?: string
  /** Legacy data URL preview (older uploads). */
  previewUrl?: string
  /** Legacy full file data URL (older uploads). */
  dataUrl?: string
  /** Blob stored in IndexedDB for preview and download. */
  blobStored?: boolean
}

export type ClientProjectChangeRequest = {
  summary: string
  details: string
  submittedAt: string
  files: ClientProjectFile[]
}

export function isClientProjectImageFile(type: string, name: string): boolean {
  const mime = type.toLowerCase()
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
  )
}

export function isClientProjectPdfFile(type: string, name: string): boolean {
  const mime = type.toLowerCase()
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return mime.includes('pdf') || ext === 'pdf'
}

export function isClientProjectVideoFile(type: string, name: string): boolean {
  const mime = type.toLowerCase()
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return (
    mime.startsWith('video/') ||
    ['mp4', 'mov', 'webm', 'ogg', 'm4v'].includes(ext)
  )
}

export function isClientProjectAudioFile(type: string, name: string): boolean {
  const mime = type.toLowerCase()
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'webm'].includes(ext)
  )
}

export function isClientProjectTextFile(type: string, name: string): boolean {
  const mime = type.toLowerCase()
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (mime.startsWith('text/')) return true
  return [
    'txt',
    'json',
    'xml',
    'csv',
    'md',
    'markdown',
    'js',
    'ts',
    'tsx',
    'jsx',
    'css',
    'html',
    'htm',
    'yaml',
    'yml',
    'log',
    'svg',
    'env',
    'ini',
    'cfg',
    'conf',
  ].includes(ext)
}

export function canPreviewClientProjectFile(
  file: Pick<ClientProjectFile, 'type' | 'name' | 'dataUrl' | 'previewUrl' | 'blobStored'>,
): boolean {
  return canDownloadClientProjectFile(file as ClientProjectFile)
}

export async function readClientProjectFileDataUrl(file: File): Promise<string | undefined> {
  const result = await readStoredFileDataUrl(file)
  return result.ok ? result.dataUrl : undefined
}

export function getClientProjectFileDataUrl(file: ClientProjectFile): string | undefined {
  return file.dataUrl ?? file.previewUrl
}

export function canDownloadClientProjectFile(file: ClientProjectFile): boolean {
  return Boolean(getClientProjectFileDataUrl(file) || file.blobStored)
}

export function downloadClientProjectFile(file: ClientProjectFile): boolean {
  const dataUrl = getClientProjectFileDataUrl(file)
  if (!dataUrl) return false

  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = file.name
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  return true
}

export async function resolveClientProjectFileUrl(
  file: ClientProjectFile,
): Promise<string | undefined> {
  const legacy = getClientProjectFileDataUrl(file)
  if (legacy) return legacy
  if (file.blobStored) return getFileBlobObjectUrl(file.id)
  return undefined
}

export async function downloadClientProjectFileAsync(
  file: ClientProjectFile,
): Promise<boolean> {
  if (getClientProjectFileDataUrl(file)) {
    return downloadClientProjectFile(file)
  }

  const blob = await getFileBlob(file.id)
  if (!blob) return false

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
  return true
}

function createFileId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const MAX_DATA_URL_BYTES = 8 * 1024 * 1024

export async function buildClientProjectFileFromUpload(file: File): Promise<ClientProjectFile> {
  const id = createFileId()
  const type = file.type || 'application/octet-stream'

  try {
    await putFileBlob(id, file)
    return {
      id,
      name: file.name,
      size: file.size,
      type,
      blobStored: true,
    }
  } catch {
    if (file.size > MAX_DATA_URL_BYTES) {
      throw new Error(
        `Could not store "${file.name}". Try a smaller file (under 8 MB) or use another browser.`,
      )
    }

    const stored = await readStoredFileDataUrl(file)
    if (!stored.ok) {
      throw new Error(`Could not store "${file.name}". ${stored.error}`)
    }

    const entry: ClientProjectFile = {
      id,
      name: file.name,
      size: file.size,
      type,
      dataUrl: stored.dataUrl,
    }

    if (isDataUrlImage(stored.dataUrl)) {
      entry.previewUrl = stored.dataUrl
    }

    return entry
  }
}

export type ClientUpload = ClientProjectFile & {
  projectId: string
  projectName: string
  uploadedAt: string
}

export type ClientProject = {
  id: string
  /** Profile user id — projects are isolated per admin profile. */
  ownerId: string
  name: string
  type: string
  urgency: ClientProjectUrgency
  progress: string
  metric: string
  status: string
  due: string
  /** ISO date (YYYY-MM-DD) for calendar picker round-trip */
  date?: string
  description?: string
  url?: string
  budget?: number
  /** Running invoice balance. Starts at -budget; increases toward $0 as payments are made. */
  balance?: number
  files?: ClientProjectFile[]
  /** Set when master admin marks the job complete at 100%. */
  completedAt?: string
  /** Customer/support confirmed the completed deliverable. */
  orderConfirmed?: boolean
  /** Filed when customer/support requests edits on a completed job. */
  changeRequest?: ClientProjectChangeRequest
  /** Original deliverable progress locked when revisions are requested (typically 100%). */
  deliveredProgress?: string
  /** Progress on requested changes after a job returns from complete to review. */
  changesProgress?: string
  /** Support-submitted projects stay pending until master admin approves. */
  approvalStatus?: 'pending' | 'approved'
  /** ISO timestamp when a support project was submitted for approval. */
  submittedAt?: string
  /** Support commission rate set at master admin approval (e.g. 0.2 = 20%). */
  supportCommissionRate?: number
  /** Fixed support commission amount when custom $ commission is chosen at approval. */
  supportCommissionAmount?: number
}

const STORAGE_KEY = 'overdriveio-client-projects'
const SEED_OWNER_ID = 'seed-admin'

const defaultProjects: Omit<ClientProject, 'ownerId'>[] = [
  {
    id: 'proj-overdrive-redesign',
    name: 'Overdrive IO Website Redesign',
    type: 'Website',
    urgency: 'High',
    progress: '75%',
    metric: '75%',
    status: 'In Progress',
    due: 'Mar 28, 2026',
    date: '2026-03-28',
    budget: 12500,
    balance: -2250,
  },
  {
    id: 'proj-smart-builds',
    name: 'Smart Builds Pro Platform',
    type: 'App',
    urgency: 'Med',
    progress: '60%',
    metric: '60%',
    status: 'In Progress',
    due: 'Apr 12, 2026',
    date: '2026-04-12',
    budget: 8500,
    balance: -2000,
  },
  {
    id: 'proj-acme-mobile',
    name: 'Acme Mobile App',
    type: 'App',
    urgency: 'Med',
    progress: '40%',
    metric: '40%',
    status: 'In Progress',
    due: 'May 02, 2026',
    date: '2026-05-02',
    budget: 9000,
    balance: -9000,
  },
  {
    id: 'proj-dealer-dashboard',
    name: 'Dealer Dashboard System',
    type: 'Systems',
    urgency: 'Low',
    progress: '20%',
    metric: '20%',
    status: 'Planning',
    due: 'Jun 15, 2026',
    date: '2026-06-15',
    budget: 15000,
    balance: -4250,
  },
  {
    id: 'proj-marketing',
    name: 'Marketing Campaign',
    type: 'Other',
    urgency: 'High',
    progress: '90%',
    metric: '90%',
    status: 'Review',
    due: 'Mar 10, 2026',
    date: '2026-03-10',
    budget: 500,
    balance: 0,
  },
  {
    id: 'proj-brand-identity',
    name: 'Brand Identity Package',
    type: 'Other',
    urgency: 'Low',
    progress: '100%',
    metric: '100%',
    status: 'Complete',
    due: 'Feb 28, 2026',
    date: '2026-02-28',
    budget: 3200,
    balance: 0,
    completedAt: '2026-02-28T18:00:00.000Z',
    orderConfirmed: true,
    url: 'https://overdriveio.com',
  },
]

type LegacyClientProject = Omit<ClientProject, 'ownerId'> & {
  client?: string
  ownerId?: string
}

function normalizeProjectBalance(
  budget: number | undefined,
  balance: number | undefined,
): number | undefined {
  if (budget === undefined || budget <= 0) return balance
  if (balance === undefined) return -budget
  if (balance > 0) return -balance
  return balance
}

function normalizeProject(project: LegacyClientProject): ClientProject {
  const urgency =
    project.urgency ??
    (project.client?.toLowerCase().includes('high')
      ? 'High'
      : project.client?.toLowerCase().includes('low')
        ? 'Low'
        : 'Med')

  const balance = normalizeProjectBalance(project.budget, project.balance)

  let progress = project.progress
  let metric = project.metric
  let status = project.status
  let deliveredProgress = project.deliveredProgress
  let changesProgress = project.changesProgress

  if (project.changeRequest && status !== 'Complete') {
    deliveredProgress = deliveredProgress ?? '100%'
    if (project.changesProgress) {
      changesProgress = project.changesProgress
    } else if (parseProjectProgressPercent(project.progress) >= 100) {
      changesProgress = '0%'
    } else {
      changesProgress = '0%'
    }
    progress = changesProgress
    metric = changesProgress
    status = deriveProjectStatus(parseProjectProgressPercent(changesProgress), 'Review', {
      hasChangeRequest: true,
    })
  } else {
    const progressPct = parseProjectProgressPercent(progress ?? '0%')
    if (status !== 'Complete' && status !== 'Review') {
      status = deriveProjectStatus(progressPct, status)
    }
    metric = progress ?? '0%'
  }

  return {
    id: project.id,
    ownerId: project.ownerId ?? SEED_OWNER_ID,
    name: project.name,
    type: project.type,
    urgency,
    progress,
    metric,
    status,
    due: project.due,
    date: project.date,
    description: project.description,
    url: project.url,
    budget: project.budget,
    balance,
    completedAt: project.completedAt,
    orderConfirmed: project.orderConfirmed,
    changeRequest: project.changeRequest,
    deliveredProgress,
    changesProgress,
    approvalStatus: project.approvalStatus ?? 'approved',
    submittedAt: project.submittedAt,
    supportCommissionRate: project.supportCommissionRate,
    supportCommissionAmount: project.supportCommissionAmount,
    files: project.files?.map((file) => ({
      ...file,
      projectId: file.projectId ?? project.id,
      projectName: file.projectName ?? project.name,
      uploadedAt: file.uploadedAt,
    })),
  }
}

function readAllProjects(): ClientProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = defaultProjects.map((project) =>
        normalizeProject({ ...project, ownerId: SEED_OWNER_ID }),
      )
      writeAllProjects(initial)
      return initial
    }

    const parsed = JSON.parse(raw) as LegacyClientProject[]
    if (!Array.isArray(parsed)) return []

    const normalized = parsed.map(normalizeProject)
    const needsPersist =
      normalized.length !== parsed.length ||
      parsed.some((project) => !project.ownerId) ||
      parsed.some(
        (project, index) =>
          project.balance !== normalized[index]?.balance ||
          project.metric !== normalized[index]?.metric ||
          project.progress !== normalized[index]?.progress ||
          project.status !== normalized[index]?.status ||
          (project.budget !== undefined &&
            project.budget > 0 &&
            project.balance === undefined),
      )

    if (needsPersist) {
      writeAllProjects(normalized)
    }

    return normalized
  } catch {
    return []
  }
}

function writeAllProjects(
  projects: ClientProject[],
): { ok: true } | { ok: false; error: string } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    notifyDataBinUpdated('projects')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Storage is full. Remove older files and try again.' }
  }
}

function readProjects(): ClientProject[] {
  const scope = getClientDataScope()
  const all = readAllProjects()

  if (scope.viewAll) return all
  if (!scope.ownerId) return []

  return all.filter((project) => project.ownerId === scope.ownerId)
}

function canAccessProject(
  project: ClientProject,
  scope: ReturnType<typeof getClientDataScope>,
): boolean {
  if (scope.viewAll) return true
  return scope.ownerId !== null && project.ownerId === scope.ownerId
}

function findAccessibleProjectIndex(
  projects: ClientProject[],
  id: string,
  scope: ReturnType<typeof getClientDataScope>,
): number {
  return projects.findIndex((project) => project.id === id && canAccessProject(project, scope))
}

export function getTodayIsoDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function formatClientProjectDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatClientProjectFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function listClientProjects(): ClientProject[] {
  return readProjects()
}

export function isProjectApproved(project: ClientProject): boolean {
  return !project.approvalStatus || project.approvalStatus === 'approved'
}

export function isProjectPendingApproval(project: ClientProject): boolean {
  return project.approvalStatus === 'pending'
}

export function filterListedClientProjects(projects: ClientProject[]): ClientProject[] {
  return projects.filter(isProjectApproved)
}

export function listPendingApprovalClientProjects(): ClientProject[] {
  return readAllProjects().filter(isProjectPendingApproval)
}

/** Running balance; negative means invoice amount still owed. */
export function getProjectBalance(project: ClientProject): number {
  if (project.balance !== undefined) return project.balance
  if (project.budget !== undefined && project.budget > 0) return -project.budget
  return 0
}

export function getProjectAmountPaid(project: ClientProject): number {
  const budget = project.budget ?? 0
  if (budget <= 0) return 0
  return Math.max(0, budget + getProjectBalance(project))
}

export function getProjectAmountOwed(project: ClientProject): number {
  return Math.max(0, -getProjectBalance(project))
}

export type ClientProjectFinancialTotals = {
  totalBudget: number
  totalBalance: number
  budgetedProjects: { id: string; name: string; budget: number }[]
  outstandingProjects: { id: string; name: string; balance: number }[]
}

export function getClientProjectFinancialTotals(
  projects: ClientProject[],
): ClientProjectFinancialTotals {
  let totalBudget = 0
  let totalBalance = 0
  const budgetedProjects: ClientProjectFinancialTotals['budgetedProjects'] = []
  const outstandingProjects: ClientProjectFinancialTotals['outstandingProjects'] = []

  for (const project of projects) {
    if (project.budget !== undefined && project.budget > 0) {
      totalBudget += project.budget
      budgetedProjects.push({
        id: project.id,
        name: project.name,
        budget: project.budget,
      })
    }

    const owed = getProjectAmountOwed(project)
    if (owed > 0) {
      totalBalance += owed
      outstandingProjects.push({
        id: project.id,
        name: project.name,
        balance: getProjectBalance(project),
      })
    }
  }

  outstandingProjects.sort((a, b) => a.balance - b.balance)
  budgetedProjects.sort((a, b) => b.budget - a.budget)

  return { totalBudget, totalBalance, budgetedProjects, outstandingProjects }
}

export const PROJECT_FUNNEL_STAGES = [
  'Planning',
  'In Progress',
  'Review',
  'Complete',
] as const

export type ProjectFunnelStage = (typeof PROJECT_FUNNEL_STAGES)[number]

export type ProjectFunnelStageStat = {
  stage: ProjectFunnelStage
  count: number
  share: number
  progress: number
}

export type ProjectFunnelWorkload = {
  totalProjects: number
  avgProgress: number
  totalFiles: number
  highUrgency: number
  activeProjects: number
  stages: ProjectFunnelStageStat[]
}

export function parseProjectProgressPercent(progress: string): number {
  const value = Number.parseInt(progress.replace(/\D/g, ''), 10)
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
}

export function getDeliveredProgressPercent(project: ClientProject): number {
  if (project.deliveredProgress) {
    return parseProjectProgressPercent(project.deliveredProgress)
  }
  return parseProjectProgressPercent(project.progress)
}

export function getChangesProgressPercent(project: ClientProject): number {
  if (project.changeRequest) {
    return parseProjectProgressPercent(project.changesProgress ?? '0%')
  }
  return parseProjectProgressPercent(project.changesProgress ?? project.progress)
}

export function getFunnelStageProgressPercent(project: ClientProject): number {
  if (project.changeRequest && project.status !== 'Complete') {
    return Math.max(0, 100 - getChangesProgressPercent(project))
  }
  return parseProjectProgressPercent(project.progress)
}

export function getProjectFunnelStage(project: ClientProject): ProjectFunnelStage {
  if (project.changeRequest && project.status !== 'Complete') {
    return 'Review'
  }

  if (project.status === 'Complete') {
    return 'Complete'
  }

  if (project.status === 'Review') {
    return 'Review'
  }

  const progressPct = getFunnelStageProgressPercent(project)

  if (progressPct === 0 || progressPct < 20) {
    return 'Planning'
  }

  return 'In Progress'
}

export function hasRevisionProgress(project: ClientProject): boolean {
  return Boolean(project.changeRequest && project.status !== 'Complete')
}

export function isProjectComplete(project: ClientProject): boolean {
  return project.status === 'Complete'
}

export function isActiveProject(project: ClientProject): boolean {
  return project.status !== 'Complete'
}

export function isJobCompleteNotification(message: string): boolean {
  return message.startsWith('JOB COMPLETE:')
}

export function parseJobCompleteProjectName(message: string): string | null {
  const match = message.match(/^JOB COMPLETE:\s*"(.+)"$/)
  return match?.[1] ?? null
}

export function findCompletedProjectForActivity(
  activity: { message: string; projectId?: string },
  projects: ClientProject[],
): ClientProject | undefined {
  if (activity.projectId) {
    const byId = projects.find(
      (project) => project.id === activity.projectId && project.status === 'Complete',
    )
    if (byId) return byId
  }

  const projectName = parseJobCompleteProjectName(activity.message)
  if (!projectName) return undefined

  return projects.find(
    (project) => project.name === projectName && project.status === 'Complete',
  )
}

export function canRequestProjectChanges(): boolean {
  const session = getAdminSession()
  if (!session) return false

  if (isOwnerSession(session)) return true

  const role = normalizeAdminRole(session.role)
  return role === 'Customer' || role === 'Support' || role === 'Administrator'
}

export function deriveProjectStatus(
  progressPercent: number,
  currentStatus: string,
  options?: { markingComplete?: boolean; hasChangeRequest?: boolean },
): string {
  if (options?.markingComplete && progressPercent === 100) {
    return 'Complete'
  }

  if (currentStatus === 'Complete') {
    return 'Complete'
  }

  if (currentStatus === 'Review') {
    if (options?.hasChangeRequest) {
      if (options?.markingComplete && progressPercent === 100) {
        return 'Complete'
      }
      return 'Review'
    }
    if (progressPercent === 0) return 'Planning'
    if (progressPercent >= 20) return 'In Progress'
    return 'Review'
  }

  if (progressPercent === 0) return 'Planning'
  if (progressPercent >= 20) return 'In Progress'
  return 'Planning'
}

export function getProjectFunnelWorkload(
  projects: ClientProject[],
): ProjectFunnelWorkload {
  const counts: Record<ProjectFunnelStage, number> = {
    Planning: 0,
    'In Progress': 0,
    Review: 0,
    Complete: 0,
  }
  const progressByStage: Record<ProjectFunnelStage, number> = {
    Planning: 0,
    'In Progress': 0,
    Review: 0,
    Complete: 0,
  }

  let progressSum = 0
  let totalFiles = 0
  let highUrgency = 0

  for (const project of projects) {
    const stage = getProjectFunnelStage(project)
    counts[stage] += 1
    const progress = getFunnelStageProgressPercent(project)
    progressByStage[stage] += progress
    progressSum += progress
    totalFiles += project.files?.length ?? 0
    if (project.urgency === 'High') highUrgency += 1
  }

  const totalProjects = projects.length
  const denominator = totalProjects || 1

  return {
    totalProjects,
    avgProgress: totalProjects ? Math.round(progressSum / totalProjects) : 0,
    totalFiles,
    highUrgency,
    activeProjects: totalProjects - counts.Complete,
    stages: PROJECT_FUNNEL_STAGES.map((stage) => ({
      stage,
      count: counts[stage],
      share: Math.round((counts[stage] / denominator) * 100),
      progress: counts[stage]
        ? Math.round(progressByStage[stage] / counts[stage])
        : 0,
    })),
  }
}

export type ProfileProjectFinancialTotals = {
  totalBudget: number
  runningBalance: number
  balanceDue: number
}

export function getProfileProjectFinancialTotalsMap(
  projects: ClientProject[],
): Record<string, ProfileProjectFinancialTotals> {
  const byOwner: Record<string, ClientProject[]> = {}

  for (const project of projects) {
    if (!byOwner[project.ownerId]) byOwner[project.ownerId] = []
    byOwner[project.ownerId].push(project)
  }

  const totals: Record<string, ProfileProjectFinancialTotals> = {}

  for (const [ownerId, ownerProjects] of Object.entries(byOwner)) {
    const financials = getClientProjectFinancialTotals(ownerProjects)
    totals[ownerId] = {
      totalBudget: financials.totalBudget,
      runningBalance: ownerProjects.reduce(
        (sum, project) => sum + getProjectBalance(project),
        0,
      ),
      balanceDue: financials.totalBalance,
    }
  }

  return totals
}

/** Support profiles earn commission on collected project revenue. */
export const SUPPORT_PROFILE_COMMISSION_RATE = 0.2

export const SUPPORT_PROJECT_COMMISSION_PRESETS = [0.2, 0.25, 0.3] as const

export type SupportProjectCommissionInput =
  | { type: 'rate'; rate: number }
  | { type: 'custom'; amount: number }

export type SupportProfileCommissionTotals = {
  rate: number | null
  earned: number
  pending: number
  potential: number
  usesCustomAmounts: boolean
  usesMixedRates: boolean
}

export type SupportCommissionTerms =
  | { type: 'rate'; rate: number }
  | { type: 'custom'; amount: number }

export type ProjectSupportCommissionSummary = {
  earned: number
  pending: number
  potential: number
  terms: SupportCommissionTerms
}

export function getSupportCommissionTerms(project: ClientProject): SupportCommissionTerms {
  if (project.supportCommissionAmount !== undefined && project.supportCommissionAmount >= 0) {
    return { type: 'custom', amount: project.supportCommissionAmount }
  }

  return {
    type: 'rate',
    rate: project.supportCommissionRate ?? SUPPORT_PROFILE_COMMISSION_RATE,
  }
}

export function getProjectSupportCommissionSummary(
  project: ClientProject,
): ProjectSupportCommissionSummary {
  return {
    ...getProjectSupportCommissionParts(project),
    terms: getSupportCommissionTerms(project),
  }
}

export function getProfileSupportCommissionTotalsMap(
  projects: ClientProject[],
): Record<string, SupportProfileCommissionTotals> {
  const byOwner: Record<string, ClientProject[]> = {}

  for (const project of projects) {
    if (!byOwner[project.ownerId]) byOwner[project.ownerId] = []
    byOwner[project.ownerId].push(project)
  }

  const totals: Record<string, SupportProfileCommissionTotals> = {}

  for (const [ownerId, ownerProjects] of Object.entries(byOwner)) {
    totals[ownerId] = getSupportProfileCommissionTotalsFromProjects(ownerProjects)
  }

  return totals
}

export function getProjectSupportCommissionParts(
  project: ClientProject,
  amountPaid = getProjectAmountPaid(project),
  balanceDue = getProjectAmountOwed(project),
): { earned: number; pending: number; potential: number } {
  const budget = project.budget ?? 0

  if (project.supportCommissionAmount !== undefined && project.supportCommissionAmount >= 0) {
    const total = project.supportCommissionAmount
    if (budget <= 0) {
      return { earned: 0, pending: total, potential: total }
    }

    return {
      earned: total * (amountPaid / budget),
      pending: total * (balanceDue / budget),
      potential: total,
    }
  }

  const rate = project.supportCommissionRate ?? SUPPORT_PROFILE_COMMISSION_RATE
  return {
    earned: amountPaid * rate,
    pending: balanceDue * rate,
    potential: budget * rate,
  }
}

export function getSupportProfileCommissionTotalsFromProjects(
  projects: ClientProject[],
): SupportProfileCommissionTotals {
  let earned = 0
  let pending = 0
  let potential = 0
  let usesCustomAmounts = false
  const rates = new Set<number>()

  for (const project of projects) {
    const parts = getProjectSupportCommissionParts(project)
    earned += parts.earned
    pending += parts.pending
    potential += parts.potential

    if (project.supportCommissionAmount !== undefined && project.supportCommissionAmount >= 0) {
      usesCustomAmounts = true
    } else {
      rates.add(project.supportCommissionRate ?? SUPPORT_PROFILE_COMMISSION_RATE)
    }
  }

  const usesMixedRates = rates.size > 1 || (usesCustomAmounts && rates.size > 0)
  const rate = usesCustomAmounts || usesMixedRates ? null : [...rates][0] ?? SUPPORT_PROFILE_COMMISSION_RATE

  return {
    rate,
    earned,
    pending,
    potential,
    usesCustomAmounts,
    usesMixedRates,
  }
}

export function getSupportProfileCommissionTotals(
  totalBudget: number,
  amountPaid: number,
  balanceDue: number,
  rate = SUPPORT_PROFILE_COMMISSION_RATE,
): Omit<SupportProfileCommissionTotals, 'usesCustomAmounts' | 'usesMixedRates'> & {
  usesCustomAmounts: false
  usesMixedRates: false
} {
  return {
    rate,
    earned: amountPaid * rate,
    pending: balanceDue * rate,
    potential: totalBudget * rate,
    usesCustomAmounts: false,
    usesMixedRates: false,
  }
}

export function getProjectProgressPercent(project: ClientProject): number {
  if (hasRevisionProgress(project)) {
    return getChangesProgressPercent(project)
  }
  return parseProjectProgressPercent(project.progress)
}

export function getProjectProgressLabel(project: ClientProject): string {
  if (hasRevisionProgress(project)) {
    return `${getChangesProgressPercent(project)}% changes`
  }
  return project.progress
}

export type ProfileProjectWorkloadSummary = {
  totalProjects: number
  avgProgress: number
  activeProjects: number
  projectProgress: number[]
}

export function getProfileProjectWorkloadMap(
  projects: ClientProject[],
): Record<string, ProfileProjectWorkloadSummary> {
  const byOwner: Record<string, ClientProject[]> = {}

  for (const project of projects) {
    if (!byOwner[project.ownerId]) byOwner[project.ownerId] = []
    byOwner[project.ownerId].push(project)
  }

  const workloadMap: Record<string, ProfileProjectWorkloadSummary> = {}

  for (const [ownerId, ownerProjects] of Object.entries(byOwner)) {
    const activeOwnerProjects = ownerProjects.filter(isActiveProject)
    const projectProgress = activeOwnerProjects.map((project) =>
      getProjectProgressPercent(project),
    )

    workloadMap[ownerId] = {
      totalProjects: activeOwnerProjects.length,
      avgProgress: projectProgress.length
        ? Math.round(
            projectProgress.reduce((sum, progress) => sum + progress, 0) /
              projectProgress.length,
          )
        : 0,
      activeProjects: activeOwnerProjects.length,
      projectProgress,
    }
  }

  return workloadMap
}

export function listClientUploads(): ClientUpload[] {
  const uploads: ClientUpload[] = []

  for (const project of readProjects()) {
    if (!project.files?.length) continue

    for (const file of project.files) {
      uploads.push({
        ...file,
        projectId: file.projectId ?? project.id,
        projectName: file.projectName ?? project.name,
        uploadedAt: file.uploadedAt ?? new Date().toISOString(),
      })
    }
  }

  return uploads.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  )
}

export function getClientUploadsSummary(): { count: number; totalBytes: number } {
  const uploads = listClientUploads()
  return {
    count: uploads.length,
    totalBytes: uploads.reduce((sum, file) => sum + file.size, 0),
  }
}

export function getClientUploadsByCategory(): { label: string; count: number }[] {
  const uploads = listClientUploads()
  const buckets: Record<string, number> = {
    Documents: 0,
    'Design Files': 0,
    Images: 0,
    Videos: 0,
    Exports: 0,
  }

  for (const file of uploads) {
    const type = file.type.toLowerCase()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

    if (isClientProjectImageFile(file.type, file.name)) {
      buckets.Images++
    } else if (isClientProjectVideoFile(file.type, file.name)) {
      buckets.Videos++
    } else if (
      isClientProjectPdfFile(file.type, file.name) ||
      ['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)
    ) {
      buckets.Documents++
    } else if (
      ['psd', 'ai', 'fig', 'sketch', 'xd'].includes(ext) ||
      type.includes('photoshop') ||
      type.includes('illustrator')
    ) {
      buckets['Design Files']++
    } else if (['zip', 'rar', '7z', 'gz', 'tar', 'csv', 'xls', 'xlsx', 'json'].includes(ext)) {
      buckets.Exports++
    } else {
      buckets.Documents++
    }
  }

  return [
    { label: 'Documents', count: buckets.Documents },
    { label: 'Design Files', count: buckets['Design Files'] },
    { label: 'Images', count: buckets.Images },
    { label: 'Videos', count: buckets.Videos },
    { label: 'Exports', count: buckets.Exports },
  ].filter((row) => row.count > 0)
}

export type ClientProjectUploadGroup = {
  projectId: string
  projectName: string
  projectType: string
  files: ClientUpload[]
  totalBytes: number
}

export function listClientUploadGroups(): ClientProjectUploadGroup[] {
  const groups: ClientProjectUploadGroup[] = []

  for (const project of readProjects()) {
    if (!project.files?.length) continue

    const files: ClientUpload[] = project.files.map((file) => ({
      ...file,
      projectId: file.projectId ?? project.id,
      projectName: file.projectName ?? project.name,
      uploadedAt: file.uploadedAt ?? new Date().toISOString(),
    }))

    files.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    )

    groups.push({
      projectId: project.id,
      projectName: project.name,
      projectType: project.type,
      files,
      totalBytes: files.reduce((sum, file) => sum + file.size, 0),
    })
  }

  return groups.sort((a, b) => {
    const aLatest = a.files[0]?.uploadedAt ?? ''
    const bLatest = b.files[0]?.uploadedAt ?? ''
    return new Date(bLatest).getTime() - new Date(aLatest).getTime()
  })
}

export function createClientProject(input: {
  name: string
  type: ClientProjectType
  urgency: ClientProjectUrgency
  date: string
  description?: string
  url?: string
  budget?: number
  files?: ClientProjectFile[]
}): { ok: true; project: ClientProject } | { ok: false; error: string } {
  const scope = getClientDataScope()
  if (!scope.ownerId) {
    return { ok: false, error: 'Sign in to create projects.' }
  }

  const name = input.name.trim()
  const date = input.date.trim()
  const description = input.description?.trim()
  const url = input.url?.trim()
  const budget = input.budget

  if (!name || !date) {
    return { ok: false, error: 'Project name and date are required.' }
  }

  const due = formatClientProjectDate(date)
  const projectId = crypto.randomUUID()
  const uploadedAt = new Date().toISOString()
  const session = getAdminSession()
  const isSupportSubmission =
    session !== null && normalizeAdminRole(session.role) === 'Support'
  const files =
    input.files && input.files.length > 0
      ? input.files.map((file) => ({
          ...file,
          projectId,
          projectName: name,
          uploadedAt,
        }))
      : undefined

  const project: ClientProject = {
    id: projectId,
    ownerId: scope.ownerId,
    name,
    type: input.type,
    urgency: input.urgency,
    progress: '0%',
    metric: '0%',
    status: 'Planning',
    due,
    date,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(budget !== undefined && budget >= 0
      ? { budget, balance: -budget }
      : {}),
    ...(files ? { files } : {}),
    ...(isSupportSubmission
      ? { approvalStatus: 'pending' as const, submittedAt: uploadedAt }
      : { approvalStatus: 'approved' as const }),
  }

  const saved = writeAllProjects([project, ...readAllProjects()])
  if (!saved.ok) {
    return saved
  }

  logPlatformActivity({
    message: isSupportSubmission
      ? `Project submitted for approval: "${name}"`
      : `Project created: "${name}"`,
    category: 'project',
    ownerId: scope.ownerId,
    actorName: scope.actorName,
    projectId,
  })
  if (files?.length) {
    logPlatformActivity({
      message: `${files.length} file(s) uploaded to "${name}"`,
      category: 'upload',
      ownerId: scope.ownerId,
      actorName: scope.actorName,
    })
  }

  return { ok: true, project }
}

export function approveClientProject(
  id: string,
  commission: SupportProjectCommissionInput,
): { ok: true; project: ClientProject } | { ok: false; error: string } {
  const session = getAdminSession()
  if (!isOwnerSession(session)) {
    return { ok: false, error: 'Only the master admin can approve projects.' }
  }

  if (commission.type === 'rate') {
    if (!SUPPORT_PROJECT_COMMISSION_PRESETS.some((preset) => preset === commission.rate)) {
      return { ok: false, error: 'Choose a valid commission rate.' }
    }
  } else if (commission.amount < 0) {
    return { ok: false, error: 'Enter a valid custom commission amount.' }
  }

  const projects = readAllProjects()
  const index = projects.findIndex((project) => project.id === id)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const existing = projects[index]
  if (!isProjectPendingApproval(existing)) {
    return { ok: false, error: 'This project is not awaiting approval.' }
  }

  const updated: ClientProject = {
    ...existing,
    approvalStatus: 'approved',
    ...(commission.type === 'rate'
      ? { supportCommissionRate: commission.rate, supportCommissionAmount: undefined }
      : { supportCommissionAmount: commission.amount, supportCommissionRate: undefined }),
  }

  const next = [...projects]
  next[index] = updated
  const saved = writeAllProjects(next)
  if (!saved.ok) {
    return saved
  }

  logPlatformActivity({
    message: `Project approved: "${updated.name}"`,
    category: 'project',
    ownerId: updated.ownerId,
    actorName: session?.name,
    projectId: updated.id,
  })

  return { ok: true, project: updated }
}

export function declineClientProject(
  id: string,
): { ok: true } | { ok: false; error: string } {
  const session = getAdminSession()
  if (!isOwnerSession(session)) {
    return { ok: false, error: 'Only the master admin can decline projects.' }
  }

  const projects = readAllProjects()
  const project = projects.find((entry) => entry.id === id)
  if (!project) {
    return { ok: false, error: 'Project not found.' }
  }

  if (!isProjectPendingApproval(project)) {
    return { ok: false, error: 'This project is not awaiting approval.' }
  }

  const fileIds = (project.files ?? []).map((file) => file.id)
  if (fileIds.length > 0) {
    void deleteFileBlobs(fileIds)
  }

  const saved = writeAllProjects(projects.filter((entry) => entry.id !== id))
  if (!saved.ok) {
    return saved
  }

  logPlatformActivity({
    message: `Project declined: "${project.name}"`,
    category: 'project',
    ownerId: project.ownerId,
    actorName: session?.name,
    projectId: project.id,
  })

  return { ok: true }
}

export function updateClientProject(
  id: string,
  input: {
    name: string
    type: ClientProjectType
    urgency: ClientProjectUrgency
    date: string
    description?: string
    url?: string
    budget?: number
    files?: ClientProjectFile[]
  },
): { ok: true; project: ClientProject } | { ok: false; error: string } {
  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, id, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const existing = projects[index]
  const name = input.name.trim()
  const date = input.date.trim()
  const description = input.description?.trim()
  const url = input.url?.trim()

  if (!name || !date) {
    return { ok: false, error: 'Project name and date are required.' }
  }

  const due = formatClientProjectDate(date)
  const previousFileIds = new Set(existing.files?.map((file) => file.id) ?? [])
  const paidSoFar = getProjectAmountPaid(existing)
  const files =
    input.files?.map((file) => ({
      ...file,
      projectId: id,
      projectName: name,
      uploadedAt: file.uploadedAt ?? new Date().toISOString(),
    })) ?? existing.files
  const newlyAddedFiles =
    input.files?.filter((file) => !previousFileIds.has(file.id)) ?? []

  const updated: ClientProject = {
    ...existing,
    name,
    type: input.type,
    urgency: input.urgency,
    due,
    date,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(files ? { files } : {}),
  }

  if (!description && updated.description) {
    delete updated.description
  }
  if (!url && updated.url) {
    delete updated.url
  }
  if (input.budget !== undefined && input.budget >= 0) {
    updated.budget = input.budget
    updated.balance = Math.min(0, -(input.budget - paidSoFar))
  } else if (input.budget === undefined) {
    delete updated.budget
    delete updated.balance
  }

  const next = [...projects]
  next[index] = updated
  const saved = writeAllProjects(next)
  if (!saved.ok) {
    return saved
  }

  logPlatformActivity({
    message: `Project updated: "${name}"`,
    category: 'project',
    ownerId: existing.ownerId,
    actorName: scope.actorName,
  })
  if (newlyAddedFiles.length > 0) {
    logPlatformActivity({
      message: `${newlyAddedFiles.length} file(s) uploaded to "${name}"`,
      category: 'upload',
      ownerId: existing.ownerId,
      actorName: scope.actorName,
    })
  }

  return { ok: true, project: updated }
}

export function applyProjectPayment(
  projectId: string,
  amount: number,
): { ok: true; project: ClientProject } | { ok: false; error: string } {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Enter a valid payment amount.' }
  }

  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const existing = projects[index]
  const owed = getProjectAmountOwed(existing)
  if (owed <= 0) {
    return { ok: false, error: 'This project invoice is already paid in full.' }
  }

  const payment = Math.min(amount, owed)
  const updated: ClientProject = {
    ...existing,
    balance: Math.min(0, getProjectBalance(existing) + payment),
  }

  const next = [...projects]
  next[index] = updated
  const saved = writeAllProjects(next)
  if (!saved.ok) {
    return saved
  }

  logPlatformActivity({
    message: `Payment of ${payment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} applied to "${existing.name}"`,
    category: 'project',
    ownerId: existing.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true, project: updated }
}

export function markClientProjectInvoicePaid(
  projectId: string,
): { ok: true; project: ClientProject } | { ok: false; error: string } {
  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const existing = projects[index]
  const owed = getProjectAmountOwed(existing)
  if (owed <= 0) {
    return { ok: false, error: 'This project invoice is already paid in full.' }
  }

  const updated: ClientProject = {
    ...existing,
    balance: 0,
  }

  const next = [...projects]
  next[index] = updated
  const saved = writeAllProjects(next)
  if (!saved.ok) {
    return saved
  }

  logPlatformActivity({
    message: `Invoice marked as paid for "${existing.name}" (${owed.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})`,
    category: 'project',
    ownerId: existing.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true, project: updated }
}

export function updateClientProjectProgress(
  id: string,
  progressPercent: number,
  options?: { allowMarkComplete?: boolean },
): { ok: true; project: ClientProject } | { ok: false; error: string } {
  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, id, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const existing = projects[index]
  const clamped = Math.min(100, Math.max(0, Math.round(progressPercent)))
  const label = `${clamped}%`
  const markingComplete = Boolean(options?.allowMarkComplete && clamped === 100)
  const trackingRevision = Boolean(existing.changeRequest && existing.status !== 'Complete')
  const status = deriveProjectStatus(clamped, existing.status, {
    markingComplete,
    hasChangeRequest: trackingRevision,
  })

  const updated: ClientProject = {
    ...existing,
    progress: label,
    metric: label,
    status,
    ...(trackingRevision ? { changesProgress: label } : {}),
    ...(markingComplete
      ? { completedAt: new Date().toISOString(), orderConfirmed: false }
      : {}),
  }

  const next = [...projects]
  next[index] = updated
  writeAllProjects(next)

  logPlatformActivity({
    message: markingComplete
      ? `JOB COMPLETE: "${existing.name}"`
      : trackingRevision
        ? `Changes progress set to ${label}: "${existing.name}"`
        : `Project progress set to ${label}: "${existing.name}"`,
    category: 'project',
    ownerId: existing.ownerId,
    actorName: scope.actorName,
    ...(markingComplete ? { projectId: existing.id } : {}),
  })

  return { ok: true, project: updated }
}

export function confirmClientProjectOrder(
  projectId: string,
): { ok: true; project: ClientProject } | { ok: false; error: string } {
  if (!canRequestProjectChanges()) {
    return { ok: false, error: 'Sign in to confirm completed orders.' }
  }

  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const existing = projects[index]
  if (existing.status !== 'Complete') {
    return { ok: false, error: 'Only completed jobs can be confirmed.' }
  }

  const updated: ClientProject = {
    ...existing,
    orderConfirmed: true,
  }

  const next = [...projects]
  next[index] = updated
  writeAllProjects(next)

  logPlatformActivity({
    message: `Order confirmed: "${existing.name}"`,
    category: 'project',
    ownerId: existing.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true, project: updated }
}

export function canUncompleteClientProject(): boolean {
  return isOwnerSession(getAdminSession())
}

export function uncompleteClientProject(
  projectId: string,
): { ok: true; project: ClientProject } | { ok: false; error: string } {
  if (!canUncompleteClientProject()) {
    return { ok: false, error: 'Only the master admin can uncomplete jobs.' }
  }

  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const existing = projects[index]
  if (existing.status !== 'Complete') {
    return { ok: false, error: 'Only completed jobs can be uncompleted.' }
  }

  const trackingRevision = Boolean(existing.changeRequest)
  const revertProgress = 80
  const label = `${revertProgress}%`
  const updated: ClientProject = {
    ...existing,
    status: trackingRevision ? 'Review' : 'In Progress',
    progress: label,
    metric: label,
    orderConfirmed: false,
    ...(trackingRevision ? { changesProgress: label } : {}),
  }
  delete updated.completedAt

  const next = [...projects]
  next[index] = updated
  writeAllProjects(next)

  logPlatformActivity({
    message: `Job uncompleted: "${existing.name}"`,
    category: 'project',
    ownerId: existing.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true, project: updated }
}

export function requestClientProjectChanges(
  projectId: string,
  input: {
    summary: string
    details: string
    files?: ClientProjectFile[]
  },
): { ok: true; project: ClientProject } | { ok: false; error: string } {
  if (!canRequestProjectChanges()) {
    return {
      ok: false,
      error: 'Sign in to request changes on completed jobs.',
    }
  }

  const summary = input.summary.trim()
  const details = input.details.trim()
  if (!summary) {
    return { ok: false, error: 'Describe what needs to be changed.' }
  }
  if (!details) {
    return { ok: false, error: 'Add details about the requested changes.' }
  }

  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const existing = projects[index]
  if (existing.status !== 'Complete') {
    return { ok: false, error: 'Changes can only be requested on completed jobs.' }
  }

  const uploadedAt = new Date().toISOString()
  const changeFiles = (input.files ?? []).map((file) => ({
    ...file,
    projectId: existing.id,
    projectName: existing.name,
    uploadedAt: file.uploadedAt ?? uploadedAt,
  }))

  const updated: ClientProject = {
    ...existing,
    status: 'Review',
    orderConfirmed: false,
    deliveredProgress: existing.progress,
    changesProgress: '0%',
    progress: '0%',
    metric: '0%',
    changeRequest: {
      summary,
      details,
      submittedAt: uploadedAt,
      files: changeFiles,
    },
    files: [...(existing.files ?? []), ...changeFiles],
  }

  const next = [...projects]
  next[index] = updated
  writeAllProjects(next)

  logPlatformActivity({
    message: `Changes requested: "${existing.name}" — ${summary}`,
    category: 'project',
    ownerId: existing.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true, project: updated }
}

export function deleteClientProject(
  id: string,
): { ok: true } | { ok: false; error: string } {
  const scope = getClientDataScope()
  const projects = readAllProjects()
  const project = projects.find(
    (entry) => entry.id === id && canAccessProject(entry, scope),
  )
  if (!project) {
    return { ok: false, error: 'Project not found.' }
  }

  const fileIds = (project.files ?? []).map((f) => f.id)
  if (fileIds.length > 0) {
    void deleteFileBlobs(fileIds)
  }

  writeAllProjects(projects.filter((entry) => entry.id !== id))

  logPlatformActivity({
    message: `Project deleted: "${project.name}"`,
    category: 'project',
    ownerId: project.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true }
}

export function deleteClientProjectFile(
  projectId: string,
  fileId: string,
): { ok: true } | { ok: false; error: string } {
  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const project = projects[index]
  const file = project.files?.find((entry) => entry.id === fileId)
  if (!file) {
    return { ok: false, error: 'File not found.' }
  }

  const nextFiles = project.files!.filter((entry) => entry.id !== fileId)
  const next = [...projects]
  next[index] = {
    ...project,
    files: nextFiles.length > 0 ? nextFiles : undefined,
  }
  if (!next[index].files) {
    delete next[index].files
  }

  void deleteFileBlob(fileId)
  writeAllProjects(next)

  logPlatformActivity({
    message: `File removed: "${file.name}" from "${project.name}"`,
    category: 'upload',
    ownerId: project.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true }
}

export function moveClientProjectFile(
  fromProjectId: string,
  fileId: string,
  toProjectId: string,
): { ok: true } | { ok: false; error: string } {
  if (fromProjectId === toProjectId) {
    return { ok: false, error: 'Choose a different project.' }
  }

  const scope = getClientDataScope()
  const projects = readAllProjects()
  const fromIndex = findAccessibleProjectIndex(projects, fromProjectId, scope)
  const toIndex = findAccessibleProjectIndex(projects, toProjectId, scope)

  if (fromIndex === -1 || toIndex === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const fromProject = projects[fromIndex]
  const toProject = projects[toIndex]

  if (!scope.viewAll && fromProject.ownerId !== toProject.ownerId) {
    return { ok: false, error: 'Files can only be moved within your own projects.' }
  }
  const file = fromProject.files?.find((entry) => entry.id === fileId)
  if (!file) {
    return { ok: false, error: 'File not found.' }
  }

  const movedFile: ClientProjectFile = {
    ...file,
    projectId: toProjectId,
    projectName: toProject.name,
    uploadedAt: file.uploadedAt ?? new Date().toISOString(),
  }

  const nextFromFiles = fromProject.files!.filter((entry) => entry.id !== fileId)
  const nextToFiles = [...(toProject.files ?? []), movedFile]

  const next = [...projects]
  next[fromIndex] = {
    ...fromProject,
    ...(nextFromFiles.length > 0 ? { files: nextFromFiles } : {}),
  }
  if (!next[fromIndex].files) {
    delete next[fromIndex].files
  }
  next[toIndex] = { ...toProject, files: nextToFiles }

  writeAllProjects(next)

  logPlatformActivity({
    message: `File moved: "${file.name}" from "${fromProject.name}" to "${toProject.name}"`,
    category: 'upload',
    ownerId: fromProject.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true }
}

async function cloneClientProjectFile(
  file: ClientProjectFile,
): Promise<ClientProjectFile> {
  const duplicate: ClientProjectFile = {
    ...file,
    id: createFileId(),
    uploadedAt: new Date().toISOString(),
  }

  if (file.blobStored) {
    const copied = await copyFileBlob(file.id, duplicate.id)
    if (!copied) {
      duplicate.blobStored = false
    }
  }

  return duplicate
}

export async function duplicateClientProjectFile(
  projectId: string,
  fileId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const project = projects[index]
  const file = project.files?.find((entry) => entry.id === fileId)
  if (!file) {
    return { ok: false, error: 'File not found.' }
  }

  const duplicate = await cloneClientProjectFile(file)
  const next = [...projects]
  next[index] = {
    ...project,
    files: [...(project.files ?? []), duplicate],
  }
  writeAllProjects(next)

  logPlatformActivity({
    message: `File duplicated: "${file.name}" in "${project.name}"`,
    category: 'upload',
    ownerId: project.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true }
}

export function detachClientProjectFile(
  projectId: string,
  fileId: string,
): { ok: true; file: ClientProjectFile; project: ClientProject } | { ok: false; error: string } {
  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const project = projects[index]
  const file = project.files?.find((entry) => entry.id === fileId)
  if (!file) {
    return { ok: false, error: 'File not found.' }
  }

  const nextFiles = project.files!.filter((entry) => entry.id !== fileId)
  const next = [...projects]
  next[index] = {
    ...project,
    files: nextFiles.length > 0 ? nextFiles : undefined,
  }
  if (!next[index].files) {
    delete next[index].files
  }
  writeAllProjects(next)

  return { ok: true, file, project }
}

export function moveClientProjectFileToFileManager(
  fromProjectId: string,
  fileId: string,
): { ok: true } | { ok: false; error: string } {
  const detached = detachClientProjectFile(fromProjectId, fileId)
  if (!detached.ok) {
    return detached
  }

  const result = addFileManagerFiles([detached.file], detached.project.ownerId)
  if (!result.ok) {
    const projects = readAllProjects()
    const index = projects.findIndex((project) => project.id === fromProjectId)
    if (index !== -1) {
      const project = projects[index]
      const next = [...projects]
      next[index] = {
        ...project,
        files: [...(project.files ?? []), detached.file],
      }
      writeAllProjects(next)
    }
    return result
  }

  const scope = getClientDataScope()
  logPlatformActivity({
    message: `File moved: "${detached.file.name}" from "${detached.project.name}" to File Manager`,
    category: 'upload',
    ownerId: detached.project.ownerId,
    actorName: scope.actorName,
  })

  return { ok: true }
}

export function appendFileToClientProject(
  projectId: string,
  file: ClientProjectFile,
): { ok: true } | { ok: false; error: string } {
  const scope = getClientDataScope()
  const projects = readAllProjects()
  const index = findAccessibleProjectIndex(projects, projectId, scope)
  if (index === -1) {
    return { ok: false, error: 'Project not found.' }
  }

  const project = projects[index]
  const attached: ClientProjectFile = {
    ...file,
    projectId,
    projectName: project.name,
    uploadedAt: file.uploadedAt ?? new Date().toISOString(),
  }

  const next = [...projects]
  next[index] = {
    ...project,
    files: [...(project.files ?? []), attached],
  }
  const saved = writeAllProjects(next)
  if (!saved.ok) {
    return saved
  }

  return { ok: true }
}
