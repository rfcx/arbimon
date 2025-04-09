<template>
  <section class="py-10 bg-white dark:bg-pitch pl-18">
    <div class="flex items-center">
      <h1 class="text-gray-900 dark:text-insight ml-8">
        Sites
      </h1>
      <button
        class="btn btn-primary btn-medium group ml-2 btn-small"
        @click="createSite()"
      >
        <span>Create</span>
      </button>
      <button
        class="btn btn-secondary btn-medium group ml-2 btn-small"
        @click="importSite()"
      >
        <span>Bulk Import Sites</span>
      </button>
    </div>
    <div class="grid grid-cols-12 gap-4 mt-8 mx-8">
      <div class="col-span-12 md:col-span-8 w-full overflow-x-auto">
        <div class="p-1">
          <button
            :disabled="selectedSite == undefined"
            class="btn btn-secondary btn-medium group btn-small disabled:cursor-not-allowed disabled:btn-disabled disabled:hover:btn-disabled"
            @click="editSite()"
          >
            <span>Edit Site</span>
          </button>
          <button class="btn btn-secondary btn-medium group ml-2 btn-small">
            <span>Delete</span>
          </button>
          <button
            class="btn btn-secondary btn-medium group ml-2 btn-small"
            @click="exportSites()"
          >
            <span>Export Sites</span>
          </button>
        </div>
        <div
          v-show="!isLoadingSiteCount"
          class="mt-4"
        >
          <span class="text-left reclist-total">
            {{ sitesCount() }} {{ sitesCount() > 1 ? "sites" : "site" }}
          </span>
        </div>
        <div class="bg-echo mt-5">
          <table class="w-full table-fixed bg-echo">
            <thead class="h-10 border-b-1 border-util-gray-02">
              <tr>
                <th
                  v-for="(item, idx) in tableHeader"
                  :key="'species-table-header-' + item.title"
                  class="font-bold capitalize pt-2 px-1 select-none"
                  :class="{
                    'text-left': idx < 2,
                    'w-32 lg:w-36': idx < 1,
                    'w-20': tableHeader.length > 2 && idx >= 1,
                    'sticky left-0': idx === 0,
                    'sticky left-32 lg:left-36': idx === 1,
                    'cursor-pointer': item.key
                  }"
                  :style="{ 'box-shadow': `inset 0 -3px 0 ${HEADER_COLOR}` }"
                  @click="sort(item.key)"
                >
                  <div
                    class="flex flex-row"
                    :class="{ 'justify-center': idx >= 2 }"
                  >
                    {{ item.title }}
                    <!-- <div
                      v-if="item.key"
                      class="ml-2 text-util-gray-02"
                    >
                      <icon-fa-chevron-up
                        class="text-xxs"
                        :class="{'text-white': sortColumn === item.key && sortDirection === 1 }"
                      />
                      <icon-fa-chevron-down
                        class="text-xxs"
                        :class="{'text-white': sortColumn === item.key && sortDirection === -1 }"
                      />
                    </div> -->
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in pageData"
                :key="'species-table-row-' + row.name"
                @click="clickSite(row)"
              >
                <td class="p-2 sticky left-0 lg:left-0 z-10">
                  {{ row.name }}
                </td>
                <td class="p-2 sticky left-32 lg:left-36 z-10">
                  {{ row.rec_count }}
                </td>
                <td class="p-2 sticky left-32 lg:left-36 z-10">
                  {{ row.lat }}
                </td>
                <td class="p-2 sticky left-32 lg:left-36 z-10">
                  {{ row.lon }}
                </td>
                <td class="p-2 sticky left-32 lg:left-36 z-10">
                  {{ row.alt }}
                </td>
                <td class="p-2 sticky left-32 lg:left-36 z-10">
                  {{ row.timezone }}
                </td>
                <td class="p-2 sticky left-32 lg:left-36 z-10">
                  {{ row.updated_at }}
                </td>
                <td class="p-2 sticky left-32 lg:left-36 z-10">
                  {{ row.deployment }}
                </td>
              </tr>
              <tr
                v-for="blankIndex in pageSize - pageData.length"
                :key="'blank-row' + blankIndex"
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
      </div>
      <div class="col-span-12 md:col-span-4 w-full overflow-x-auto">
        <CreateEditSite
          v-if="creating || editing"
          :editing="editing"
          :site="selectedSite"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { type SiteParams, type SiteResponse } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useSites } from './api/use-sites'
import CreateEditSite from './component/create-edit-site.vue'

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

// API
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const siteParams = computed<SiteParams>(() => {
  return {
    count: true,
    deployment: true,
    logs: true
  }
})
const { isLoading: isLoadingSiteCount, data: sites } = useSites(apiClientArbimon, selectedProjectSlug, siteParams)

// Show on UI
const sitesCount = () => {
  return sites.value?.length ?? 0
}

const creating = ref(false)
const editing = ref(false)
const selectedSite = ref<SiteResponse | undefined>(undefined)

// Table
export interface SiteItem {
  name: string
  rec_count: number
  lat: string
  lon: string
  alt: string
  data: boolean[]
  total: number
}

type SortableColumn = 'name' | 'rec_count' | 'lat' | 'lon' | 'alt' | 'timezone' | 'updated_at' | 'deployment'
type SortDirection = 1 | -1

interface Header {
  title: string
  key?: SortableColumn
}

const SORT_ASC: SortDirection = 1
const SORT_DESC: SortDirection = -1
const SORTABLE_COLUMNS: Record<SortableColumn, { defaultDirection: SortDirection, sortFunction: (e1: SiteResponse, e2: SiteResponse) => number }> = {
  name: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.name.localeCompare(e2.name)
  },
  rec_count: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.rec_count - e2.rec_count
  },
  lat: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.lat - e2.lat
  },
  lon: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.lon - e2.lon
  },
  alt: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.alt - e2.alt
  },
  timezone: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.name.localeCompare(e2.name)
  },
  updated_at: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.name.localeCompare(e2.name)
  },
  deployment: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.deployment - e2.deployment
  }
}

const HEADER_COLOR = '#ffffff80'
const tableHeader: Header[] =
  [
    { title: 'Name', key: 'name' },
    { title: 'No. of recordings', key: 'rec_count' },
    { title: 'Latitude', key: 'lat' },
    { title: 'Longitude', key: 'lon' },
    { title: 'Elevation', key: 'alt' },
    { title: 'Current Timezone', key: 'timezone' },
    { title: 'Updated', key: 'updated_at' },
    { title: 'Deployed', key: 'deployment' }
  ]

const pageIndex = 1 // 1-based for humans
const pageSize = 10
let sortColumn: SortableColumn = 'name'
let sortDirection: SortDirection = SORTABLE_COLUMNS.name.defaultDirection

const sort = (column?: SortableColumn) => {
  if (!column) return

  if (sortColumn === column) {
    // Change direction
    sortDirection = sortDirection === SORT_ASC
      ? SORT_DESC
      : SORT_ASC
  } else {
    // Change column
    sortColumn = column
    sortDirection = SORTABLE_COLUMNS[column].defaultDirection
  }
}

const sortedTableData = computed((): SiteResponse[] | undefined => {
  return sites.value
})

const pageData = computed((): SiteResponse[] => {
  const start = (pageIndex - 1) * pageSize
  return sortedTableData.value?.slice(start, start + pageSize) ?? []
})

// function
// const deleteSelectedSite = () => { console.info('deleteSelectedSite') }
// const deleteAllEmptySites = () => { console.info('DeleteAllEmptySites') }
const exportSites = () => { console.info('exportSites') }
const editSite = () => {
  creating.value = false
  editing.value = true
}
const importSite = () => { console.info('importSite') }
const createSite = () => {
  creating.value = true
  editing.value = false
 }

const clickSite = (site: SiteResponse) => {
  selectedSite.value = site
}
</script>
