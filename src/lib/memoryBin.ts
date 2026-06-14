/**
 * Site-wide memory bin — namespaced browser storage for the Overdrive IO app.
 * Diagrams use a separate in-session bin in `diagramStorage.ts`.
 */

import { notifyDataBinUpdated } from './dataBins'

const MEMORY_BIN_KEY = 'overdriveio-site-memory-bin'
const MAX_ENTRIES = 200

export type SiteMemoryBinStore = {
  version: 1
  updatedAt: number
  entries: Record<string, unknown>
}

function emptyStore(): SiteMemoryBinStore {
  return { version: 1, updatedAt: Date.now(), entries: {} }
}

function readStore(): SiteMemoryBinStore {
  try {
    const raw = localStorage.getItem(MEMORY_BIN_KEY)
    if (!raw) return emptyStore()

    const parsed = JSON.parse(raw) as SiteMemoryBinStore
    if (parsed?.version !== 1 || typeof parsed.entries !== 'object') {
      return emptyStore()
    }
    return parsed
  } catch {
    return emptyStore()
  }
}

function writeStore(store: SiteMemoryBinStore) {
  localStorage.setItem(
    MEMORY_BIN_KEY,
    JSON.stringify({ ...store, updatedAt: Date.now() }),
  )
}

/** Read the full memory bin store. */
export function loadSiteMemoryBin(): SiteMemoryBinStore {
  return readStore()
}

/** Replace the entire memory bin store. */
export function saveSiteMemoryBin(store: SiteMemoryBinStore) {
  writeStore(store)
  notifyDataBinUpdated('memory-bin')
}

/** Read a namespaced entry, e.g. `admin.users`, `inventory.theme`. */
export function getMemoryBinEntry<T>(key: string): T | null {
  const value = readStore().entries[key]
  return value === undefined ? null : (value as T)
}

/** Write a namespaced entry into the site memory bin. */
export function setMemoryBinEntry(key: string, value: unknown) {
  const store = readStore()
  store.entries[key] = value

  const keys = Object.keys(store.entries)
  if (keys.length > MAX_ENTRIES) {
    const overflow = keys.length - MAX_ENTRIES
    for (const staleKey of keys.slice(-overflow)) {
      delete store.entries[staleKey]
    }
  }

  writeStore(store)
  notifyDataBinUpdated('memory-bin')
}

/** Remove one entry from the memory bin. */
export function removeMemoryBinEntry(key: string) {
  const store = readStore()
  if (!(key in store.entries)) return
  delete store.entries[key]
  writeStore(store)
  notifyDataBinUpdated('memory-bin')
}

/** Clear all site memory bin entries. */
export function clearSiteMemoryBin() {
  writeStore(emptyStore())
  notifyDataBinUpdated('memory-bin')
}

/** List all keys currently stored in the memory bin. */
export function listMemoryBinKeys(): string[] {
  return Object.keys(readStore().entries)
}
