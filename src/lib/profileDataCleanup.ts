/** Purge per-profile portal data when an admin profile is deleted. */

import { notifyDataBinUpdated } from './dataBins'
import { deleteFileBlobs } from './fileBlobStore'
import { purgeFileManagerDataForOwner } from './fileManager'
import { purgePortalMessengerDataForOwner } from './portalMessenger'

const PROJECTS_KEY = 'overdriveio-client-projects'
const ACTIVITY_KEY = 'overdriveio-platform-activity'

type StoredProject = {
  ownerId?: string
  files?: { id: string; blobStored?: boolean }[]
}

export function deleteProfilePortalData(ownerId: string) {
  let projectsChanged = false
  let activityChanged = false

  try {
    const projectsRaw = localStorage.getItem(PROJECTS_KEY)
    if (projectsRaw) {
      const projects = JSON.parse(projectsRaw) as StoredProject[]
      if (Array.isArray(projects)) {
        const removed = projects.filter((project) => project.ownerId === ownerId)
        const blobIds = removed.flatMap((project) =>
          (project.files ?? [])
            .filter((file) => file.blobStored)
            .map((file) => file.id),
        )
        if (blobIds.length > 0) {
          void deleteFileBlobs(blobIds)
        }
        const nextProjects = projects.filter((project) => project.ownerId !== ownerId)
        if (nextProjects.length !== projects.length) {
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(nextProjects))
          projectsChanged = true
        }
      }
    }
  } catch {
    // ignore corrupt project data
  }

  try {
    const activityRaw = localStorage.getItem(ACTIVITY_KEY)
    if (activityRaw) {
      const activities = JSON.parse(activityRaw) as { ownerId?: string }[]
      if (Array.isArray(activities)) {
        const nextActivities = activities.filter((entry) => entry.ownerId !== ownerId)
        if (nextActivities.length !== activities.length) {
          localStorage.setItem(ACTIVITY_KEY, JSON.stringify(nextActivities))
          activityChanged = true
        }
      }
    }
  } catch {
    // ignore corrupt activity data
  }

  purgeFileManagerDataForOwner(ownerId)
  purgePortalMessengerDataForOwner(ownerId)

  if (projectsChanged) notifyDataBinUpdated('projects')
  if (activityChanged) notifyDataBinUpdated('activity')
}
