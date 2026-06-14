# Site memory bin

Project-local storage area for the Overdrive IO website.

## Runtime (browser)

App data is persisted via `src/lib/memoryBin.ts` under the localStorage key `overdriveio-site-memory-bin`. Use namespaced keys such as `admin.users` or `portal.preferences`.

```ts
import { getMemoryBinEntry, setMemoryBinEntry } from '../lib/memoryBin'

setMemoryBinEntry('portal.lastRoute', '/clientportal')
const lastRoute = getMemoryBinEntry<string>('portal.lastRoute')
```

## This folder

Use `memory-bin/` for optional local exports, backups, or dev notes. Contents are gitignored except this README.

## Existing feature storage

- **Admin users / sessions** — `src/lib/adminUsers.ts` (dedicated localStorage keys)
- **Diagram memory bin** — `src/components/diagrams/diagramStorage.ts` (in-session undo bin for the nerve center)

Do not duplicate those systems here unless migrating to the shared memory bin API.
