import {
  appendDataBinRecord,
  countRecords,
  estimatePayloadSize,
  listDataBinRecords,
  listDataBinSnapshots,
  upsertDataBinSnapshot,
  type DataBinCategory,
  type DataBinSnapshot,
} from './internalDatabase'

export type DataBinDefinition = {
  id: string
  label: string
  category: DataBinCategory
  storageKey: string
  description: string
  appendOnly?: boolean
}

export const DATA_BIN_DEFINITIONS: DataBinDefinition[] = [
  {
    id: 'profiles',
    label: 'Profiles',
    category: 'admin',
    storageKey: 'overdriveio-admin-users',
    description: 'Admin and client profile accounts',
  },
  {
    id: 'session',
    label: 'Active Session',
    category: 'admin',
    storageKey: 'overdriveio-admin-session',
    description: 'Current signed-in session',
  },
  {
    id: 'projects',
    label: 'Projects',
    category: 'portal',
    storageKey: 'overdriveio-client-projects',
    description: 'Client projects, progress, and attached file metadata',
  },
  {
    id: 'file-manager',
    label: 'File Manager',
    category: 'portal',
    storageKey: 'overdriveio-file-manager-files',
    description: 'Standalone uploads stored outside project folders',
  },
  {
    id: 'messages',
    label: 'Messages',
    category: 'portal',
    storageKey: 'overdriveio-portal-chat-messages',
    description: 'Portal messenger channel messages',
  },
  {
    id: 'chat-members',
    label: 'Chat Members',
    category: 'portal',
    storageKey: 'overdriveio-portal-chat-general-member-ids',
    description: 'General channel membership tracking',
  },
  {
    id: 'activity',
    label: 'Activity Log',
    category: 'system',
    storageKey: 'overdriveio-platform-activity',
    description: 'Project, upload, and profile activity events',
  },
  {
    id: 'notifications',
    label: 'Notification State',
    category: 'system',
    storageKey: 'overdriveio-notifications-read-at',
    description: 'Last-read timestamp for notifications',
  },
  {
    id: 'memory-bin',
    label: 'Memory Bin',
    category: 'system',
    storageKey: 'overdriveio-site-memory-bin',
    description: 'Shared namespaced app configuration entries',
  },
  {
    id: 'demo-requests',
    label: 'Demo Requests',
    category: 'leads',
    storageKey: 'overdriveio-demo-requests',
    description: 'Request demo form submissions',
    appendOnly: true,
  },
  {
    id: 'file-blobs',
    label: 'File Blobs',
    category: 'files',
    storageKey: 'overdriveio-file-blobs',
    description: 'Binary upload storage in IndexedDB',
  },
]

const definitionById = new Map(DATA_BIN_DEFINITIONS.map((bin) => [bin.id, bin]))

export function getDataBinDefinition(binId: string): DataBinDefinition | undefined {
  return definitionById.get(binId)
}

function readLocalStorageValue(storageKey: string): unknown | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    const raw = localStorage.getItem(storageKey)
    return raw ?? null
  }
}

async function readFileBlobCount(): Promise<number> {
  return new Promise((resolve) => {
    const request = indexedDB.open('overdriveio-file-blobs', 1)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('files')) {
        db.close()
        resolve(0)
        return
      }

      const tx = db.transaction('files', 'readonly')
      const countRequest = tx.objectStore('files').count()
      countRequest.onsuccess = () => {
        db.close()
        resolve(countRequest.result)
      }
      countRequest.onerror = () => {
        db.close()
        resolve(0)
      }
    }
    request.onerror = () => resolve(0)
  })
}

export async function syncDataBin(binId: string): Promise<DataBinSnapshot | null> {
  const definition = getDataBinDefinition(binId)
  if (!definition) return null

  const now = new Date().toISOString()

  if (definition.appendOnly) {
    const records = await listDataBinRecords(binId)
    const data = records.map((record) => record.data)
    const snapshot: DataBinSnapshot = {
      id: definition.id,
      label: definition.label,
      category: definition.category,
      storageKey: definition.storageKey,
      description: definition.description,
      data,
      recordCount: records.length,
      sizeBytes: estimatePayloadSize(data),
      updatedAt: records[0]?.createdAt ?? now,
      syncedAt: now,
    }
    await upsertDataBinSnapshot(snapshot)
    return snapshot
  }

  if (binId === 'file-blobs') {
    const recordCount = await readFileBlobCount()
    const snapshot: DataBinSnapshot = {
      id: definition.id,
      label: definition.label,
      category: definition.category,
      storageKey: definition.storageKey,
      description: definition.description,
      data: { blobCount: recordCount },
      recordCount,
      sizeBytes: 0,
      updatedAt: now,
      syncedAt: now,
    }
    await upsertDataBinSnapshot(snapshot)
    return snapshot
  }

  const data = readLocalStorageValue(definition.storageKey)
  const snapshot: DataBinSnapshot = {
    id: definition.id,
    label: definition.label,
    category: definition.category,
    storageKey: definition.storageKey,
    description: definition.description,
    data,
    recordCount: countRecords(data),
    sizeBytes: estimatePayloadSize(data),
    updatedAt: now,
    syncedAt: now,
  }

  await upsertDataBinSnapshot(snapshot)
  return snapshot
}

export async function syncAllDataBins(): Promise<DataBinSnapshot[]> {
  const snapshots = await Promise.all(
    DATA_BIN_DEFINITIONS.map((definition) => syncDataBin(definition.id)),
  )
  return snapshots.filter((snapshot): snapshot is DataBinSnapshot => snapshot != null)
}

export function notifyDataBinUpdated(binId: string): void {
  queueMicrotask(() => {
    void syncDataBin(binId)
  })
}

export async function saveAppendOnlyBinRecord(
  binId: string,
  record: unknown,
): Promise<void> {
  const definition = getDataBinDefinition(binId)
  if (!definition?.appendOnly) {
    throw new Error(`Bin "${binId}" is not append-only.`)
  }

  const existing = readLocalStorageValue(definition.storageKey)
  const next = Array.isArray(existing) ? [...existing, record] : [record]
  localStorage.setItem(definition.storageKey, JSON.stringify(next))

  await appendDataBinRecord(binId, record)
  await syncDataBin(binId)
}

export async function writeDataBin(binId: string, data: unknown): Promise<void> {
  const definition = getDataBinDefinition(binId)
  if (!definition || definition.appendOnly) {
    throw new Error(`Bin "${binId}" cannot be written directly.`)
  }

  localStorage.setItem(definition.storageKey, JSON.stringify(data))
  await syncDataBin(binId)
}

export function formatDataBinSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export { listDataBinSnapshots, type DataBinSnapshot }
