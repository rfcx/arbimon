<template>
  <div class="text-white bg-black rounded-lg w-full">
    <table class="table-auto w-full border-collapse text-sm">
      <thead class="bg-gray-800 text-left">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-2 cursor-pointer"
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
          class="border-t border-gray-700 hover:bg-gray-900"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-2"
          >
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from 'vue'

interface Column {
  label: string
  key: string
}

interface Row {
  [key: string]: any
}

const props = defineProps<{
  columns: Column[]
  rows: Row[]
  defaultSortKey?: string
  defaultSortOrder?: 'asc' | 'desc'
}>()

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

onMounted(() => {
  if (props.defaultSortKey) {
    sortKey.value = props.defaultSortKey
    sortOrder.value = props.defaultSortOrder ?? 'asc'
  }
})
</script>
