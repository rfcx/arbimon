<template>
  <section class="py-20 bg-white dark:bg-pitch pl-18 site-page">
    <div class="flex flex-col px-8 bg-white dark:bg-pitch">
      <h1 class="ml-1 text-gray-900 dark:text-insight">
        Recordings
      </h1>
      <div class="flex mt-6">
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="filterRecordings()"
        >
          <span>Filters</span>
          <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
        </button>
        <div
          ref="exportRef"
          class="relative"
        >
          <button
            class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
            @click="showExportPanel = true"
          >
            <span>Export</span>
            <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
          </button>
          <ExportPanel
            v-if="showExportPanel"
            @close="showExportPanel = false"
          />
        </div>
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="showCreatePlaylistModal = true"
        >
          <span>Save to Playlist</span>
        </button>
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          data-dropdown-toggle="deleteRecordingDropdown"
        >
          <span>Delete</span>
          <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
        </button>
        <div
          id="deleteRecordingDropdown"
          class="z-10 hidden bg-moss border border-frequency rounded-lg"
        >
          <ul class="p-2 font-medium">
            <li
              class="px-3 py-2 hover:bg-util-gray-04/60 cursor-pointer"
              @click="deleteCheckedRecordings"
            >
              Checked recordings
            </li>
            <li
              class="px-3 py-2 hover:bg-util-gray-04/60 cursor-pointer"
              @click="deleteAllFilteredRecordings"
            >
              All filtered recordings
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div
      v-show="!isLoadingRecordings"
      class="mt-4 px-8"
    >
      <div class="flex justify-between items-center mb-4">
        <span class="ml-1 font-bold text-left text-sm reclist-total text-white">
          {{ recordingsCount }} {{ recordingsCount > 1 ? "Recordings" : "Recording" }}
        </span>

        <div class="flex items-center">
          <div class="inline-flex border border-util-gray-03 rounded overflow-hidden">
            <button
              v-for="(option) in limitOptions"
              :key="option"
              :class="[
                'px-[10px] py-[5px] text-xs border-l font-bold border-util-gray-03 first:border-l-0',
                limitPerPage === option
                  ? 'bg-util-gray-03 text-white'
                  : 'hover:bg-util-gray-04 text-white',
              ]"
              @click="changeLimit(option)"
            >
              {{ option }}
            </button>
          </div>
          <button
            class="ml-3 px-[10px] py-[5px] text-xs text-white border border-util-gray-03 rounded hover:bg-util-gray-04 transition"
            @click="applyRecordings"
          >
            <icon-fa-refresh class="w-[10px]" />
          </button>
        </div>
      </div>

      <SortableTable
        v-show="!isLoadingRecordings && !isRefetchRecordings"
        class="mt-5"
        :columns="columns"
        :rows="filteredRecordings ?? []"
        :selected-row="selectedRecording"
        :default-sort-key="'updated_at'"
        :default-sort-order="'desc'"
        :project-slug="selectedProjectSlug"
        :show-checkbox="true"
        @selected-rows="onSelectedRecordings"
        @selected-item="onSelectedItem"
      />
    </div>
    <PaginationComponent
      v-show="!isLoadingRecordings"
      class="mt-4 px-8"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:current-page="handlePageChange"
    />
    <CreatePlaylistModal
      v-if="showCreatePlaylistModal"
      @close="showCreatePlaylistModal = false"
      @save="saveToPlaylist"
    />
    <CustomPopup
      :visible="showPopup"
      :is-for-delete-popup="true"
      :list="recordingsSelected"
      title="Delete recordings"
      message="Are you sure you want to delete the following?"
      note="Note: analysis results on these recordings will also be deleted"
      btn-ok-text="Delete"
      btn-cancel-text="Cancel"
      @ok="handleOk"
      @cancel="handleCancel"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { initDropdowns } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'

import { type RecordingSearchParams, type RecordingSearchResponse, apiLegacyCreatePlaylists, apiLegacyDeleteRecording } from '@rfcx-bio/common/api-arbimon/audiodata/recording'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useRecordings } from './api/use-recordings'
import CreatePlaylistModal from './component/create-playlist.vue'
import CustomPopup from './component/custom-popup.vue'
import ExportPanel from './component/export-panel.vue'
import PaginationComponent from './component/pagination-component.vue'
import SortableTable from './component/sortable-table.vue'
import { type Row } from './component/sortable-table.vue'

const limitPerPage = ref(10)
const currentPage = ref(1)

const offset = computed(() => (currentPage.value - 1) * limitPerPage.value)
const limitOptions = [10, 25, 50, 100]

const requestParams = computed<RecordingSearchParams>(() => ({
  limit: limitPerPage.value,
  offset: offset.value,
  output: ['count', 'date_range', 'list'],
  sortBy: 'r.site_id DESC, r.datetime DESC'
}))

const totalPages = computed(() => Math.ceil(recordingsCount.value / limitPerPage.value))

const handlePageChange = async (page: number) => {
  if (currentPage.value === page) return
  currentPage.value = page
  await refetchRecordings()
}

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

const { isLoading: isLoadingRecordings, data: recordings, refetch: refetchRecordings, isRefetching: isRefetchRecordings } = useRecordings(apiClientArbimon, selectedProjectSlug, requestParams)

const recordingsCount = computed(() => { return recordings.value?.count ?? 0 })
const showCreatePlaylistModal = ref(false)
const showExportPanel = ref(false)

const columns = [
  { label: 'Site', key: 'site', maxWidth: 130 },
  { label: 'Recorded Time', key: 'datetime', maxWidth: 110 },
  { label: 'Filename', key: 'filename', maxWidth: 140 },
  { label: 'Uploaded', key: 'upload_time', maxWidth: 100 },
  { label: 'Recorder', key: 'recorder', maxWidth: 100 },
  { label: 'Notes', key: 'comments', maxWidth: 100 }
]
const selectedRecording = ref<RecordingSearchResponse | undefined>(undefined)

const filteredRecordings = computed(() => {
  if (!recordings.value) return []
  return recordings.value.list
})
onMounted(() => {
  initDropdowns()
})

const showPopup = ref(false)
const allFiltered = ref(false)
const recordingsSelected = ref<string[]>([])

const applyRecordings = async () => {
  await refetchRecordings()
}

const changeLimit = async (value: number) => {
  limitPerPage.value = value
  await refetchRecordings()
}

const onSelectedItem = (row?: Record<string, any>) => {
  console.info('onSelectedItem', row)
}

const selectedRows = ref<Row[]>([])
const onSelectedRecordings = (rows?: Row[]) => {
  if (!rows) return
  selectedRows.value = rows
}

const filterRecordings = () => {
  console.info('FilterRecordings')
}

const saveToPlaylist = async (name: string) => {
  showCreatePlaylistModal.value = false
  try {
  await apiLegacyCreatePlaylists(apiClientArbimon, selectedProjectSlug.value ?? '', { playlist_name: name, params: selectedRows.value.length ? { recIds: selectedRows.value.map(item => Number(item.id)) } : {} })
  } catch (e) {}
}

const deleteCheckedRecordings = () => {
  getDeleteConfirmationMessage()
  showPopup.value = !showPopup.value
  console.info('deleteCheckedRecordings')
}

const deleteAllFilteredRecordings = () => {
  allFiltered.value = true
  showPopup.value = !showPopup.value
  console.info('deleteRecording')
}

async function handleOk () {
  try {
    showPopup.value = false
    await apiLegacyDeleteRecording(apiClientArbimon, selectedProjectSlug.value ?? '', { recs: selectedRows.value })
    applyRecordings()
    // showAlertDialog('success', 'Success', 'Removed')
  } catch (e) {
    // showAlertDialog('error', 'Error', 'Remove recording')
  }
}

const handleCancel = () => {
  showPopup.value = false
}

function getDeleteConfirmationMessage () {
  const recs = selectedRows.value.map(item => item.site)
  const countMap = recs.reduce((acc: Record<string, number>, curr) => {
    acc[curr] = (acc[curr] || 0) + 1
    return acc
  }, {})

  const siteNames = Object.keys(countMap)
  const topSites = siteNames.slice(0, 3)
  const otherSites = siteNames.slice(3)

  const list: string[] = []

  topSites.forEach(site => {
    const count = countMap[site]
    const s = count > 1 ? 's' : ''
    list.push(`${count} recording${s} from "${site}"`)
  })

  if (otherSites.length > 0) {
    const otherCount = otherSites.reduce((sum, site) => sum + countMap[site], 0)
    list.push(`& ${otherCount} recording${otherCount > 1 ? 's' : ''} from ${otherSites.length} other site${otherSites.length > 1 ? 's' : ''}`)
  }

  recordingsSelected.value = list
}

</script>
