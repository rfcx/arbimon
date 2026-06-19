<template>
  <div class="flex justify-between items-center gap-x-4 gap-y-2 flex-wrap">
    <!-- Left: count + currently-displaying range, left-justified -->
    <div class="flex items-center flex-wrap gap-x-3 gap-y-1">
      <span class="ml-1 font-bold text-left text-sm leading-[26px] text-white whitespace-nowrap">
        {{ rangeText }}
      </span>
      <div
        v-if="showFiltersApplied"
        class="px-2 py-1 bg-util-gray-04 text-sm rounded-[3px] font-medium"
      >
        Filters applied
      </div>
    </div>

    <!-- Right: pagination + page-size + refresh, horizontally stacked, right-justified -->
    <div class="flex items-center gap-x-3 flex-wrap justify-end">
      <PaginationComponent
        v-if="totalPages > 0"
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:current-page="onPageChange"
      />
      <!-- visual separator between pagination and page-size controls -->
      <span
        v-if="totalPages > 0"
        class="self-stretch w-px bg-util-gray-03 mx-1"
        aria-hidden="true"
      />
      <div class="inline-flex border border-util-gray-03 rounded overflow-hidden">
        <button
          v-for="option in limitOptions"
          :key="option"
          :class="[
            'px-[10px] py-[5px] text-xs border-l font-bold border-util-gray-03 first:border-l-0',
            limitPerPage === option
              ? 'bg-util-gray-03 text-white'
              : 'hover:bg-util-gray-04 text-white',
          ]"
          @click="emit('update:limitPerPage', option)"
        >
          {{ option }}
        </button>
      </div>
      <button
        v-if="showRefresh"
        class="px-[10px] py-[5px] text-xs text-white border border-util-gray-03 rounded hover:bg-util-gray-04 transition"
        title="Refresh"
        @click="emit('refresh')"
      >
        <icon-fa-refresh class="w-[10px]" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import PaginationComponent from './pagination-component.vue'

const props = withDefaults(defineProps<{
  totalCount: number
  currentPage: number
  totalPages: number
  limitPerPage: number
  limitOptions?: number[]
  noun?: string
  pluralNoun?: string
  showFiltersApplied?: boolean
  showRefresh?: boolean
}>(), {
  limitOptions: () => [10, 25, 50, 100],
  noun: 'Recording',
  pluralNoun: 'Recordings',
  showFiltersApplied: false,
  showRefresh: false
})

const emit = defineEmits<{(e: 'update:currentPage', value: number): void, (e: 'update:limitPerPage', value: number): void, (e: 'refresh'): void }>()

const onPageChange = (p: number): void => emit('update:currentPage', p)

const fmt = (n: number): string => new Intl.NumberFormat('en-US').format(n)

// "11-20 of 100,000 Recordings" (or "1 Recording", "0 Recordings")
const rangeText = computed<string>(() => {
  const total = props.totalCount
  const noun = total === 1 ? props.noun : props.pluralNoun
  if (total <= 0) return `0 ${props.pluralNoun}`
  const start = (props.currentPage - 1) * props.limitPerPage + 1
  const end = Math.min(props.currentPage * props.limitPerPage, total)
  return `${fmt(start)}-${fmt(end)} of ${fmt(total)} ${noun}`
})
</script>
