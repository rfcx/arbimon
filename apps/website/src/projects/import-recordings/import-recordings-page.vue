<template>
  <section :class="isPopout ? 'p-6' : 'pt-20 pl-18 pr-6 md:(pl-23 pr-10) pb-20'">
    <div class="flex items-start justify-between">
      <div>
        <h1 :class="isPopout ? 'text-2xl' : 'mt-6'">
          Import Recordings <span class="text-sm align-middle rounded bg-frequency/20 px-2 py-1 ml-2">BETA</span>
        </h1>
        <p class="text-sm text-cloud mt-2">
          Upload audio directly from your browser. Files are analyzed locally first — review the list, then press Start.
        </p>
      </div>
      <button
        v-if="!isPopout"
        class="btn btn-secondary text-sm mt-6 whitespace-nowrap"
        title="Open the uploader in its own window"
        @click="popOut"
      >
        ⧉ Pop out
      </button>
      <button
        v-else
        class="btn btn-secondary text-sm whitespace-nowrap"
        title="Close this window (uploads resume in the main tab)"
        @click="closePopout"
      >
        ✕ Close window
      </button>
    </div>

    <div
      v-if="isProjectViewOnly"
      class="mt-6 rounded-lg border border-flamingo/30 bg-flamingo/10 px-4 py-3 text-sm text-flamingo inline-block"
    >
      This project is view-only and cannot accept uploads.
    </div>

    <div
      v-else-if="popoutActive && !isPopout"
      class="mt-6 rounded-lg border border-frequency/30 bg-frequency/10 px-4 py-3 text-sm inline-block"
    >
      Uploads are running in the popped-out window. Close it to control them from here.
    </div>

    <template v-else>
      <!-- Global control bar FIRST (2026-08-12 layout pass): Start/Pause +
           Grafana-style stat panels sit directly under the title as the page's
           permanent header row (no v-if — an Idle button + zeroed panels is the
           stable empty state; hiding it made the layout jump on first file). -->
      <div class="mt-6 flex items-stretch gap-x-3 w-full">
        <button
          class="shrink-0 rounded-lg px-6 font-medium text-base inline-flex flex-col items-center justify-center gap-y-1 min-w-28 transition-colors"
          :class="startPauseClass"
          :disabled="startPauseDisabled"
          @click="onStartPause"
        >
          <svg
            v-if="buttonMode === 'pause'"
            viewBox="0 0 16 16"
            class="w-5 h-5 fill-current"
          ><path d="M4 2h3v12H4zM9 2h3v12H9z" /></svg>
          <svg
            v-else
            viewBox="0 0 16 16"
            class="w-5 h-5 fill-current"
          ><path d="M4 2l9 6-9 6V2z" /></svg>
          <span>{{ startPauseLabel }}</span>
        </button>

        <div class="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Upload Rate</span>
            <span class="text-xl tabular-nums font-medium">{{ formatRate(currentRateBps) }}</span>
          </div>
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Uploaded</span>
            <span class="text-xl tabular-nums font-medium">{{ formatBytes(metrics.bytesTransferred) }}</span>
          </div>
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Imported</span>
            <span class="text-xl tabular-nums font-medium text-frequency">{{ metrics.completed }}</span>
          </div>
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Errors</span>
            <span
              class="text-xl tabular-nums font-medium"
              :class="metrics.failed > 0 ? 'text-flamingo' : ''"
            >{{ metrics.failed }}</span>
          </div>
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Duplicates</span>
            <span class="text-xl tabular-nums font-medium">{{ metrics.duplicates }}</span>
          </div>
        </div>
      </div>

      <!-- Site + timezone + options (below the control bar) -->
      <div class="mt-5 flex flex-wrap gap-x-6 gap-y-3 items-end">
        <div class="relative">
          <label class="block text-sm mb-1">Site</label>
          <select
            v-model="selectedSiteExternalId"
            class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2 min-w-64 transition-shadow duration-300"
            :class="siteFlash ? 'ring-2 ring-flamingo/80 shadow-lg shadow-flamingo/20' : ''"
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
          <!-- floating "select a site first" callout, anchored to the selector -->
          <div
            v-if="siteCalloutVisible"
            class="absolute left-0 top-full mt-2 z-40 w-64 rounded-lg border border-flamingo/40 bg-pitch shadow-xl px-3 py-2 text-sm"
          >
            <div class="absolute -top-1.5 left-6 w-3 h-3 rotate-45 bg-pitch border-l border-t border-flamingo/40" />
            <span class="text-flamingo">Select a site first</span>
            <span class="text-cloud"> — files need a destination site before they can be analyzed.</span>
          </div>
        </div>
        <div>
          <label class="block text-sm mb-1">Timezone of Audio Recordings</label>
          <select
            v-model="timezoneMode"
            class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2"
          >
            <option value="auto">
              Automatic
            </option>
            <option
              value="site"
              :disabled="siteTimezone === undefined"
            >
              Site Local Time {{ siteTimezone !== undefined ? `(${siteTimezone})` : '(unknown)' }}
            </option>
            <option value="utc">
              UTC
            </option>
          </select>
        </div>
        <label class="flex items-center gap-x-2 text-sm cursor-pointer select-none pb-2">
          <input
            v-model="flacEncodeEnabled"
            type="checkbox"
            class="rounded border-cloud/40 bg-pitch"
          >
          Convert WAV to FLAC before upload (lossless, smaller &amp; faster)
        </label>
      </div>

      <!-- hidden file input (the intake button inside the table slot triggers it) -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".wav,.flac,.opus"
        class="hidden"
        @change="onPick"
      >

      <!-- Aggregate progress -->
      <div
        v-if="stats.total > 0 && stats.bytesTotal > 0"
        class="mt-4"
      >
        <div class="flex justify-between text-sm mb-1">
          <span>{{ stats.ingested + stats.duplicate }} / {{ stats.total }} complete</span>
          <span>{{ formatBytes(stats.bytesUploaded) }} / {{ formatBytes(stats.bytesTotal) }}</span>
        </div>
        <div class="h-2 rounded bg-cloud/20 overflow-hidden">
          <div
            class="h-full bg-frequency transition-all"
            :style="{ width: `${overallPercent}%` }"
          />
        </div>
      </div>

      <!-- Staging table + integrated intake area (whole region is a drop target).
           dragenter/leave use a depth counter — a bare dragleave fires on every
           child-element boundary and makes the highlight flicker. -->
      <div
        @dragenter.prevent="onDragEnter"
        @dragover.prevent
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <staging-table
          :items="items"
          :opening-id="openingVisualizerId"
          :flac-enabled="flacEncodeEnabled"
          :drop-active="dropActive"
          @clear-completed="clearCompleted"
          @retry-failed="retryFailed"
          @start-selected="startSelected"
          @pause-selected="pauseSelected"
          @clear-selected="clearSelected"
          @cancel-item="cancelItem"
          @retry-item="retryItem"
          @clear-item="clearItem"
          @open-destination="openInVisualizer"
        >
          <template #intake>
            <div
              class="border-t border-dashed px-6 py-8 text-center transition-colors"
              :class="dropActive ? 'border-frequency bg-frequency/10' : 'border-cloud/30'"
            >
              <p :class="items.length === 0 ? 'text-lg' : 'text-base'">
                Drag &amp; drop audio files or folders here
              </p>
              <p class="text-sm text-cloud mt-1">
                .wav, .flac, .opus — files are analyzed locally and staged above before anything uploads
              </p>
              <button
                class="btn btn-secondary mt-3 text-sm"
                @click="pickFiles"
              >
                Or choose files…
              </button>
              <p
                v-if="selectedSiteExternalId === ''"
                class="text-sm text-cloud mt-2"
              >
                Select a site above to enable analysis.
              </p>
            </div>
          </template>
        </staging-table>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiArbimonResolveRecordingId } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SiteResponse, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type TimezoneMode, type UploadItem, analyzeFile, collectDroppedFiles, createUploadItem, isSupportedAudioFile } from '@rfcx-bio/upload-engine'

import StagingTable from '@/_components/upload-panel/staging-table.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { track } from '~/analytics'
import { useStore } from '~/store'
import { bindProjectMetrics, currentRateBps, engine, engineRunning, fileSource, flacEncodeEnabled, items, projectMetrics, refreshItems, stats } from '~/upload'

const route = useRoute()
const store = useStore()
const apiClientArbimon = inject(apiClientArbimonLegacyKey)

const projectSlug = computed(() => route.params.projectSlug as string)
const isProjectViewOnly = computed(() => store.project?.isLocked === true)
const isPopout = computed(() => route.query.popout === '1')

// -- sites + timezone --------------------------------------------------------

const sites = ref<SiteResponse[]>([])
const selectedSiteExternalId = ref('')
const timezoneMode = ref<TimezoneMode>('auto')

const selectedSite = computed(() =>
  sites.value.find(site => site.external_id === selectedSiteExternalId.value))

const siteTimezone = computed(() => {
  const tz = selectedSite.value?.timezone
  return tz !== undefined && tz !== '' ? tz : undefined
})

// If the user had Site Local selected and switches to a site without a tz,
// fall back to Automatic rather than silently uploading with a stale zone.
watch(siteTimezone, (tz) => {
  if (tz === undefined && timezoneMode.value === 'site') timezoneMode.value = 'auto'
})

const loadSites = async (): Promise<void> => {
  if (apiClientArbimon === undefined || projectSlug.value === undefined) return
  const response = await apiArbimonGetSites(apiClientArbimon, projectSlug.value, {})
  sites.value = (response ?? []).filter(site => site.external_id !== null && site.external_id !== '')
}

// -- metrics binding ----------------------------------------------------------

const metrics = projectMetrics

onMounted(async () => {
  await loadSites()
  bindProjectMetrics(projectSlug.value, store.user?.sub)
  await refreshItems()
})

// -- site-required guidance (flash + callout) ---------------------------------

const siteFlash = ref(false)
const siteCalloutVisible = ref(false)
let calloutTimer: ReturnType<typeof setTimeout> | undefined

const promptForSite = (): void => {
  // undramatic: one brief ring pulse on the selector + a small anchored
  // callout that self-dismisses (or dismisses on site selection)
  siteFlash.value = true
  setTimeout(() => { siteFlash.value = false }, 1200)
  siteCalloutVisible.value = true
  if (calloutTimer !== undefined) clearTimeout(calloutTimer)
  calloutTimer = setTimeout(() => { siteCalloutVisible.value = false }, 6000)
}

watch(selectedSiteExternalId, (value) => {
  if (value !== '') {
    siteCalloutVisible.value = false
    if (calloutTimer !== undefined) clearTimeout(calloutTimer)
  }
})

// -- staged intake ------------------------------------------------------------

const dropActive = ref(false)
let dragDepth = 0
const fileInput = ref<HTMLInputElement>()

const onDragEnter = (): void => {
  dragDepth++
  dropActive.value = true
}

const onDragLeave = (): void => {
  dragDepth--
  if (dragDepth <= 0) {
    dragDepth = 0
    dropActive.value = false
  }
}

const enqueueFiles = async (files: Array<{ file: File, relativePath: string }>): Promise<void> => {
  if (selectedSiteExternalId.value === '') { promptForSite(); return }
  const accepted = files.filter(({ file }) => isSupportedAudioFile(file.name))
  const pairs = accepted.map(({ file, relativePath }) => {
    const item = createUploadItem({
      filename: file.name,
      relativePath,
      fileSizeBytes: file.size,
      streamId: selectedSiteExternalId.value,
      initialState: 'analyzing'
    })
    fileSource.register(item.id, file)
    return { item, file }
  })
  // Stage first (rows appear immediately as "Analyzing…"), then analyze.
  await engine.stage(pairs.map(pair => pair.item))
  await refreshItems()
  track('web_upload_batch_staged', {
    fileCount: pairs.length,
    totalBytes: pairs.reduce((sum, { item }) => sum + item.fileSizeBytes, 0),
    projectSlug: projectSlug.value,
    timezoneMode: timezoneMode.value
  })
  // Analyze with small concurrency — header reads are cheap but many files
  // shouldn't hammer the disk at once.
  const context = {
    mode: timezoneMode.value,
    siteTimezone: siteTimezone.value,
    siteName: selectedSite.value?.name
  }
  const CONCURRENCY = 4
  let index = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, pairs.length) }, async () => {
    while (index < pairs.length) {
      const mine = pairs[index++]
      const { patch } = await analyzeFile(mine.item, mine.file, context)
      await engine.updateStaged(mine.item.id, patch)
    }
  })
  await Promise.all(workers)
  await refreshItems()
}

const onDrop = async (event: DragEvent): Promise<void> => {
  dragDepth = 0
  dropActive.value = false
  if (event.dataTransfer === null) return
  await enqueueFiles(await collectDroppedFiles(event.dataTransfer))
}

const pickFiles = (): void => {
  if (selectedSiteExternalId.value === '') { promptForSite(); return }
  fileInput.value?.click()
}

const onPick = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  if (input.files === null) return
  await enqueueFiles(Array.from(input.files).map(file => ({ file, relativePath: file.name })))
  input.value = ''
}

// -- global Start / Pause -----------------------------------------------------

const activePipeline = computed(() =>
  stats.value.queued + stats.value.preparing + stats.value.ready +
  stats.value.signing + stats.value.signed + stats.value.uploading + stats.value.uploaded)

const startableCount = computed(() =>
  items.value.filter(item => item.state === 'staged' && item.analysisError === undefined).length)

/** 'pause' while work is flowing, 'start' when there is something to start,
 *  'inert' when nothing is actionable (all visible rows settled). */
const buttonMode = computed(() => {
  if (engineRunning.value && activePipeline.value > 0) return 'pause'
  if (startableCount.value > 0 || activePipeline.value > 0) return 'start'
  return 'inert'
})

const startPauseLabel = computed(() => {
  if (buttonMode.value === 'pause') return 'Pause'
  if (startableCount.value > 0) return `Start (${startableCount.value})`
  if (activePipeline.value > 0) return 'Resume'
  return 'Idle'
})

const startPauseDisabled = computed(() => buttonMode.value === 'inert')

const startPauseClass = computed(() => {
  if (buttonMode.value === 'inert') return 'border border-cloud/20 bg-moss/20 text-cloud/50 cursor-default'
  if (buttonMode.value === 'pause') return 'btn-secondary'
  return 'btn-primary'
})

const onStartPause = async (): Promise<void> => {
  if (engineRunning.value && activePipeline.value > 0) {
    await engine.pause()
    return
  }
  if (startableCount.value > 0) await engine.startStaged()
  engine.start()
  await refreshItems()
}

// -- table actions ------------------------------------------------------------

const clearCompleted = async (): Promise<void> => {
  for (const item of items.value.filter(i => i.state === 'ingested' || i.state === 'duplicate')) {
    await engine.remove(item.id)
  }
  await refreshItems()
}

const retryFailed = async (): Promise<void> => {
  for (const item of items.value.filter(i => ['failed', 'rejected', 'cancelled'].includes(i.state))) {
    await engine.retry(item.id)
  }
  engine.start()
  await refreshItems()
}

const startSelected = async (ids: string[]): Promise<void> => {
  await engine.startStaged(ids)
  engine.start()
  await refreshItems()
}

const pauseSelected = async (ids: string[]): Promise<void> => {
  await engine.pauseItems(ids)
  await refreshItems()
}

const clearSelected = async (ids: string[]): Promise<void> => {
  for (const id of ids) await engine.remove(id)
  await refreshItems()
}

const cancelItem = async (id: string): Promise<void> => { await engine.cancel(id); await refreshItems() }
const retryItem = async (id: string): Promise<void> => { await engine.retry(id); engine.start(); await refreshItems() }
const clearItem = async (id: string): Promise<void> => { await engine.remove(id); await refreshItems() }

// -- destination (Visualizer) -------------------------------------------------

const openingVisualizerId = ref<string | undefined>(undefined)

const openInVisualizer = async (item: UploadItem): Promise<void> => {
  if (apiClientArbimon === undefined || item.timestampUtc === undefined) return
  openingVisualizerId.value = item.id
  try {
    const recordingId = await apiArbimonResolveRecordingId(apiClientArbimon, projectSlug.value, item.streamId, item.timestampUtc)
    if (recordingId === undefined) {
      window.alert('This recording is not queryable yet — give it a moment and try again.')
      return
    }
    window.open(`${window.location.origin}/project/${projectSlug.value}/visualizer/rec/${recordingId}`, '_blank', 'noopener')
  } catch {
    window.alert('Could not open the recording in the Visualizer. Please try again.')
  } finally {
    openingVisualizerId.value = undefined
  }
}

// -- pop-out ------------------------------------------------------------------
// One engine per window over the SAME IndexedDB queue: when a popped-out
// window is active, THIS window pauses its engine and shows a banner
// (double-driving the queue would double-upload). BroadcastChannel carries
// the liveness signal.

const popoutActive = ref(false)
const POPOUT_CHANNEL = 'arbimon-uploader-popout'
let channel: BroadcastChannel | undefined
let heartbeatTimer: ReturnType<typeof setInterval> | undefined
let lastPopoutBeatMs = 0
let watchdogTimer: ReturnType<typeof setInterval> | undefined

const popOut = (): void => {
  const url = `${window.location.origin}/p/${projectSlug.value}/import-recordings?popout=1`
  window.open(url, 'arbimon-uploader', 'popup=yes,width=1280,height=860')
}

const closePopout = (): void => {
  // window.close() works because the pop-out was opened by script (same
  // origin, named window). The opener's 5s heartbeat watchdog then clears
  // its dormant banner and resumes engine control automatically.
  window.close()
}

onMounted(() => {
  if (typeof BroadcastChannel === 'undefined') return
  channel = new BroadcastChannel(POPOUT_CHANNEL)
  if (isPopout.value) {
    // I am the pop-out: announce liveness every 2s; adopt file handles the
    // opener transfers (File is structured-cloneable, so handles survive
    // the channel — without this, staged items would have no bytes here).
    channel.onmessage = (event) => {
      if (event.data?.type === 'file-handles') {
        for (const [id, file] of event.data.entries as Array<[string, File]>) {
          fileSource.inner.register(id, file)
        }
        void refreshItems()
      }
    }
    heartbeatTimer = setInterval(() => { channel?.postMessage({ type: 'popout-beat' }) }, 2000)
    channel.postMessage({ type: 'popout-beat' })
  } else {
    // I am a normal page: dormant while a pop-out beats (last beat < 5s ago).
    channel.onmessage = (event) => {
      if (event.data?.type === 'popout-beat') {
        lastPopoutBeatMs = Date.now()
        if (!popoutActive.value) {
          popoutActive.value = true
          void engine.pause()
          // hand the pop-out our file handles so it can drive the queue
          try {
            channel?.postMessage({ type: 'file-handles', entries: fileSource.inner.entries() })
          } catch { /* very large registries may exceed clone limits — the popout will surface missing handles per-item */ }
        }
      }
    }
    watchdogTimer = setInterval(() => {
      if (popoutActive.value && Date.now() - lastPopoutBeatMs > 5000) {
        popoutActive.value = false // pop-out closed; this window may drive again
      }
    }, 2000)
  }
})

onBeforeUnmount(() => {
  if (heartbeatTimer !== undefined) clearInterval(heartbeatTimer)
  if (watchdogTimer !== undefined) clearInterval(watchdogTimer)
  channel?.close()
})

// -- display helpers ----------------------------------------------------------

const overallPercent = computed(() =>
  stats.value.bytesTotal === 0 ? 0 : Math.round((stats.value.bytesUploaded / stats.value.bytesTotal) * 100))

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const formatRate = (bps: number): string => {
  if (bps <= 0) return '—'
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(0)} KB/s`
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`
}
</script>