/**
 * App-wide upload engine singleton.
 *
 * The engine + its IndexedDB queue live at module scope so uploads keep
 * running while the user navigates between routes (Drive-style). The
 * upload-panel (full page UI) and upload-tray (floating mini status) both
 * consume this shared state.
 */
import { computed, reactive, ref } from 'vue'

import { type QueueStats, type UploadItem, BrowserFileSource, IndexedDbUploadStore, makeBrowserPrepare, UploadEngine } from '@rfcx-bio/upload-engine'

import { track } from '~/analytics'
import { useAuth0Client } from '~/auth-client'
import { getIdToken } from '~/auth-client/get-id-token'

const INGEST_BASE_URL = (import.meta.env.VITE_INGEST_BASE_URL as string | undefined) ?? 'https://ingest.rfcx.org'

export const EMPTY_STATS: QueueStats = { total: 0, queued: 0, preparing: 0, ready: 0, signing: 0, signed: 0, uploading: 0, uploaded: 0, ingested: 0, duplicate: 0, failed: 0, rejected: 0, paused: 0, bytesTotal: 0, bytesUploaded: 0 }

/** Per-prepare timezone context, set by the panel before enqueue. */
export const prepareOptions = reactive<{ timezone?: string | number }>({})

export const uploadStore = new IndexedDbUploadStore()
export const fileSource = new BrowserFileSource()

const getToken = async (): Promise<string> => {
  const client = await useAuth0Client()
  return await getIdToken(client)
}

export const engine = new UploadEngine(
  { ingestBaseUrl: INGEST_BASE_URL },
  uploadStore,
  fileSource,
  getToken,
  async (item, file) => await makeBrowserPrepare({ timezone: prepareOptions.timezone })(item, file)
)

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
