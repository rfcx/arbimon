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
                  :to="{ name: ROUTE_NAMES.cnnJobList }"
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
          <tr
            v-for="blankIndex in pageSize - pageData.length"
            :key="'blank-row-' + blankIndex"
          >
            <td class="p-2">
              <span>&nbsp;</span>
            </td>
          </tr>
          <tr
            class="h-2 border-b-1 border-subtle"
          >
            <td :colspan="tableHeader.length" />
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-end mt-3">
      <div class="flex justify-end">
        <div class="text-sm">
          <input
            v-model.number="pageIndex"
            type="number"
            min="1"
            :max="maxPage"
            class="text-center bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
          >
          of
          <span class="ml-1.5">{{ maxPage }}</span>
        </div>
        <button
          class="btn btn-icon ml-4 rounded-md bg-fog border-0"
          @click="previousPage()"
        >
          <icon-fas-chevron-left class="w-3 h-3 text-pitch" />
        </button>
        <button
          class="btn btn-icon ml-2 rounded-md bg-fog border-0"
          @click="nextPage()"
        >
          <icon-fas-chevron-right class="w-3 h-3 text-pitch" />
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { ROUTE_NAMES } from '~/router'

type SortableColumn = 'scientificName' | 'unvalidated' | 'present' | 'notPresent' | 'unknown'
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

const SORTABLE_COLUMNS: Record<SortableColumn, { defaultDirection: SortDirection, sortFunction: (e1: ClassificationsSummaryDataset, e2: ClassificationsSummaryDataset) => number }> = {
  scientificName: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.title.localeCompare(e2.title)
  },
  unvalidated: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.unvalidated - e2.unvalidated
  },
  present: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.confirmed - e2.confirmed
  },
  notPresent: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.rejected - e2.rejected
  },
  unknown: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.uncertain - e2.uncertain
  }
}

const props = withDefaults(defineProps<{ datasets: ClassificationsSummaryDataset[], loading: boolean }>(), {
loading: false
})

const sortColumn = ref<SortableColumn>('scientificName')
const sortDirection = ref<SortDirection>(SORTABLE_COLUMNS.scientificName.defaultDirection)

const pageIndex = ref(1) // 1-based for humans

const tableHeader: Header[] =
  [
    { title: 'Class', key: 'scientificName' },
    { title: 'Unvalidated', key: 'unvalidated' },
    { title: 'Present', key: 'present' },
    { title: 'Not Present', key: 'notPresent' },
    { title: 'Unknown', key: 'unknown' }
  ]

const hasTableData = ref(props.datasets !== undefined)
const pageSize = ref(25)
const maxPage = ref(0)

const sortedTableData = computed((): ClassificationsSummaryDataset[] => {
  // Sort by user-chosen sort, then our default sort
  const list = props.datasets
  return list.sort((a, b) =>
    SORTABLE_COLUMNS[sortColumn.value].sortFunction(a, b) * sortDirection.value ||
    SORTABLE_COLUMNS.scientificName.sortFunction(a, b) * SORTABLE_COLUMNS.scientificName.defaultDirection
  )
})

const pageData = computed(() : ClassificationsSummaryDataset[] => {
  if (props.datasets === undefined) return []
  const start = (pageIndex.value - 1) * pageSize.value
  return sortedTableData.value.slice(start, start + pageSize.value)
})

watch(() => props.datasets, () => {
  pageSize.value = props.datasets === undefined ? 0 : 25
  maxPage.value = Math.ceil(props.datasets.length / pageSize.value)

  if (pageIndex.value > maxPage.value) pageIndex.value = 1
  hasTableData.value = props.datasets !== undefined
})

const previousPage = () => setPage(pageIndex.value - 1)

const nextPage = () => setPage(pageIndex.value + 1)

const setPage = (page: number) => {
  // Wrap-around
  let newPage = page
  if (page < 1) newPage = maxPage.value
  if (page > maxPage.value) newPage = 1

  pageIndex.value = newPage
}

const sort = (column?: SortableColumn) => {
  if (!column) return

  if (sortColumn.value === column) {
    // Change direction
    sortDirection.value = sortDirection.value === SORT_ASC
      ? SORT_DESC
      : SORT_ASC
  } else {
    // Change column
    sortColumn.value = column
    sortDirection.value = SORTABLE_COLUMNS[column].defaultDirection
  }
}

</script>
