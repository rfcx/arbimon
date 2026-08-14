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
    {
      enabled: flacEncodeEnabled.value,
      encode: workerEncode,
      // §118: a wholly-broken encoder used to be invisible — every file just
      // uploaded uncompressed. Surface it once per session as telemetry so it
      // cannot hide behind fail-open again.
      onEncoderUnavailable: (detail) => {
        encoderUnavailable.value = detail
        track('web_upload_encoder_unavailable', { detail })
      }
    }
  )(item, file)
)

/**
 * Set when client-side FLAC encoding could not run at all (§118). Uploads still
 * succeed — uncompressed — so this is advisory, but it must be visible.
 */
export const encoderUnavailable = ref<string | undefined>(undefined)

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

/**
 * Work that would be LOST OR CRIPPLED by closing/reloading the tab.
 *
 * `activeCount` deliberately covers only the in-flight pipeline. But STAGED and
 * ANALYZING rows represent the most expensive user work in the whole flow —
 * sha1 checksums, parsed timestamps, duplicate verdicts, site linkage and
 * hand-corrected dates — and they were entirely UNPROTECTED.
 *
 * MEASURED 2026-08-14 on the demo tier: with 5 staged rows,
 * `activeCount` was 0, no beforeunload dialog fired, and after a reload the
 * rows survived (IndexedDB) while ALL 5 FILE HANDLES were gone
 * (BrowserFileSource is in-memory). The queue then LOOKS healthy — checksums
 * and timestamps intact — and only reveals the damage when the user presses
 * Start, at which point every row goes `rejected` with
 * "Session interrupted — re-add this folder to resume".
 *
 * Silent until the user commits is the worst shape for this class of defect,
 * so the unload guard now covers staged work too.
 */
export const unsavedCount = computed(() =>
  activeCount.value + stats.value.staged + stats.value.analyzing)

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

// Track terminal outcomes per item — a Map so a RETRY can reverse the
// previously-counted outcome (the count-once Set made a failed→retry→ingested
// item stay counted as a failure forever; found live 2026-08-12).
//
// DECLARED HERE, above its users: resetProjectMetrics() clears it, and that
// function is defined further up the file than the engine listener that also
// uses it. Leaving the declaration below both worked only because every call
// is deferred — a fragile ordering that a later refactor could turn into a
// temporal-dead-zone crash at module load.
const trackedTerminal = new Map<string, string>()

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

/**
 * Reset the persisted transfer counters for the bound project (operator
 * 2026-08-14: a Reset control on the metrics bar).
 *
 * SCOPE IS DELIBERATELY NARROW — this clears the CUMULATIVE counters
 * (Imported / Errors / Duplicates / Uploaded / Upload Rate feed) and nothing
 * else. It does NOT touch the upload queue, so the "Complete" panel (derived
 * live from queue rows) and every row in every section are untouched. A reset
 * that also emptied the queue would silently discard in-flight work.
 *
 * `trackedTerminal` is cleared too: it remembers which items have already been
 * counted so a retry can un-count its previous outcome. Leaving it populated
 * would mean an already-counted row could never contribute again, so the
 * counters would not climb back from zero as the same session continued.
 */
export const resetProjectMetrics = (): void => {
  const slug = metricsProjectSlug.value
  const userSub = projectMetrics.value.userSub
  projectMetrics.value = { ...EMPTY_METRICS, userSub }
  trackedTerminal.clear()
  if (slug !== undefined) saveMetrics(slug, projectMetrics.value)
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

// -- current transfer rate (sliding window over PER-ITEM PUT progress) --------
// Derived from each item's own progress deltas, NOT from the queue-aggregate
// stats.bytesUploaded: that aggregate is a function of queue MEMBERSHIP, so
// Clear Completed dropped it (and racing stats events then re-raised it) —
// producing phantom rate spikes on clear (operator-reported 2026-08-12).
// Per-item deltas only ever reflect real bytes moving on the wire; a removed
// item simply stops emitting.
export const currentRateBps = ref(0)
const rateWindow: Array<{ atMs: number, bytes: number }> = []
// last observed uploaded-bytes per in-flight item (cleared on settle/remove)
const itemBytesSeen = new Map<string, number>()

const recomputeRate = (now: number): void => {
  // 10-second sliding window
  while (rateWindow.length > 0 && now - rateWindow[0].atMs > 10_000) rateWindow.shift()
  const windowBytes = rateWindow.reduce((sum, s) => sum + s.bytes, 0)
  const windowMs = rateWindow.length > 0 ? Math.max(1000, now - rateWindow[0].atMs) : 1000
  currentRateBps.value = windowBytes / (windowMs / 1000)
}

const observeItemProgress = (item: UploadItem): void => {
  const now = Date.now()
  if (item.state === 'uploading' && item.progress !== undefined) {
    const bytes = Math.floor(item.fileSizeBytes * item.progress)
    const seen = itemBytesSeen.get(item.id) ?? 0
    if (bytes > seen) {
      rateWindow.push({ atMs: now, bytes: bytes - seen })
      itemBytesSeen.set(item.id, bytes)
    }
  } else if (itemBytesSeen.has(item.id) && item.state !== 'uploading') {
    // settled/paused/removed — credit any tail bytes on success, then forget
    if (item.state === 'uploaded' || item.state === 'ingested' || item.state === 'duplicate') {
      const seen = itemBytesSeen.get(item.id) ?? 0
      if (item.fileSizeBytes > seen) rateWindow.push({ atMs: now, bytes: item.fileSizeBytes - seen })
    }
    itemBytesSeen.delete(item.id)
  }
  recomputeRate(now)
}

// decay to zero when idle (no progress events arrive to trigger recompute)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (currentRateBps.value > 0) recomputeRate(Date.now())
  }, 2000)
}

engine.on(event => {
  if (event.type === 'stats') {
    stats.value = event.stats
  }
  if (event.type === 'engine-state') engineRunning.value = event.running
  if (event.type === 'item-updated') {
    observeItemProgress(event.item)
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

// -- multi-window / pop-out coordination (per-project) ------------------------
// The IndexedDB queue is shared by all windows; each window runs its own
// engine. Per-PROJECT pop-outs each own their project's items: a pop-out
// heartbeats on a per-project BroadcastChannel and scopes its engine TO that
// project; every normal window excludes projects with a live pop-out from its
// own scope (instead of pausing wholesale — the pre-multi-window design).
// Multiple pop-outs for different projects therefore coexist: each drives
// exactly its own partition, and main windows drive the rest.

const POPOUT_CHANNEL = 'arbimon-uploader-popout'
const POPOUT_BEAT_MS = 2000
const POPOUT_STALE_MS = 5000

/** projects with a live pop-out → last heartbeat epoch ms */
const popoutBeats = new Map<string, number>()
/** reactive view: slugs whose pop-out is currently alive */
export const livePopouts = ref<Set<string>>(new Set())
/** when THIS window is a pop-out: the project it owns */
let ownPopoutSlug: string | undefined

const recomputePopouts = (): void => {
  const now = Date.now()
  const alive = new Set<string>()
  for (const [slug, at] of popoutBeats) {
    if (now - at <= POPOUT_STALE_MS) alive.add(slug)
    else popoutBeats.delete(slug)
  }
  const changed = alive.size !== livePopouts.value.size ||
    [...alive].some(s => !livePopouts.value.has(s))
  if (changed) {
    livePopouts.value = alive
    applyScope()
  }
}

const applyScope = (): void => {
  if (ownPopoutSlug !== undefined) {
    // pop-out window: drive ONLY my project
    const mine = ownPopoutSlug
    engine.setScope(item => item.projectSlug === mine)
  } else {
    // normal window: drive everything EXCEPT projects with a live pop-out
    const excluded = livePopouts.value
    engine.setScope(item =>
      item.projectSlug === undefined || !excluded.has(item.projectSlug))
  }
}

let popoutChannel: BroadcastChannel | undefined

/** Called by the uploader page when it mounts as a pop-out (?popout=1). */
export const registerAsPopout = (slug: string): void => {
  ownPopoutSlug = slug
  applyScope()
  popoutChannel?.postMessage({ type: 'popout-beat', slug })
}

/** Ask openers to transfer file handles for a project (pop-out bootstrap). */
export const requestFileHandles = (slug: string): void => {
  popoutChannel?.postMessage({ type: 'need-file-handles', slug })
}

if (!import.meta.env.SSR && typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  popoutChannel = new BroadcastChannel(POPOUT_CHANNEL)
  popoutChannel.onmessage = (event) => {
    const msg = event.data as { type?: string, slug?: string, entries?: Array<[string, File]> }
    if (msg?.type === 'popout-beat' && typeof msg.slug === 'string') {
      if (ownPopoutSlug === undefined) {
        popoutBeats.set(msg.slug, Date.now())
        recomputePopouts()
      }
    }
    if (msg?.type === 'need-file-handles' && ownPopoutSlug === undefined) {
      // a pop-out bootstrapped; hand over handles for ITS project's items
      try {
        const wanted = new Set(items.value.filter(i => i.projectSlug === msg.slug).map(i => i.id))
        const entries = fileSource.inner.entries().filter(([id]) => wanted.has(id))
        if (entries.length > 0) popoutChannel?.postMessage({ type: 'file-handles', slug: msg.slug, entries })
      } catch { /* clone limits — popout surfaces missing handles per-item */ }
    }
    if (msg?.type === 'file-handles' && ownPopoutSlug !== undefined && msg.slug === ownPopoutSlug) {
      for (const [id, file] of msg.entries ?? []) fileSource.inner.register(id, file)
      void refreshItems()
    }
  }
  // pop-out: heartbeat; all windows: sweep stale beats
  setInterval(() => {
    if (ownPopoutSlug !== undefined) {
      popoutChannel?.postMessage({ type: 'popout-beat', slug: ownPopoutSlug })
    } else {
      recomputePopouts()
    }
  }, POPOUT_BEAT_MS)
}

// online/offline handling lives with the singleton (not a component lifecycle)
if (!import.meta.env.SSR && typeof window !== 'undefined') {
  window.addEventListener('online', () => { engine.setOnline(true) })
  window.addEventListener('offline', () => { engine.setOnline(false) })
  window.addEventListener('beforeunload', (event) => {
    // Covers staged/analyzing work too (see unsavedCount): those rows carry
    // real user effort and lose their file handles on reload, which is exactly
    // the case that previously passed with no warning at all.
    if (unsavedCount.value > 0) {
      event.preventDefault()
      event.returnValue = ''
    }
  })
  // Load any persisted queue from a previous session at app boot.
  void refreshItems()
}

// Test hook: exposes the engine + store for automated benchmarking/QA.
// NOT available in production builds — the demo tier (ADR-026) is where the
// upload harnesses in qa/synthetics run, and production has no reason to hand
// page scripts a handle on the upload pipeline.
if (!import.meta.env.SSR && typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
  ;(window as unknown as Record<string, unknown>).__uploadEngine = engine
  ;(window as unknown as Record<string, unknown>).__uploadStore = uploadStore
}
