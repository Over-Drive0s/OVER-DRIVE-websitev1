import { getClientDataScope, type ClientDataScope } from './clientDataScope'
import { notifyDataBinUpdated } from './dataBins'
import {
  logPlatformActivity,
  PLATFORM_ACTIVITY_EVENT,
  readAllPlatformActivities,
  type PlatformActivity,
  type PlatformActivityCategory,
} from './platformActivityLog'

export {
  logPlatformActivity,
  PLATFORM_ACTIVITY_EVENT,
  readAllPlatformActivities,
  type PlatformActivity,
  type PlatformActivityCategory,
}

const NOTIFICATIONS_READ_KEY = 'overdriveio-notifications-read-at'

export function activityMatchesScope(
  entry: PlatformActivity,
  scope: ClientDataScope,
): boolean {
  if (scope.viewAll) return true
  if (!scope.ownerId) return false
  return !entry.ownerId || entry.ownerId === scope.ownerId
}

export function filterPlatformActivitiesForScope(
  activities: PlatformActivity[],
  scope: ClientDataScope,
  limit = 50,
): PlatformActivity[] {
  return activities
    .filter((entry) => activityMatchesScope(entry, scope))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit)
}

export function listPlatformActivities(limit = 50): PlatformActivity[] {
  return filterPlatformActivitiesForScope(
    readAllPlatformActivities(),
    getClientDataScope(),
    limit,
  )
}

export function filterNotificationActivities(
  activities: PlatformActivity[],
): PlatformActivity[] {
  return activities.filter((entry) => entry.category !== 'auth')
}

export function getNotificationsReadAt(): string | null {
  try {
    return localStorage.getItem(NOTIFICATIONS_READ_KEY)
  } catch {
    return null
  }
}

export function markNotificationsRead(): void {
  try {
    localStorage.setItem(NOTIFICATIONS_READ_KEY, new Date().toISOString())
    notifyDataBinUpdated('notifications')
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLATFORM_ACTIVITY_EVENT))
  }
}

export function isActivityUnread(entry: PlatformActivity, readAt?: string | null): boolean {
  const resolvedReadAt = readAt ?? getNotificationsReadAt()
  if (!resolvedReadAt) return true

  const readTime = new Date(resolvedReadAt).getTime()
  if (Number.isNaN(readTime)) return true

  return new Date(entry.createdAt).getTime() > readTime
}

export function countUnreadActivities(activities: PlatformActivity[]): number {
  const readAt = getNotificationsReadAt()
  return filterNotificationActivities(activities).filter((entry) =>
    isActivityUnread(entry, readAt),
  ).length
}

export function formatPlatformActivityTime(createdAt: string): string {
  const timestamp = new Date(createdAt).getTime()
  if (Number.isNaN(timestamp)) return 'Recently'

  const diff = Date.now() - timestamp
  if (diff < 0) return 'Just now'

  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'Just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  return new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
