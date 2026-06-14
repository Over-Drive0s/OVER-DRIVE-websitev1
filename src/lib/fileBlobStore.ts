/** IndexedDB blob storage — all upload sizes and file types (browser quota applies). */

import { notifyDataBinUpdated } from './dataBins'

const DB_NAME = 'overdriveio-file-blobs'
const DB_VERSION = 1
const STORE = 'files'

const objectUrlCache = new Map<string, string>()
let dbPromise: Promise<IDBDatabase> | null = null

function resetDbPromise() {
  dbPromise = null
}

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this browser.'))
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE)
        }
      }

      request.onsuccess = () => {
        const db = request.result
        db.onversionchange = () => {
          db.close()
          resetDbPromise()
        }
        resolve(db)
      }

      request.onerror = () => {
        resetDbPromise()
        reject(request.error ?? new Error('Failed to open file storage.'))
      }

      request.onblocked = () => {
        resetDbPromise()
        reject(new Error('File storage is busy. Close other tabs and try again.'))
      }
    })
  }

  return dbPromise
}

function runWrite(
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        const request = run(tx.objectStore(STORE))

        request.onsuccess = () => resolve()
        request.onerror = () =>
          reject(request.error ?? new Error('Failed to write file storage.'))
        tx.onabort = () =>
          reject(tx.error ?? new Error('File storage transaction aborted.'))
      }),
  )
}

function runRead<T>(
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        const request = run(tx.objectStore(STORE))

        request.onsuccess = () => resolve(request.result as T | undefined)
        request.onerror = () =>
          reject(request.error ?? new Error('Failed to read file storage.'))
        tx.onabort = () =>
          reject(tx.error ?? new Error('File storage transaction aborted.'))
      }),
  )
}

export async function putFileBlob(id: string, blob: Blob): Promise<void> {
  await runWrite((store) => store.put(blob, id))
  notifyDataBinUpdated('file-blobs')
}

export async function getFileBlob(id: string): Promise<Blob | undefined> {
  return runRead<Blob>((store) => store.get(id))
}

export async function deleteFileBlob(id: string): Promise<void> {
  const cached = objectUrlCache.get(id)
  if (cached) {
    URL.revokeObjectURL(cached)
    objectUrlCache.delete(id)
  }

  await runWrite((store) => store.delete(id))
  notifyDataBinUpdated('file-blobs')
}

export async function getFileBlobObjectUrl(id: string): Promise<string | undefined> {
  const cached = objectUrlCache.get(id)
  if (cached) return cached

  const blob = await getFileBlob(id)
  if (!blob) return undefined

  const url = URL.createObjectURL(blob)
  objectUrlCache.set(id, url)
  return url
}

export async function deleteFileBlobs(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteFileBlob(id)))
}

export async function copyFileBlob(fromId: string, toId: string): Promise<boolean> {
  const blob = await getFileBlob(fromId)
  if (!blob) return false
  await putFileBlob(toId, blob)
  return true
}
