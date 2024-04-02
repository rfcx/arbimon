<template>
  <div
    v-if="loading"
    class="loading-shimmer h-32 mt-2"
  />
  <no-data-panel
    v-else-if="!hasTableData"
    class="h-32 mt-2"
  />
  <div
    v-else
    class="mt-2 bg-echo"
  >
    <div class="w-full overflow-x-auto">
      <table class="w-full table-fixed">
        <thead class="h-10 border-b-1 border-util-gray-02">
          <tr>
            <th
              v-for="(item, idx) in tableHeader"
              :key="'species-table-header-' + item.title"
              class="font-bold capitalize select-none px-4"
              :class="{
                'text-left': idx < 2,
                'w-52 lg:w-66': idx < 1,
                'w-20': idx === 1,
                'w-36': idx > 1,
                'sticky left-0': idx === 0,
                'cursor-pointer': item.key
              }"
              @click="sort(item.key)"
            >
              <div
                class="flex items-center text-xs"
                :class="{ 'justify-center': idx >= 2 }"
              >
                {{ item.title }}
                <div
                  v-if="item.key"
                  class="ml-2 text-faded"
                >
                  <icon-fa-chevron-up
                    class="text-xxs"
                    :class="{'text-white': sortColumn === item.key && sortDirection === 1 }"
                  />
                  <icon-fa-chevron-down
                    class="text-xxs"
                    :class="{'text-white': sortColumn === item.key && sortDirection === -1 }"
                  />
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(row, idx) in pageData"
            :key="'species-table-row-' + row.scientificName + idx"
          >
            <tr class="border-b-1 border-util-gray-01">
              <td class="py-2 pl-4 sticky left-0 z-10">
                <router-link
                  :to="{ name: ROUTE_NAMES.cnnJobDetailBySpecies, params: { jobId, speciesSlug: row.value }}"
                  class="text-subtle hover:(underline text-white) flex"
                >
                  <img
                    v-if="row.image"
                    class="h-8 w-8 self-center rounded-full"
                    :src="row.image"
                  >
                  <div
                    v-else
                    class="h-8 w-8 rounded-full bg-util-gray-03"
                  />
                  <div class="ml-2">
                    <span class="text-insight text-base italic">{{ row.title }}</span>
                    <p
                      v-if="row.value"
                      class="text-xs text-util-gray-01"
                    >
                      {{ row.value }}
                    </p>
                    <p
                      v-else
                      class="invisible text-xs text-util-gray-01"
                    >
                      Unknown
                    </p>
                  </div>
                </router-link>
              </td>
              <td class="p-2 text-center text-xs text-insight">
                {{ row.unvalidated }}
              </td>
              <td class="p-2 text-center text-xs text-insight">
                {{ row.confirmed }}
              </td>
              <td class="p-2 text-center text-xs text-insight">
                {{ row.rejected }}
              </td>
              <td class="p-2 text-center text-xs text-insight">
                {{ row.uncertain }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div
      v-if="props.datasets?.length"
      class="w-full flex flex-row justify-end mt-3"
    >
      <div class="flex flex-row items-center text-sm gap-x-1">
        <div class="text-sm">
          <input
            v-model.number="pageIndex"
            type="number"
            min="1"
            :max="maxPage"
            class="text-center bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          <span>of</span>
          <span class="px-1.5 text-sm">{{ maxPage }}</span>
          <span>pages</span>
        </div>
      </div>
      <button
        class="btn btn-icon ml-4 rounded-md bg-fog border-0 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="pageIndex - 1 === 0"
        @click="setPage(pageIndex - 1)"
      >
        <icon-fas-chevron-left class="w-3 h-3 text-pitch" />
      </button>
      <button
        class="btn btn-icon ml-2 rounded-md bg-fog border-0 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="props.datasets == null || props.datasets.length < pageSize"
        @click="setPage(pageIndex + 1)"
      >
        <icon-fas-chevron-right class="w-3 h-3 text-pitch" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

type SortableColumn = 'name' | 'unvalidated' | 'present' | 'notPresent' | 'unknown'
type SortDirection = 1 | -1

interface Header {
  title: string
  key: SortableColumn
}

export interface ClassificationsSummaryDataset {
  value: string
  title: string
  image: string | null
  unvalidated: number
  rejected: number
  uncertain: number
  confirmed: number
}

const SORT_ASC: SortDirection = 1
const SORT_DESC: SortDirection = -1

const tableHeader: Header[] =
  [
    { title: 'Class', key: 'name' },
    { title: 'Unvalidated', key: 'unvalidated' },
    { title: 'Present', key: 'present' },
    { title: 'Not Present', key: 'notPresent' },
    { title: 'Unknown', key: 'unknown' }
  ]

const props = withDefaults(defineProps<{ datasets: ClassificationsSummaryDataset[], loading: boolean, total: number, index: number}>(), {
  loading: false
})

const emit = defineEmits<{(e: 'emitSortPaginations', sortKey?: string, pageIndex?: number): void }>()
const route = useRoute()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)

const sortColumn = ref<SortableColumn>()
const sortDirection = ref<SortDirection>()

const hasTableData = ref(props.datasets.length === 0)
const pageSize = ref(25)
const maxPage = ref(1)
const pageIndex = ref(1)
const hasSort = ref(false)

const pageData = computed(() : ClassificationsSummaryDataset[] => {
  return props.datasets ?? []
})

watch(() => props.datasets, () => {
  pageSize.value = props.datasets === undefined ? 0 : 25
  maxPage.value = Math.ceil(props.total / pageSize.value)

  if (pageIndex.value > maxPage.value) pageIndex.value = 1
  hasTableData.value = props.datasets !== undefined
})

watch(() => props.index, () => {
  pageIndex.value = props.index
})

const setPage = (page: number) => {
  // Wrap-around
  let newPage = page
  if (page < 1) newPage = maxPage.value
  if (page > maxPage.value) newPage = 1

  pageIndex.value = newPage

  if (hasSort.value) {
    emit('emitSortPaginations', `${sortDirection.value === SORT_DESC ? '-' : ''}${sortColumn.value}`, pageIndex.value)
  } else {
    emit('emitSortPaginations', undefined, pageIndex.value)
  }
}

const sort = (column?: SortableColumn) => {
  if (!column) return
  hasSort.value = true

  if (sortColumn.value === column) {
    // Change direction
    sortDirection.value = sortDirection.value === SORT_ASC
      ? SORT_DESC
      : SORT_ASC
  } else {
    // Change column
    sortColumn.value = column
    sortDirection.value = SORT_ASC
  }
  emit('emitSortPaginations', `${sortDirection.value === SORT_DESC ? '-' : ''}${column}`, pageIndex.value)
}

</script>
