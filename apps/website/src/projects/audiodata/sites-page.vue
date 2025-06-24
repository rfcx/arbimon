<template>
  <section class="py-10 bg-white dark:bg-pitch pl-18">
    <div class="flex items-center px-8 bg-white dark:bg-pitch">
      <h1 class="text-gray-900 dark:text-insight">
        Sites
      </h1>
      <button
        class="btn btn-primary btn-medium ml-2 btn-small items-center inline-flex"
        @click="createSite()"
      >
        <span>Create</span>
        <icon-custom-ic-plus-icon class="ml-2 w-4 h-4" />
      </button>
      <button
        class="btn btn-secondary btn-medium ml-2 btn-small items-center text-frequency inline-flex hover:text-pitch"
        @click="triggerFileInput"
      >
        <span>Bulk Import Sites</span>
        <icon-custom-ic-plus-icon class="ml-2 w-4 h-4" />
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        class="hidden"
        @change="handleFileUpload"
      >
    </div>
    <div class="flex mx-8 mt-8">
      <!-- Left: Table (scrollable) -->
      <div class="w-2/3 overflow-y-auto pr-4">
        <!-- Content wrapper for scroll height -->
        <div>
          <div class="p-1 flex justify-between">
            <div>
              <button
                :disabled="selectedSite == undefined"
                class="btn btn-secondary btn-medium btn-small disabled:cursor-not-allowed disabled:btn-disabled disabled:hover:btn-disabled"
                @click="editSite()"
              >
                <span>Edit Site</span>
              </button>
              <button
                class="btn btn-secondary btn-medium ml-2 btn-small"
                data-dropdown-toggle="mapDropdown"
              >
                <span class="inline-flex gap-1">
                  Delete
                  <icon-custom-el-angle-down class="ml-2 mt-1 w-3 h-3" />
                </span>
              </button>
              <div
                id="mapDropdown"
                class="z-10 hidden bg-moss border border-frequency rounded-lg"
              >
                <ul class="p-2 font-medium">
                  <li
                    class="px-3 py-2 hover:bg-util-gray-04/60 cursor-pointer"
                    @click="deleteSelectedSite"
                  >
                    Delete selected site
                  </li>
                  <li
                    class="px-3 py-2 hover:bg-util-gray-04/60 cursor-pointer"
                    @click="deleteAllEmptySites"
                  >
                    Delete all empty sites
                  </li>
                </ul>
              </div>
              <button
                class="btn btn-secondary btn-medium ml-2 btn-small"
                @click="exportSites()"
              >
                <span>Export Sites</span>
              </button>
            </div>
            <div class="input-item search form-element">
              <icon-fa-search class="h-3 w-3 mt-3 fa-search text-insight" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="Search by site name"
                class="form-control placeholder-style rounded px-3 py-2 h-[34px] w-52 items-center inline-flex rounded border-1 border-util-gray-03 bg-echo"
                @input="onSearchInput"
              >
            </div>
          </div>
          <div
            v-show="!isLoadingSite"
            class="mt-4"
          >
            <span class="text-left reclist-total">
              {{ sitesCount() }} {{ sitesCount() > 1 ? "sites" : "site" }}
            </span>
          </div>
          <SortableTable
            class="mt-5"
            :columns="columns"
            :rows="filteredSites ?? []"
            :selected-row="selectedSite"
            :default-sort-key="'updated_at'"
            :default-sort-order="'desc'"
            @selected-item="onSelectedItem"
          />
          <div
            v-if="((sites?.length ?? 0) === 0 && !isLoadingSite)"
            class="text-center pt-10"
          >
            <h3 class="items-center font-display inline-flex">
              This project does not have any <icon-fa-map-marker class="h-5 w-5 px-1" /> sites
            </h3>
          </div>
        </div>
      </div>

      <div class="w-1/3 sticky top-[1rem] self-start">
        <div>
          <div
            v-if="creating"
            class="items-center text-frequency inline-flex px-3 py-2 rounded rounded-b-none border-1 border-b-0 border-util-gray-03"
          >
            <icon-custom-ic-plus-icon class="w-4 h-4" />
            <span class="ml-1">New Site</span>
          </div>
          <div
            v-else-if="editing"
            class="items-center text-frequency inline-flex px-3 py-2 rounded rounded-b-none border-1 border-b-0 border-util-gray-03"
          >
            <icon-custom-ic-edit class="ml-2 w-4 h-4 self-center text-frequency" />
            <span class="ml-1">Edit Site</span>
          </div>
          <div
            v-else
            class="items-center text-frequency inline-flex px-3 py-2 rounded rounded-b-none border-1 border-b-0 border-util-gray-03"
          >
            <icon-fa-map
              class="h-3 w-3 text-frequency"
            />
            <span class="ml-1">Location</span>
          </div>
        </div>
        <CreateEditSite
          v-if="creating || editing"
          class="mb-3"
          :editing="editing"
          :site="selectedSite"
          @emit-close="onClose"
          @emit-reload-site="reloadSite"
        />
        <map-view
          :data="markers"
          class="relative w-full"
          :selected-location-id="locationSelected"
          :is-error="false"
          @emit-selected="onEmitSelected"
        />
        <ImageCarousel :images="imageList" />
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
    <alert-dialog
      v-if="showAlert"
      :severity="success"
      :title="title"
      :message="message"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onMounted, ref } from 'vue'

import { type CreateSiteBody, type SiteParams, type SiteResponse, apiLegacySiteCreate, apiLegacySiteDelete } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type LocationProjectWithInfo, apiBioGetMyProjects } from '@rfcx-bio/common/api-bio/project/projects'

import type { AlertDialogType } from '@/_components/alert-dialog.vue'
import alertDialog from '@/_components/alert-dialog.vue'
import { apiClientArbimonLegacyKey, apiClientDeviceKey, apiClientKey } from '@/globals'
import { useStore } from '~/store'
import { apiDeviceGetAssets, useGetAssets, useSites } from './api/use-sites'
import CreateEditSite from './component/create-edit-site.vue'
import CustomPopup from './component/custom-popup.vue'
import ImageCarousel from './component/image-carousel.vue'
import { type Image } from './component/image-carousel.vue'
import ImportSiteModal from './component/import-site-modal.vue'
import MapView from './component/map-view.vue'
import SortableTable from './component/sortable-table.vue'

interface Site {
  name: string;
  lat: number;
  lon: number;
  alt: number;
  hidden: number;
}

const importSiteModal = ref<InstanceType<typeof ImportSiteModal> | null>(null)

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

// API
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const apiClientBio = inject(apiClientKey) as AxiosInstance
const apiClientDevice = inject(apiClientDeviceKey) as AxiosInstance

const projects = ref<LocationProjectWithInfo[]>([])

const siteParams = computed<SiteParams>(() => {
  return {
    count: true,
    deployment: true,
    logs: true
  }
})
const { isLoading: isLoadingSite, data: sites, refetch: siteRefetch } = useSites(apiClientArbimon, selectedProjectSlug, siteParams)
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

const imageList = ref<Image[]>([])

const searchKeyword = ref('')
const searchTimeout = ref<number | undefined>(undefined)

// Show on UI
onMounted(() => {
  if (store.myProjects.length === 0) {
    fetchProjects(0, LIMIT)
  }
})

const columns = [
  { label: 'Name', key: 'name', maxWidth: 150 },
  { label: 'No. of records', key: 'rec_count', maxWidth: 50 },
  { label: 'Latitude', key: 'lat', maxWidth: 50 },
  { label: 'Longitude', key: 'lon', maxWidth: 50 },
  { label: 'Elevation', key: 'alt', maxWidth: 50 },
  { label: 'Current Timezone', key: 'timezone', maxWidth: 70 },
  { label: 'Updated', key: 'updated_at', maxWidth: 80 },
  { label: 'Deployed', key: 'deployment', maxWidth: 80 }
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
    showPopup.value = false
    await apiLegacySiteDelete(apiClientArbimon, selectedProjectSlug.value ?? '', siteIds.value)
    reloadSite()
    showAlertDialog('success', 'Success', 'Removed')
  } catch (e) {
    showAlertDialog('error', 'Error', 'Remove site')
  }
}

const filteredSites = computed(() => {
  if (!sites.value) return []
  if (!searchKeyword.value.trim()) return sites.value

  const keyword = searchKeyword.value.trim().toLowerCase()
  return sites.value.filter(site => site.name.toLowerCase().includes(keyword))
})

const onSearchInput = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = window.setTimeout(() => {
    // debounce
  }, 300)
}

const sitesCount = () => {
  return filteredSites.value?.length ?? 0
}

const handleCancel = () => {
  showPopup.value = false
}

const locationSelected = computed(() => {
  if (selectedSite.value === undefined) return undefined
  return selectedSite.value.id
})

// function
const deleteSelectedSite = () => {
  if (selectedSite.value === undefined) {
    showAlertDialog('error', 'Error', 'Please select site to remove')
    return
  }

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
    lat: site.lat.toString(),
    lon: site.lon.toString(),
    alt: site.alt.toString(),
    project_id: selected?.idCore ?? '',
    hidden: site.hidden ?? 0
  }
}

async function createSitesFromCsvData (sites: Site[]) {
  try {
  await createSites(sites)
    showAlertDialog('success', 'Success', 'All sites created successfully!')
    reloadSite()
  } catch (err) {
    showAlertDialog('error', 'Error', 'Failed to create sites')
  }
}

async function createSites (sites: Site[]): Promise<void[]> {
  return Promise.all(
    sites.map(async (site) => {
      const response = await apiLegacySiteCreate(
        apiClientArbimon,
        selectedProjectSlug.value ?? '',
        toCreateSiteBody(site)
      )

      let responseObj: { error?: string } = {}

      if (typeof response.data === 'string') {
        responseObj = JSON.parse(response.data)
      } else if (typeof response.data === 'object' && response.data !== null) {
        responseObj = response.data
      }

      if (responseObj.error) {
        throw responseObj.error
      }
    })
  )
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

function triggerFileInput () {
  importSiteModal.value?.open()
}

const getAssets = async (siteId: string) => {
  const response = await useGetAssets(apiClientDevice, siteId)
  if (response === undefined) return
  imageList.value = []
  const mappedAssets = await Promise.all(
  response.map(async (asset) => {
      const imageBlob = await apiDeviceGetAssets(apiClientDevice, `/assets/${asset.id}`)
      if (!imageBlob) {
        return {
          id: asset.id,
          src: ''
        }
      }

      return {
        id: asset.id,
        src: URL.createObjectURL(imageBlob)
      }
    })
    ).then(results => results.filter((item): item is { id: string; src: string; label: string } => item !== null))
    imageList.value = mappedAssets
}

const onEmitSelected = async (locationId: number) => {
  const site = sites.value?.find(s => s.id === locationId)
  if (site !== undefined) {
    selectedSite.value = site
    if (site.external_id !== undefined) return
    await getAssets(site.external_id)
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
      createSitesFromCsvData(importSites.value)
    }
  }

  reader.readAsText(files[0])
}

function handleCsvData (csv: string) {
    const parsed = parseSitesFromCsv(csv)
    if (Array.isArray(parsed)) {
      importSites.value = parsed
      createSitesFromCsvData(importSites.value)
    }
}

const onClose = (status?: string, error?: string | undefined) => {
  let message = 'New Sites created successfully'
  let messageError = 'Failed to create sites'
  if (editing.value) {
    message = 'Site updated'
    messageError = 'Failed to update site'
  }
  if (error) {
    showAlertDialog('error', 'Error', error)
    return
  }
  if (status !== undefined) {
    const isError = status === 'error'
    showAlertDialog(isError ? 'error' : 'success', isError ? 'Error' : 'Success', isError ? messageError : message)
  }
  creating.value = false
  editing.value = false
}

const reloadSite = async (status?: string): Promise<void> => {
  let message = 'New Sites created successfully'
  let messageError = 'Failed to create sites'
  if (editing.value) {
    message = 'Site updated'
    messageError = 'Failed to update site'
  }
  if (status !== undefined) {
    const isError = status === 'error'
    showAlertDialog(isError ? 'error' : 'success', isError ? 'Error' : 'Success', isError ? messageError : message)
  }

  creating.value = false
  editing.value = false
  await siteRefetch()
}

const createSite = () => {
  creating.value = true
  editing.value = false
}

const onSelectedItem = async (row?: Record<string, any>) => {
  selectedSite.value = row as SiteResponse
  if (selectedSite.value?.external_id === undefined) return
  await getAssets(selectedSite.value.external_id)
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
    showAlertDialog('error', 'Error', 'There is no empty site in your project')
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
  const headersText = allTextLines[0].split(',')
  const headers = headersText.map(h => h.trim().toLowerCase())

  if (!headers.includes('name') || !headers.includes('lat') || !headers.includes('lon') || !headers.includes('alt')) {
    showAlertDialog('error', 'Error', 'Wrong format of csv file')
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
            showAlertDialog('error', 'Error', 'Please enter latitude number between -85 to 85')
            return false
          }
          site.lat = lat
        } else if (header === 'lon') {
          const lon = parseFloat(value)
          if (lon > 180 || lon < -180) {
            showAlertDialog('error', 'Error', 'Please enter longitude number between -180 to 180')
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

const success = ref<AlertDialogType>('error')
const title = ref('')
const message = ref('')
const showAlert = ref(false)

const showAlertDialog = (type: AlertDialogType, titleValue: string, messageValue: string, hideAfter = 7000) => {
  showAlert.value = true
  success.value = type
  title.value = titleValue
  message.value = messageValue
  setTimeout(() => {
    showAlert.value = false
  }, hideAfter)
}

</script>

<style lang="scss">
.input-item {
  [type='text']:focus {
    border-color: #ADFF2C;
    --tw-ring-color: #ADFF2C;
  }
  color: #fff;
}
.placeholder-style::placeholder {
  color: #fff;
  font-size: 14px;
}
.search .fa-search {
  position: absolute;
  top: 0;
  left: 10px;
  bottom: 0;
  color: #D3D2CF;
}
.form-element {
  position: relative;
}

.form-control {
    padding: 6px 12px 6px 30px !important;
}
</style>
