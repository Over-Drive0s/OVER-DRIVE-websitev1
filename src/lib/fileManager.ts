import { getClientDataScope } from './clientDataScope'
import { notifyDataBinUpdated } from './dataBins'
import {
  appendFileToClientProject,
  type ClientProjectFile,
} from './clientProjects'
import { copyFileBlob, deleteFileBlob, deleteFileBlobs } from './fileBlobStore'
import { logPlatformActivity } from './platformActivityLog'

export const FILE_MANAGER_TARGET_ID = '__file-manager__'

export type FileManagerFile = ClientProjectFile & {
  uploadedAt: string
}

const STORAGE_KEY = 'overdriveio-file-manager-files'

function readStore(): Record<string, FileManagerFile[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as Record<string, FileManagerFile[]>
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed
  } catch {
    return {}
  }
}

function writeStore(
  store: Record<string, FileManagerFile[]>,
): { ok: true } | { ok: false; error: string } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    notifyDataBinUpdated('file-manager')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Storage is full. Remove older files and try again.' }
  }
}

function createFileId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function resolveOwnerId(ownerIdOverride?: string): string | null {
  if (ownerIdOverride) return ownerIdOverride
  const scope = getClientDataScope()
  return scope.ownerId
}

export function listFileManagerFiles(ownerIdOverride?: string): FileManagerFile[] {
  if (ownerIdOverride) {
    const files = readStore()[ownerIdOverride] ?? []
    return [...files].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    )
  }

  const scope = getClientDataScope()
  if (scope.viewAll) {
    return listFileManagerFilesForOwnerIds(Object.keys(readStore()))
  }

  const ownerId = scope.ownerId
  if (!ownerId) return []

  const files = readStore()[ownerId] ?? []
  return [...files].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  )
}

export function listFileManagerFilesForOwnerIds(ownerIds: string[]): FileManagerFile[] {
  if (ownerIds.length === 0) return []

  const store = readStore()
  const files: FileManagerFile[] = []

  for (const ownerId of ownerIds) {
    files.push(...(store[ownerId] ?? []))
  }

  return files.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  )
}

export function findFileManagerFileOwner(fileId: string): string | undefined {
  const store = readStore()

  for (const [ownerId, files] of Object.entries(store)) {
    if (files.some((file) => file.id === fileId)) {
      return ownerId
    }
  }

  return undefined
}

export function addFileManagerFiles(
  files: ClientProjectFile[],
  ownerIdOverride?: string,
): { ok: true; files: FileManagerFile[] } | { ok: false; error: string } {
  const ownerId = resolveOwnerId(ownerIdOverride)
  if (!ownerId) {
    return { ok: false, error: 'Sign in to upload files.' }
  }
  if (files.length === 0) {
    return { ok: false, error: 'No files to upload.' }
  }

  const uploadedAt = new Date().toISOString()
  const nextFiles: FileManagerFile[] = files.map((file) => ({
    ...file,
    uploadedAt: file.uploadedAt ?? uploadedAt,
  }))

  const store = readStore()
  const existing = store[ownerId] ?? []
  store[ownerId] = [...nextFiles, ...existing]
  const saved = writeStore(store)
  if (!saved.ok) {
    return saved
  }

  const scope = getClientDataScope()
  logPlatformActivity({
    message: `${nextFiles.length} file(s) uploaded to File Manager`,
    category: 'upload',
    ownerId,
    actorName: scope.actorName,
  })

  return { ok: true, files: nextFiles }
}

export function deleteFileManagerFile(
  fileId: string,
  ownerIdOverride?: string,
): { ok: true } | { ok: false; error: string } {
  const ownerId = resolveOwnerId(ownerIdOverride)
  if (!ownerId) {
    return { ok: false, error: 'Sign in to manage files.' }
  }

  const store = readStore()
  const existing = store[ownerId] ?? []
  const file = existing.find((entry) => entry.id === fileId)
  if (!file) {
    return { ok: false, error: 'File not found.' }
  }

  store[ownerId] = existing.filter((entry) => entry.id !== fileId)
  if (store[ownerId].length === 0) {
    delete store[ownerId]
  }
  writeStore(store)
  void deleteFileBlob(fileId)

  const scope = getClientDataScope()
  logPlatformActivity({
    message: `File removed: "${file.name}" from File Manager`,
    category: 'upload',
    ownerId,
    actorName: scope.actorName,
  })

  return { ok: true }
}

export function detachFileManagerFile(
  fileId: string,
  ownerIdOverride?: string,
): { ok: true; file: FileManagerFile } | { ok: false; error: string } {
  const ownerId = resolveOwnerId(ownerIdOverride)
  if (!ownerId) {
    return { ok: false, error: 'Sign in to manage files.' }
  }

  const store = readStore()
  const existing = store[ownerId] ?? []
  const file = existing.find((entry) => entry.id === fileId)
  if (!file) {
    return { ok: false, error: 'File not found.' }
  }

  store[ownerId] = existing.filter((entry) => entry.id !== fileId)
  if (store[ownerId].length === 0) {
    delete store[ownerId]
  }
  writeStore(store)

  return { ok: true, file }
}

export async function duplicateFileManagerFile(
  fileId: string,
  ownerIdOverride?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ownerId = resolveOwnerId(ownerIdOverride)
  if (!ownerId) {
    return { ok: false, error: 'Sign in to manage files.' }
  }

  const store = readStore()
  const existing = store[ownerId] ?? []
  const file = existing.find((entry) => entry.id === fileId)
  if (!file) {
    return { ok: false, error: 'File not found.' }
  }

  const duplicate: FileManagerFile = {
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

  store[ownerId] = [duplicate, ...existing]
  writeStore(store)

  const scope = getClientDataScope()
  logPlatformActivity({
    message: `File duplicated: "${file.name}" in File Manager`,
    category: 'upload',
    ownerId,
    actorName: scope.actorName,
  })

  return { ok: true }
}

export function moveFileManagerFileToProject(
  fileId: string,
  projectId: string,
  ownerIdOverride?: string,
): { ok: true } | { ok: false; error: string } {
  const detached = detachFileManagerFile(fileId, ownerIdOverride)
  if (!detached.ok) {
    return detached
  }

  const attached = appendFileToClientProject(projectId, detached.file)
  if (!attached.ok) {
    const ownerId = resolveOwnerId(ownerIdOverride)
    if (ownerId) {
      const store = readStore()
      store[ownerId] = [detached.file, ...(store[ownerId] ?? [])]
      writeStore(store)
    }
    return attached
  }

  const scope = getClientDataScope()
  logPlatformActivity({
    message: `File moved: "${detached.file.name}" from File Manager to project`,
    category: 'upload',
    ownerId: scope.ownerId ?? undefined,
    actorName: scope.actorName,
  })

  return { ok: true }
}

/** Remove all File Manager entries (and blobs) for a deleted profile. */
export function purgeFileManagerDataForOwner(ownerId: string): void {
  const store = readStore()
  const files = store[ownerId] ?? []
  if (files.length === 0) return

  const blobIds = files.filter((file) => file.blobStored).map((file) => file.id)
  delete store[ownerId]
  writeStore(store)
  if (blobIds.length > 0) {
    void deleteFileBlobs(blobIds)
  }
}
