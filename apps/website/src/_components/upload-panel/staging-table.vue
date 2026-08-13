<template>
  <!-- Top AND bottom borders bracket each Upload Queue Section. NO extra
       left padding: the section's content (site name + table) sits at the SAME
       left edge as every other page section; the caret hangs INTO the page's
       own gutter via its negative margin (operator 2026-08-13: the caret must
       not shrink the queue's usable width). -->
  <div class="mt-6 pt-5 pb-6 border-t border-b border-cloud/20">
    <!-- Single header line: collapse-caret + site identity + timezone LEFT,
         all action buttons RIGHT — one horizontal row above the table. -->
    <div class="flex items-center justify-between gap-x-4 flex-wrap gap-y-2">
      <!-- The whole title+metadata area toggles collapse on click (operator
           2026-08-13) — same function as the caret. Guarded: clicks on/inside
           any BUTTON (the caret itself, future controls) are ignored so
           nothing double-fires; the unlinked state (site selector) does not
           get the handler at all. cursor-pointer only when linked. -->
      <div
        class="flex items-center gap-x-4 flex-wrap gap-y-2"
        :class="siteName !== undefined ? 'cursor-pointer select-none' : ''"
        @click="onTitleAreaClick"
      >
        <template v-if="siteName === undefined">
          <select
            ref="sitePicker"
            class="rounded border-frequency/50 bg-pitch text-insight px-3 py-1.5 min-w-64 text-sm"
            value=""
            @change="$emit('siteChosen', ($event.target as HTMLSelectElement).value)"
          >
            <option
              disabled
              value=""
            >
              Select a site for these recordings…
            </option>
            <option
              v-for="option in siteOptions"
              :key="option.id"
              :value="option.id"
              :disabled="option.taken"
            >
              {{ option.name }}{{ option.taken ? ' — already on this page' : '' }}
            </option>
          </select>
        </template>
        <template v-else>
          <!-- Collapse caret: the app's STANDARD chevron (custom-icons
               'angle-down', same glyph as dropdowns elsewhere). Points DOWN
               when expanded, ROTATES to point RIGHT when collapsed. It hangs
               into the page gutter (-ml-7 w-7, no compensating padding on the
               section) so the site name + queue box stay flush with the
               common left edge of all page sections. -->
          <button
            class="-ml-7 w-7 -mr-4 shrink-0 inline-flex items-center justify-center text-insight hover:text-frequency"
            :title="collapsed ? 'Expand this section' : 'Collapse this section'"
            :aria-expanded="!collapsed"
            @click="$emit('toggleCollapsed')"
          >
            <!-- WindiCSS: rotate utilities are inert without the explicit `transform`
                 class (cf. every in-app usage: 'transform rotate-180'). -->
            <icon-custom-angle-down
              class="w-5 h-5 transform transition-transform duration-200"
              :class="collapsed ? '-rotate-90' : ''"
            />
          </button>
          <!-- Site title + metadata: ONE baseline-aligned run (items-baseline,
               not items-center — mixed text sizes centre-align to different
               visual lines; sharing the BASELINE is what reads as level).
               Metadata pieces are separated by subtle middot delimiters,
               rendered as their own spans (aria-hidden) rather than CSS
               pseudo-elements so they participate in the same baseline. -->
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
            <h3 class="text-xl font-bold leading-none">
              {{ siteName }}
            </h3>
            <!-- Labelled metadata pieces (operator 2026-08-13): "Label: value",
                 label at reduced opacity so the VALUES stay the scannable part. -->
            <span class="text-sm text-cloud flex flex-wrap items-baseline gap-x-2">
              <span :title="'Recordings staged in this section'"><span class="text-cloud/60">Queued:</span> {{ items.length }} recording{{ items.length === 1 ? '' : 's' }}</span>
              <template v-if="siteInfo !== undefined">
                <span
                  class="text-cloud/40 select-none"
                  aria-hidden="true"
                >·</span>
                <span :title="'Recordings already in this site'"><span class="text-cloud/60">Existing:</span> {{ siteInfo.recCount.toLocaleString() }} recording{{ siteInfo.recCount === 1 ? '' : 's' }}</span>
                <template v-if="siteInfo.lat !== undefined && siteInfo.lon !== undefined">
                  <span
                    class="text-cloud/40 select-none"
                    aria-hidden="true"
                  >·</span>
                  <span :title="'Site coordinates'"><span class="text-cloud/60">Location:</span> {{ siteInfo.lat.toFixed(4) }}, {{ siteInfo.lon.toFixed(4) }}</span>
                </template>
              </template>
              <template v-if="siteTimezone !== undefined">
                <span
                  class="text-cloud/40 select-none"
                  aria-hidden="true"
                >·</span>
                <span :title="'Site timezone'"><span class="text-cloud/60">Timezone:</span> {{ siteTimezone }}{{ tzOffsetLabel !== undefined ? ` (${tzOffsetLabel})` : '' }}</span>
              </template>
            </span>
          </div>
          <!-- Timezone method moved OFF the box header to the page-level
               options row ("Determine Timezone(s):", operator 2026-08-13) —
               one method for the whole upload session. -->
        </template>
      </div>

      <!-- action cluster: selection actions, then standing actions, then ✕ -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <template v-if="selectedIds.size > 0">
          <span class="text-sm text-cloud">{{ selectedIds.size }} selected:</span>
          <!-- BATCH DATE EDIT (operator 2026-08-13): set one date across every
               selected row, keeping each row's own TIME. Starting with date
               only — a numeric UTC-offset picker was floated but deferred as
               harder to reason about; this covers the common "recorder had the
               wrong day" case. Only offered for rows that are still editable. -->
          <label
            v-if="editableSelectedCount > 0"
            class="flex items-center gap-x-2 text-sm text-cloud"
          >
            Set date:
            <input
              v-model="batchDate"
              type="date"
              class="rounded border-cloud/30 bg-pitch text-insight px-2 py-1 text-sm"
            >
            <button
              class="btn btn-secondary text-sm"
              :disabled="batchDate === ''"
              :title="`Apply this date to ${editableSelectedCount} selected recording${editableSelectedCount === 1 ? '' : 's'} (each keeps its own time)`"
              @click="applyBatchDate"
            >
              Apply
            </button>
          </label>
          <!-- Start/Pause for a selection retired 2026-08-13 (operator): the
               global control row owns run/pause; per-selection the useful
               actions are edit + remove. -->
          <button
            class="btn btn-secondary text-sm inline-flex items-center gap-x-1.5"
            @click="emitSelected('clearSelected')"
          >
            <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
            Remove
          </button>
        </template>
        <!-- 'Clear Completed' and 'Retry Failed' retired from this cluster
             2026-08-13 (operator): those actions now live ON the Completed and
             Errors group header rows, next to the rows they act on. -->
        <button
          v-if="items.length === 0"
          class="text-cloud hover:text-flamingo text-sm shrink-0"
          title="Remove this Upload Queue Section"
          @click="$emit('removeBox')"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- The table + intake area (one bordered region; the whole thing is a
         drop target — the page passes highlight state via dropActive).
         v-show (not v-if) when collapsed: rows keep updating unseen. -->
    <div
      v-show="!collapsed"
      class="mt-3 overflow-x-auto rounded-lg border transition-colors"
      :class="dropActive ? 'border-frequency bg-frequency/5' : 'border-cloud/20'"
    >
      <table class="w-full text-sm whitespace-nowrap">
        <thead>
          <tr class="bg-moss/40 text-left">
            <th class="px-2 py-2 w-8">
              <input
                type="checkbox"
                :checked="allVisibleSelected"
                class="rounded border-cloud/40 bg-pitch"
                @change="toggleSelectAll"
              >
            </th>
            <th
              v-for="col in COLUMNS"
              :key="col.key"
              class="px-2 py-2 font-medium cursor-pointer select-none hover:text-frequency"
              @click="onSort(col.key)"
            >
              {{ col.label }}
              <span
                v-if="sortKey === col.key"
                class="text-frequency"
              >{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th class="px-2 py-2 w-20" />
          </tr>
        </thead>
        <tbody>
          <!-- Rows partitioned into collapsible STATUS GROUPS (≥1 row each).
               The group header row carries the caret + aggregates; when the
               group is collapsed the aggregates ARE the summary line. -->
          <template
            v-for="section in groupSections"
            :key="section.key"
          >
            <tr
              class="border-t border-cloud/20 bg-moss/25 cursor-pointer select-none hover:bg-moss/40"
              @click="toggleGroup(section.key)"
            >
              <td
                :colspan="COLUMNS.length + 2"
                class="px-2 py-1.5"
              >
                <span class="inline-flex items-center gap-x-2">
                  <icon-custom-angle-down
                    class="w-4 h-4 text-insight transform transition-transform duration-200"
                    :class="groupCollapsed[section.key] ? '-rotate-90' : ''"
                  />
                  <span
                    class="font-semibold"
                    :class="section.key === 'errors' ? 'text-flamingo' : section.key === 'completed' ? 'text-frequency' : 'text-insight'"
                  >{{ section.label }}</span>
                  <span class="text-cloud text-xs">{{ section.metrics }}</span>
                  <!-- Group-scoped actions live HERE (moved off the header
                       cluster 2026-08-13): the action sits next to the rows it
                       acts on. @click.stop so it doesn't also toggle the group. -->
                  <button
                    v-if="section.key === 'errors'"
                    class="btn btn-secondary text-xs inline-flex items-center gap-x-1 ml-2 px-2 py-0.5"
                    :title="`Retry all ${section.rows.length} failed recording${section.rows.length === 1 ? '' : 's'}`"
                    @click.stop="$emit('retryFailed')"
                  ><!-- errors group == exactly the retryFailed set, so the
                       existing whole-box emit is already group-scoped -->
                    <svg viewBox="0 0 16 16" class="w-3 h-3 fill-none stroke-current" stroke-width="1.8"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    Retry All ({{ section.rows.length }})
                  </button>
                  <button
                    v-if="section.key === 'completed' || section.key === 'duplicates'"
                    class="btn btn-secondary text-xs inline-flex items-center gap-x-1 ml-2 px-2 py-0.5"
                    :title="`Clear these ${section.rows.length} recording${section.rows.length === 1 ? '' : 's'} from the list (they stay uploaded)`"
                    @click.stop="$emit('clearSelected', section.rows.map(r => r.id))"
                  >
                    <svg viewBox="0 0 16 16" class="w-3 h-3 fill-current"><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
                    Clear ({{ section.rows.length }})
                  </button>
                </span>
              </td>
            </tr>
            <tr
              v-for="item in (groupCollapsed[section.key] ? [] : section.rows)"
              :key="item.id"
              class="border-t border-cloud/10 hover:bg-moss/20"
              :class="selectedIds.has(item.id) ? 'bg-moss/30' : ''"
            >
            <td class="px-2 py-1.5">
              <input
                type="checkbox"
                :checked="selectedIds.has(item.id)"
                class="rounded border-cloud/40 bg-pitch"
                @change="toggleSelect(item.id)"
              >
            </td>
            <td
              class="px-2 py-1.5 max-w-56 truncate"
              :title="item.relativePath"
            >
              {{ displayFilename(item) }}
            </td>
            <!-- Date and Time each get their OWN picker (operator 2026-08-13):
                 a date input for the date cell, a time input for the time cell.
                 Pre-Start rows only. -->
            <td class="px-2 py-1.5">
              <span class="inline-flex items-center gap-x-1">
                {{ recDate(item) }}
                <button
                  v-if="canEditDatetime(item)"
                  class="text-cloud/60 hover:text-frequency"
                  title="Correct this recording’s date"
                  @click="openFieldEditor(item, 'date')"
                >
                  <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-none stroke-current" stroke-width="1.5"><path d="M10.5 2.5l3 3L6 13l-3.5.5L3 10l7.5-7.5zM9 4l3 3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
              </span>
            </td>
            <td class="px-2 py-1.5">
              <span class="inline-flex items-center gap-x-1">
                {{ recTime(item) }}
                <button
                  v-if="canEditDatetime(item)"
                  class="text-cloud/60 hover:text-frequency"
                  title="Correct this recording’s time"
                  @click="openFieldEditor(item, 'time')"
                >
                  <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-none stroke-current" stroke-width="1.5"><path d="M10.5 2.5l3 3L6 13l-3.5.5L3 10l7.5-7.5zM9 4l3 3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
              </span>
            </td>
            <td class="px-2 py-1.5">{{ zoneCol(item) }}</td>
            <td class="px-2 py-1.5">{{ formatCol(item) }}</td>
            <td class="px-2 py-1.5 tabular-nums">{{ sizeCol(item) }}</td>
            <td class="px-2 py-1.5 tabular-nums">{{ lengthCol(item) }}</td>
            <!-- Progress: percentage only (the bar was retired 2026-08-13). -->
            <td class="px-2 py-1.5 tabular-nums">
              <span
                v-if="showProgress(item)"
                class="text-insight"
              >{{ progressPercent(item) }}%</span>
              <span
                v-else-if="item.state === 'ingested' || item.state === 'duplicate'"
                class="text-frequency"
              >100%</span>
              <span
                v-else
                class="text-cloud"
              >—</span>
            </td>
            <td class="px-2 py-1.5 tabular-nums text-cloud">{{ rateCol(item) }}</td>
            <!-- Status LAST, immediately before the per-row action buttons. -->
            <td
              class="px-2 py-1.5 max-w-72 truncate"
              :class="statusColor(item)"
              :title="statusDetail(item)"
            >
              {{ statusCol(item) }}
            </td>
            <td class="px-2 py-1.5">
              <div class="flex items-center gap-x-1.5 justify-end">
                <button
                  v-if="item.state === 'ingested'"
                  class="text-cloud hover:text-frequency disabled:opacity-40"
                  :disabled="openingId === item.id"
                  title="Open this recording in the Visualizer (new tab)"
                  @click="$emit('openDestination', item)"
                >
                  <svg viewBox="0 0 16 16" class="w-4 h-4 fill-none stroke-current" stroke-width="1.6"><path d="M6.5 3.5H3v9h9V9.5M9.5 2.5h4v4M13 3L7.5 8.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
                <button
                  v-if="canCancel(item)"
                  class="text-cloud hover:text-flamingo"
                  title="Cancel"
                  @click="$emit('cancelItem', item.id)"
                >
                  <svg viewBox="0 0 16 16" class="w-4 h-4 fill-none stroke-current" stroke-width="1.8"><path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round" /></svg>
                </button>
                <button
                  v-if="canRetry(item)"
                  class="text-cloud hover:text-frequency"
                  title="Retry"
                  @click="$emit('retryItem', item.id)"
                >
                  <svg viewBox="0 0 16 16" class="w-4 h-4 fill-none stroke-current" stroke-width="1.8"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
                <button
                  v-if="canClear(item)"
                  class="text-cloud hover:text-insight"
                  title="Remove from list"
                  @click="$emit('clearItem', item.id)"
                >
                  <svg viewBox="0 0 16 16" class="w-4 h-4 fill-current"><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
                </button>
              </div>
            </td>
          </tr>
          </template>
        </tbody>
      </table>
      <!-- intake area (drop zone) — always beneath the last visible row;
           the PAGE owns the drag/drop handlers on the whole container -->
      <slot name="intake" />
    </div>

    <!-- Per-field correction modal: a DATE picker or a TIME picker depending on
         which cell's pencil was clicked (native inputs = the platform's own
         pickers). House modal pattern, cf. the FLAC explainer. -->
    <div
      v-if="editingItem !== undefined"
      class="fixed inset-0 z-[9999] isolate flex items-center justify-center bg-pitch/60"
      @click.self="editingItem = undefined"
    >
      <div class="bg-moss rounded-xl shadow-lg max-w-md w-full p-6 mx-4">
        <div class="flex flex-col gap-y-4">
          <div class="flex flex-row items-center justify-between">
            <h2 class="text-xl font-header">
              Correct {{ editField === 'date' ? 'Date' : 'Time' }}
            </h2>
            <button
              type="button"
              title="Cancel"
              @click="editingItem = undefined"
            >
              <icon-custom-fi-close-thin class="h-5 w-5 cursor-pointer text-insight" />
            </button>
          </div>
          <p class="text-sm text-cloud truncate">
            {{ editingItem.relativePath }}
          </p>
          <label class="text-sm text-cloud flex flex-col gap-y-1.5">
            {{ editField === 'date' ? 'Recording date' : 'Recording start time' }} ({{ editZoneLabel }})
            <input
              v-if="editField === 'date'"
              v-model="editValue"
              type="date"
              class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2"
            >
            <input
              v-else
              v-model="editValue"
              type="time"
              step="1"
              class="rounded border-cloud/30 bg-pitch text-insight px-3 py-2"
            >
          </label>
          <div class="flex justify-end gap-x-3">
            <button
              class="btn btn-secondary btn-medium px-4 py-2"
              @click="editingItem = undefined"
            >
              Cancel
            </button>
            <button
              class="btn btn-primary btn-medium px-4 py-2"
              :disabled="editValue === ''"
              @click="saveField"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { type UploadItem, toUtcIso } from '@rfcx-bio/upload-engine'

const props = defineProps<{
  items: UploadItem[]
  /** The linked site's name; undefined while the box is still UNLINKED
   * (header shows the site selector instead, autofocused). */
  siteName?: string
  /** The linked site's IANA tz (shown in the Site Local Time option). */
  siteTimezone?: string
  /** Per-box timezone method (auto|site|utc). */
  timezoneMode?: string
  /** Options for the unlinked-state site selector; taken = already boxed. */
  siteOptions?: Array<{ id: string, name: string, taken: boolean }>
  openingId?: string
  /** Whether the FLAC transcode stage is on — refines the pending-group label
   * (a queued WAV only counts as Transcode Pending when encoding will run). */
  flacEnabled?: boolean
  /** Drag-hover highlight for the combined table+intake region (page-owned). */
  dropActive?: boolean
  /** Collapse state is PAGE-OWNED (lifted 2026-08-13) so the options row's
   * expand/collapse-all control can drive every box at once. */
  collapsed?: boolean
  /** Site facts for the title line (existing recordings, coordinates). */
  siteInfo?: { recCount: number, lat?: number, lon?: number }
}>()

const emit = defineEmits<{
  (e: 'removeBox'): void
  (e: 'toggleCollapsed'): void
  (e: 'siteChosen', streamId: string): void
    (e: 'clearCompleted'): void
  (e: 'retryFailed'): void
  
  (e: 'clearSelected', ids: string[]): void
  (e: 'cancelItem', id: string): void
  (e: 'retryItem', id: string): void
  (e: 'clearItem', id: string): void
  (e: 'openDestination', item: UploadItem): void
  (e: 'editDatetime', edit: { id: string, localWallTime: string, timestampUtc: string, timezoneName: string }): void
}>()

// autofocus the site selector when the box mounts unlinked
const sitePicker = ref<HTMLSelectElement>()

// -- per-row datetime correction (operator 2026-08-13) ----------------------
// Pre-Start rows only: once signed/uploading the timestamp is part of the
// server registration and must not drift from it.
const editingItem = ref<UploadItem>()
const editValue = ref('')
const editField = ref<'date' | 'time'>('date')

const canEditDatetime = (item: UploadItem): boolean =>
  item.state === 'staged' || item.state === 'analyzing'

/** Title-area click = collapse toggle, EXCEPT clicks on/inside buttons or
 * the site <select> (unlinked state) — those keep their own behaviour. */
const onTitleAreaClick = (event: MouseEvent): void => {
  if (props.siteName === undefined) return
  const target = event.target as HTMLElement | null
  if (target?.closest('button, select, input, a') !== null) return
  emit('toggleCollapsed')
}

/** Open the DATE or TIME picker for one row. localWallTime is
 * 'YYYY-MM-DDTHH:mm:ss', so each field is a slice of it. */
const openFieldEditor = (item: UploadItem, field: 'date' | 'time'): void => {
  editingItem.value = item
  editField.value = field
  const wall = item.localWallTime
  editValue.value = wall === undefined
    ? ''
    : field === 'date' ? wall.slice(0, 10) : wall.slice(11, 19)
}

/** The zone the edited wall time will be interpreted in — the row's OWN
 * current zone, so "correct the clock" doesn't covertly change the timezone
 * decision. Errored rows without a zone fall back to the site tz, then UTC. */
const editZone = computed<string>(() => {
  const item = editingItem.value
  if (item === undefined) return 'UTC'
  return item.timezoneName ?? props.siteTimezone ?? 'UTC'
})
const editZoneLabel = computed(() => editZone.value)

/** Current UTC offset of the site's IANA tz (e.g. 'UTC-5'), for the title
 * line. DATA-DERIVED, not Intl timeZoneName: the traps registry records that
 * an Intl 'shortOffset' usage passed local vue-tsc but BROKE the Docker image
 * build (older TS lib in the image lacks the union member) — 'longOffset'
 * carries the same risk. Instead, format today's instant in the tz with
 * plain numeric fields (supported everywhere) and diff against UTC. */
const tzOffsetLabel = computed<string | undefined>(() => {
  const tz = props.siteTimezone
  if (tz === undefined || tz === '') return undefined
  try {
    const now = new Date()
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    })
    const p = Object.fromEntries(fmt.formatToParts(now).map(x => [x.type, x.value]))
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour === '24' ? 0 : p.hour), +p.minute, +p.second)
    const offsetMin = Math.round((asUtc - now.getTime()) / 60_000)
    if (offsetMin === 0) return 'UTC+0'
    const sign = offsetMin < 0 ? '-' : '+'
    const abs = Math.abs(offsetMin)
    const hh = Math.floor(abs / 60)
    const mm = abs % 60
    return `UTC${sign}${hh}${mm !== 0 ? `:${String(mm).padStart(2, '0')}` : ''}`
  } catch { return undefined }
})

const saveField = (): void => {
  const item = editingItem.value
  if (item === undefined || editValue.value === '') return
  // Recombine the edited field with the row's existing other half. A row with
  // NO timestamp yet (analysis failed) gets sensible defaults so a single
  // field edit can still produce a complete, valid timestamp.
  const existing = item.localWallTime
  const datePart = editField.value === 'date'
    ? editValue.value
    : existing?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  const rawTime = editField.value === 'time'
    ? editValue.value
    : existing?.slice(11, 19) ?? '00:00:00'
  const timePart = rawTime.length === 5 ? `${rawTime}:00` : rawTime
  const wall = `${datePart}T${timePart}`
  const zone = editZone.value
  // Offset-string zones (UTC±HH:MM from filename/metadata rungs) and IANA
  // names both go through toUtcIso; plain 'UTC' means interpret as UTC.
  const utc = zone === 'UTC' ? toUtcIso(wall) : toUtcIso(wall, offsetToMinutes(zone) ?? zone)
  if (utc === undefined) return
  emit('editDatetime', { id: item.id, localWallTime: wall, timestampUtc: utc, timezoneName: zone })
  editingItem.value = undefined
}

// -- batch date edit over the current selection ----------------------------
const batchDate = ref('')

/** Selected rows that are still pre-Start (the only ones we may re-date). */
const editableSelected = computed(() =>
  props.items.filter(item => selectedIds.value.has(item.id) && canEditDatetime(item)))
const editableSelectedCount = computed(() => editableSelected.value.length)

const applyBatchDate = (): void => {
  if (batchDate.value === '') return
  for (const item of editableSelected.value) {
    // keep each row's OWN time; only the date moves
    const time = item.localWallTime?.slice(11, 19) ?? '00:00:00'
    const wall = `${batchDate.value}T${time}`
    const zone = item.timezoneName ?? props.siteTimezone ?? 'UTC'
    const utc = zone === 'UTC' ? toUtcIso(wall) : toUtcIso(wall, offsetToMinutes(zone) ?? zone)
    if (utc === undefined) continue
    emit('editDatetime', { id: item.id, localWallTime: wall, timestampUtc: utc, timezoneName: zone })
  }
  batchDate.value = ''
}

/** '±HH:MM' -> minutes; undefined for IANA names. */
const offsetToMinutes = (zone: string): number | undefined => {
  const m = zone.match(/^([+-])(\d{2}):(\d{2})$/)
  if (m === null) return undefined
  const sign = m[1] === '-' ? -1 : 1
  return sign * (parseInt(m[2]) * 60 + parseInt(m[3]))
}

// Collapse state lifted to the page (see props.collapsed); template reads
// the prop via this alias so the v-show/caret bindings stay terse.
const collapsed = computed(() => props.collapsed === true)
onMounted(() => {
  if (props.siteName === undefined) sitePicker.value?.focus()
})

// -- status grouping (kept for Status-column sorting; the 'Hide:' checkbox
// filters were retired 2026-08-12 — operator: not the right technique) -----

type FilterGroup = 'completed' | 'failed' | 'cancelled' | 'duplicate' |
  'uploadInProgress' | 'uploadPending' | 'transcodeInProgress' |
  'transcodePending' | 'processing' | 'staged'

const groupOf = (item: UploadItem): FilterGroup => {
  // Transcode groups only apply to WAVs when encoding is on; everything
  // else in the pre-sign pipeline is plain Upload Pending.
  const willTranscode = props.flacEnabled === true && item.fileFormat === 'wav'
  switch (item.state) {
    case 'ingested': return 'completed'
    case 'duplicate': return 'duplicate'
    case 'failed':
    case 'rejected': return 'failed'
    case 'cancelled': return 'cancelled'
    case 'uploading': return 'uploadInProgress'
    case 'uploaded': return 'processing'
    case 'preparing': return willTranscode ? 'transcodeInProgress' : 'uploadPending'
    case 'queued': return willTranscode ? 'transcodePending' : 'uploadPending'
    case 'ready':
    case 'signing':
    case 'signed':
    case 'paused': return 'uploadPending'
    case 'analyzing':
    case 'staged':
    default: return 'staged'
  }
}

const visible = computed(() => props.items)

// -- sorting ------------------------------------------------------------------

// Column order (operator 2026-08-13): Method dropped entirely; Size added;
// Status moved LAST, immediately before the per-row action buttons.
const COLUMNS: Array<{ key: string, label: string }> = [
  { key: 'filename', label: 'Filename' },
  { key: 'recDate', label: 'Date' },
  { key: 'recTime', label: 'Time' },
  { key: 'zone', label: 'Zone' },
  { key: 'format', label: 'Format' },
  { key: 'sizeBytes', label: 'Size' },
  { key: 'durationMs', label: 'Duration' },
  { key: 'progress', label: 'Progress' },
  { key: 'rate', label: 'Rate' },
  { key: 'status', label: 'Status' }
]

const sortKey = ref<string>('filename')
const sortAsc = ref(true)

const onSort = (key: string): void => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = true }
}

const sortValue = (item: UploadItem, key: string): string | number => {
  switch (key) {
    case 'filename': return item.relativePath.toLowerCase()
    case 'recDate':
    case 'recTime': return item.localWallTime ?? ''
    case 'zone': return zoneCol(item)
    case 'format': return (item.sampleRateHz ?? 0) * 100 + (item.bitDepth ?? 0)
    case 'sizeBytes': return item.fileSizeBytes
    case 'durationMs': return item.durationMs ?? -1
    case 'status': return groupOf(item)
    case 'progress': return item.state === 'ingested' ? 2 : (item.progress ?? -1)
    case 'rate': return avgRateBps(item) ?? -1
    default: return 0
  }
}

// -- STATUS GROUPS (2026-08-13, operator: first-class parallel-upload UI) ----
// Rows are grouped into collapsible sections by coarse status. Five groups
// (operator approved splitting Active out of Queued so collapsing the queue
// cannot hide in-flight uploads — the rows you actually watch):
//   active:    uploading / uploaded / signing / signed  (default EXPANDED, top)
//   queued:    staged / queued / preparing / ready / paused / analyzing
//   completed: ingested
//   duplicates:duplicate
//   errors:    failed / rejected / cancelled
// A group renders ONLY when it has ≥1 row. Aggregates live on the group line.

type StatusGroup = 'active' | 'queued' | 'completed' | 'duplicates' | 'errors'

const GROUP_ORDER: StatusGroup[] = ['active', 'queued', 'completed', 'duplicates', 'errors']

const GROUP_LABELS: Record<StatusGroup, string> = {
  active: 'Active',
  queued: 'Queued',
  completed: 'Completed',
  duplicates: 'Duplicates',
  errors: 'Errors'
}

const statusGroupOf = (item: UploadItem): StatusGroup => {
  switch (item.state) {
    case 'ingested': return 'completed'
    case 'duplicate': return 'duplicates'
    case 'failed':
    case 'rejected':
    case 'cancelled': return 'errors'
    case 'uploading':
    case 'uploaded':
    case 'signing':
    case 'signed': return 'active'
    default: return 'queued' // staged/queued/preparing/ready/paused/analyzing
  }
}

// Per-group collapse: Active + Queued start OPEN (the work you watch);
// Completed/Duplicates/Errors start FOLDED (the bulk you scroll past).
const groupCollapsed = ref<Record<StatusGroup, boolean>>({
  active: false, queued: false, completed: true, duplicates: true, errors: true
})
const toggleGroup = (g: StatusGroup): void => { groupCollapsed.value[g] = !groupCollapsed.value[g] }

interface GroupSection {
  key: StatusGroup
  label: string
  rows: UploadItem[]
  metrics: string
}

const humanBytes = (n: number): string => {
  if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${n} B`
}

const groupMetrics = (g: StatusGroup, rows: UploadItem[]): string => {
  const n = rows.length
  const noun = `${n} recording${n === 1 ? '' : 's'}`
  switch (g) {
    case 'active': {
      const bytes = rows.reduce((s, r) => s + r.fileSizeBytes, 0)
      const done = rows.reduce((s, r) => s + (r.state === 'uploaded' ? r.fileSizeBytes : r.fileSizeBytes * (r.progress ?? 0)), 0)
      const pct = bytes > 0 ? Math.round((done / bytes) * 100) : 0
      const rate = rows.reduce((s, r) => s + (avgRateBps(r) ?? 0), 0)
      const rateTxt = rate > 0 ? ` · ${humanBytes(rate)}/s` : ''
      return `${noun} · ${pct}% of ${humanBytes(bytes)}${rateTxt}`
    }
    case 'queued': {
      const bytes = rows.reduce((s, r) => s + r.fileSizeBytes, 0)
      return `${noun} · ${humanBytes(bytes)} waiting`
    }
    case 'completed': {
      const bytes = rows.reduce((s, r) => s + r.fileSizeBytes, 0)
      return `${noun} · ${humanBytes(bytes)} uploaded`
    }
    case 'duplicates': return noun
    case 'errors': return noun
  }
}

/** The sections actually rendered: sorted rows partitioned by group, empty
 * groups dropped, fixed group order. */
const groupSections = computed<GroupSection[]>(() => {
  const buckets = new Map<StatusGroup, UploadItem[]>()
  for (const row of visibleSorted.value) {
    const g = statusGroupOf(row)
    const arr = buckets.get(g)
    if (arr === undefined) buckets.set(g, [row])
    else arr.push(row)
  }
  return GROUP_ORDER
    .filter(g => (buckets.get(g)?.length ?? 0) > 0)
    .map(g => ({ key: g, label: GROUP_LABELS[g], rows: buckets.get(g) ?? [], metrics: groupMetrics(g, buckets.get(g) ?? []) }))
})

const visibleSorted = computed(() => {
  const rows = [...visible.value]
  const key = sortKey.value
  rows.sort((a, b) => {
    const va = sortValue(a, key)
    const vb = sortValue(b, key)
    const cmp = typeof va === 'number' && typeof vb === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb))
    return sortAsc.value ? cmp : -cmp
  })
  return rows
})

// -- selection ----------------------------------------------------------------

const selectedIds = ref(new Set<string>())

const toggleSelect = (id: string): void => {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

const allVisibleSelected = computed(() =>
  visibleSorted.value.length > 0 &&
  visibleSorted.value.every(item => selectedIds.value.has(item.id)))

const toggleSelectAll = (): void => {
  if (allVisibleSelected.value) selectedIds.value = new Set()
  else selectedIds.value = new Set(visibleSorted.value.map(item => item.id))
}

// Drop selections whose rows disappeared (cleared)
watch(() => props.items, (items) => {
  const alive = new Set(items.map(item => item.id))
  const next = new Set([...selectedIds.value].filter(id => alive.has(id)))
  if (next.size !== selectedIds.value.size) selectedIds.value = next
})

const emitSelected = (event: 'clearSelected'): void => {
  const ids = [...selectedIds.value]
  emit(event, ids)
  selectedIds.value = new Set()
}

// -- cell renderers -----------------------------------------------------------

const displayFilename = (item: UploadItem): string => {
  // relativePath keeps the ORIGINAL name (pre-transcode); show its basename
  const base = item.relativePath.split('/').pop() ?? item.filename
  return base
}

const recDate = (item: UploadItem): string =>
  item.localWallTime !== undefined ? item.localWallTime.slice(0, 10) : '—'

const recTime = (item: UploadItem): string =>
  item.localWallTime !== undefined ? item.localWallTime.slice(11, 19) : '—'

/**
 * Zone column: compact `UTC±H[:MM]` (unpadded hours). IANA zones are resolved
 * to their offset AT THE RECORDING INSTANT (DST-correct), offset strings are
 * reformatted, plain UTC renders as `UTC`.
 */
const zoneCol = (item: UploadItem): string => {
  const tz = item.timezoneName
  if (tz === undefined) return '—'
  if (tz === 'UTC') return 'UTC'
  const offsetMatch = tz.match(/^([+-])(\d{2}):(\d{2})$/)
  if (offsetMatch !== null) {
    const [, sign, hh, mm] = offsetMatch
    return `UTC${sign}${parseInt(hh)}${mm !== '00' ? `:${mm}` : ''}`
  }
  // IANA zone name → offset AT the recording instant, derived from the data
  // we already carry: offset = localWallTime − timestampUtc. DST-correct by
  // construction and needs no Intl lib support.
  if (item.localWallTime !== undefined && item.timestampUtc !== undefined) {
    const wall = Date.parse(`${item.localWallTime}Z`)
    const utc = Date.parse(item.timestampUtc)
    if (!isNaN(wall) && !isNaN(utc)) {
      const offsetMin = Math.round((wall - utc) / 60_000)
      if (offsetMin === 0) return 'UTC'
      const sign = offsetMin < 0 ? '-' : '+'
      const abs = Math.abs(offsetMin)
      const hours = Math.floor(abs / 60)
      const mins = abs % 60
      return `UTC${sign}${hours}${mins !== 0 ? `:${String(mins).padStart(2, '0')}` : ''}`
    }
  }
  return tz
}

/** Format column: sample rate + bit depth (the filetype was dropped
 * 2026-08-13 — it is already implied by the filename). */
const formatCol = (item: UploadItem): string => {
  const rate = item.sampleRateHz !== undefined
    ? `${(item.sampleRateHz / 1000).toFixed(1).replace(/\.0$/, '')} kHz`
    : undefined
  const depth = item.bitDepth !== undefined ? `${item.bitDepth}-bit` : undefined
  const parts = [rate, depth].filter(p => p !== undefined)
  return parts.length > 0 ? parts.join(' · ') : '—'
}

/** Size column: file size in MB. */
const sizeCol = (item: UploadItem): string => {
  const mb = item.fileSizeBytes / 1048576
  if (mb >= 100) return `${mb.toFixed(0)} MB`
  return `${mb.toFixed(1)} MB`
}

/** Duration column: 'N mins, N secs' (operator 2026-08-13), with singular
 * forms and the minutes part omitted entirely for sub-minute clips. */
const lengthCol = (item: UploadItem): string => {
  if (item.durationMs === undefined) return '—'
  const totalSeconds = Math.round(item.durationMs / 1000)
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  const minPart = mm > 0 ? `${mm} min${mm === 1 ? '' : 's'}` : undefined
  const secPart = `${ss} sec${ss === 1 ? '' : 's'}`
  return minPart !== undefined ? `${minPart}, ${secPart}` : secPart
}

const STATE_LABELS: Record<string, string> = {
  analyzing: 'Analyzing…',
  staged: 'Staged',
  queued: 'Waiting (transcode/hash)',
  preparing: 'Transcoding/Hashing…',
  ready: 'Waiting for URL',
  signing: 'Requesting URL…',
  signed: 'Waiting to upload',
  uploading: 'Uploading',
  uploaded: 'Processing (server)…',
  ingested: 'Complete',
  duplicate: 'Duplicate — already ingested (↻ to force retry)',
  failed: 'Failed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  paused: 'Paused'
}

const statusCol = (item: UploadItem): string => {
  if (item.state === 'staged' && item.analysisError !== undefined) return item.analysisError
  // prestaged: checksum + signed URL already in hand — Start goes straight
  // to the PUT (and the server's dedup check already passed this file)
  if (item.state === 'staged' && item.signedUrl !== undefined) return 'Staged — ready for fast upload'
  // advisory duplicates carry their staging-time note in `error`
  if (item.state === 'duplicate' && item.error !== undefined) return `Duplicate — ${item.error}`
  const label = STATE_LABELS[item.state] ?? item.state
  const detail = item.error
  return detail !== undefined && ['failed', 'rejected', 'cancelled'].includes(item.state)
    ? `${label}: ${detail}`
    : label
}

const statusDetail = (item: UploadItem): string =>
  item.analysisError ?? item.error ?? STATE_LABELS[item.state] ?? item.state

const statusColor = (item: UploadItem): string => {
  switch (item.state) {
    case 'ingested': return 'text-frequency'
    case 'duplicate': return 'text-cloud'
    case 'failed':
    case 'rejected':
    case 'cancelled': return 'text-flamingo'
    case 'staged': return item.analysisError !== undefined ? 'text-flamingo' : 'text-insight'
    default: return 'text-insight'
  }
}

const showProgress = (item: UploadItem): boolean =>
  ['preparing', 'ready', 'signing', 'signed', 'uploading', 'uploaded'].includes(item.state)

const progressPercent = (item: UploadItem): number => {
  switch (item.state) {
    case 'preparing': return 5
    case 'ready':
    case 'signing': return 8
    case 'signed': return 10
    case 'uploading': return 10 + Math.round((item.progress ?? 0) * 80)
    case 'uploaded': return 95
    default: return 100
  }
}

const avgRateBps = (item: UploadItem): number | undefined => {
  if (item.uploadStartedAtMs === undefined) return undefined
  const end = item.uploadEndedAtMs ?? Date.now()
  const seconds = (end - item.uploadStartedAtMs) / 1000
  if (seconds <= 0) return undefined
  const bytes = item.state === 'uploading'
    ? item.fileSizeBytes * (item.progress ?? 0)
    : item.fileSizeBytes
  return bytes / seconds
}

const rateCol = (item: UploadItem): string => {
  // Rate is only meaningful for uploads that moved real bytes: in-flight
  // with progress, or terminal-successful. Failed/instant-aborted attempts
  // produced absurd numbers (100+ MB/s on a CORS abort) — show — instead.
  if (!['uploading', 'uploaded', 'ingested', 'duplicate'].includes(item.state)) return '—'
  const bps = avgRateBps(item)
  if (bps === undefined || bps <= 0) return '—'
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(0)} KB/s`
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`
}

// -- row action gates ---------------------------------------------------------

const canCancel = (item: UploadItem): boolean =>
  !['ingested', 'duplicate', 'failed', 'rejected', 'cancelled'].includes(item.state)

// duplicate is retryable as the OVERRIDE for advisory staging-time flags
// (lost-recording/availability=0 re-uploads) — the server re-verdicts at
// signing, so a true duplicate just bounces back at zero byte cost
const canRetry = (item: UploadItem): boolean =>
  ['failed', 'rejected', 'cancelled', 'duplicate'].includes(item.state)

const canClear = (item: UploadItem): boolean =>
  ['ingested', 'duplicate', 'failed', 'rejected', 'cancelled', 'staged'].includes(item.state)
</script>