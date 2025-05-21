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
          <button
            class="btn btn-secondary btn-medium group ml-2 btn-small"
            @click="deleteSelectedSite"
          >
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
        <SortableTable
          class="mt-5"
          :columns="columns"
          :rows="sites ?? []"
          :default-sort-key="'updated_at'"
          :default-sort-order="'desc'"
          @selected-item="onSelectedItem"
        />
      </div>
      <div class="col-span-12 md:col-span-4 w-full overflow-x-auto">
        <CreateEditSite
          v-if="creating || editing"
          :editing="editing"
          :site="selectedSite"
          @emit-close="onClose"
          @emit-reload-site="reloadSite"
        />
      </div>
    </div>
    <CustomPopup
      :visible="showPopup"
      :is-for-delete-popup="true"
      :list="sitesSelected"
      title="Delete selected site"
      message="Are you sure you would like to delete the following site?"
      btn-ok-text="Delete"
      btn-cancel-text="Cancel"
      @ok="handleOk"
      @cancel="handleCancel"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { type SiteParams, type SiteResponse, apiLegacySiteDelete } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useSites } from './api/use-sites'
import CreateEditSite from './component/create-edit-site.vue'
import CustomPopup from './component/custom-popup.vue'
import SortableTable from './component/sortable-table.vue'

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
const { isLoading: isLoadingSiteCount, data: sites, refetch: siteRefetch } = useSites(apiClientArbimon, selectedProjectSlug, siteParams)

const sitesSelected = ref<string[]>([])
const siteIds = ref<(string | number)[]>([])

// Show on UI
const sitesCount = () => {
  return sites.value?.length ?? 0
}
const columns = [
  { label: 'Name', key: 'name', maxWidth: 150 },
  { label: 'No. of records', key: 'rec_count', maxWidth: 50 },
  { label: 'Latitude', key: 'lat', maxWidth: 50 },
  { label: 'Longitude', key: 'lon', maxWidth: 50 },
  { label: 'Elevation', key: 'alt', maxWidth: 50 },
  { label: 'Current Timezone', key: 'timezone', maxWidth: 70 },
  { label: 'Updated', key: 'updated_at', maxWidth: 100 },
  { label: 'Deployed', key: 'deployment', maxWidth: 60 }
]

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

const showPopup = ref(false)

async function handleOk () {
    try {
      await apiLegacySiteDelete(apiClientArbimon, selectedProjectSlug.value ?? '', siteIds.value)
      showPopup.value = false
    } catch (e) { }
}

const handleCancel = () => {
  showPopup.value = false
}

// function
const deleteSelectedSite = () => {
  showPopup.value = !showPopup.value
  // checkEmptySites()
}
const exportSites = () => {
  const url = `${window.location.origin}/legacy-api/project/${selectedProjectSlug.value}/sites-export.csv`
  const link = document.createElement('a')
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
 }
const editSite = () => {
  creating.value = false
  editing.value = true
}
const importSite = () => { console.info('importSite') }
const onClose = () => {
  creating.value = false
  editing.value = false
}

const reloadSite = async (): Promise<void> => {
  creating.value = false
  editing.value = false
  await siteRefetch()
}

const createSite = () => {
  creating.value = true
  editing.value = false
}

function onSelectedItem (row?: Record<string, any>) {
  if (!row) {
    selectedSite.value = undefined
  }
  selectedSite.value = row as SiteResponse
}

function checkEmptySites () {
  const names: string[] = []
  const ids: (string | number)[] = []

  sites.value?.forEach(site => {
    if (site.rec_count === 0 && !names.includes(site.name)) {
      names.push(site.name)
      ids.push(site.id)
    }
  })

  if (!names.length) {
    console.info('There is no empty site in your project')
    return
  }

  if (names.length > 3) {
    const msg = `& ${names.length - 3} other sites`
    names.splice(3)
    names.push(msg)
  }
  sitesSelected.value = names
  siteIds.value = ids
}

</script>
