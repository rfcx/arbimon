<template>
  <div class="text-white bg-pitch rounded-lg w-full">
    <table class="table-auto w-full border-collapse text-sm border-util-gray-03">
      <thead class="bg-pitch text-left">
        <tr>
          <th
            v-if="props.showCheckbox"
            class="w-4 pb-2 pl-2 cursor-pointer border-b-2 border-b-util-gray-03"
          >
            <input
              type="checkbox"
              :checked="areAllRowsSelected"
              class="w-[14px] h-[14px] rounded text-frequency focus:outline-none focus:shadow-none focus:ring-0 focus:ring-offset-0"
              @change="toggleSelectAll"
            >
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="`max-width: ${column.maxWidth || 100}px`"
            class="px-2 pb-2 cursor-pointer border-b-2 border-b-util-gray-03 align-bottom"
            @click="sortBy(column.key)"
          >
            <span
              class="flex items-center truncate"
              :class="isDecimalKey(column.key) ? 'truncate' : ''"
              :style="`max-width: ${column.maxWidth || 100}px`"
              :title="column.label"
            >
              <span class="truncate">
                {{ column.label }}
              </span>
              <span
                v-if="sortKey === column.key"
                class="ml-1 shrink-0 inline-block transform"
                :class="sortOrder === 'asc' ? 'rotate-270' : 'rotate-90'"
              >
                ㄑ
              </span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="(row, index) in sortedRows"
          :key="row.id ?? index"
        >
          <tr
            class="border-t border-util-gray-03 hover:border-util-gray-03 hover:bg-moss cursor-pointer"
            :class="selectedRowIndex === index ? 'bg-[#7F7D78]' : ''"
            @click="handleRowClick(row, index)"
          >
            <td
              v-if="props.showCheckbox"
              class="w-4 pl-2"
            >
              <input
                v-model="selectedRows"
                :checked="isRowSelected(row)"
                class="w-[14px] h-[14px] rounded text-frequency focus:outline-none focus:shadow-none focus:ring-0 focus:ring-offset-0"
                type="checkbox"
                :value="row"
                @click.stop
              >
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :style="`max-width: ${column.maxWidth || 100}px`"
              class="py-2 pl-2 truncate whitespace-nowrap overflow-hidden h-[40px]"
              :title="formatforTitle(column.key, row[column.key], row)"
            >
              {{ formatValueByKey(column.key, row[column.key], row) }}
              <icon-custom-fi-eye-off
                v-if="row.hidden === 1 && column.key === 'name'"
                class="inline-flex text-util-gray-02 mr-2 w-4 ml-1"
              />
            </td>
          </tr>
          <tr v-if="selectedRowIndex === index && showExpand === true">
            <td :colspan="columns.length + (props.showCheckbox ? 1 : 0)">
              <div class="p-2 bg-pitch flex flex-col">
                <div class="recording-img">
                  <div
                    v-show="isLoaded"
                    class="loading-shimmer w-[420px] h-[154px]"
                  />
                  <img
                    :src="row.thumbnail"
                    alt="spectrogram"
                    class="w-[420px] h-[154px]"
                    @load="onImageLoad"
                  >
                </div>
                <button
                  class="btn btn-secondary btn-xs-custom items-center inline-flex w-max hover:bg-opacity-80 mt-2"
                  @click="onVisualizerRedirect(row.id)"
                >
                  <icon-fa-cubes class="w-[15px] h-[12px] mr-1" /> View in Visualizer
                </button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, ref, toRaw, watch } from 'vue'

interface Column {
  label: string
  key: string
  maxWidth: number
}

export interface Row {
  [key: string]: any
}

type FormatType = 'datetime' | 'date' | 'friendly'

const decimalKeys = ['lat', 'lon', 'alt', 'rec_count']
function isDecimalKey (key: string): boolean {
  return decimalKeys.includes(key)
}
const props = defineProps<{
  columns: Column[]
  rows: Row[]
  defaultSortKey?: string
  defaultSortOrder?: 'asc' | 'desc'
  selectedRow?: Row | null
  showCheckbox?: boolean
  projectSlug?: string
  showExpand?: boolean
}>()

const emit = defineEmits<{(e: 'selectedItem', row?: Row): void, (e: 'selectedRows', rows?: Row[]): void}>()

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const selectedRows = ref<Row[]>([])
const isLoaded = ref(true)

function onImageLoad () {
  isLoaded.value = false
}

const onVisualizerRedirect = (id: number) => {
  window.location.assign(`${window.location.origin}/project/${props.projectSlug ?? ''}/visualizer/rec/${id}`)
}

const areAllRowsSelected = computed(() => {
  return sortedRows.value.length > 0 &&
    sortedRows.value.every(row =>
      selectedRows.value.some(selected => selected.id === row.id)
    )
})

const toggleSelectAll = () => {
  const currentPage = sortedRows.value.map(row => row)

  if (areAllRowsSelected.value) {
    selectedRows.value = selectedRows.value.filter(
      r => !currentPage.includes(r)
    )
  } else {
    sortedRows.value.forEach(row => {
      if (!selectedRows.value.some(r => r === row)) {
        selectedRows.value.push(row)
      }
    })
  }
}

const isRowSelected = (row: Row): boolean => {
  return selectedRows.value.some(r => r === row)
}

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows

  return [...props.rows].sort((a, b) => {
    const aVal = a[sortKey.value!]
    const bVal = b[sortKey.value!]

    if (aVal == null) return 1
    if (bVal == null) return -1
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const selectedRowIndex = ref<number | null>(null)

function formatValueByKey (key: string, value: any, row: any, forTitle?: boolean): string {
  if (row.hidden === 1 && (key === 'lat' || key === 'lon' || key === 'alt' || key === 'timezone')) {
    return '-'
  }

  if (value === null || value === undefined || value === '') return '-'
  if (key === 'timezone') return forTitle === true ? value : getUTCOffset(value)
  if (key === 'deployment') return value === 0 ? 'no data' : formatDateTime(value, row.timezone)
  if (key === 'updated_at') return formatDateTime(value, row.timezone)
  if (key === 'datetime') return forTitle === true ? getUTCOffset(row.timezone) : formatDateFullInParens(value, row.timezone)
  if (key === 'comments') return forTitle === true ? row.meta.comment ?? value : value
  if (key === 'site') return forTitle === true ? '' : value
  if (key === 'upload_time') return forTitle === true ? '' : formatDateShort(value, row.timezone)
  if (key === 'recorder') return forTitle === true ? '' : value

  if (typeof value !== 'number') return value

  if (key === 'lat' || key === 'lon') {
    return parseFloat(value.toFixed(3)).toString()
  }

  if (key === 'alt') {
    return Math.round(value).toString()
  }

  return value.toString()
}

function formatforTitle (key: string, value: any, row: any): string {
  return formatValueByKey(key, value, row, true)
}

function getUTCOffset (timeZone: string | undefined): string {
  if (!timeZone || typeof timeZone !== 'string') return ''

  try {
    const now = new Date()
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    })
    const parts = dtf.formatToParts(now)
    const tzPart = parts.find(part => part.type === 'timeZoneName')

    if (!tzPart) return '-'
    const gmt = tzPart.value
    const match = gmt.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
    if (!match) return '-'

    const sign = match[1]
    const hour = match[2].padStart(2, '0')
    const minute = match[3] || '00'

    if (minute === '00') {
      return `UTC${sign}${hour}`
    } else {
      return `UTC${sign}${hour}:${minute}`
    }
  } catch {
    return '-'
  }
}

/**
 * Format a date string into one of 3 styles, with timezone and UTC support.
 * @param dateStr Input date string (ISO, UTC, or local)
 * @param options Optional config:
 *  - timeZone: timezone name (default 'Asia/Bangkok')
 *  - isUTC: true if input is in UTC format
 *  - format: 'datetime' = 'YYYY-MM-DD HH:mm:ss', 'date' = 'YYYY-MM-DD', 'friendly' = 'MMM D, YYYY h:mm A'
 *  - wrapInParens: true to wrap output in ( )
 */
 function formatDateFlexible (
  dateStr: string,
  options?: {
    timeZone?: string
    isUTC?: boolean
    format?: FormatType
    wrapInParens?: boolean
  }
): string {
  if (!dateStr) return '-'

  const {
    timeZone = 'Asia/Bangkok',
    isUTC = false,
    format = 'datetime'
    } = options || {}

  try {
    const date = isUTC
      ? dayjs.utc(dateStr).tz(timeZone)
      : dayjs.tz(dateStr, timeZone)

    const formatStr =
      format === 'date'
        ? 'YYYY-MM-DD'
        : format === 'friendly'
        ? 'MMM D, YYYY h:mm A'
        : 'YYYY-MM-DD HH:mm:ss'

    return date.format(formatStr)
  } catch {
    return '-'
  }
}

const formatDateTime = (d: string, tz?: string) =>
  formatDateFlexible(d, { timeZone: tz, format: 'friendly' })

const formatDateShort = (d: string, tz?: string) =>
  formatDateFlexible(d, { timeZone: tz, format: 'date' })

const formatDateFullInParens = (d: string, tz?: string) =>
  formatDateFlexible(d, { timeZone: tz, format: 'datetime' })

function handleRowClick (row: Row, index: number) {
  isLoaded.value = true
  if (selectedRowIndex.value === index) {
    selectedRowIndex.value = null
    emit('selectedItem', undefined)
    return
  }
  selectedRowIndex.value = index
  emit('selectedItem', row)
}

onMounted(() => {
  if (props.defaultSortKey) {
    sortKey.value = props.defaultSortKey
    sortOrder.value = props.defaultSortOrder ?? 'asc'
  }
})

watch(selectedRows, (rows) => {
  emit('selectedRows', rows.map(r => toRaw(r)))
}, { deep: true })

watch(() => props.selectedRow, (row) => {
  if (row != null) {
    const index = sortedRows.value.findIndex(r => r.id === row.id)
    selectedRowIndex.value = index
  } else {
    selectedRowIndex.value = null
  }
})
</script>

<style scoped>
.recording-img {
  background-color: #D3D2CF;
  border-color: #D3D2CF;
  width: 420px;
  height: 153px;
}

.btn-xs-custom {
  @apply px-[5px] py-[1px] text-[12px] leading-[1.5] rounded-full hover:bg-opacity-80;
}
</style>
