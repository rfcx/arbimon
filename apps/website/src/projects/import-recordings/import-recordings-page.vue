<template>
  <section :class="isPopout ? 'p-6' : 'pt-20 pl-18 pr-6 md:(pl-23 pr-10) pb-20'">
    <div class="flex items-start justify-between">
      <div>
        <!-- The PROJECT is the primary header; the task is the sub-header. The
             project you are uploading into is the thing that orients the user
             (and the thing that differs between pop-out windows). -->
        <h1 :class="isPopout ? 'text-2xl' : 'mt-6'">
          {{ projectName ?? 'Project' }}
        </h1>
        <h2 class="text-lg font-semibold mt-1">
          Upload &amp; Import Recordings
          <!-- Generic "NEW" chip: intentionally not uploader-specific so the
               same treatment can flag other new features elsewhere. -->
          <span class="text-xs align-middle rounded bg-frequency/20 text-frequency px-2 py-0.5 ml-2 font-medium tracking-wide">NEW</span>
        </h2>
      </div>
      <button
        v-if="!isPopout"
        class="btn btn-secondary text-sm mt-6 whitespace-nowrap inline-flex items-center gap-x-2"
        title="Open the uploader in its own window"
        @click="popOut"
      >
        Pop-Out in New Window
        <!-- Material Symbols "open in new" (the Gmail pop-out glyph);
             -960-based viewBox per the Material icon coordinate system -->
        <svg
          viewBox="0 -960 960 960"
          class="w-4 h-4 fill-current"
        ><path d="M216-144q-29.7 0-50.85-21.15T144-216v-528q0-29.7 21.15-50.85T216-816h264v72H216v528h528v-264h72v264q0 29.7-21.15 50.85T744-144H216Zm171-192-51-51 357-357H576v-72h240v240h-72v-117L387-336Z" /></svg>
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

    <!-- Intro copy sits OUTSIDE the header flex row so it spans the FULL page
         width. Inside that row it was boxed in by the Pop-Out button beside it
         (measured 921px of a 1306px viewport), which removing max-w-4xl alone
         did not fix. -->
    <p class="text-sm text-cloud mt-3">
      Upload recordings from directly within your browser. Metadata from your recordings and project data are used to match each recording to the correct date, time and timezone and to scan for duplicate recordings within a Site. You&rsquo;ll have a chance to review and correct the dates, times and timezones of your recordings before they&rsquo;re uploaded. Then, click &ldquo;Start&rdquo; to launch the upload.
      <!-- Background-uploads sentence: copy is deliberately honest about the
           tab-close case — the queue persists (IndexedDB) but file handles
           cannot survive a closed tab, so those items need re-adding
           (verified in engine.prepareOne). -->
      Uploads continue in the background while you browse other pages in Arbimon; if you close this tab, you&rsquo;ll be asked to re-add your recordings to finish &mdash; anything already uploaded is skipped.
    </p>

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

        <div class="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Complete</span>
            <span class="text-xl tabular-nums font-medium">
              {{ projectProgress.done }}/{{ projectProgress.total }}
              <span class="text-sm text-cloud">({{ overallPercent }}%)</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Options row: Add-site button + the SESSION-WIDE settings (timezone
           method + FLAC toggle). Timezone moved up from the per-box header
           2026-08-13 (operator) — one method for the whole session. -->
      <div class="mt-5 flex flex-wrap gap-x-6 gap-y-3 items-center">
        <button
          class="btn btn-primary text-sm inline-flex items-center gap-x-2"
          :disabled="hasUnlinkedBox"
          :title="hasUnlinkedBox ? 'Pick a site for the new box above first' : 'Add an upload box for another site'"
          @click="addUnlinkedBox"
        >
          <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M7 2h2v5h5v2H9v5H7V9H2V7h5V2z" /></svg>
          Add Recordings to another Site
        </button>
        <label class="flex items-center gap-x-2 text-sm text-cloud">
          Determine Timezone(s):
          <select
            v-model="timezoneMode"
            class="rounded border-cloud/30 bg-pitch text-insight px-2 py-1 text-sm"
          >
            <option value="auto">
              Automatically
            </option>
            <option value="site">
              By Site Timezone
            </option>
            <option value="utc">
              UTC
            </option>
            <option value="metadata">
              Scan Recording File Metadata
            </option>
          </select>
        </label>
        <div class="flex items-center gap-x-1.5">
          <label class="flex items-center gap-x-2 text-sm cursor-pointer select-none">
            <input
              v-model="flacEncodeEnabled"
              type="checkbox"
              class="rounded border-cloud/40 bg-pitch"
            >
            Pre-Convert WAV to FLAC
          </label>
          <!-- Long-form explanation lives in a modal rather than a tooltip:
               the copy is a full paragraph, which flowbite tooltips (used for
               one-liners elsewhere) handle badly. Icon matches the app's
               `icon-custom-ic-info` treatment used by icon-i-info.vue. -->
          <button
            type="button"
            class="inline-flex items-center justify-center text-insight hover:text-frequency transition-colors"
            title="About WAV to FLAC pre-conversion"
            aria-label="More information about WAV to FLAC pre-conversion"
            @click="showFlacInfo = true"
          >
            <icon-custom-ic-info class="h-4 w-4 cursor-pointer" />
          </button>
        </div>
        <!-- Gmail-style expand/collapse ALL site queues. Tri-state label:
             if ANY box is expanded the action is Collapse all, else Expand
             all. Only shown once there are ≥2 linked boxes to act on. -->
        <button
          v-if="linkedBoxCount >= 2"
          class="btn btn-secondary text-sm inline-flex items-center gap-x-1.5"
          :title="anyBoxExpanded ? 'Collapse all site queues' : 'Expand all site queues'"
          @click="toggleAllBoxes"
        >
          <svg
            v-if="anyBoxExpanded"
            viewBox="0 0 16 16"
            class="w-3.5 h-3.5 fill-none stroke-current"
            stroke-width="1.8"
          ><path d="M3 6.5L8 2l5 4.5M3 13.5L8 9l5 4.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <svg
            v-else
            viewBox="0 0 16 16"
            class="w-3.5 h-3.5 fill-none stroke-current"
            stroke-width="1.8"
          ><path d="M3 2.5L8 7l5-4.5M3 9.5L8 14l5-4.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          {{ anyBoxExpanded ? 'Collapse all' : 'Expand all' }}
        </button>
        </div>

      <!-- WAV->FLAC explainer modal -->
      <div
        v-if="showFlacInfo"
        class="fixed inset-0 z-[9999] isolate flex items-center justify-center bg-pitch/60"
        @click.self="showFlacInfo = false"
      >
        <div class="bg-moss rounded-xl shadow-lg max-w-lg w-full p-6 mx-4">
          <div class="flex flex-col gap-y-4">
            <div class="flex flex-row items-center justify-between">
              <h2 class="text-2xl font-header">
                Pre-Convert WAV to FLAC
              </h2>
              <button
                type="button"
                title="Close"
                @click="showFlacInfo = false"
              >
                <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
              </button>
            </div>
            <p class="text-sm text-cloud">
              When you add WAV audio files, this uploader may pre-encode the files from WAV to a lossless FLAC format prior to upload. This can reduce your upload time by as much as 50% on slower connections, but it will make use of your computer&rsquo;s CPU for the encoding. You can disable this feature at any time.
            </p>
            <div class="flex justify-end">
              <button
                class="btn btn-primary btn-medium px-4 py-2"
                @click="showFlacInfo = false"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- hidden file input; routed to whichever box requested the picker -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".wav,.flac,.opus"
        class="hidden"
        @change="onPick"
      >

      <!-- Per-site upload boxes, newest on top. Each box is a complete unit:
           header (site name) + filters + table + its OWN drag/drop intake.
           A drop into a box stages files for THAT box's site — the moment of
           association is where you dropped, not a page-level selector. -->
      <template
        v-for="(box, boxIndex) in siteBoxes"
        :key="box.boxId"
      >
        <hr
          v-if="boxIndex > 0"
          class="mt-6 border-cloud/20"
        >
        <div
          @dragenter.prevent="box.streamId !== undefined && boxDragEnter(box.streamId)"
          @dragover.prevent
          @dragleave.prevent="box.streamId !== undefined && boxDragLeave(box.streamId)"
          @drop.prevent="box.streamId !== undefined && boxDrop(box.streamId, $event)"
        >
        <staging-table
          :items="box.streamId !== undefined ? itemsForBox(box.streamId) : []"
          :site-name="box.siteName"
          :site-timezone="box.siteTimezone"
          :timezone-mode="timezoneMode"
          :site-options="siteOptions"
          :opening-id="openingVisualizerId"
          :flac-enabled="flacEncodeEnabled"
          :drop-active="box.streamId !== undefined && dragBoxId === box.streamId"
          :collapsed="collapsedBoxIds.has(box.boxId)"
          @toggle-collapsed="toggleBoxCollapsed(box.boxId)"
          @remove-box="removeSiteBox(box.boxId)"
          @site-chosen="linkBoxToSite(box.boxId, $event)"
                    @clear-completed="box.streamId !== undefined && clearCompleted(box.streamId)"
          @retry-failed="box.streamId !== undefined && retryFailed(box.streamId)"
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
              class="border-t border-dashed px-6 py-6 text-center transition-colors"
              :class="box.streamId !== undefined && dragBoxId === box.streamId ? 'border-frequency bg-frequency/10' : 'border-cloud/30'"
            >
              <template v-if="box.streamId !== undefined">
                <p :class="itemsForBox(box.streamId).length === 0 ? 'text-lg' : 'text-base'">
                  Drag &amp; drop recordings for <span class="text-frequency">{{ box.siteName }}</span>
                </p>
                <p class="text-sm text-cloud mt-1">
                  .wav, .flac, .opus — analyzed locally and staged above before anything uploads
                </p>
                <button
                  class="btn btn-secondary mt-3 text-sm"
                  @click="pickFilesFor(box.streamId)"
                >
                  Or choose recordings…
                </button>
              </template>
              <p
                v-else
                class="text-cloud"
              >
                Select a site above to enable this box.
              </p>
            </div>
          </template>
        </staging-table>
        </div>
      </template>

      <!-- Add-a-site affordance. ALWAYS rendered, at the BOTTOM of the stack:
           it is the empty state when there are no boxes yet, and the “add
           another” target once boxes exist. Clicking anywhere in the box is
           equivalent to the header’s “Add Recordings to another Site” button — same
           handler, same disabled rule (one pending unlinked box at a time). It
           is a real <button> so it is keyboard-focusable and announced, rather
           than a div with a click handler. -->
      <button
        type="button"
        class="mt-6 w-full rounded-lg border-2 border-dashed px-6 py-12 text-center block transition-colors"
        :class="hasUnlinkedBox
          ? 'border-cloud/20 opacity-60 cursor-not-allowed'
          : 'border-cloud/40 cursor-pointer hover:border-frequency hover:bg-frequency/5 focus-visible:border-frequency focus-visible:bg-frequency/5'"
        :disabled="hasUnlinkedBox"
        :title="hasUnlinkedBox ? 'Pick a site for the new box above first' : 'Add an upload box for another site'"
        :aria-label="siteBoxes.length === 0
          ? 'Add Recordings to a Site'
          : 'Add Recordings to another Site'"
        @click="addUnlinkedBox"
      >
        <span class="text-lg inline-flex items-center gap-x-2 justify-center">
          <svg viewBox="0 0 16 16" class="w-4 h-4 fill-current shrink-0"><path d="M7 2h2v5h5v2H9v5H7V9H2V7h5V2z" /></svg>
          {{ siteBoxes.length === 0 ? 'Add Recordings to a Site' : 'Add Recordings to another Site' }}
        </span>
        <span class="block text-sm text-cloud mt-2">
          Each site gets its own upload box — drop recordings into the box for the site they belong to. Boxes upload in parallel.
        </span>
      </button>
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
import { bindProjectMetrics, currentRateBps, engine, engineRunning, fileSource, flacEncodeEnabled, items, livePopouts, projectMetrics, refreshItems, registerAsPopout, requestFileHandles } from '~/upload'

const route = useRoute()
const store = useStore()
const apiClientArbimon = inject(apiClientArbimonLegacyKey)

const projectSlug = computed(() => route.params.projectSlug as string)
const projectName = computed(() => store.project?.name)
const isProjectViewOnly = computed(() => store.project?.isLocked === true)

// The shared queue holds EVERY project's items; this page shows only its own.
// (Legacy items with no projectSlug — pre-partitioning — show everywhere
// rather than nowhere.)
const projectItems = computed(() =>
  items.value.filter(item => item.projectSlug === undefined || item.projectSlug === projectSlug.value))
const isPopout = computed(() => route.query.popout === '1')

// -- sites + per-site boxes ---------------------------------------------------

const sites = ref<SiteResponse[]>([])

/** One upload box per site, newest FIRST. A box starts UNLINKED
 * (streamId undefined — header shows the focused site selector) and links
 * on selection. */
interface SiteBox {
  boxId: string
  streamId?: string
  siteName?: string
  siteTimezone?: string
}
const siteBoxes = ref<SiteBox[]>([])

/** PAGE-LEVEL timezone method ("Determine Timezone(s):" on the options row —
 * moved up from per-box 2026-08-13, operator). One method for the whole
 * session; changing it RE-ANALYZES every staged row (see the watch below) so
 * the selector is never silently ignored for files already added. */
const timezoneMode = ref<TimezoneMode>('auto')

// Changing the method re-runs analysis on every STAGED row (pre-Start only —
// items already in the pipeline keep the timestamps they were signed with;
// re-dating a row mid-upload would desync it from its server registration).
// Guarded by a generation counter so a rapid double-change can't interleave
// two passes; file handles come from fileSource (present for staged rows —
// they were registered at enqueue and only released post-transcode/upload).
let reanalyzeGeneration = 0
watch(timezoneMode, async (mode) => {
  const generation = ++reanalyzeGeneration
  const staged = items.value.filter(item => item.state === 'staged' || item.state === 'analyzing')
  for (const item of staged) {
    if (generation !== reanalyzeGeneration) return // superseded by a newer change
    if (item.streamId === undefined) continue
    const site = siteById(item.streamId)
    const file = await fileSource.getFile(item.id)
    if (file === undefined) continue // handle gone (popped out / reloaded) — leave as-is
    const { patch } = await analyzeFile(item, file, {
      mode,
      siteTimezone: site?.timezone !== undefined && site?.timezone !== '' ? site.timezone : undefined,
      siteName: site?.name
    })
    await engine.updateStaged(item.id, patch)
  }
  await refreshItems()
})

/** WAV->FLAC explainer modal (the "i" beside the pre-convert checkbox). */
const showFlacInfo = ref(false)

// -- Site-queue collapse (PAGE-owned, lifted from staging-table 2026-08-13) --
// A Set of collapsed boxIds; absence = expanded. Page-level ownership is what
// lets the options row's expand/collapse-all control drive every box.
const collapsedBoxIds = ref<Set<string>>(new Set())
const toggleBoxCollapsed = (boxId: string): void => {
  const next = new Set(collapsedBoxIds.value)
  if (next.has(boxId)) next.delete(boxId)
  else next.add(boxId)
  collapsedBoxIds.value = next
}
const linkedBoxCount = computed(() => siteBoxes.value.filter(b => b.streamId !== undefined).length)
const anyBoxExpanded = computed(() =>
  siteBoxes.value.some(b => b.streamId !== undefined && !collapsedBoxIds.value.has(b.boxId)))
const toggleAllBoxes = (): void => {
  if (anyBoxExpanded.value) {
    // collapse everything that is linked
    collapsedBoxIds.value = new Set(siteBoxes.value.filter(b => b.streamId !== undefined).map(b => b.boxId))
  } else {
    collapsedBoxIds.value = new Set()
  }
}

const hasUnlinkedBox = computed(() => siteBoxes.value.some(box => box.streamId === undefined))

/** Options for a box's site selector — already-boxed sites grayed out. */
const siteOptions = computed(() =>
  sites.value.map(site => ({
    id: site.external_id,
    name: site.name,
    taken: siteBoxes.value.some(box => box.streamId === site.external_id)
  })))

const siteById = (streamId: string): SiteResponse | undefined =>
  sites.value.find(site => site.external_id === streamId)

const addUnlinkedBox = (): void => {
  if (hasUnlinkedBox.value) return // one pending box at a time
  siteBoxes.value = [
    { boxId: `box-${Date.now().toString(36)}` },
    ...siteBoxes.value
  ]
  // the box's own onMounted autofocuses its selector
}

const linkBoxToSite = (boxId: string, streamId: string): void => {
  const site = siteById(streamId)
  if (site === undefined) return
  if (siteBoxes.value.some(box => box.streamId === streamId)) return // taken guard
  siteBoxes.value = siteBoxes.value.map(box =>
    box.boxId === boxId
      ? {
          ...box,
          streamId: site.external_id,
          siteName: site.name,
          siteTimezone: site.timezone !== undefined && site.timezone !== '' ? site.timezone : undefined
        }
      : box)
}

const removeSiteBox = (boxId: string): void => {
  siteBoxes.value = siteBoxes.value.filter(box => box.boxId !== boxId)
}

const boxForStream = (streamId: string): SiteBox | undefined =>
  siteBoxes.value.find(box => box.streamId === streamId)

const itemsForBox = (streamId: string): UploadItem[] =>
  projectItems.value.filter(item => item.streamId === streamId)

const loadSites = async (): Promise<void> => {
  if (apiClientArbimon === undefined || projectSlug.value === undefined) return
  const response = await apiArbimonGetSites(apiClientArbimon, projectSlug.value, {})
  sites.value = (response ?? []).filter(site => site.external_id !== null && site.external_id !== '')
}

/** Boxes must exist for any site that already has queue items (restored
 * session / other-window activity) — else those rows would be invisible. */
const materializeBoxesFromQueue = (): void => {
  const known = new Set(siteBoxes.value.map(box => box.streamId).filter(id => id !== undefined))
  const additions: SiteBox[] = []
  for (const item of projectItems.value) {
    if (known.has(item.streamId)) continue
    known.add(item.streamId)
    const site = siteById(item.streamId)
    additions.push({
      boxId: `box-${item.streamId}`,
      streamId: item.streamId,
      siteName: item.siteName ?? site?.name ?? item.streamId,
      siteTimezone: site?.timezone !== undefined && site?.timezone !== '' ? site?.timezone : undefined
    })
  }
  if (additions.length > 0) siteBoxes.value = [...siteBoxes.value, ...additions]
}

watch(projectItems, materializeBoxesFromQueue)

// -- metrics binding ----------------------------------------------------------

const metrics = projectMetrics

// Escape closes the explainer modal (modal parity with the rest of the app).
const onFlacInfoKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape' && showFlacInfo.value) showFlacInfo.value = false
}
onMounted(() => { window.addEventListener('keydown', onFlacInfoKeydown) })
onBeforeUnmount(() => { window.removeEventListener('keydown', onFlacInfoKeydown) })

onMounted(async () => {
  await loadSites()
  bindProjectMetrics(projectSlug.value, store.user?.sub)
  await refreshItems()
  materializeBoxesFromQueue()
})

// -- staged intake (per-box) --------------------------------------------------

/** which box is currently drag-hovered (depth-counted per box) */
const dragBoxId = ref<string | undefined>(undefined)
let dragDepth = 0
const fileInput = ref<HTMLInputElement>()
/** the box whose choose-files button opened the picker */
let pickTargetStreamId: string | undefined

const boxDragEnter = (streamId: string): void => {
  if (dragBoxId.value !== streamId) dragDepth = 0
  dragBoxId.value = streamId
  dragDepth++
}

const boxDragLeave = (streamId: string): void => {
  if (dragBoxId.value !== streamId) return
  dragDepth--
  if (dragDepth <= 0) {
    dragDepth = 0
    dragBoxId.value = undefined
  }
}

const enqueueFiles = async (streamId: string, files: Array<{ file: File, relativePath: string }>): Promise<void> => {
  const site = siteById(streamId)
  if (site === undefined) return
  const siteTz = site.timezone !== undefined && site.timezone !== '' ? site.timezone : undefined
  const boxMode = timezoneMode.value
  const accepted = files.filter(({ file }) => isSupportedAudioFile(file.name))
  const pairs = accepted.map(({ file, relativePath }) => {
    const item = createUploadItem({
      filename: file.name,
      relativePath,
      fileSizeBytes: file.size,
      streamId,
      projectSlug: projectSlug.value,
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
    timezoneMode: boxMode
  })
  // Analyze with small concurrency — header reads are cheap but many files
  // shouldn't hammer the disk at once. Context is PER-BOX: this box's own
  // timezone method + its site's timezone.
  const context = {
    mode: boxMode,
    siteTimezone: siteTz,
    siteName: site.name
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
  // Two background advisories, fire-and-forget (failures leave items on the
  // normal Start path):
  // 1. prestage (non-WAV): sha1 + signed URL while parked — signing IS the
  //    dedup check, so those rows resolve NOW and Start fast-tracks them.
  void engine.prestage(pairs.map(pair => pair.item.id)).then(async () => { await refreshItems() })
  // 2. existence check (ALL files incl. WAVs): a recording already at this
  //    (site, timestamp) means the server WILL reject the upload (same
  //    checksum → Duplicate., different → Invalid.) — surface that verdict
  //    at staging time instead of after Start. Per-row Retry remains the
  //    override for the rare recoverable (availability=0) case.
  void checkExistingRecordings(pairs.map(pair => pair.item.id))
}

const checkExistingRecordings = async (ids: string[]): Promise<void> => {
  if (apiClientArbimon === undefined) return
  const CONCURRENCY = 4
  let index = 0
  let flagged = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, ids.length) }, async () => {
    while (index < ids.length) {
      const id = ids[index++]
      const item = items.value.find(i => i.id === id)
      if (item === undefined || item.state !== 'staged' || item.timestampUtc === undefined) continue
      try {
        const recordingId = await apiArbimonResolveRecordingId(
          apiClientArbimon, projectSlug.value, item.streamId, item.timestampUtc)
        if (recordingId !== undefined) {
          const ok = await engine.markDuplicateIfStaged(id, 'A recording already exists at this site + time')
          if (ok) flagged++
        }
      } catch { /* advisory only — the sign-time check remains authoritative */ }
    }
  })
  await Promise.all(workers)
  if (flagged > 0) await refreshItems()
}

const boxDrop = async (streamId: string, event: DragEvent): Promise<void> => {
  dragDepth = 0
  dragBoxId.value = undefined
  if (event.dataTransfer === null) return
  await enqueueFiles(streamId, await collectDroppedFiles(event.dataTransfer))
}

const pickFilesFor = (streamId: string): void => {
  pickTargetStreamId = streamId
  fileInput.value?.click()
}

const onPick = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  if (input.files === null || pickTargetStreamId === undefined) return
  await enqueueFiles(pickTargetStreamId, Array.from(input.files).map(file => ({ file, relativePath: file.name })))
  input.value = ''
  pickTargetStreamId = undefined
}

// -- global Start / Pause -----------------------------------------------------

const activePipeline = computed(() =>
  projectItems.value.filter(item =>
    ['queued', 'preparing', 'ready', 'signing', 'signed', 'uploading', 'uploaded'].includes(item.state)).length)

const startableCount = computed(() =>
  projectItems.value.filter(item => item.state === 'staged' && item.analysisError === undefined).length)

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
  if (startableCount.value > 0) {
    await engine.startStaged(
      projectItems.value
        .filter(item => item.state === 'staged' && item.analysisError === undefined)
        .map(item => item.id)
    )
  }
  engine.start()
  await refreshItems()
}

// -- table actions ------------------------------------------------------------

const clearCompleted = async (streamId: string): Promise<void> => {
  for (const item of itemsForBox(streamId).filter(i => i.state === 'ingested' || i.state === 'duplicate')) {
    await engine.remove(item.id)
  }
  await refreshItems()
}

const retryFailed = async (streamId: string): Promise<void> => {
  for (const item of itemsForBox(streamId).filter(i => ['failed', 'rejected', 'cancelled'].includes(i.state))) {
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

// -- pop-out (per-project; coordination lives in ~/upload) --------------------
// Each project can have its OWN pop-out: unique window name per slug, and the
// singleton's scope machinery partitions the queue — a pop-out drives only
// its project's items while main windows drive the rest. No wholesale pause.

const popoutActive = computed(() => livePopouts.value.has(projectSlug.value))

const popOut = (): void => {
  const url = `${window.location.origin}/p/${projectSlug.value}/import-recordings?popout=1`
  window.open(url, `arbimon-uploader-${projectSlug.value}`, 'popup=yes,width=1280,height=860')
}

const closePopout = (): void => {
  // window.close() works because the pop-out was opened by script (same
  // origin, named window). Openers notice the heartbeat stop within ~5s,
  // clear the banner, and resume driving this project's items.
  window.close()
}

onMounted(() => {
  if (isPopout.value) {
    registerAsPopout(projectSlug.value)
    requestFileHandles(projectSlug.value)
  }
})

// -- display helpers ----------------------------------------------------------

const projectProgress = computed(() => {
  let bytesTotal = 0
  let bytesUploaded = 0
  let done = 0
  for (const item of projectItems.value) {
    bytesTotal += item.fileSizeBytes
    if (item.state === 'uploaded' || item.state === 'ingested' || item.state === 'duplicate') {
      bytesUploaded += item.fileSizeBytes
    } else if (item.state === 'uploading' && item.progress !== undefined) {
      bytesUploaded += Math.floor(item.fileSizeBytes * item.progress)
    }
    if (item.state === 'ingested' || item.state === 'duplicate') done++
  }
  return { total: projectItems.value.length, done, bytesTotal, bytesUploaded }
})

// % accompanies the N/N Complete panel — count-based to match its ratio
const overallPercent = computed(() =>
  projectProgress.value.total === 0 ? 0 : Math.round((projectProgress.value.done / projectProgress.value.total) * 100))

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