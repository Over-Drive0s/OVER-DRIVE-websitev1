/** Activity persistence + logging (no scope imports — avoids circular deps). */

import { notifyDataBinUpdated } from './dataBins'

export type PlatformActivityCategory =
  | 'project'
  | 'upload'
  | 'profile'
  | 'auth'
  | 'system'

export type PlatformActivity = {
  id: string
  message: string
  category: PlatformActivityCategory
  createdAt: string
  ownerId?: string
  actorName?: string
  projectId?: string
}

const STORAGE_KEY = 'overdriveio-platform-activity'
const MAX_ENTRIES = 150

export const PLATFORM_ACTIVITY_EVENT = 'overdrive-platform-activity'

function readActivities(): PlatformActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as PlatformActivity[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.message === 'string' &&
        typeof entry.createdAt === 'string',
    )
  } catch {
    return []
  }
}

function writeActivities(activities: PlatformActivity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.slice(0, MAX_ENTRIES)))
  notifyDataBinUpdated('activity')
}

export function readAllPlatformActivities(): PlatformActivity[] {
  return readActivities()
}

export function logPlatformActivity(
  input: {
    message: string
    category: PlatformActivityCategory
    ownerId?: string
    actorName?: string
    createdAt?: string
    projectId?: string
  },
): PlatformActivity {
  const entry: PlatformActivity = {
    id: crypto.randomUUID(),
    message: input.message,
    category: input.category,
    createdAt: input.createdAt ?? new Date().toISOString(),
    ...(input.ownerId ? { ownerId: input.ownerId } : {}),
    ...(input.actorName ? { actorName: input.actorName } : {}),
    ...(input.projectId ? { projectId: input.projectId } : {}),
  }

  writeActivities([entry, ...readActivities()])

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<PlatformActivity>(PLATFORM_ACTIVITY_EVENT, { detail: entry }),
    )
  }

  return entry
}
