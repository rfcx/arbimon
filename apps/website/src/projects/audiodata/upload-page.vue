<template>
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10) pb-20">
    <h1 class="mt-6">
      Upload recordings <span class="text-sm align-middle rounded bg-frequency/20 px-2 py-1 ml-2">BETA</span>
    </h1>
    <div
      v-if="isProjectViewOnly"
      class="mt-6 rounded-lg border border-flamingo/30 bg-flamingo/10 px-4 py-3 text-sm text-flamingo"
    >
      This project is currently view-only. Uploads are disabled until the project is reactivated.
    </div>
    <template v-else>
      <!-- Site + timezone selection -->
      <div class="mt-6 flex flex-wrap gap-x-6 gap-y-3 items-end">
        <div>
          <label class="block text-sm mb-1">Site</label>
          <select
            v-model="selectedSiteExternalId"
            class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2 min-w-64"
          >
            <option
              disabled
              value=""
            >
              Select a site…
            </option>
            <option
              v-for="site in sites"
              :key="site.external_id"
              :value="site.external_id"
            >
              {{ site.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">Filename timezone</label>
          <select
            v-model="timezoneMode"
            class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2"
          >
            <option value="utc">
              UTC (default)
            </option>
            <option value="local">
              Site local time ({{ browserTimezone }})
            </option>
          </select>
        </div>
      </div>

      <!-- Drop zone -->
      <div
        class="mt-6 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors"
        :class="dropActive ? 'border-frequency bg-frequency/10' : 'border-cloud/40'"
        @dragover.prevent="dropActive = true"
        @dragleave.prevent="dropActive = false"
        @drop.prevent="onDrop"
      >
        <p class="text-lg">
          Drag &amp; drop audio files or folders here
        </p>
        <p class="text-sm text-cloud mt-2">
          .wav, .flac, .opus — WAV up to 200MB, FLAC up to 1GB per file
        </p>
        <button
          class="btn btn-secondary mt-4"
          :disabled="selectedSiteExternalId === ''"
          @click="pickFiles"
        >
          Or choose files…
        </button>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".wav,.flac,.opus"
          class="hidden"
          @change="onPick"
        >
        <p
          v-if="selectedSiteExternalId === ''"
          class="text-sm text-flamingo mt-3"
        >
          Select a site first.
        </p>
      </div>

      <!-- Aggregate progress -->
      <div
        v-if="stats.total > 0"
        class="mt-6"
      >
        <div class="flex justify-between text-sm mb-1">
          <span>
            {{ stats.ingested + stats.duplicate }} / {{ stats.total }} complete
            <template v-if="stats.failed + stats.rejected > 0"> · {{ stats.failed + stats.rejected }} failed</template>
          </span>
          <span>{{ formatBytes(stats.bytesUploaded) }} / {{ formatBytes(stats.bytesTotal) }}</span>
        </div>
        <div class="h-2 rounded bg-cloud/20 overflow-hidden">
          <div
            class="h-full bg-frequency transition-all"
            :style="{ width: `${overallPercent}%` }"
          />
        </div>
        <div class="flex gap-x-3 mt-3">
          <button
            class="btn btn-secondary text-sm"
            @click="engineRunning ? pauseEngine() : resumeEngine()"
          >
            {{ engineRunning ? 'Pause' : 'Resume' }}
          </button>
          <button
            class="btn btn-secondary text-sm"
            @click="retryFailed"
          >
            Retry failed
          </button>
          <button
            class="btn btn-secondary text-sm"
            @click="clearCompleted"
          >
            Clear completed
          </button>
        </div>
      </div>

      <!-- File list -->
      <ul
        v-if="items.length > 0"
        class="mt-6 divide-y divide-cloud/10"
      >
        <li
          v-for="item in items"
          :key="item.id"
          class="py-2 flex items-center gap-x-4 text-sm"
        >
          <span class="flex-1 truncate">{{ item.relativePath }}</span>
          <span class="text-cloud w-24 text-right">{{ formatBytes(item.fileSizeBytes) }}</span>
          <span
            class="w-40 text-right"
            :class="stateColor(item.state)"
          >
            <template v-if="item.state === 'uploading'">{{ Math.round((item.progress ?? 0) * 100) }}%</template>
            <template v-else>{{ stateLabel(item.state) }}</template>
          </span>
          <span
            v-if="item.error !== undefined"
            class="text-flamingo text-xs max-w-64 truncate"
            :title="item.error"
          >{{ item.error }}</span>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

import { type SiteResponse, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type QueueStats, type UploadItem, type UploadItemState, BrowserFileSource, collectDroppedFiles, createUploadItem, IndexedDbUploadStore, isSupportedAudioFile, makeBrowserPrepare, UploadEngine } from '@rfcx-bio/upload-engine'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useAuth0Client } from '~/auth-client'
import { getIdToken } from '~/auth-client/get-id-token'
import { useStore } from '~/store'

const store = useStore()
const apiClientArbimon = inject(apiClientArbimonLegacyKey)

const isProjectViewOnly = computed(() => store.project?.isLocked === true)

// -- sites ------------------------------------------------------------------
const sites = ref<SiteResponse[]>([])
const selectedSiteExternalId = ref('')
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timezoneMode = ref<'utc' | 'local'>('utc')

onMounted(async () => {
  const slug = store.project?.slug
  if (slug === undefined || apiClientArbimon === undefined) return
  const response = await apiArbimonGetSites(apiClientArbimon, slug, {})
  sites.value = (response ?? []).filter(site => site.external_id !== null && site.external_id !== '')
})

// -- engine -----------------------------------------------------------------
const INGEST_BASE_URL = (import.meta.env.VITE_INGEST_BASE_URL as string | undefined) ?? 'https://ingest.rfcx.org'

const uploadStore = new IndexedDbUploadStore()
const fileSource = new BrowserFileSource()

const getToken = async (): Promise<string> => {
  const client = await useAuth0Client()
  return await getIdToken(client)
}

const engine = new UploadEngine(
  { ingestBaseUrl: INGEST_BASE_URL },
  uploadStore,
  fileSource,
  getToken,
  async (item, file) => await makeBrowserPrepare({ timezone: timezoneMode.value === 'local' ? browserTimezone : undefined })(item, file)
)

const items = ref<UploadItem[]>([])
const stats = ref<QueueStats>({ total: 0, queued: 0, preparing: 0, ready: 0, signing: 0, signed: 0, uploading: 0, uploaded: 0, ingested: 0, duplicate: 0, failed: 0, rejected: 0, paused: 0, bytesTotal: 0, bytesUploaded: 0 })
const engineRunning = ref(false)
const dropActive = ref(false)

const refreshItems = async (): Promise<void> => {
  items.value = await uploadStore.list()
}

const offEngine = engine.on(event => {
  if (event.type === 'stats') stats.value = event.stats
  if (event.type === 'engine-state') engineRunning.value = event.running
  if (event.type === 'item-updated') {
    const index = items.value.findIndex(existing => existing.id === event.item.id)
    if (index >= 0) items.value[index] = event.item
    else items.value.push(event.item)
  }
})

const onlineListener = (): void => { engine.setOnline(navigator.onLine) }
onMounted(async () => {
  window.addEventListener('online', onlineListener)
  window.addEventListener('offline', onlineListener)
  await refreshItems()
})
onBeforeUnmount(() => {
  offEngine()
  window.removeEventListener('online', onlineListener)
  window.removeEventListener('offline', onlineListener)
})

// beforeunload guard while active work exists
const beforeUnload = (event: BeforeUnloadEvent): void => {
  const active = stats.value.uploading + stats.value.signed + stats.value.signing + stats.value.ready + stats.value.queued + stats.value.preparing
  if (active > 0) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onMounted(() => { window.addEventListener('beforeunload', beforeUnload) })
onBeforeUnmount(() => { window.removeEventListener('beforeunload', beforeUnload) })

// -- file intake ------------------------------------------------------------
const fileInput = ref<HTMLInputElement>()

const enqueueFiles = async (files: Array<{ file: File, relativePath: string }>): Promise<void> => {
  if (selectedSiteExternalId.value === '') return
  const accepted = files.filter(({ file }) => isSupportedAudioFile(file.name))
  const newItems = accepted.map(({ file, relativePath }) => {
    const item = createUploadItem({
      filename: file.name,
      relativePath,
      fileSizeBytes: file.size,
      streamId: selectedSiteExternalId.value
    })
    fileSource.register(item.id, file)
    return item
  })
  await engine.enqueue(newItems)
  await refreshItems()
  engine.start()
}

const onDrop = async (event: DragEvent): Promise<void> => {
  dropActive.value = false
  if (event.dataTransfer === null) return
  await enqueueFiles(await collectDroppedFiles(event.dataTransfer))
}

const pickFiles = (): void => { fileInput.value?.click() }

const onPick = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  if (input.files === null) return
  await enqueueFiles(Array.from(input.files).map(file => ({ file, relativePath: file.name })))
  input.value = ''
}

// -- controls ---------------------------------------------------------------
const pauseEngine = async (): Promise<void> => { await engine.pause() }
const resumeEngine = (): void => { engine.start() }

const retryFailed = async (): Promise<void> => {
  const failed = await uploadStore.list(['failed'])
  for (const item of failed) await engine.retry(item.id)
}

const clearCompleted = async (): Promise<void> => {
  await uploadStore.clearTerminal()
  await refreshItems()
}

// -- display helpers ---------------------------------------------------------
const overallPercent = computed(() =>
  stats.value.bytesTotal === 0 ? 0 : Math.round((stats.value.bytesUploaded / stats.value.bytesTotal) * 100)
)

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const STATE_LABELS: Record<UploadItemState, string> = {
  queued: 'Queued',
  preparing: 'Preparing…',
  ready: 'Ready',
  signing: 'Requesting URL…',
  signed: 'Waiting to upload',
  uploading: 'Uploading',
  uploaded: 'Processing…',
  ingested: 'Complete',
  duplicate: 'Duplicate (already ingested)',
  failed: 'Failed',
  rejected: 'Rejected',
  paused: 'Paused'
}

const stateLabel = (state: UploadItemState): string => STATE_LABELS[state]

const stateColor = (state: UploadItemState): string => {
  switch (state) {
    case 'ingested': return 'text-frequency'
    case 'duplicate': return 'text-cloud'
    case 'failed':
    case 'rejected': return 'text-flamingo'
    default: return 'text-insight'
  }
}
</script>
