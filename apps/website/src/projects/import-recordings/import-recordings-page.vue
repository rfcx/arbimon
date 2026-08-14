<template>
  <!-- SAME padding in both modes (2026-08-14). The uploader tab used to use a
       flat `p-6` because it was a chromeless popup window with no sidebar to
       clear. Now that it keeps the sidebar (a tab with no navigation is a dead
       end), it needs the SAME left clearance every other project page uses —
       `pl-18`/`pl-23` is exactly that gutter, and without it the content slides
       underneath the sidebar. -->
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10) pb-20">
    <div class="flex items-start justify-between">
      <div>
        <!-- The PROJECT is the primary header; the task is the sub-header. The
             project you are uploading into is the thing that orients the user
             (and the thing that differs between uploader tabs). -->
        <h1 class="mt-6">
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
        title="Open the uploader in its own tab"
        @click="popOut"
      >
        Open in New Tab
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
        title="Close this tab (uploads resume in your other Arbimon tab)"
        @click="closePopout"
      >
        ✕ Close tab
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

    <!-- Uploader-tab placeholder (operator 2026-08-14). The uploader is stateful,
         so only ONE tab drives a given project at a time. When an uploader tab
         owns this project the original tab shows this instead of a second,
         competing uploader — and it must be ACTIONABLE, because a browser will
         not tell us whether focusing that tab actually worked. `window.open`
         with the same tab NAME re-focuses the existing tab rather than opening
         a second one, so the button is safe to press repeatedly. -->
    <!-- Popup blocked: fall back to the FULL inline uploader (see onMounted).
         Import must never be a dead button. -->
    <div
      v-else-if="popoutBlocked && !isPopout && !popoutActive"
      class="mt-6 rounded-lg border border-flamingo/30 bg-flamingo/10 px-4 py-3 text-sm"
    >
      <p class="text-insight">
        Your browser blocked the uploader tab, so it’s running here instead.
      </p>
      <p class="text-cloud mt-1">
        Allow pop-ups for this site to keep uploads in their own tab, or
        <button
          class="text-frequency hover:underline"
          @click="focusPopout"
        >try opening it again</button>.
      </p>
    </div>

    <div
      v-else-if="popoutActive && !isPopout"
      class="mt-6 rounded-lg border border-frequency/30 bg-frequency/10 px-4 py-4 text-sm"
    >
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div class="flex items-start gap-x-3">
          <svg
            viewBox="0 -960 960 960"
            class="w-5 h-5 fill-frequency shrink-0 mt-0.5"
          ><path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-440H180v440Z" /></svg>
          <div>
            <p class="text-insight font-medium">
              This project’s uploader is open in another tab
            </p>
            <p class="text-cloud mt-0.5">
              Uploads keep running there. Switch to that tab to review or control them.
            </p>
          </div>
        </div>
        <button
          class="btn btn-primary text-sm inline-flex items-center gap-x-2 ml-auto"
          @click="focusPopout"
        >
          <svg
            viewBox="0 -960 960 960"
            class="w-4 h-4 fill-current"
          ><path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z" /></svg>
          Go to the uploader tab
        </button>
      </div>
      <p
        v-if="focusAttempted"
        class="text-xs text-cloud mt-3"
      >
        If nothing happened, look along your browser’s tab strip for
        “{{ popoutWindowTitle }}” — it may be in another browser window.
      </p>
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

        <!-- Panel order (operator 2026-08-14), left to right:
             Complete · Imported · Errors · Duplicates · Upload Rate · Uploaded.
             Outcome counts first (what happened to my recordings), throughput
             last (how fast it is going) — so the eye reads results before
             mechanics. -->
        <div class="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Complete</span>
            <span class="text-xl tabular-nums font-medium">
              {{ projectProgress.done }}/{{ projectProgress.total }}
              <span class="text-sm text-cloud">({{ overallPercent }}%)</span>
            </span>
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
            <span class="text-xs text-cloud uppercase tracking-wide">Upload Rate</span>
            <span class="text-xl tabular-nums font-medium">{{ formatRate(currentRateBps) }}</span>
          </div>
          <div class="rounded-lg border border-cloud/20 bg-moss/30 px-4 py-2.5 flex flex-col justify-center">
            <span class="text-xs text-cloud uppercase tracking-wide">Uploaded</span>
            <span class="text-xl tabular-nums font-medium">{{ formatBytes(metrics.bytesTransferred) }}</span>
          </div>
        </div>

        <!-- Reset the CUMULATIVE counters (operator 2026-08-14). Deliberately
             separated from the panels by its own column so it cannot be
             mistaken for a metric, and it asks for confirmation because the
             counters are persisted per project and cannot be recovered.
             It does NOT touch the upload queue — see resetProjectMetrics(). -->
        <button
          class="shrink-0 rounded-lg border border-cloud/20 bg-moss/30 px-3 text-cloud hover:(text-flamingo border-flamingo/40) transition-colors inline-flex flex-col items-center justify-center gap-y-1"
          title="Reset the Imported / Errors / Duplicates / Uploaded totals for this project. Does not affect the upload queue."
          aria-label="Reset metrics"
          @click="onResetMetrics"
        >
          <svg viewBox="0 0 16 16" class="w-5 h-5 fill-none stroke-current" stroke-width="1.6"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="text-xs">Reset</span>
        </button>
      </div>

      <!-- Options row: Add-site button on the LEFT; the SESSION-WIDE settings
           (timezone method + FLAC toggle) justified RIGHT (operator
           2026-08-13). ml-auto on the settings group does the split. -->
      <div class="mt-5 flex flex-wrap gap-x-6 gap-y-3 items-center relative">
        <!-- Expand/Collapse ALL: an icon button in the LEFT MARGIN, on the same
             row as (and just left of) 'Add Recordings to a Site'. Positioned
             ABSOLUTELY so it hangs in the gutter without being a flex item —
             as a flex child it both consumed row width (pushing 'Add
             Recordings' off the content edge) and centre-aligned to its own
             smaller height, sitting ~11px below the button. h-9 matches the
             button height so it centres against it. -ml-7 w-7 mirrors the
             section carets' geometry, keeping it on the caret column below.
             Icons are Gmail's own glyphs (-960 960 Material viewBox). Only
             shown once there are ≥2 linked sections. -->
        <button
          v-if="linkedBoxCount >= 2"
          class="absolute -ml-7 w-7 h-9 shrink-0 inline-flex items-center justify-center text-cloud hover:text-frequency"
          :title="anyBoxExpanded ? 'Collapse all Upload Queue Sections' : 'Expand all Upload Queue Sections'"
          :aria-label="anyBoxExpanded ? 'Collapse all' : 'Expand all'"
          @click="toggleAllBoxes"
        >
          <svg
            v-if="anyBoxExpanded"
            viewBox="0 -960 960 960"
            class="w-5 h-5 fill-current"
          ><path d="M289-95l-50-50L480-387L721-145L671-95L480-285L289-95ZM480-573L239-815l50-50L480-675L671-865l50,50L480-573Z" /></svg>
          <svg
            v-else
            viewBox="0 -960 960 960"
            class="w-5 h-5 fill-current"
          ><path d="M480-95L239-337l50-50l191,190l191-190l50,50L480-95ZM289-575l-50-50l241-242l241,242l-50,50l-191-190L289-575Z" /></svg>
        </button>
        <button
          class="btn btn-primary text-sm inline-flex items-center gap-x-2"
          :disabled="hasUnlinkedBox"
          :title="hasUnlinkedBox ? 'Pick a site for the new section above first' : 'Add an Upload Queue Section for a site'"
          @click="addUnlinkedBox"
        >
          <svg
            viewBox="0 0 16 16"
            class="w-3.5 h-3.5 fill-current"
          ><path d="M7 2h2v5h5v2H9v5H7V9H2V7h5V2z" /></svg>
          Add Recordings to a Site
        </button>
        <!-- Session settings moved into a modal (operator 2026-08-14): the
             timezone selector and FLAC toggle crowded this row and left no
             room to explain either. A single gear keeps the row calm and
             gives later settings somewhere obvious to live. -->
        <div class="ml-auto flex items-center">
          <!-- Weighted to MATCH its neighbour (operator 2026-08-14: the first
               attempt was "tiny and weird"). Two things were wrong: it was a
               bare text link sitting beside a real pill button, so it read as
               an afterthought rather than a peer control; and the gear was a
               hand-rolled path that did not match the app's glyphs.
               Now uses the repo's `btn-icon` shortcut (same pill geometry and
               frequency/chirp hover as the other buttons) and the Material
               `0 -960 960 960` settings glyph, which is the convention the
               collapse/expand carets in this same row already follow. -->
          <button
            class="btn-icon text-sm inline-flex items-center gap-x-2 !py-3"
            title="Uploader Settings"
            aria-label="Uploader Settings"
            @click="showSettings = true"
          >
            <!-- 4/4.5 (16-18px), matching the Add button's 14px glyph rather than
                 the 20px carets: an icon noticeably larger than its label's
                 cap-height is what made the first version read as "weird". -->
            <svg
              viewBox="0 -960 960 960"
              class="w-4 h-4 fill-current"
            ><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z" /></svg>
            Settings
          </button>
        </div>
      </div>

      <uploader-settings-modal
        v-if="showSettings"
        :timezone-mode="timezoneMode"
        :flac-enabled="flacEncodeEnabled"
        :flac-info-text="FLAC_INFO_TEXT"
        @close="showSettings = false"
        @update:timezone-mode="onTimezoneModeChange"
        @update:flac-enabled="flacEncodeEnabled = $event"
      />

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
        v-for="box in siteBoxes"
        :key="box.boxId"
      >
        <!-- No <hr> between sections: each Upload Queue Section now carries its
             OWN top+bottom border (2026-08-13), so a separator here would
             stack a third rule between adjacent sections. -->
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
            :site-info="box.streamId !== undefined ? siteInfoFor(box.streamId) : undefined"
            @toggle-collapsed="toggleBoxCollapsed(box.boxId)"
            @edit-datetime="applyDatetimeEdit"
            @remove-box="removeSiteBox(box.boxId)"
            @site-chosen="linkBoxToSite(box.boxId, $event)"
            @clear-completed="box.streamId !== undefined && clearCompleted(box.streamId)"
            @retry-failed="box.streamId !== undefined && retryFailed(box.streamId)"
            @clear-selected="clearSelected"

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
                  Select a site above to enable this section.
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
        :title="hasUnlinkedBox ? 'Pick a site for the new section above first' : 'Add an Upload Queue Section for a site'"
        aria-label="Add Recordings to a Site"
        @click="addUnlinkedBox"
      >
        <span class="text-lg inline-flex items-center gap-x-2 justify-center">
          <svg
            viewBox="0 0 16 16"
            class="w-4 h-4 fill-current shrink-0"
          ><path d="M7 2h2v5h5v2H9v5H7V9H2V7h5V2z" /></svg>
          Add Recordings to a Site
        </span>
        <span class="block text-sm text-cloud mt-2">
          Each site gets its own Upload Queue Section — drop recordings into the section for the site they belong to. Sections upload in parallel.
        </span>
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { apiArbimonFindRecordingAtExactTime, apiArbimonResolveRecordingId } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SiteResponse, apiArbimonGetSites } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type TimezoneMode, type UploadItem, analyzeFile, collectDroppedFiles, createUploadItem, isSupportedAudioFile } from '@rfcx-bio/upload-engine'

import StagingTable from '@/_components/upload-panel/staging-table.vue'
import UploaderSettingsModal from '@/_components/upload-panel/uploader-settings-modal.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { track } from '~/analytics'
import { useStore } from '~/store'
import { bindProjectMetrics, currentRateBps, engine, engineRunning, fileSource, flacEncodeEnabled, items, livePopouts, projectMetrics, refreshItems, registerAsPopout, releasePopoutClaim, requestFileHandles, resetProjectMetrics } from '~/upload'

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
    // A hand-corrected row is the USER'S decision — a mode change must not
    // silently clobber it. (Retry-after-edit still re-enters normally.)
    if (item.timezoneSource === 'manual') continue
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

/** Copy for the "i" tooltip beside the Pre-Convert WAV to FLAC checkbox.
 * Lives here rather than inline so the template stays readable; the tooltip
 * component renders it as plain text (no HTML entities). */
const FLAC_INFO_TEXT = 'When you add WAV audio files, this uploader may pre-encode the files from WAV to a lossless FLAC format prior to upload. This can reduce your upload time by as much as 50% on slower connections, but it will make use of your computer\u2019s CPU for the encoding. You can disable this feature at any time.'

// -- Site-queue collapse (PAGE-owned, lifted from staging-table 2026-08-13) --
// A Set of collapsed boxIds; absence = expanded. Page-level ownership is what
// lets the options row's expand/collapse-all control drive every box.
const showSettings = ref(false)

/** Modal -> page bridge for the timezone selector. A `$event as TimezoneMode`
 * cast in the template is a vue-eslint PARSING error (the template parser has
 * no TS), so the narrowing happens here instead. */
const onTimezoneModeChange = (value: string): void => {
  timezoneMode.value = value as TimezoneMode
}
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

/** Site facts for a section's title line: how many recordings the site already
 * holds and the datetime range they span. Both come from the sites API's count
 * aggregate (requires count: true — see loadSites). */
const siteInfoFor = (streamId: string): { recCount: number, firstRecordingAt?: string, lastRecordingAt?: string } | undefined => {
  const site = siteById(streamId)
  if (site === undefined) return undefined
  return {
    recCount: site.rec_count ?? 0,
    firstRecordingAt: typeof site.first_recording_at === 'string' ? site.first_recording_at : undefined,
    lastRecordingAt: typeof site.last_recording_at === 'string' ? site.last_recording_at : undefined
  }
}

/** Apply a hand-corrected date/time to a staged row. timezoneSource 'manual'
 * marks it as the user's decision — the mode-change re-analysis skips it. */
const applyDatetimeEdit = async (edit: { id: string, localWallTime: string, timestampUtc: string, timezoneName: string }): Promise<void> => {
  await engine.updateStaged(edit.id, {
    localWallTime: edit.localWallTime,
    timestampUtc: edit.timestampUtc,
    timezoneName: edit.timezoneName,
    timezoneSource: 'manual',
    analysisError: undefined
  })
  await refreshItems()
}

const addUnlinkedBox = (): void => {
  if (hasUnlinkedBox.value) return // one pending box at a time
  // APPEND, don't prepend (operator 2026-08-14). A new section is created by a
  // button at the BOTTOM of the stack, so putting the section at the top made
  // it appear away from where the user clicked — and pushed the existing
  // sections down. It now lands last, directly above that button.
  //
  // Collapsing the others is part of the same intent: with several sites open,
  // a new empty section appended to the bottom could be off-screen entirely.
  // Collapsing everything else brings it into view and makes it the obvious
  // focus, without destroying any state (collapse is display-only).
  const boxId = `box-${Date.now().toString(36)}`
  collapsedBoxIds.value = new Set(
    siteBoxes.value.filter(b => b.streamId !== undefined).map(b => b.boxId)
  )
  siteBoxes.value = [...siteBoxes.value, { boxId }]
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
  // count: true is REQUIRED for rec_count / first_recording_at /
  // last_recording_at — without it the server skips the aggregate entirely and
  // every site reports 0 existing recordings (which is what the header showed
  // before 2026-08-13).
  const response = await apiArbimonGetSites(apiClientArbimon, projectSlug.value, { count: true })
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
  //    (site, timestamp) means the server WILL reject the upload — surface
  //    that verdict at staging time instead of after Start.
  //
  //    Verified against Core 2026-08-13 (core/internal/ingest/get.js + its
  //    own int tests): the stream-source-file lookup is keyed on sha1 AND
  //    start. A match returns the file (→ 'Duplicate.'); a MISS with a
  //    segment already at that instant returns 403 'There is another file
  //    with the same timestamp' (→ 'Invalid.'). So a timestamp collision is
  //    rejected EITHER WAY — knowing only (site, timestamp) is enough to
  //    predict rejection; we just cannot name which of the two it will be.
  //    (An earlier version of this comment claimed a different checksum
  //    yields 'Invalid.' via the same lookup; it actually never matches the
  //    lookup at all and is caught by the 403 branch.)
  //
  //    The one exception is availability === 0 (the existing file was
  //    deleted), where the server ALLOWS a re-ingest. That is precisely why
  //    duplicate rows keep a ↻ Retry override rather than being terminal.
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
        // EXACT match: the nearest-at-or-before variant matches the site's
        // newest recording for ANY later timestamp, so it flagged every
        // genuinely-new file as a duplicate (fixed 2026-08-13).
        const recordingId = await apiArbimonFindRecordingAtExactTime(
          apiClientArbimon, projectSlug.value, item.streamId, item.timestampUtc)
        if (recordingId !== undefined) {
          const ok = await engine.markDuplicateIfStaged(id, 'This site already has a recording at this date and time — use ↻ Retry to upload anyway')
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

/**
 * Start/Pause colours (operator 2026-08-14: the non-idle states were not
 * readable).
 *
 * MEASURED in the live browser with Playwright hover(), reading COMPUTED
 * styles — not inferred from class names, and not simulated by re-applying
 * utility classes (a shortcut's baked-in hover rule cannot be reproduced that
 * way; my first attempt did exactly that and reported a false 1.08:1 for the
 * hover state).
 *
 * What the OLD `btn-secondary` Pause actually measured:
 *   rest : frequency on TRANSPARENT over moss   13.91:1
 *   hover: pitch on chirp                       17.82:1
 *
 * So the numbers pass WCAG — the real problem is that Pause was an OUTLINE
 * button (transparent fill, green text) sitting beside a SOLID green Start.
 * Against the dark page it reads as low-emphasis/disabled rather than as the
 * active control, and it changes its entire treatment on hover (outline →
 * solid), which is why it felt unreadable and unusable in practice. Contrast
 * ratio alone does not capture "looks switched off".
 *
 * Fix, inside the house palette: Pause is now a FILLED chirp button with pitch
 * text (17.82:1) hovering to frequency (16.57:1) — the same dark-on-bright
 * treatment Start already uses, so the two read as ONE control changing state
 * rather than two unrelated buttons, while chirp vs frequency keeps them
 * distinguishable at a glance. Both states now stay solid on hover.
 */
const startPauseClass = computed(() => {
  if (buttonMode.value === 'inert') return 'border border-cloud/20 bg-moss/20 text-cloud/50 cursor-default'
  if (buttonMode.value === 'pause') return 'bg-chirp text-pitch hover:bg-frequency focus:ring-4 focus:ring-chirp'
  return 'bg-frequency text-pitch hover:bg-chirp focus:ring-4 focus:ring-chirp'
})

/**
 * Reset the cumulative metrics (operator 2026-08-14). Confirms first: the
 * counters are PERSISTED per project in localStorage, so a mis-click would
 * discard a running session's totals with no way to recover them.
 *
 * Scope is the counters only — the upload queue and every section are
 * untouched, so "Complete" (derived live from queue rows) keeps its value.
 * That asymmetry is intentional and is spelled out in the confirm text.
 */
const onResetMetrics = (): void => {
  const confirmed = window.confirm(
    'Reset the Imported, Errors, Duplicates and Uploaded totals for this project?\n\n' +
    'Your recordings and the upload queue are not affected.'
  )
  if (!confirmed) return
  resetProjectMetrics()
  track('web_upload_metrics_reset', { project: projectSlug.value })
}

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

const clearSelected = async (ids: string[]): Promise<void> => {
  for (const id of ids) await engine.remove(id)
  await refreshItems()
}

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

// -- uploader tab (per-project; coordination lives in ~/upload) ---------------
// Each project can have its OWN uploader tab: unique tab name per slug, and the
// singleton's scope machinery partitions the queue — an uploader tab drives
// only its project's items while other tabs drive the rest. No wholesale pause.
//
// TAB, NOT A STANDALONE WINDOW (operator 2026-08-14): this used to open a
// chromeless popup window (`popup=yes,width=,height=`). A tab is easier to
// manage — it lives in the normal tab strip, survives window management, is
// far less likely to be blocked, and needs no OS-level window hunting. The
// underlying mechanism is unchanged (`window.open` with a stable NAME, so a
// second call re-uses the existing tab); only the popup FEATURES argument is
// dropped, which is precisely what makes a browser choose a tab over a window.

const popoutActive = computed(() => livePopouts.value.has(projectSlug.value))

/**
 * Tab title for the uploader (operator 2026-08-14).
 *
 * Requirements it has to satisfy:
 *  - not confusable with ordinary SPA pages (which are titled “Arbimon”), and
 *  - not confusable with an uploader tab for a DIFFERENT project, since a user
 *    may legitimately run several at once (the engine partitions the queue by
 *    project, so this is a supported state, not an edge case).
 *
 * Hence: role first, then the project name, then the product. This matters MORE
 * as a tab than it did as a window: a tab strip truncates titles far harder
 * than a taskbar, so the distinguishing part has to come first — a user with
 * several uploader tabs open sees “Uploading — Boger…” and can still tell them
 * apart. The project NAME is used rather than the slug — it is what the user
 * recognises. Falls back to the slug before the name has loaded.
 */
const popoutWindowTitle = computed(() =>
  `Uploading — ${projectName.value ?? projectSlug.value} — Arbimon`)

/** True once the user has pressed “Go to the uploader tab” at least once. */
const focusAttempted = ref(false)

/** One auto-launch attempt per visit to this route (see onMounted). */
const autoLaunchTried = ref(false)

/**
 * Set when `window.open` returned null — i.e. the browser blocked it.
 * The page then renders the FULL inline uploader instead of the placeholder,
 * so Import still works. Without this the nav would appear to do nothing.
 *
 * Kept even though a TAB is much less likely to be blocked than a popup: some
 * browsers/extensions still block script-opened tabs that are not tied to a
 * user gesture, and the auto-launch on mount is exactly that case.
 */
const popoutBlocked = ref(false)

/**
 * Open OR re-focus the uploader tab. Passing the same tab NAME means a second
 * call re-uses (and focuses) the existing tab rather than opening another, so
 * this is safe to press repeatedly.
 *
 * ⚠️ A page CANNOT reliably detect whether focus actually moved: the returned
 * handle is non-null even when the browser declines to switch tabs, and
 * `focus()` is widely ignored for background tabs. So we do not pretend to
 * know — we attempt it, then surface a hint naming the tab title so the user
 * can find it themselves.
 */
const focusPopout = (): void => {
  focusAttempted.value = true
  const handle = openPopoutWindow()
  try { handle?.focus() } catch { /* browsers may refuse; the hint covers it */ }
}

/**
 * NOTE the deliberately ABSENT third argument. `window.open(url, name)` with no
 * features string opens a TAB; supplying any feature list (the old
 * `popup=yes,width=1280,height=860`) is what asks for a standalone popup
 * WINDOW. That single omission is the whole tab-vs-window switch — the stable
 * per-project NAME is retained, so re-use/re-focus behaviour is unchanged.
 */
const openPopoutWindow = (): Window | null => {
  const url = `${window.location.origin}/p/${projectSlug.value}/import-recordings?popout=1`
  return window.open(url, `arbimon-uploader-${projectSlug.value}`)
}

const popOut = (): void => {
  openPopoutWindow()
}

const closePopout = (): void => {
  // window.close() works because the tab was opened by script (same origin,
  // named). Openers notice the heartbeat stop within ~5s, clear the banner,
  // and resume driving this project's items.
  window.close()
}

onMounted(() => {
  if (isPopout.value) {
    registerAsPopout(projectSlug.value)
    requestFileHandles(projectSlug.value)
    return
  }
  // UPLOADER-TAB-FIRST (operator 2026-08-14): arriving from the Import nav
  // opens the uploader in its own TAB, so the stateful uploader stops competing
  // with SPA navigation. The original tab then shows the launcher/placeholder.
  //
  // Guards, in order of importance:
  //  - only auto-launch ONCE per page visit (autoLaunchTried), so returning to
  //    this route does not spawn or re-focus repeatedly;
  //  - never auto-launch if a pop-out for this project is ALREADY live — the
  //    placeholder handles that case and re-opening could steal focus;
  //  - never auto-launch for a view-only project (nothing to upload);
  //  - a BLOCKED open returns null, which we surface rather than swallow:
  //    the page falls back to the full inline uploader so Import is never a
  //    dead button. Far rarer for a tab than it was for a popup window, but
  //    a script-opened tab with no user gesture can still be refused.
  if (isProjectViewOnly.value) return
  if (autoLaunchTried.value) return
  autoLaunchTried.value = true
  if (popoutActive.value) return
  const handle = openPopoutWindow()
  if (handle === null) {
    popoutBlocked.value = true
    track('web_upload_popout_blocked', { project: projectSlug.value })
  }
})

/**
 * Release the per-tab uploader claim when this page goes away.
 *
 * NEW REQUIREMENT UNDER THE TAB MODEL. A chromeless popup window had no
 * navigation, so the claim could only end by closing the document. A TAB sits
 * inside the full app, so the user can navigate to any other page — and the
 * claim, which lives in the upload SINGLETON rather than in this component,
 * would otherwise outlive the page: this tab would stay scoped to one project
 * (driving nothing else) while every other tab kept excluding that project on
 * the strength of a heartbeat nobody is listening to any more. Stalled queue,
 * no visible cause.
 *
 * Closing the tab still works as before — the document dies and the heartbeat
 * simply stops.
 */
onUnmounted(() => {
  if (isPopout.value) releasePopoutClaim()
})

// Title the uploader tab (operator 2026-08-14). Set reactively rather than
// once on mount: `projectName` arrives from the store asynchronously, so a
// mount-time write would leave the slug showing. Only the UPLOADER TAB is
// retitled — the original tab keeps the app's normal title.
watchEffect(() => {
  if (!isPopout.value) return
  document.title = popoutWindowTitle.value
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
