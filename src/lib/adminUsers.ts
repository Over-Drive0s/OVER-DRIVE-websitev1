import { SITE_ADMIN_EMAIL, SITE_EMAIL_DOMAIN } from '../config/site'
import { normalizeAdminRole, type ProfileRoleFilter } from './adminRoles'
import { formatPhoneNumber } from './formatPhoneNumber'
import { deleteProfilePortalData } from './profileDataCleanup'
import { logPlatformActivity } from './platformActivityLog'
import { notifyDataBinUpdated } from './dataBins'
import { readStoredFileDataUrl } from './storedFileData'
import type { PreferredPayment } from './preferredPayment'

export type AdminRole = 'Customer' | 'Administrator' | 'Support'

export type AdminUser = {
  id: string
  name: string
  email: string
  phone?: string
  password: string
  role: AdminRole
  createdAt: string
  profileImageUrl?: string
  preferredPayment?: PreferredPayment
}

export type AdminSession = {
  id: string
  email: string
  name: string
  role: AdminRole
  isOwner?: boolean
  profileImageUrl?: string
}

/** Profile / admin file uploads — any file type. */
export async function readProfileImageDataUrl(
  file: File,
): Promise<{ ok: true; dataUrl: string } | { ok: false; error: string }> {
  return readStoredFileDataUrl(file)
}

const USERS_KEY = 'overdriveio-admin-users'
const LEGACY_USERS_KEY = 'overdrive-admin-users'
const SESSION_KEY = 'overdriveio-admin-session'
const LEGACY_SESSION_KEY = 'overdrive-admin-session'

/** Legacy owner sign-ins — normalized to the current master admin email. */
const LEGACY_OWNER_EMAILS = [
  'admin@overdrive.com',
  'admin@overdriveio.com',
  `admin@${SITE_EMAIL_DOMAIN}`,
]

const seedUsers: AdminUser[] = [
  {
    id: 'seed-admin',
    name: 'Admin',
    email: SITE_ADMIN_EMAIL,
    password: 'pushingP11',
    role: 'Administrator',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

function normalizeOwnerEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  if (LEGACY_OWNER_EMAILS.includes(normalized)) {
    return SITE_ADMIN_EMAIL.toLowerCase()
  }
  return normalized
}

function migrateLegacySession() {
  try {
    const legacy = localStorage.getItem(LEGACY_SESSION_KEY)
    if (!legacy) return

    if (!localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, legacy)
      notifyDataBinUpdated('session')
    }
    localStorage.removeItem(LEGACY_SESSION_KEY)
  } catch {
    // ignore corrupt legacy data
  }
}

function normalizeUsers(users: AdminUser[]): AdminUser[] {
  const normalized = users.map((u) => {
    const email = normalizeOwnerEmail(u.email)
    const role = normalizeAdminRole(u.role)
    const migrated = role !== u.role || email !== u.email
    return migrated ? { ...u, email, role } : u
  })

  const seen = new Set<string>()
  const deduped: AdminUser[] = []
  for (const user of normalized) {
    const key = user.email.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(user)
  }
  return deduped
}

function migrateLegacyUsers() {
  try {
    const legacy = localStorage.getItem(LEGACY_USERS_KEY)
    if (!legacy) return

    const current = localStorage.getItem(USERS_KEY)
    if (!current) {
      localStorage.setItem(USERS_KEY, legacy)
    } else {
      const legacyUsers = JSON.parse(legacy) as AdminUser[]
      const existing = JSON.parse(current) as AdminUser[]
      const emails = new Set(existing.map((u) => u.email.toLowerCase()))
      const merged = [
        ...existing,
        ...legacyUsers.filter((u) => !emails.has(u.email.toLowerCase())),
      ]
      localStorage.setItem(USERS_KEY, JSON.stringify(merged))
    }
    localStorage.removeItem(LEGACY_USERS_KEY)
  } catch {
    // ignore corrupt legacy data
  }
}

function mergeSeedUsers(users: AdminUser[]): AdminUser[] {
  const seed = seedUsers[0]
  const seedEmail = normalizeOwnerEmail(seed.email)
  const others = users.filter(
    (user) =>
      user.id !== seed.id && normalizeOwnerEmail(user.email) !== seedEmail,
  )
  return normalizeUsers([{ ...seed, email: seedEmail }, ...others])
}

function readUsers(): AdminUser[] {
  migrateLegacyUsers()

  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) {
      const initial = normalizeUsers([...seedUsers])
      writeUsers(initial)
      return initial
    }

    const parsed = JSON.parse(raw) as AdminUser[]
    const normalized = normalizeUsers(parsed)
    const merged = mergeSeedUsers(normalized)
    if (
      merged.length !== parsed.length ||
      JSON.stringify(normalized) !== JSON.stringify(parsed) ||
      parsed.some((user) => normalizeAdminRole(user.role) !== user.role)
    ) {
      writeUsers(merged)
    }
    return merged
  } catch {
    const initial = normalizeUsers([...seedUsers])
    writeUsers(initial)
    return initial
  }
}

function writeUsers(users: AdminUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  notifyDataBinUpdated('profiles')
}

function writeSession(session: AdminSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  notifyDataBinUpdated('session')
}

export function listAdminUsers(): AdminUser[] {
  return [...readUsers()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function findAdminUserByEmail(email: string): AdminUser | undefined {
  const normalized = normalizeOwnerEmail(email)
  return readUsers().find((user) => user.email.toLowerCase() === normalized)
}

export function findAdminUserById(id: string): AdminUser | undefined {
  return readUsers().find((user) => user.id === id)
}

export function getAdminOwnerIdsByRole(role: AdminRole): string[] {
  return readUsers()
    .filter((user) => !isExclusiveOwnerEmail(user.email) && user.role === role)
    .map((user) => user.id)
}

export function adminUserMatchesRoleFilter(
  ownerId: string | undefined,
  filter: ProfileRoleFilter,
): boolean {
  if (filter === 'all' || !ownerId) return filter === 'all'
  const owner = findAdminUserById(ownerId)
  return owner?.role === filter
}

export function createAdminUser(input: {
  name: string
  email: string
  phone: string
  password: string
  role: AdminRole
  profileImageUrl?: string
  preferredPayment?: PreferredPayment
}): { ok: true; user: AdminUser } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  const phone = input.phone.replace(/\D/g, '')

  if (!email || !name || !input.password || !phone) {
    return { ok: false, error: 'All fields are required.' }
  }

  if (phone.length !== 10) {
    return { ok: false, error: 'Enter a valid 10-digit phone number.' }
  }

  const users = readUsers()
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: 'An admin with this email already exists.' }
  }

  const user: AdminUser = {
    id: crypto.randomUUID(),
    name,
    email,
    phone: formatPhoneNumber(phone),
    password: input.password,
    role: input.role,
    createdAt: new Date().toISOString(),
    ...(input.profileImageUrl ? { profileImageUrl: input.profileImageUrl } : {}),
    ...(input.preferredPayment ? { preferredPayment: input.preferredPayment } : {}),
  }

  writeUsers([...users, user])

  const session = getAdminSession()
  logPlatformActivity({
    message: `Profile created: ${name} (${input.role})`,
    category: 'profile',
    ownerId: user.id,
    actorName: session?.name,
  })

  import('./portalMessenger')
    .then(({ ensureGeneralChannelMembers }) => ensureGeneralChannelMembers())
    .catch(() => {})

  return { ok: true, user }
}

export function updateAdminUser(
  id: string,
  input: {
    name: string
    email: string
    phone: string
    password?: string
    role: AdminRole
    profileImageUrl?: string
    preferredPayment?: PreferredPayment
  },
): { ok: true; user: AdminUser } | { ok: false; error: string } {
  const users = readUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) {
    return { ok: false, error: 'Profile not found.' }
  }

  const existing = users[index]
  const email = normalizeOwnerEmail(input.email)
  const name = input.name.trim()
  const phone = input.phone.replace(/\D/g, '')

  if (!email || !name || !phone) {
    return { ok: false, error: 'Name, email, and phone are required.' }
  }

  if (phone.length !== 10) {
    return { ok: false, error: 'Enter a valid 10-digit phone number.' }
  }

  if (users.some((u) => u.id !== id && u.email.toLowerCase() === email)) {
    return { ok: false, error: 'An admin with this email already exists.' }
  }

  const updated: AdminUser = {
    ...existing,
    name,
    email,
    phone: formatPhoneNumber(phone),
    role: input.role,
    ...(input.password ? { password: input.password } : {}),
  }

  if (input.profileImageUrl !== undefined) {
    if (input.profileImageUrl) {
      updated.profileImageUrl = input.profileImageUrl
    } else {
      delete updated.profileImageUrl
    }
  }

  if (input.preferredPayment !== undefined) {
    if (input.preferredPayment) {
      updated.preferredPayment = input.preferredPayment
    } else {
      delete updated.preferredPayment
    }
  }

  const next = [...users]
  next[index] = updated
  writeUsers(next)

  const session = getAdminSession()
  if (session && session.email.toLowerCase() === existing.email.toLowerCase()) {
    writeSession(buildSession(updated))
  }

  logPlatformActivity({
    message: `Profile updated: ${name}`,
    category: 'profile',
    ownerId: updated.id,
    actorName: session?.name,
  })

  return { ok: true, user: updated }
}

export function deleteAdminUser(
  id: string,
): { ok: true } | { ok: false; error: string } {
  const users = readUsers()
  const user = users.find((u) => u.id === id)
  if (!user) {
    return { ok: false, error: 'Profile not found.' }
  }

  if (isExclusiveOwnerEmail(user.email)) {
    return { ok: false, error: 'The master owner profile cannot be deleted.' }
  }

  writeUsers(users.filter((u) => u.id !== id))
  deleteProfilePortalData(user.id)

  const session = getAdminSession()
  if (session && session.email.toLowerCase() === user.email.toLowerCase()) {
    signOutAdmin()
  }

  logPlatformActivity({
    message: `Profile deleted: ${user.name}`,
    category: 'profile',
    ownerId: user.id,
    actorName: session?.name,
  })

  return { ok: true }
}

export function isExclusiveOwnerEmail(email: string): boolean {
  const normalized = normalizeOwnerEmail(email)
  return normalized === SITE_ADMIN_EMAIL.toLowerCase()
}

export function isOwnerSession(session: AdminSession | null): boolean {
  if (!session) return false
  return session.isOwner === true || isExclusiveOwnerEmail(session.email)
}

export type PostLoginPath = '/masteradmin' | '/clientportal' | '/adminsupport' | '/adminportal'

export function getPostLoginPath(email: string, role?: AdminRole): PostLoginPath {
  if (isExclusiveOwnerEmail(email)) return '/masteradmin'

  const resolvedRole = role ?? findAdminUserByEmail(email)?.role
  if (resolvedRole === 'Support') return '/adminsupport'
  if (resolvedRole === 'Administrator') return '/adminportal'
  return '/clientportal'
}

function buildSession(user: AdminUser): AdminSession {
  const email = normalizeOwnerEmail(user.email)
  const isOwner = isExclusiveOwnerEmail(email)
  return {
    id: user.id,
    email,
    name: user.name,
    role: user.role,
    ...(isOwner ? { isOwner: true } : {}),
    ...(user.profileImageUrl ? { profileImageUrl: user.profileImageUrl } : {}),
  }
}

function normalizeSession(session: AdminSession): AdminSession {
  const email = normalizeOwnerEmail(session.email)
  const isOwner = session.isOwner === true || isExclusiveOwnerEmail(email)
  const user =
    session.id ? findAdminUserById(session.id) : findAdminUserByEmail(email)
  const id = session.id ?? user?.id ?? seedUsers[0].id

  const profileImageUrl = user?.profileImageUrl ?? session.profileImageUrl

  return {
    id,
    email,
    name: session.name,
    role: session.role,
    ...(isOwner ? { isOwner: true } : {}),
    ...(profileImageUrl ? { profileImageUrl } : {}),
  }
}

export function signInAdmin(
  email: string,
  password: string,
): { ok: true; session: AdminSession } | { ok: false; error: string } {
  const normalized = normalizeOwnerEmail(email)
  const user = readUsers().find((u) => u.email.toLowerCase() === normalized)

  if (!user || user.password !== password) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  const session = buildSession(user)
  writeSession(session)

  logPlatformActivity({
    message: `Signed in: ${session.name}`,
    category: 'auth',
    ownerId: session.id,
    actorName: session.name,
  })

  return { ok: true, session }
}

export function signInAdminProvider(provider: 'google' | 'apple' | 'slack'): AdminSession {
  const session: AdminSession = {
    id: seedUsers[0].id,
    email: `${provider}@${SITE_EMAIL_DOMAIN}`,
    name: 'Admin',
    role: 'Administrator',
    isOwner: true,
  }
  writeSession(session)

  logPlatformActivity({
    message: `Signed in via ${provider}`,
    category: 'auth',
    ownerId: session.id,
    actorName: session.name,
  })

  return session
}

export function getAdminSession(): AdminSession | null {
  migrateLegacySession()

  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as AdminSession
    const session = normalizeSession(parsed)

    if (JSON.stringify(parsed) !== JSON.stringify(session)) {
      writeSession(session)
    }

    return session
  } catch {
    return null
  }
}

export function signOutAdmin() {
  const session = getAdminSession()
  if (session) {
    logPlatformActivity({
      message: `Signed out: ${session.name}`,
      category: 'auth',
      ownerId: session.id,
      actorName: session.name,
    })
  }

  localStorage.removeItem(SESSION_KEY)
  notifyDataBinUpdated('session')
}
