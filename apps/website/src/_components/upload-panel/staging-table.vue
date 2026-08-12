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

    <!-- Standing + bulk actions -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
      <button
        class="btn btn-secondary text-sm"
        :disabled="groupCounts.completed === 0 && groupCounts.duplicate === 0"
        @click="$emit('clearCompleted')"
      >
        Clear Completed
      </button>
      <button
        class="btn btn-secondary text-sm"
        :disabled="groupCounts.failed === 0 && groupCounts.cancelled === 0"
        @click="$emit('clearFailed')"
      >
        Clear Failed
      </button>
      <button
        class="btn btn-secondary text-sm"
        :disabled="groupCounts.failed === 0 && groupCounts.cancelled === 0"
        @click="$emit('retryFailed')"
      >
        Retry Failed
      </button>
      <template v-if="selectedIds.size > 0">
        <span class="text-sm text-cloud ml-2">{{ selectedIds.size }} selected:</span>
        <button
          class="btn btn-secondary text-sm"
          @click="emitSelected('startSelected')"
        >
          Start
        </button>
        <button
          class="btn btn-secondary text-sm"
          @click="emitSelected('cancelSelected')"
        >
          Cancel
        </button>
        <button
          class="btn btn-secondary text-sm"
          @click="emitSelected('retrySelected')"
        >
          Retry
        </button>
        <button
          class="btn btn-secondary text-sm"
          @click="emitSelected('clearSelected')"
        >
          Clear
        </button>
      </template>
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
            <th class="px-2 py-2 w-24" />
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
              :title="item.filename"
            >
              {{ displayFilename(item) }}
            </td>
            <td class="px-2 py-1.5">{{ item.siteName ?? item.streamId }}</td>
            <td
              class="px-2 py-1.5 max-w-40 truncate text-cloud"
              :title="item.directory"
            >
              {{ item.directory === '' ? '—' : item.directory }}
            </td>
            <td class="px-2 py-1.5">{{ recDate(item) }}</td>
            <td class="px-2 py-1.5">{{ recTime(item) }}</td>
            <td class="px-2 py-1.5">{{ item.timezoneName ?? '—' }}</td>
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
            <td class="px-2 py-1.5 text-center">
              <button
                v-if="item.state === 'ingested'"
                class="text-frequency hover:text-frequency/70"
                :disabled="openingId === item.id"
                title="Open this recording in the Visualizer (new tab)"
                @click="$emit('openDestination', item)"
              >
                <span v-if="openingId === item.id">…</span>
                <span v-else>↗</span>
              </button>
              <span
                v-else
                class="text-cloud/40"
              >—</span>
            </td>
            <td class="px-2 py-1.5">
              <div class="flex items-center gap-x-1 justify-end">
                <button
                  v-if="canCancel(item)"
                  class="px-1 text-cloud hover:text-flamingo"
                  title="Cancel"
                  @click="$emit('cancelItem', item.id)"
                >✕</button>
                <button
                  v-if="canRetry(item)"
                  class="px-1 text-cloud hover:text-frequency"
                  title="Retry"
                  @click="$emit('retryItem', item.id)"
                >↻</button>
                <button
                  v-if="canClear(item)"
                  class="px-1 text-cloud hover:text-insight"
                  title="Clear from list"
                  @click="$emit('clearItem', item.id)"
                >🗑</button>
              </div>
            </td>
          </tr>
          <tr v-if="visibleSorted.length === 0">
            <td
              :colspan="COLUMNS.length + 3"
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
  (e: 'clearFailed'): void
  (e: 'retryFailed'): void
  (e: 'startSelected', ids: string[]): void
  (e: 'cancelSelected', ids: string[]): void
  (e: 'retrySelected', ids: string[]): void
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
  { key: 'directory', label: 'Directory' },
  { key: 'recDate', label: 'Recording Date' },
  { key: 'recTime', label: 'Recording Time' },
  { key: 'timezoneName', label: 'Timezone/Offset' },
  { key: 'timezoneSource', label: 'Timezone Determined By' },
  { key: 'format', label: 'Format' },
  { key: 'durationMs', label: 'Length' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Transfer Progress' },
  { key: 'rate', label: 'Transfer Rate (Avg)' },
  { key: 'destination', label: 'Destination' }
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
    case 'directory': return (item.directory ?? '').toLowerCase()
    case 'recDate':
    case 'recTime': return item.localWallTime ?? ''
    case 'timezoneName': return item.timezoneName ?? ''
    case 'timezoneSource': return item.timezoneSource ?? ''
    case 'format': return `${item.fileFormat ?? ''}-${item.sampleRateHz ?? 0}`
    case 'durationMs': return item.durationMs ?? -1
    case 'status': return groupOf(item)
    case 'progress': return item.state === 'ingested' ? 2 : (item.progress ?? -1)
    case 'rate': return avgRateBps(item) ?? -1
    case 'destination': return item.state === 'ingested' ? 1 : 0
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

const emitSelected = (event: 'startSelected' | 'cancelSelected' | 'retrySelected' | 'clearSelected'): void => {
  const ids = [...selectedIds.value]
  // explicit dispatch: a dynamic event name defeats the emit overload types
  if (event === 'startSelected') emit('startSelected', ids)
  else if (event === 'cancelSelected') emit('cancelSelected', ids)
  else if (event === 'retrySelected') emit('retrySelected', ids)
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