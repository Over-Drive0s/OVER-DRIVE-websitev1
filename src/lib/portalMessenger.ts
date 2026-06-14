import {
  adminUserMatchesRoleFilter,
  isExclusiveOwnerEmail,
  listAdminUsers,
  type AdminUser,
} from './adminUsers'
import type { ProfileRoleFilter } from './adminRoles'
import { getClientDataScope } from './clientDataScope'
import { notifyDataBinUpdated } from './dataBins'

export const GENERAL_CHANNEL_ID = 'general'
const GENERAL_WORKSPACE_ID = '__general__'
const GENERAL_MEMBERS_KEY = 'overdriveio-portal-chat-general-member-ids'

export type PortalChatMessage = {
  id: string
  channelId: string
  ownerId: string
  authorName: string
  text: string
  createdAt: string
}

export const PORTAL_CHAT_CHANNELS = [
  { id: 'general', label: 'general' },
  { id: 'project-updates', label: 'project-updates' },
  { id: 'support', label: 'support' },
] as const

export type PortalChatChannelId = (typeof PORTAL_CHAT_CHANNELS)[number]['id']

const STORAGE_KEY = 'overdriveio-portal-chat-messages'
const MAX_MESSAGES = 500

export const PORTAL_CHAT_EVENT = 'overdrive-portal-chat'

function readMessages(): PortalChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as PortalChatMessage[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.channelId === 'string' &&
        typeof entry.ownerId === 'string' &&
        typeof entry.authorName === 'string' &&
        typeof entry.text === 'string' &&
        typeof entry.createdAt === 'string',
    )
  } catch {
    return []
  }
}

function writeMessages(messages: PortalChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(0, MAX_MESSAGES)))
  notifyDataBinUpdated('messages')
}

function dispatchChatEvent(message?: PortalChatMessage) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PORTAL_CHAT_EVENT, { detail: message }),
    )
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function isGeneralChannel(channelId: string): boolean {
  return channelId === GENERAL_CHANNEL_ID
}

function profileDisplayName(user: AdminUser): string {
  return isExclusiveOwnerEmail(user.email) ? 'Admin' : user.name
}

function readGeneralMemberIds(): string[] {
  try {
    const raw = localStorage.getItem(GENERAL_MEMBERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeGeneralMemberIds(ids: string[]) {
  localStorage.setItem(GENERAL_MEMBERS_KEY, JSON.stringify(ids))
  notifyDataBinUpdated('chat-members')
}

export type GeneralChannelMember = {
  id: string
  name: string
  email: string
  role: AdminUser['role']
  profileImageUrl?: string
  isOwner: boolean
}

export function listGeneralChannelMembers(): GeneralChannelMember[] {
  return listAdminUsers().map((user) => ({
    id: user.id,
    name: profileDisplayName(user),
    email: user.email,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
    isOwner: isExclusiveOwnerEmail(user.email),
  }))
}

export function ensureGeneralChannelMembers(): void {
  const users = listAdminUsers()
  const seededIds = new Set(readGeneralMemberIds())
  const joinMessages: PortalChatMessage[] = []
  const nextSeededIds = [...seededIds]

  for (const user of users) {
    if (seededIds.has(user.id)) continue

    joinMessages.push({
      id: createId(),
      channelId: GENERAL_CHANNEL_ID,
      ownerId: GENERAL_WORKSPACE_ID,
      authorName: profileDisplayName(user),
      text: 'joined #general',
      createdAt: user.createdAt,
    })
    nextSeededIds.push(user.id)
  }

  if (joinMessages.length === 0) return

  writeMessages([...joinMessages, ...readMessages()])
  writeGeneralMemberIds(nextSeededIds)
  dispatchChatEvent()
}

export function listPortalChatMessages(
  channelId: string,
  profileFilter?: ProfileRoleFilter,
): PortalChatMessage[] {
  const scope = getClientDataScope()

  return readMessages()
    .filter((entry) => {
      if (entry.channelId !== channelId) return false
      if (isGeneralChannel(channelId)) return true
      if (scope.viewAll) {
        if (profileFilter && profileFilter !== 'all') {
          return adminUserMatchesRoleFilter(entry.ownerId, profileFilter)
        }
        return true
      }
      return scope.ownerId ? entry.ownerId === scope.ownerId : false
    })
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
}

export function sendPortalChatMessage(
  channelId: string,
  text: string,
  targetOwnerId?: string,
): { ok: true; message: PortalChatMessage } | { ok: false; error: string } {
  const trimmed = text.trim()
  if (!trimmed) {
    return { ok: false, error: 'Message cannot be empty.' }
  }

  const scope = getClientDataScope()
  if (!scope.ownerId) {
    return { ok: false, error: 'Sign in to send messages.' }
  }

  let ownerId: string
  if (isGeneralChannel(channelId)) {
    ownerId = GENERAL_WORKSPACE_ID
  } else if (scope.viewAll) {
    if (!targetOwnerId || targetOwnerId === 'all') {
      return {
        ok: false,
        error: 'Select a profile to send a message to their workspace.',
      }
    }
    ownerId = targetOwnerId
  } else {
    ownerId = scope.ownerId
  }

  const message: PortalChatMessage = {
    id: createId(),
    channelId,
    ownerId,
    authorName: scope.actorName ?? 'User',
    text: trimmed,
    createdAt: new Date().toISOString(),
  }

  const messages = readMessages()
  writeMessages([message, ...messages])
  dispatchChatEvent(message)

  return { ok: true, message }
}

/** Remove workspace messages and general-channel membership for a deleted profile. */
export function purgePortalMessengerDataForOwner(ownerId: string): void {
  const messages = readMessages()
  const remaining = messages.filter((entry) => entry.ownerId !== ownerId)
  if (remaining.length !== messages.length) {
    writeMessages(remaining)
  }

  const memberIds = readGeneralMemberIds()
  const nextMemberIds = memberIds.filter((id) => id !== ownerId)
  if (nextMemberIds.length !== memberIds.length) {
    writeGeneralMemberIds(nextMemberIds)
  }
}

export function formatPortalChatTime(createdAt: string): string {
  const timestamp = new Date(createdAt).getTime()
  if (Number.isNaN(timestamp)) return 'now'

  const date = new Date(timestamp)
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
