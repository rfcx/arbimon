/**
 * App-wide upload engine singleton.
 *
 * The engine + its IndexedDB queue live at module scope so uploads keep
 * running while the user navigates between routes (Drive-style). The
 * upload-panel (full page UI) and the uploads TaskSource (~/tasks/sources/
 * uploads → floating tray) both consume this shared state.
 */
import { computed, reactive, ref } from 'vue'

import { type QueueStats, type UploadItem, BrowserFileSource, IndexedDbUploadStore, makeBrowserPrepare, makeWorkerEncoder, TranscodeCache, TranscodingFileSource, UploadEngine, withFlacTranscode } from '@rfcx-bio/upload-engine'

import { track } from '~/analytics'
import { useAuth0Client } from '~/auth-client'
import { getIdToken } from '~/auth-client/get-id-token'

const INGEST_BASE_URL = (import.meta.env.VITE_INGEST_BASE_URL as string | undefined) ?? 'https://ingest.rfcx.org'

export const EMPTY_STATS: QueueStats = { total: 0, queued: 0, preparing: 0, ready: 0, signing: 0, signed: 0, uploading: 0, uploaded: 0, ingested: 0, duplicate: 0, failed: 0, rejected: 0, paused: 0, bytesTotal: 0, bytesUploaded: 0 }

/** Per-prepare timezone context, set by the panel before enqueue. */
export const prepareOptions = reactive<{ timezone?: string | number }>({})

/**
 * Client-side WAV→FLAC encoding (#112): lossless, metadata-gated, fail-open.
 * Encodable WAVs are FLAC-encoded in the browser before hashing/upload —
 * roughly half the bytes over the wire and no server-side WAV size cap.
 * Files the encoder cannot guarantee lossless (float-32, >8ch, …) upload
 * unchanged. Toggleable from the panel.
 */
export const flacEncodeEnabled = ref(true)
export const transcodeCache = new TranscodeCache()

// Encoding runs in a module Worker (vite bundles the new-URL pattern
// natively) so multi-hundred-MB encodes never block the UI thread.
const workerEncode = makeWorkerEncoder(() =>
  new Worker(
    new URL('../../../../../packages/upload-engine/src/browser/flac-encode-worker.ts', import.meta.url),
    { type: 'module' }
  )
)

export const uploadStore = new IndexedDbUploadStore()
// register() passes through to the inner BrowserFileSource; getFile() serves
// the encoded FLAC when one exists.
export const fileSource = new TranscodingFileSource(new BrowserFileSource(), transcodeCache)

const getToken = async (): Promise<string> => {
  const client = await useAuth0Client()
  return await getIdToken(client)
}

export const engine = new UploadEngine(
  { ingestBaseUrl: INGEST_BASE_URL },
  uploadStore,
  fileSource,
  getToken,
  async (item, file) => await withFlacTranscode(
    makeBrowserPrepare({ timezone: prepareOptions.timezone }),
    transcodeCache,
    { enabled: flacEncodeEnabled.value, encode: workerEncode }
  )(item, file)
)

// Encoded blobs are released when their item settles (memory hygiene — a
// long batch must not hold every FLAC in RAM).
engine.on(event => {
  if (event.type === 'item-updated' &&
      ['ingested', 'duplicate', 'failed', 'rejected'].includes(event.item.state)) {
    transcodeCache.release(event.item.id)
  }
})

// -- shared reactive state (fed by engine events) -----------------------------
export const items = ref<UploadItem[]>([])
export const stats = ref<QueueStats>({ ...EMPTY_STATS })
export const engineRunning = ref(false)

export const activeCount = computed(() =>
  stats.value.queued + stats.value.preparing + stats.value.ready +
  stats.value.signing + stats.value.signed + stats.value.uploading + stats.value.uploaded)

export const hasQueue = computed(() => stats.value.total > 0)

export const refreshItems = async (): Promise<void> => {
  items.value = await uploadStore.list()
}

// Track terminal outcomes once per item (telemetry).
const trackedTerminal = new Set<string>()

engine.on(event => {
  if (event.type === 'stats') stats.value = event.stats
  if (event.type === 'engine-state') engineRunning.value = event.running
  if (event.type === 'item-updated') {
    const index = items.value.findIndex(existing => existing.id === event.item.id)
    if (index >= 0) items.value[index] = event.item
    else items.value.push(event.item)

    // telemetry: one event per terminal outcome per item
    const terminalStates = ['ingested', 'duplicate', 'failed', 'rejected']
    if (terminalStates.includes(event.item.state) && !trackedTerminal.has(event.item.id)) {
      trackedTerminal.add(event.item.id)
      track('web_upload_file_terminal', {
        outcome: event.item.state,
        fileSizeBytes: event.item.fileSizeBytes,
        attempts: event.item.attempts,
        multipart: event.item.multipart !== undefined,
        error: event.item.state === 'failed' || event.item.state === 'rejected' ? event.item.error : undefined
      })
    }
  }
  if (event.type === 'error') {
    track('web_upload_engine_error', { message: event.message })
  }
})

// online/offline handling lives with the singleton (not a component lifecycle)
if (!import.meta.env.SSR && typeof window !== 'undefined') {
  window.addEventListener('online', () => { engine.setOnline(true) })
  window.addEventListener('offline', () => { engine.setOnline(false) })
  window.addEventListener('beforeunload', (event) => {
    if (activeCount.value > 0) {
      event.preventDefault()
      event.returnValue = ''
    }
  })
  // Load any persisted queue from a previous session at app boot.
  void refreshItems()
}
