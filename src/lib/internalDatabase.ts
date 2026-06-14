/** IndexedDB internal database — persistent bins for all site data. */

export type DataBinCategory = 'admin' | 'portal' | 'system' | 'leads' | 'files'

export type DataBinSnapshot = {
  id: string
  label: string
  category: DataBinCategory
  storageKey: string
  description: string
  data: unknown
  recordCount: number
  sizeBytes: number
  updatedAt: string
  syncedAt: string
}

export type DataBinRecord = {
  id: string
  binId: string
  data: unknown
  createdAt: string
}

const DB_NAME = 'overdriveio-internal-database'
const DB_VERSION = 1
const BINS_STORE = 'bins'
const RECORDS_STORE = 'records'

export const INTERNAL_DATABASE_EVENT = 'overdrive-internal-database-updated'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(BINS_STORE)) {
        db.createObjectStore(BINS_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(RECORDS_STORE)) {
        const store = db.createObjectStore(RECORDS_STORE, { keyPath: 'id' })
        store.createIndex('binId', 'binId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function dispatchDatabaseUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(INTERNAL_DATABASE_EVENT))
}

function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  return openDb().then(
    (db) =>
      new Promise<T | void>((resolve, reject) => {
        const tx = db.transaction(storeName, mode)
        const store = tx.objectStore(storeName)
        const request = run(store)
        tx.oncomplete = () => {
          db.close()
          if (request) {
            resolve((request as IDBRequest<T>).result)
          } else {
            resolve()
          }
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error)
        }
      }),
  )
}

export function estimatePayloadSize(data: unknown): number {
  try {
    return new Blob([JSON.stringify(data ?? null)]).size
  } catch {
    return 0
  }
}

export function countRecords(data: unknown): number {
  if (data == null) return 0
  if (Array.isArray(data)) return data.length
  if (typeof data === 'object') {
    const values = Object.values(data as Record<string, unknown>)
    if (values.every((value) => Array.isArray(value))) {
      return values.reduce<number>((sum, value) => sum + value.length, 0)
    }
    return Object.keys(data as Record<string, unknown>).length
  }
  return 1
}

export async function upsertDataBinSnapshot(snapshot: DataBinSnapshot): Promise<void> {
  await runTransaction(BINS_STORE, 'readwrite', (store) => {
    store.put(snapshot)
  })
  dispatchDatabaseUpdated()
}

export async function listDataBinSnapshots(): Promise<DataBinSnapshot[]> {
  const rows = (await runTransaction<DataBinSnapshot[]>(BINS_STORE, 'readonly', (store) =>
    store.getAll(),
  )) as DataBinSnapshot[] | void

  return (rows ?? []).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export async function getDataBinSnapshot(binId: string): Promise<DataBinSnapshot | null> {
  const row = (await runTransaction<DataBinSnapshot | undefined>(BINS_STORE, 'readonly', (store) =>
    store.get(binId),
  )) as DataBinSnapshot | undefined | void

  return row ?? null
}

export async function appendDataBinRecord(
  binId: string,
  data: unknown,
): Promise<DataBinRecord> {
  const entry: DataBinRecord = {
    id: crypto.randomUUID(),
    binId,
    data,
    createdAt: new Date().toISOString(),
  }

  await runTransaction(RECORDS_STORE, 'readwrite', (store) => {
    store.put(entry)
  })

  dispatchDatabaseUpdated()
  return entry
}

export async function listDataBinRecords(binId: string): Promise<DataBinRecord[]> {
  const rows = (await runTransaction<DataBinRecord[]>(RECORDS_STORE, 'readonly', (store) =>
    store.index('binId').getAll(binId),
  )) as DataBinRecord[] | void

  return (rows ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export async function exportInternalDatabase(): Promise<{
  exportedAt: string
  bins: DataBinSnapshot[]
  records: DataBinRecord[]
}> {
  const bins = await listDataBinSnapshots()
  const records = (await runTransaction<DataBinRecord[]>(RECORDS_STORE, 'readonly', (store) =>
    store.getAll(),
  )) as DataBinRecord[] | void

  return {
    exportedAt: new Date().toISOString(),
    bins,
    records: records ?? [],
  }
}
