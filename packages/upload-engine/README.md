# Biodiversity > Upload Engine

Framework-free TypeScript bulk audio upload engine for Arbimon.

Powers the in-browser bulk uploader (and is designed to be the shared core
of the next-generation desktop uploader). Design + pipeline background:
`rfcx-local` repo, `runbooks/DESIGN-browser-bulk-uploader-2026-07-16.md`.

## Pipeline

```
enqueue → prepare (sha1 + header probe + filename→timestamp)
        → sign   (POST /uploads/bulk, ≤100/req, per-item outcomes)
        → upload (bounded concurrent PUT pool → presigned R2 URLs)
        → track  (POST /uploads/status until terminal)
```

## Shell adapters

The engine core never touches the DOM, IndexedDB, or fs directly. Shells
provide:

| Adapter         | Browser (included)                           | Desktop (future)  |
| --------------- | -------------------------------------------- | ----------------- |
| `UploadStore`   | `IndexedDbUploadStore`                       | sqlite            |
| `FileSource`    | `BrowserFileSource` (in-memory File handles) | fs paths          |
| `TokenProvider` | auth0-spa-js `getTokenSilently`              | device-flow token |
| `PrepareFn`     | `makeBrowserPrepare()`                       | ffprobe-backed    |

## Usage (browser)

```ts
import {
  UploadEngine,
  IndexedDbUploadStore,
  BrowserFileSource,
  makeBrowserPrepare,
  createUploadItem,
  collectDroppedFiles,
  isSupportedAudioFile
} from '@rfcx-bio/upload-engine'

const store = new IndexedDbUploadStore()
const files = new BrowserFileSource()
const engine = new UploadEngine(
  { ingestBaseUrl: 'https://ingest.rfcx.org' },
  store,
  files,
  getAccessToken,
  makeBrowserPrepare({ timezone: siteTimezone })
)

engine.on(event => {
  /* item-updated | stats | engine-state | error */
})

const dropped = await collectDroppedFiles(event.dataTransfer)
const items = dropped
  .filter(({ file }) => isSupportedAudioFile(file.name))
  .map(({ file, relativePath }) => {
    const item = createUploadItem({
      filename: file.name,
      relativePath,
      fileSizeBytes: file.size,
      streamId
    })
    files.register(item.id, file)
    return item
  })
await engine.enqueue(items)
engine.start()
```

## Server contracts

- `POST /uploads/bulk` — bulk signed URLs (ingest-service, cap 100/request)
- `POST /uploads/status` — bulk ingest status (terminal/retryable/nextAction)
- Presigned PUT to R2 — requires the bucket CORS policy (applied 2026-07-16
  to all ingest buckets; origins arbimon.org/www/staging/localhost)
