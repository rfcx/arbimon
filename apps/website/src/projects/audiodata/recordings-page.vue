<template>
  <section class="py-20 bg-white dark:bg-pitch pl-18 site-page">
    <div class="flex flex-col px-8 bg-white dark:bg-pitch">
      <h1 class="ml-1 text-gray-900 dark:text-insight">
        Recordings
      </h1>
      <div class="flex mt-6">
        <div
          ref="filtersRootRef"
          class="relative"
        >
          <button
            class="btn btn-secondary btn-medium text-[14px] py-2 ml-2 btn-small items-center inline-flex px-3"
            @click="filterRecordings()"
          >
            <span>Filters</span>
            <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
          </button>
          <FilterPanel
            v-if="showFilterModal"
            :date-range="dateRange"
            :sites="sites"
            :playlists="playlists"
            :tags="tagsRecording"
            :classes="classesRecordings"
            :soundscapes="soundscapeRecordings"
            :classifications="classifications"
            :filters-data="filterParams"
            :is-reset="isResetFilter"
            @apply="applyFilters"
            @reset-filters="resetFilters"
          />
        </div>
        <div
          ref="exportRef"
          class="relative"
        >
          <button
            class="btn btn-secondary btn-medium text-[14px] py-2 ml-2 btn-small items-center inline-flex px-3 disabled:hover:btn-disabled disabled:btn-disabled"
            :disabled="!store.userIsDataEntryMember"
            data-tooltip-style="light"
            :data-tooltip-target="!store.userIsDataEntryMember ? 'exportRecordingTooltip': null"
            @click="showExportPanel = true"
          >
            <span>Export</span>
            <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
          </button>
          <ExportPanel
            v-if="showExportPanel"
            :tags="tagsRecording"
            :classes-recordings="classesRecordings"
            :filter-data="requestParamsForPlaylist"
            :soundscape-recordings="soundscapeRecordings"
            @close="handleCloseExport"
          />
        </div>
        <div
          v-if="!store.userIsDataEntryMember"
          id="exportRecordingTooltip"
          role="tooltip"
          class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
        >
          You do not have permission to export data
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
        <button
          class="btn btn-secondary btn-medium text-[14px] py-2 ml-2 btn-small items-center inline-flex px-3 disabled:hover:btn-disabled disabled:btn-disabled"
          :disabled="!store.userIsFullProjectMember"
          data-tooltip-style="light"
          :data-tooltip-target="!store.userIsFullProjectMember ? 'recordingPlaylistTooltip': null"
          @click="showCreatePlaylist"
        >
          <span>Save to Playlist</span>
        </button>
        <div
          v-if="!store.userIsFullProjectMember"
          id="recordingPlaylistTooltip"
          role="tooltip"
          class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
        >
          You do not have permission to create playlists
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
        <button
          class="btn btn-secondary btn-medium text-[14px] py-2 ml-2 btn-small items-center inline-flex px-3 disabled:hover:btn-disabled disabled:btn-disabled"
          :disabled="!store.userIsFullProjectMember"
          data-dropdown-toggle="deleteRecordingDropdown"
          data-tooltip-style="light"
          :data-tooltip-target="!store.userIsFullProjectMember ? 'deleteRecordingTooltip': null"
        >
          <span>Delete</span>
          <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
        </button>
        <div
          v-if="!store.userIsFullProjectMember"
          id="deleteRecordingTooltip"
          role="tooltip"
          class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
        >
          You do not have permission to delete recordings
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
        <div
          id="deleteRecordingDropdown"
          class="z-10 hidden bg-moss rounded-lg"
        >
          <ul class="p-2 font-medium">
            <li
              class="px-3 py-2 hover:bg-util-gray-04/60 cursor-pointer text-[14px]"
              @click="deleteCheckedRecordings"
            >
              Checked recordings
            </li>
            <li
              class="px-3 py-2 hover:bg-util-gray-04/60 cursor-pointer text-[14px]"
              @click="deleteAllFilteredRecordings"
            >
              All filtered recordings
            </li>
          </ul>
        </div>
      </div>
    </div>
    <icon-custom-ic-loading
      v-if="isLoadingRecordings || isRefetchRecordings"
      class="animate-spin text-2xl mt-[100px]"
    />
    <div
      v-show="!isLoadingRecordings && !isRefetchRecordings"
      class="mt-4 px-8"
    >
      <div class="flex justify-between items-center mb-4">
        <span class="ml-1 font-bold text-left text-sm reclist-total text-white">
          {{ recordingsCountText }} {{ recordingsCount > 1 ? "Recordings" : "Recording" }}
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
        :selected-items="selectedRows"
        :default-sort-key="'updated_at'"
        :default-sort-order="'desc'"
        :project-slug="selectedProjectSlug"
        :show-expand="true"
        :show-checkbox="true"
        @selected-rows="onSelectedRecordings"
      />
    </div>
    <div
      v-if="!isLoadingRecordings && (recordingsCount === 0 || isErrorRecordings)"
      class="font-display text-cloud text-[26px] text-center mt-10"
    >
      <span class="font-display">Recordings not found</span>
    </div>

    <PaginationComponent
      v-show="!isLoadingRecordings && !(recordingsCount === 0) && !isErrorRecordings && !isRefetchRecordings"
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
      :list="(isTotalCountOverHalf && deleteAllFiltered) ? [] : recordingsSelected"
      title="Delete recordings"
      :message="popupMessage"
      :note="popupNote"
      :is-total-count-over-half="(isTotalCountOverHalf && deleteAllFiltered) ? true : undefined"
      btn-ok-text="Delete"
      btn-cancel-text="Cancel"
      @ok="handleOk"
      @cancel="handleCancel"
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
import { initDropdowns, initTooltips } from 'flowbite'
import debounce from 'lodash.debounce'
import { computed, inject, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { type RecordingSearchParams, type RecordingSearchResponse, type SearchCountResponse, apiLegacyCreatePlaylists, apiLegacyDeleteMatchingRecording, apiLegacyDeleteRecording, apiLegacySearchCount } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SiteParams } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

import type { AlertDialogType } from '@/_components/alert-dialog.vue'
import alertDialog from '@/_components/alert-dialog.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetClasses, useGetClassifications, useGetPlaylists, useGetSoundscape, useGetTags, useRecordings } from './api/use-recordings'
import { useSites } from './api/use-sites'
import CreatePlaylistModal from './component/create-playlist.vue'
import CustomPopup from './component/custom-popup.vue'
import ExportPanel from './component/export-panel.vue'
import FilterPanel, { type DateTime } from './component/filter-panel.vue'
import PaginationComponent from './component/pagination-component.vue'
import SortableTable from './component/sortable-table.vue'
import { type Row } from './component/sortable-table.vue'

const limitPerPage = ref(10)
const currentPage = ref(1)

const offset = computed(() => (currentPage.value - 1) * limitPerPage.value)
const limitOptions = [10, 25, 50, 100]

const selectedRows = ref<Row[]>([])
const filterParams = ref<RecordingSearchParams>()
const requestParams = computed<RecordingSearchParams>(() => ({
  limit: limitPerPage.value,
  offset: offset.value,
  output: ['count', 'date_range', 'list'],
  sortBy: 'r.site_id DESC, r.datetime DESC',
  presence: filterParams.value?.presence,
  playlists: filterParams.value?.playlists,
  range: filterParams.value?.range,
  sites: filterParams.value?.sites,
  sites_ids: filterParams.value?.sites_ids,
  soundscape_composition: filterParams.value?.soundscape_composition,
  soundscape_composition_annotation: filterParams.value?.soundscape_composition_annotation,
  tags: filterParams.value?.tags,
  validations: filterParams.value?.validations,
  years: filterParams.value?.years,
  days: filterParams.value?.days,
  hours: filterParams.value?.hours,
  months: filterParams.value?.months,
  classifications: filterParams.value?.classifications,
  classification_results: filterParams.value?.classification_results,
  ...(selectedRows.value.length > 0 && {
    recIds: selectedRows.value.map(item => Number(item.id))
  })
}))

const requestParamsForPlaylist = computed(() => {
  const { limit, offset, output, sortBy, ...rest } = requestParams.value
  return rest
})

const requestParamsForSearchCount = computed(() => {
  const { limit, offset, output, sortBy, recIds, ...rest } = requestParams.value
  return rest
})

const filteredRequestParams = computed(() => {
  const { recIds, ...rest } = requestParams.value
  return rest
})

const totalPages = computed(() => Math.ceil(recordingsCount.value / limitPerPage.value))

const handlePageChange = async (page: number) => {
  if (currentPage.value === page) return
  currentPage.value = page
  await refetchRecordings()
}

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

const { isLoading: isLoadingRecordings, data: recordings, refetch: refetchRecordings, isRefetching: isRefetchRecordings, isError: isErrorRecordings } = useRecordings(apiClientArbimon, selectedProjectSlug, filteredRequestParams)

const dateRange = ref<DateTime | undefined>()
watch(
  () => recordings.value?.date_range as DateTime | undefined,
  (newVal) => {
    if (dateRange.value === undefined && newVal !== undefined) {
      dateRange.value = newVal
    }
  },
  { immediate: true }
)

const searchCount = ref<SearchCountResponse[] | undefined>()
watch(recordings, async () => {
  searchCount.value = await apiLegacySearchCount(apiClientArbimon, selectedProjectSlug.value ?? '', requestParamsForSearchCount.value)
})

const siteParams = computed<SiteParams>(() => {
  return {
    count: true,
    deployment: true,
    logs: true
  }
})

const project = reactive({
  projectId: store.project?.id.toString() ?? '-1'
})

watch(() => store.project, () => {
  project.projectId = store.project?.id.toString() ?? '-1'
})

const filtersRootRef = ref<HTMLElement | null>(null)
function isFromFlowbiteDatepicker (el: Element | null) {
  return !!el?.closest('.datepicker, .datepicker-picker, .datepicker-dropdown')
}

const handleClickOutside = (event: MouseEvent) => {
  const el = event.target as Element | null
  if (isFromFlowbiteDatepicker(el)) return
  if (filtersRootRef.value && !filtersRootRef.value.contains(el as Node)) {
    showFilterModal.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

const { data: sites } = useSites(apiClientArbimon, selectedProjectSlug, siteParams)
const { data: playlists } = useGetPlaylists(apiClientArbimon, selectedProjectSlug)
const { data: tagsRecording } = useGetTags(apiClientArbimon, selectedProjectSlug)
const { data: classesRecordings } = useGetClasses(apiClientArbimon, selectedProjectSlug)
const { data: soundscapeRecordings } = useGetSoundscape(apiClientArbimon, selectedProjectSlug)
const { data: classifications } = useGetClassifications(apiClientArbimon, selectedProjectSlug)

const recordingsCount = computed(() => { return recordings.value?.count ?? 0 })
const recordingsCountText = computed<string>(() =>
  new Intl.NumberFormat('en-US').format(recordingsCount.value)
)
const showCreatePlaylistModal = ref(false)
const showExportPanel = ref(false)

const isTotalCountOverHalf = computed(() =>
  totalCount.value > recordingsCount.value / 2
)

const columns = [
  { label: 'Site', key: 'site', maxWidth: 90 },
  { label: 'Recorded Time', key: 'datetime', maxWidth: 110 },
  { label: 'Filename', key: 'filename', maxWidth: 90 },
  { label: 'Uploaded', key: 'upload_time', maxWidth: 70 },
  { label: 'Recorder', key: 'recorder', maxWidth: 70 },
  { label: 'Notes', key: 'comments', maxWidth: 150 }
]
const selectedRecording = ref<RecordingSearchResponse | undefined>(undefined)

const filteredRecordings = computed(() => {
  if (!recordings.value) return []
  return recordings.value.list
})
onMounted(() => {
  initDropdowns()
  initTooltips()

  document.addEventListener('click', handleClickOutside, true)
})

const deleteAllFiltered = ref(false)
const showPopup = ref(false)
const recordingsSelected = ref<string[]>([])

const applyFilters = async (filter: RecordingSearchParams) => {
  filterParams.value = filter
  currentPage.value = 1
  selectedRows.value = []
  await refetchRecordings()
  showFilterModal.value = false
}
const isResetFilter = ref(false)

const resetFilters = debounce(async (filter: RecordingSearchParams) => {
  isResetFilter.value = true
  filterParams.value = undefined
  await refetchRecordings()
  isResetFilter.value = false
}, 500)

const popupMessage = computed(() => {
  if (isTotalCountOverHalf.value && deleteAllFiltered.value) {
    return `You are about to delete <b>${totalCountText.value} recordings</b> in this project. Are you sure?\n\nIf you only want to delete some of the recordings, we recommend filtering your selection again.`
  }
  return 'Are you sure you want to delete the following?'
})

const popupNote = computed(() => {
  if (isTotalCountOverHalf.value && deleteAllFiltered.value) {
    return 'Note: This action cannot be undone.'
  }
  return 'Note: analysis results on these recordings will also be deleted'
})

const applyRecordings = async () => {
  await refetchRecordings()
}

const changeLimit = async (value: number) => {
  limitPerPage.value = value
  await refetchRecordings()
}

const onSelectedRecordings = (rows?: Row[]) => {
  if (!rows) return
  selectedRows.value = rows === undefined ? [] : rows
}

const showFilterModal = ref(false)
const filterRecordings = () => {
  showFilterModal.value = !showFilterModal.value
}

const showCreatePlaylist = () => {
  if (selectedRows.value.length === 0 && recordingsCount.value === 0) {
    showAlertDialog('error', '', 'You can\'t create playlist with 0 recording')
  } else {
    showCreatePlaylistModal.value = true
  }
}

function omitEmptyArrays<T extends Record<string, any>> (obj: T): Partial<T> {
  const out: Record<string, any> = {}

  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      if (v.length > 0) out[k] = v
      continue
    }

    if (v !== null && v !== undefined && typeof v === 'object' && !(v instanceof Date)) {
      const nested = omitEmptyArrays(v)
      if (Object.keys(nested).length > 0) out[k] = nested
      continue
    }

    if (v !== undefined) out[k] = v
  }

  return out as Partial<T>
}

const savingPlaylist = ref(false)
const saveToPlaylist = async (name: string) => {
  savingPlaylist.value = true
  try {
    await apiLegacyCreatePlaylists(apiClientArbimon, selectedProjectSlug.value ?? '', { playlist_name: name, params: omitEmptyArrays(requestParamsForPlaylist.value) })
    showAlertDialog('success', 'Success', 'Created playlist')
    showCreatePlaylistModal.value = false
    savingPlaylist.value = false
  } catch (e) {
    showAlertDialog('error', 'Error', 'Create playlist')
    showCreatePlaylistModal.value = false
    savingPlaylist.value = false
  }
}

const deleteCheckedRecordings = () => {
  if (selectedRows.value.length === 0) {
    showAlertDialog('error', '', 'Please select recordings to delete.')
    return
  }

  getDeleteConfirmationMessage()
  showPopup.value = true
}

const deleteAllFilteredRecordings = async () => {
  if (filterParams.value === undefined) {
    showAlertDialog('error', 'Error', 'There is not filter applied for deleting recordings yet. Please filter recordings before deleting.')
    return
  }

  if (recordingsCount.value === 0) {
    showAlertDialog('error', 'Error', 'Recordings not found')
    return
  }

  if (searchCount.value === undefined) {
    showAlertDialog('error', 'Error', 'Remove recording')
    return
  }

  formattedRecordings(searchCount.value)
  deleteAllFiltered.value = true
  showPopup.value = true
}

async function handleOk () {
  try {
    showPopup.value = false
    if (selectedRows.value.length === 0) {
      await apiLegacyDeleteMatchingRecording(apiClientArbimon, selectedProjectSlug.value ?? '', requestParamsForPlaylist.value)
    } else {
      await apiLegacyDeleteRecording(apiClientArbimon, selectedProjectSlug.value ?? '', { recs: selectedRows.value })
      selectedRows.value = []
    }
    applyRecordings()
    showAlertDialog('success', 'Success', 'Removed')
  } catch (e) {
    showAlertDialog('error', 'Error', 'Remove recording')
  }
}

const handleCancel = () => {
  showPopup.value = false
}

const handleCloseExport = (isSuccess?: boolean) => {
  showExportPanel.value = false
  if (isSuccess === true) {
    showAlertDialog('success', '', 'Your report export request is processing and will be sent by email.')
  }
  if (isSuccess === false) {
    showAlertDialog('error', '', 'Error export')
  }
}

const formattedRecordings = (recCount: SearchCountResponse[]) => {
  const list = []
  const recCountLength = recCount.length
  recCount.forEach((entry, index) => {
    if (!entry.imported && index < 3) {
      const s = entry.count > 1 ? 's' : ''
      list.push(`${entry.count} recording${s} from "${entry.site}"`)
    }
  })
  if (recCountLength > 3) {
    const remainingCount = recCount
      .slice(3)
      .reduce((sum, entry) => sum + entry.count, 0)

    const msg = `& ${remainingCount} recordings from ${recCountLength - 3} other sites`
    list.push(msg)
  }

  recordingsSelected.value = list
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

onBeforeRouteLeave(() => {
  if (savingPlaylist.value) {
    const answer = window.confirm('Your playlist is being created. You can check the created playlist when complete on the Playlist page.')
    return answer
  }
  return true
})

const totalCount = computed(() => {
  return searchCount.value?.reduce((sum, item) => sum + item.count, 0) ?? 0
})

const totalCountText = computed<string>(() =>
  new Intl.NumberFormat('en-US').format(totalCount.value)
)

</script>
