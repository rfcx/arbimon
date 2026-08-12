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

export const EMPTY_STATS: QueueStats = { total: 0, analyzing: 0, staged: 0, queued: 0, preparing: 0, ready: 0, signing: 0, signed: 0, uploading: 0, uploaded: 0, ingested: 0, duplicate: 0, failed: 0, rejected: 0, cancelled: 0, paused: 0, bytesTotal: 0, bytesUploaded: 0 }

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
      ['ingested', 'duplicate', 'failed', 'rejected', 'cancelled'].includes(event.item.state)) {
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

// -- per-project transfer metrics (localStorage; reset on auth-user change) --
export interface ProjectTransferMetrics {
  bytesTransferred: number
  completed: number
  failed: number
  duplicates: number
  /** auth0 user sub the metrics belong to — mismatch = new session, reset. */
  userSub?: string
}

const METRICS_PREFIX = 'upload-metrics:'
const EMPTY_METRICS: ProjectTransferMetrics = { bytesTransferred: 0, completed: 0, failed: 0, duplicates: 0 }

/** The project the metrics (and terminal counting) attribute to right now. */
export const metricsProjectSlug = ref<string | undefined>(undefined)
export const projectMetrics = ref<ProjectTransferMetrics>({ ...EMPTY_METRICS })

const metricsKey = (slug: string): string => `${METRICS_PREFIX}${slug}`

const loadMetrics = (slug: string): ProjectTransferMetrics => {
  try {
    const raw = localStorage.getItem(metricsKey(slug))
    if (raw === null) return { ...EMPTY_METRICS }
    return { ...EMPTY_METRICS, ...JSON.parse(raw) as ProjectTransferMetrics }
  } catch { return { ...EMPTY_METRICS } }
}

const saveMetrics = (slug: string, metrics: ProjectTransferMetrics): void => {
  try { localStorage.setItem(metricsKey(slug), JSON.stringify(metrics)) } catch { /* quota — metrics are best-effort */ }
}

/**
 * Bind metrics to a project + the current auth user. A DIFFERENT user sub
 * than the stored one resets the counters (operator rule: reset on logout /
 * new arbimon session).
 */
export const bindProjectMetrics = (slug: string, userSub: string | undefined): void => {
  metricsProjectSlug.value = slug
  const loaded = loadMetrics(slug)
  if (userSub !== undefined && loaded.userSub !== undefined && loaded.userSub !== userSub) {
    projectMetrics.value = { ...EMPTY_METRICS, userSub }
  } else {
    projectMetrics.value = { ...loaded, userSub: userSub ?? loaded.userSub }
  }
  saveMetrics(slug, projectMetrics.value)
}

const bumpMetrics = (patch: Partial<ProjectTransferMetrics>): void => {
  const slug = metricsProjectSlug.value
  if (slug === undefined) return
  const next = { ...projectMetrics.value }
  if (patch.bytesTransferred !== undefined) next.bytesTransferred += patch.bytesTransferred
  if (patch.completed !== undefined) next.completed += patch.completed
  if (patch.failed !== undefined) next.failed += patch.failed
  if (patch.duplicates !== undefined) next.duplicates += patch.duplicates
  projectMetrics.value = next
  saveMetrics(slug, next)
}

// -- current transfer rate (EMA over PUT progress deltas) ---------------------
export const currentRateBps = ref(0)
const rateWindow: Array<{ atMs: number, bytes: number }> = []
let lastBytesUploaded = 0

const observeRate = (bytesUploaded: number): void => {
  const now = Date.now()
  const delta = bytesUploaded - lastBytesUploaded
  lastBytesUploaded = bytesUploaded
  if (delta > 0) rateWindow.push({ atMs: now, bytes: delta })
  // 10-second sliding window
  while (rateWindow.length > 0 && now - rateWindow[0].atMs > 10_000) rateWindow.shift()
  const windowBytes = rateWindow.reduce((sum, s) => sum + s.bytes, 0)
  const windowMs = rateWindow.length > 0 ? Math.max(1000, now - rateWindow[0].atMs) : 1000
  currentRateBps.value = windowBytes / (windowMs / 1000)
}

// Track terminal outcomes per item — a Map so a RETRY can reverse the
// previously-counted outcome (the count-once Set made a failed→retry→ingested
// item stay counted as a failure forever; found live 2026-08-12).
const trackedTerminal = new Map<string, string>()

engine.on(event => {
  if (event.type === 'stats') {
    observeRate(event.stats.bytesUploaded)
    stats.value = event.stats
  }
  if (event.type === 'engine-state') engineRunning.value = event.running
  if (event.type === 'item-updated') {
    const index = items.value.findIndex(existing => existing.id === event.item.id)
    if (index >= 0) items.value[index] = event.item
    else items.value.push(event.item)

    // telemetry + project metrics: one count per terminal outcome per item,
    // REVERSED if the item re-enters the pipeline (retry).
    const terminalStates = ['ingested', 'duplicate', 'failed', 'rejected', 'cancelled']
    const counted = trackedTerminal.get(event.item.id)
    if (terminalStates.includes(event.item.state)) {
      if (counted === undefined) {
        trackedTerminal.set(event.item.id, event.item.state)
        if (event.item.state === 'ingested') bumpMetrics({ completed: 1, bytesTransferred: event.item.fileSizeBytes })
        if (event.item.state === 'duplicate') bumpMetrics({ duplicates: 1 })
        if (event.item.state === 'failed' || event.item.state === 'rejected' || event.item.state === 'cancelled') bumpMetrics({ failed: 1 })
        track('web_upload_file_terminal', {
          outcome: event.item.state,
          fileSizeBytes: event.item.fileSizeBytes,
          attempts: event.item.attempts,
          multipart: event.item.multipart !== undefined,
          error: ['failed', 'rejected', 'cancelled'].includes(event.item.state) ? event.item.error : undefined
        })
      }
    } else if (counted !== undefined) {
      // retry: un-count the stale outcome so the eventual final one counts
      trackedTerminal.delete(event.item.id)
      if (counted === 'ingested') bumpMetrics({ completed: -1, bytesTransferred: -event.item.fileSizeBytes })
      else if (counted === 'duplicate') bumpMetrics({ duplicates: -1 })
      else bumpMetrics({ failed: -1 })
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
