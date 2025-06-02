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
        @click="triggerFileInput"
      >
        <span>Bulk Import Sites</span>
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        style="display: none"
        @change="handleFileUpload"
      >
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
            class="group btn btn-secondary btn-medium group ml-2 btn-small"
            data-dropdown-toggle="mapDropdown"
          >
            <span class="inline-flex gap-1 group-hover:fill-blue-500">
              Delete
              <icon-custom-el-angle-down class="ml-2 mt-1 group-hover:stroke-pitch inline-flex w-3 h-3" />
            </span>
          </button>
          <div
            id="mapDropdown"
            class="z-10 hidden bg-moss border-1 border-frequency rounded-lg"
          >
            <ul
              aria-labelledby="mapTypeDropdown"
              class="p-2 flex flex-col font-medium"
            >
              <li
                key="mapStyle.name"
                class="bg-moss text-frequency px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-util-gray-04/60"
                @click="deleteSelectedSite"
              >
                Delete selected site
              </li>
              <li
                key="mapStyle.name"
                class="bg-moss text-frequency px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-util-gray-04/60"
                @click="deleteAllEmptySites"
              >
                Delete all empty sites
              </li>
            </ul>
          </div>
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
          :selected-row="selectedSite"
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
        <map-view
          :data="markers"
          class="relative left-0 z-30 w-full h-100vh"
          :selected-project-id="undefined"
          :is-error="false"
          @emit-selected="onEmitSelected"
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
    <ImportSiteModal
      ref="importSiteModal"
      @imported="handleCsvData"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onMounted, ref } from 'vue'

import { type CreateSiteBody, type SiteParams, type SiteResponse, apiCorePostCreateSite, apiLegacySiteDelete } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type LocationProjectWithInfo, apiBioGetMyProjects } from '@rfcx-bio/common/api-bio/project/projects'

import { apiClientArbimonLegacyKey, apiClientCoreKey, apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { useSites } from './api/use-sites'
import CreateEditSite from './component/create-edit-site.vue'
import CustomPopup from './component/custom-popup.vue'
import ImportSiteModal from './component/import-site-modal.vue'
import MapView from './component/map-view.vue'
import SortableTable from './component/sortable-table.vue'

interface Site {
  name: string;
  lat: number;
  lon: number;
  alt: number;
}

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const importSiteModal = ref<InstanceType<typeof ImportSiteModal> | null>(null)

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

// API
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const apiClientBio = inject(apiClientKey) as AxiosInstance

const projects = ref<LocationProjectWithInfo[]>([])

const siteParams = computed<SiteParams>(() => {
  return {
    count: true,
    deployment: true,
    logs: true
  }
})
const { isLoading: isLoadingSiteCount, data: sites, refetch: siteRefetch } = useSites(apiClientArbimon, selectedProjectSlug, siteParams)
const markers = computed(() => {
  if (!sites.value) return []
  return sites.value.map(site => ({
    id: site.id,
    slug: site.external_id,
    name: site.name,
    latitudeAvg: site.lat,
    longitudeAvg: site.lon
  }))
})

const sitesSelected = ref<string[]>([])
const siteIds = ref<(number)[]>([])

// Show on UI

onMounted(() => {
  if (store.myProjects.length === 0) {
    fetchProjects(0, LIMIT)
  }
})

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
const hasFetchedAll = ref(false)
const isLoading = ref(false)
const hasFailed = ref(false)
const LIMIT = 20

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
  if (selectedSite.value === undefined) return

  sitesSelected.value = [selectedSite.value.name]
  siteIds.value = [selectedSite.value.id]

  showPopup.value = !showPopup.value
}

const deleteAllEmptySites = () => {
  checkEmptySites()
  showPopup.value = !showPopup.value
}

function toCreateSiteBody (site: Site): CreateSiteBody {
  const selected = store.myProjects.find(p => p.slug === selectedProjectSlug.value)

  return {
    name: site.name,
    latitude: site.lat.toString(),
    longitude: site.lon.toString(),
    altitude: site.alt.toString(),
    project_id: selected?.idCore ?? '',
    is_public: false // should edit
  }
}

async function createSitesFromCsvData (sites: Site[]) {
  for (const site of sites) {
    try {
      const response = await apiCorePostCreateSite(apiClientCore, toCreateSiteBody(site))
      console.info(response)
    } catch (error) {
      console.error(`Error creating site ${site.name}:`, error)
    }
  }
  reloadSite()
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

const fileInput = ref<HTMLInputElement | null>(null)
const importSites = ref<Site[]>([])
const errorMessage = ref<string | null>(null)

function triggerFileInput () {
  importSiteModal.value?.open()
}

const onEmitSelected = (locationId: number) => {
  const site = sites.value?.find(s => s.id === locationId)

  if (site !== undefined) {
    selectedSite.value = site
  }
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  const reader = new FileReader()

  reader.onload = () => {
    const content = reader.result as string
    const parsed = parseSitesFromCsv(content)
    if (Array.isArray(parsed)) {
      importSites.value = parsed
      errorMessage.value = null
      createSitesFromCsvData(importSites.value)
    }
  }

  reader.readAsText(files[0])
}

function handleCsvData (csv: string) {
    const parsed = parseSitesFromCsv(csv)
    if (Array.isArray(parsed)) {
      importSites.value = parsed
      errorMessage.value = null
      createSitesFromCsvData(importSites.value)
    }
}

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
  const ids: (number)[] = []

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

function parseSitesFromCsv (allText: string): Site[] | false {
  const allTextLines = allText.split(/\r\n|\n/)
  const headers = allTextLines[0].split(',')

  if (!headers.includes('name') || !headers.includes('lat') || !headers.includes('lon') || !headers.includes('alt')) {
    return false
  }

  const sites: Site[] = []
  for (let i = 1; i < allTextLines.length; i++) {
    const data = allTextLines[i].split(',')
    if (data.length === headers.length) {
      const site: Partial<Site> = {}
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]
        const value = data[j]

        if (header === 'lat') {
          const lat = parseFloat(value)
          if (lat > 85 || lat < -85) {
            console.info('Please enter latitude number between -85 to 85')
            return false
          }
          site.lat = lat
        } else if (header === 'lon') {
          const lon = parseFloat(value)
          if (lon > 180 || lon < -180) {
            console.info('Please enter longitude number between -180 to 180')
            return false
          }
          site.lon = lon
        } else if (header === 'alt') {
          site.alt = parseFloat(value)
        } else if (header === 'name') {
          site.name = value
        }
      }

      if (site.name && site.lat !== undefined && site.lon !== undefined && site.alt !== undefined) {
        sites.push(site as Site)
      }
    }
  }

  return sites
}

const fetchProjects = async (offset:number, limit: number): Promise<void> => {
  isLoading.value = true
  hasFailed.value = false

  try {
    const myProjectResponse = await apiBioGetMyProjects(apiClientBio, limit, offset)
    isLoading.value = false
    if (myProjectResponse === undefined) {
      hasFailed.value = true
      return
    }
    hasFetchedAll.value = myProjectResponse.total < myProjectResponse.limit // check if reaching the end
    store.updateMyProject(myProjectResponse?.data)
    projects.value = store.myProjects

    if (!hasFetchedAll.value) {
      loadMoreProject()
    }
  } catch (e) {
    isLoading.value = false
    hasFailed.value = true
  }
}

const loadMoreProject = async (): Promise<void> => {
  if (hasFetchedAll.value || isLoading.value || hasFailed.value) return
  fetchProjects(projects.value.length, LIMIT)
}

</script>
