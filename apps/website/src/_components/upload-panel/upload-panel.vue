<template>
  <div>
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
      <!-- #112: client-side lossless FLAC encoding toggle -->
      <label class="flex items-center gap-x-2 text-sm cursor-pointer select-none">
        <input
          v-model="flacEncodeEnabled"
          type="checkbox"
          class="rounded border-cloud/30"
        >
        <span :title="'Losslessly convert WAV files to FLAC in your browser before uploading — about half the upload size, bit-identical audio. Files that cannot be converted losslessly (e.g. 32-bit float) upload unchanged.'">
          Convert WAV → FLAC before upload (lossless)
        </span>
      </label>
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
    <p
      v-if="skippedAlreadyUploaded > 0"
      class="mt-4 rounded-lg border border-frequency/30 bg-frequency/10 px-4 py-3 text-sm text-insight inline-block"
    >
      {{ skippedAlreadyUploaded }} file{{ skippedAlreadyUploaded === 1 ? '' : 's' }} already uploaded in this session &mdash; skipped.
    </p>

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
          Retry / resume
        </button>
        <button
          class="btn btn-secondary text-sm"
          :title="'Remove finished, duplicate, rejected and failed items from this list (does not delete ingested recordings)'"
          @click="clearCompleted"
        >
          Clear finished
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
        class="py-2 text-sm"
      >
        <div class="flex items-center gap-x-4">
          <span class="flex-1 truncate">{{ item.relativePath }}</span>
          <span class="text-cloud w-24 text-right">{{ formatBytes(item.fileSizeBytes) }}</span>
          <span
            class="w-40 text-right"
            :class="stateColor(item.state)"
          >
            <template v-if="item.state === 'uploading'">{{ Math.round((item.progress ?? 0) * 100) }}% · {{ formatBytes(Math.round(item.fileSizeBytes * (item.progress ?? 0))) }}</template>
            <template v-else>{{ stateLabel(item.state) }}</template>
          </span>
          <span
            v-if="item.error !== undefined"
            class="text-flamingo text-xs max-w-64 truncate"
            :title="item.error"
          >{{ item.error }}</span>
          <!-- Verification affordance: once ingested, open the recording in the
               Visualizer (resolves the arbimon recording_id on click). -->
          <button
            v-if="item.state === 'ingested'"
            class="text-xs text-frequency underline hover:no-underline whitespace-nowrap disabled:opacity-50 disabled:cursor-wait"
            :disabled="openingVisualizerId === item.id"
            :title="'Open this recording in the Visualizer (new tab)'"
            @click="openInVisualizer(item)"
          >
            {{ openingVisualizerId === item.id ? 'Opening…' : 'View ↗' }}
          </button>
        </div>
        <!-- Per-file progress meter: fills during upload, pulses while the
             server processes, completes (and fades) on ingest. -->
        <div
          v-if="showMeter(item)"
          class="mt-1 h-1 rounded bg-cloud/15 overflow-hidden"
        >
          <div
            class="h-full rounded transition-all duration-300"
            :class="meterClass(item)"
            :style="{ width: `${meterPercent(item)}%` }"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'

import { apiArbimonResolveRecordingId } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SiteResponse } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type UploadItem, type UploadItemState, collectDroppedFiles, createUploadItem, isSupportedAudioFile } from '@rfcx-bio/upload-engine'

import { apiClientArbimonLegacyKey } from '@/globals'
import { track } from '~/analytics'
import { engine, engineRunning, fileSource, flacEncodeEnabled, items, prepareOptions, refreshItems, stats, uploadStore } from '~/upload'

const props = defineProps<{
  sites: SiteResponse[]
  /** Project slug — needed to resolve a recording_id for the Visualizer link. */
  projectSlug?: string
}>()

const apiClientArbimon = inject(apiClientArbimonLegacyKey)

// -- site + timezone ---------------------------------------------------------
const selectedSiteExternalId = ref('')
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timezoneMode = ref<'utc' | 'local'>('utc')

const sites = computed(() => props.sites)

// The engine, queue state, and online/beforeunload wiring are an app-wide
// singleton (~/upload) so uploads continue across route changes and the
// floating tray reflects the same state. This component is now pure UI.
watch(timezoneMode, (mode) => {
  prepareOptions.timezone = mode === 'local' ? browserTimezone : undefined
}, { immediate: true })

const dropActive = ref(false)

onMounted(async () => {
  await refreshItems()
})

// -- file intake ------------------------------------------------------------
const fileInput = ref<HTMLInputElement>()

/**
 * Files already present in the queue for this site that completed (or were
 * server-side duplicates). Re-dropping the same folder — the documented way to
 * resume an interrupted session, since File handles do not survive a reload —
 * must NOT re-upload them: the server would (correctly) flag them as
 * duplicates, which reads to the user as a false positive. Matched on
 * relativePath + size + site, which is what the user actually re-dropped.
 */
const alreadyDoneKey = (relativePath: string, size: number, streamId: string): string =>
  `${streamId}\u0000${relativePath}\u0000${size}`

const skippedAlreadyUploaded = ref(0)

const enqueueFiles = async (files: Array<{ file: File, relativePath: string }>): Promise<void> => {
  if (selectedSiteExternalId.value === '') return
  const supported = files.filter(({ file }) => isSupportedAudioFile(file.name))
  const existing = await uploadStore.list()
  const doneKeys = new Set(
    existing
      .filter(item => item.state === 'ingested' || item.state === 'duplicate')
      .map(item => alreadyDoneKey(item.relativePath, item.fileSizeBytes, item.streamId))
  )
  const accepted = supported.filter(
    ({ file, relativePath }) =>
      !doneKeys.has(alreadyDoneKey(relativePath, file.size, selectedSiteExternalId.value))
  )
  skippedAlreadyUploaded.value = supported.length - accepted.length
  if (accepted.length === 0) {
    await refreshItems()
    return
  }
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
  track('web_upload_batch_enqueued', {
    fileCount: newItems.length,
    totalBytes: newItems.reduce((sum, item) => sum + item.fileSizeBytes, 0),
    projectSlug: props.projectSlug
  })
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

/**
 * Un-stick the queue.
 *
 * `failed` items go back through engine.retry(), and — critically — items
 * stranded in a transient in-flight state (`uploading`/`signing`/`preparing`)
 * by a network drop or tab close are recovered too. Before 2026-08-03 this
 * only swept `failed`, so a mid-batch network failure left the queue looking
 * busy forever with nothing progressing.
 */
const retryFailed = async (): Promise<void> => {
  await engine.recoverStalled()
  const failed = await uploadStore.list(['failed'])
  for (const item of failed) await engine.retry(item.id)
  engine.start()
  await refreshItems()
}

/**
 * Remove every settled item from the list: ingested, duplicate, rejected AND
 * failed. Before 2026-08-11 clearTerminal did not sweep `failed`, so failed/
 * rejected remnants were IMPOSSIBLE to clear from the panel (operator-
 * reported). Clearing failed rows is the explicit "give up on these" act —
 * anything the user still wants goes through Retry FIRST.
 */
const clearCompleted = async (): Promise<void> => {
  await uploadStore.clearTerminal()
  await refreshItems()
}

// -- open in Visualizer (verification affordance) ----------------------------
const openingVisualizerId = ref<string | undefined>(undefined)

const openInVisualizer = async (item: UploadItem): Promise<void> => {
  if (props.projectSlug === undefined || apiClientArbimon === undefined || item.timestampUtc === undefined) return
  openingVisualizerId.value = item.id
  try {
    const recordingId = await apiArbimonResolveRecordingId(apiClientArbimon, props.projectSlug, item.streamId, item.timestampUtc)
    if (recordingId === undefined) {
      window.alert('This recording is not queryable yet — give it a moment and try again.')
      return
    }
    // Modern visualizer path (parity reached; 302 lifted). New tab.
    window.open(`${window.location.origin}/p/${props.projectSlug}/visualizer/rec/${recordingId}`, '_blank', 'noopener')
  } catch {
    window.alert('Could not open the recording in the Visualizer. Please try again.')
  } finally {
    openingVisualizerId.value = undefined
  }
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
  duplicate: 'Already uploaded — skipped',
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

// -- per-file progress meter ---------------------------------------------

/** Show the meter from first activity until terminal success/failure. */
const showMeter = (item: UploadItem): boolean =>
  ['preparing', 'ready', 'signing', 'signed', 'uploading', 'uploaded'].includes(item.state)

const meterPercent = (item: UploadItem): number => {
  switch (item.state) {
    case 'preparing': return 5
    case 'ready':
    case 'signing': return 8
    case 'signed': return 10
    // Byte progress owns 10–90%; the last 10% is server-side processing.
    case 'uploading': return 10 + Math.round((item.progress ?? 0) * 80)
    case 'uploaded': return 95
    default: return 100
  }
}

const meterClass = (item: UploadItem): string =>
  item.state === 'uploaded' ? 'bg-frequency/60 animate-pulse' : 'bg-frequency'
</script>
