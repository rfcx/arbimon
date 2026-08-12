<template>
  <div class="mt-6">
    <!-- Filter row -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <span class="text-cloud">Hide:</span>
      <label
        v-for="group in FILTER_GROUPS"
        :key="group.key"
        class="flex items-center gap-x-1 cursor-pointer select-none"
      >
        <input
          v-model="hiddenGroups"
          type="checkbox"
          :value="group.key"
          class="rounded border-cloud/40 bg-pitch"
        >
        <span>{{ group.label }} <span class="text-cloud">({{ groupCounts[group.key] ?? 0 }})</span></span>
      </label>
    </div>

    <!-- Actions row: selection actions LEFT, standing actions RIGHT -->
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mt-3">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <template v-if="selectedIds.size > 0">
          <span class="text-sm text-cloud">{{ selectedIds.size }} selected:</span>
          <button
            class="btn btn-secondary text-sm inline-flex items-center gap-x-1.5"
            @click="emitSelected('startSelected')"
          >
            <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M4 2l9 6-9 6V2z" /></svg>
            Start
          </button>
          <button
            class="btn btn-secondary text-sm inline-flex items-center gap-x-1.5"
            @click="emitSelected('pauseSelected')"
          >
            <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M4 2h3v12H4zM9 2h3v12H9z" /></svg>
            Pause
          </button>
          <button
            class="btn btn-secondary text-sm inline-flex items-center gap-x-1.5"
            @click="emitSelected('clearSelected')"
          >
            <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
            Remove
          </button>
        </template>
      </div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          class="btn btn-secondary text-sm inline-flex items-center gap-x-1.5"
          :disabled="groupCounts.completed === 0 && groupCounts.duplicate === 0"
          @click="$emit('clearCompleted')"
        >
          <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M6 2h4l1 2h3v1.5H2V4h3l1-2zM3.5 6.5h9L12 14.5H4L3.5 6.5zm3 1.5v5H7V8h-.5zm2.5 0v5H10V8h-1z" /></svg>
          Clear Completed
        </button>
        <button
          class="btn btn-secondary text-sm inline-flex items-center gap-x-1.5"
          :disabled="groupCounts.failed === 0 && groupCounts.cancelled === 0"
          @click="$emit('retryFailed')"
        >
          <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-none stroke-current" stroke-width="1.8"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          Retry Failed
        </button>
      </div>
    </div>

    <!-- The table -->
    <div class="mt-3 overflow-x-auto rounded-lg border border-cloud/20">
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
          <tr
            v-for="item in visibleSorted"
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
            <td class="px-2 py-1.5">{{ item.siteName ?? item.streamId }}</td>
            <td class="px-2 py-1.5">{{ recDate(item) }}</td>
            <td class="px-2 py-1.5">{{ recTime(item) }}</td>
            <td class="px-2 py-1.5">{{ zoneCol(item) }}</td>
            <td class="px-2 py-1.5 text-cloud">{{ tzSourceLabel(item) }}</td>
            <td class="px-2 py-1.5">{{ formatCol(item) }}</td>
            <td class="px-2 py-1.5 tabular-nums">{{ lengthCol(item) }}</td>
            <td
              class="px-2 py-1.5 max-w-72 truncate"
              :class="statusColor(item)"
              :title="statusDetail(item)"
            >
              {{ statusCol(item) }}
            </td>
            <td class="px-2 py-1.5 w-28">
              <div
                v-if="showProgress(item)"
                class="h-1.5 rounded bg-cloud/15 overflow-hidden min-w-20"
              >
                <div
                  class="h-full rounded bg-frequency transition-all"
                  :class="item.state === 'uploaded' ? 'animate-pulse bg-frequency/60' : ''"
                  :style="{ width: `${progressPercent(item)}%` }"
                />
              </div>
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
          <tr v-if="visibleSorted.length === 0">
            <td
              :colspan="COLUMNS.length + 2"
              class="px-4 py-6 text-center text-cloud"
            >
              {{ items.length === 0 ? 'No files yet — drop some above.' : 'All rows hidden by the filters.' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { type UploadItem, TIMEZONE_SOURCE_LABELS } from '@rfcx-bio/upload-engine'

const props = defineProps<{
  items: UploadItem[]
  openingId?: string
  /** Whether the FLAC transcode stage is on — refines the pending-group label
   * (a queued WAV only counts as Transcode Pending when encoding will run). */
  flacEnabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'clearCompleted'): void
  (e: 'retryFailed'): void
  (e: 'startSelected', ids: string[]): void
  (e: 'pauseSelected', ids: string[]): void
  (e: 'clearSelected', ids: string[]): void
  (e: 'cancelItem', id: string): void
  (e: 'retryItem', id: string): void
  (e: 'clearItem', id: string): void
  (e: 'openDestination', item: UploadItem): void
}>()

// -- status → filter-group mapping -------------------------------------------

type FilterGroup = 'completed' | 'failed' | 'cancelled' | 'duplicate' |
  'uploadInProgress' | 'uploadPending' | 'transcodeInProgress' |
  'transcodePending' | 'processing' | 'staged'

const FILTER_GROUPS: Array<{ key: FilterGroup, label: string }> = [
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'uploadInProgress', label: 'Upload In-Progress' },
  { key: 'uploadPending', label: 'Upload Pending' },
  { key: 'transcodeInProgress', label: 'Transcode In-Progress' },
  { key: 'transcodePending', label: 'Transcode Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'staged', label: 'Staged' }
]

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

const hiddenGroups = ref<FilterGroup[]>([])

const groupCounts = computed<Partial<Record<FilterGroup, number>>>(() => {
  const counts: Partial<Record<FilterGroup, number>> = {}
  for (const item of props.items) {
    const g = groupOf(item)
    counts[g] = (counts[g] ?? 0) + 1
  }
  return counts
})

const visible = computed(() =>
  props.items.filter(item => !hiddenGroups.value.includes(groupOf(item))))

// -- sorting ------------------------------------------------------------------

const COLUMNS: Array<{ key: string, label: string }> = [
  { key: 'filename', label: 'Filename' },
  { key: 'siteName', label: 'Site' },
  { key: 'recDate', label: 'Date' },
  { key: 'recTime', label: 'Time' },
  { key: 'zone', label: 'Zone' },
  { key: 'timezoneSource', label: 'Method' },
  { key: 'format', label: 'Format' },
  { key: 'durationMs', label: 'Duration' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'rate', label: 'Rate' }
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
    case 'siteName': return (item.siteName ?? item.streamId).toLowerCase()
    case 'recDate':
    case 'recTime': return item.localWallTime ?? ''
    case 'zone': return zoneCol(item)
    case 'timezoneSource': return item.timezoneSource ?? ''
    case 'format': return `${item.fileFormat ?? ''}-${item.sampleRateHz ?? 0}`
    case 'durationMs': return item.durationMs ?? -1
    case 'status': return groupOf(item)
    case 'progress': return item.state === 'ingested' ? 2 : (item.progress ?? -1)
    case 'rate': return avgRateBps(item) ?? -1
    default: return 0
  }
}

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

const emitSelected = (event: 'startSelected' | 'pauseSelected' | 'clearSelected'): void => {
  const ids = [...selectedIds.value]
  // explicit dispatch: a dynamic event name defeats the emit overload types
  if (event === 'startSelected') emit('startSelected', ids)
  else if (event === 'pauseSelected') emit('pauseSelected', ids)
  else emit('clearSelected', ids)
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

const tzSourceLabel = (item: UploadItem): string =>
  item.timezoneSource !== undefined ? TIMEZONE_SOURCE_LABELS[item.timezoneSource] : '—'

const formatCol = (item: UploadItem): string => {
  const fmt = (item.fileFormat ?? '—').toUpperCase()
  const rate = item.sampleRateHz !== undefined ? ` · ${(item.sampleRateHz / 1000).toFixed(1).replace(/\.0$/, '')} kHz` : ''
  const enc = item.transcoded === true ? ' → FLAC' : ''
  return `${fmt}${rate}${enc}`
}

const lengthCol = (item: UploadItem): string => {
  if (item.durationMs === undefined) return '—'
  const totalSeconds = Math.round(item.durationMs / 1000)
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
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
  duplicate: 'Duplicate (already ingested)',
  failed: 'Failed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  paused: 'Paused'
}

const statusCol = (item: UploadItem): string => {
  if (item.state === 'staged' && item.analysisError !== undefined) return item.analysisError
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

const canRetry = (item: UploadItem): boolean =>
  ['failed', 'rejected', 'cancelled'].includes(item.state)

const canClear = (item: UploadItem): boolean =>
  ['ingested', 'duplicate', 'failed', 'rejected', 'cancelled', 'staged'].includes(item.state)
</script>