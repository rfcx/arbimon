<template>
  <div class="text-white bg-pitch rounded-lg w-full">
    <table class="table-auto w-full border-collapse text-sm border-util-gray-03">
      <thead class="bg-pitch text-left">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-2 pb-2 cursor-pointer border-b-2 border-b-util-gray-03"
            :class="isDecimalKey(column.key) ? 'truncate' : ''"
            :style="`max-width: ${column.maxWidth || 100}px`"
            @click="sortBy(column.key)"
          >
            {{ column.label }}
            <span v-if="sortKey === column.key">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in sortedRows"
          :key="index"
          class="border-t border-util-gray-03 hover:border-util-gray-03"
          :class="selectedRowIndex === index ? 'bg-[#7F7D78]': ''"
          @click="handleRowClick(row, index)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :style="`max-width: ${column.maxWidth || 100}px`"
            class="py-2 pl-2 truncate whitespace-nowrap overflow-hidden"
          >
            {{ formatValueByKey(column.key, row[column.key], row) }}
            <icon-custom-fi-eye-off
              v-if="row.hidden === 1 && column.key === 'name'"
              class="inline-flex text-util-gray-02 mr-2 w-4 ml-1"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, defineEmits, defineProps, onMounted, ref, watch } from 'vue'

interface Column {
  label: string
  key: string
  maxWidth: number
}

export interface Row {
  [key: string]: any
}

const decimalKeys = ['lat', 'lon', 'alt']
function isDecimalKey (key: string): boolean {
  return decimalKeys.includes(key)
}
const props = defineProps<{
  columns: Column[]
  rows: Row[]
  defaultSortKey?: string
  defaultSortOrder?: 'asc' | 'desc'
  selectedRow?: Row | null
}>()

const emit = defineEmits<{(e: 'selectedItem', row?: Row): void}>()

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

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

function formatValueByKey (key: string, value: any, row: any): string {
  if (row.hidden === 1 && (key === 'lat' || key === 'lon' || key === 'alt' || key === 'timezone')) {
    return '-'
  }

  if (value === null || value === undefined || value === '') return '-'
  if (key === 'timezone') return getUTCOffset(value)
  if (key === 'deployment') return value === 0 ? 'no data' : formatDateTime(value, row.timezone)
  if (key === 'updated_at') return formatDateTime(value, row.timezone)

  if (typeof value !== 'number') return value

  if (key === 'lat' || key === 'lon') {
    return parseFloat(value.toFixed(3)).toString()
  }

  if (key === 'alt') {
    return Math.round(value).toString()
  }

  return value.toString()
}

function getUTCOffset (timeZone: string | undefined): string {
  if (!timeZone || typeof timeZone !== 'string') return ''

  try {
    const now = new Date()
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset'
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

function formatDateTime (dateStr: string, timeZone?: string): string {
  if (!dateStr) return '-'
  try {
    return dayjs(dateStr).tz(timeZone).format('MMM D, YYYY h:mm A')
  } catch {
    return dayjs(dateStr).format('MMM D, YYYY h:mm A')
  }
}

function handleRowClick (row: Row, index: number) {
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

watch(() => props.selectedRow, (row) => {
  if (row != null) {
    const index = sortedRows.value.findIndex(r => r.id === row.id)
    selectedRowIndex.value = index
  }
})
</script>
