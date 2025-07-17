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
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="exportRecordings()"
        >
          <span>Export</span>
          <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
        </button>
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="saveToPlaylist()"
        >
          <span>Save to Playlist</span>
        </button>
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="deleteRecording()"
        >
          <span>Delete</span>
          <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
        </button>
      </div>
    </div>
    <div
      v-show="!isLoadingRecordings"
      class="mt-4 px-8"
    >
      <span class="ml-1 font-bold text-left reclist-total">
        {{ recordingsCount }} {{ recordingsCount > 1 ? "Recordings" : "Recording" }}
      </span>
      <SortableTable
        class="mt-5"
        :columns="columns"
        :rows="filteredRecordings ?? []"
        :selected-row="selectedRecording"
        :default-sort-key="'updated_at'"
        :default-sort-order="'desc'"
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
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { type RecordingSearchParams, type RecordingSearchResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useRecordings } from './api/use-recordings'
import PaginationComponent from './component/pagination-component.vue'
import SortableTable from './component/sortable-table.vue'

const limitPerPage = ref(10)
const currentPage = ref(1)

const offset = computed(() => (currentPage.value - 1) * limitPerPage.value)

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

const { isLoading: isLoadingRecordings, data: recordings, refetch: refetchRecordings } = useRecordings(apiClientArbimon, selectedProjectSlug, requestParams)

const recordingsCount = computed(() => { return recordings.value?.count ?? 0 })

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

const onSelectedItem = (row?: Record<string, any>) => {
  console.info('onSelectedItem', row)
}

const filterRecordings = () => {
  console.info('FilterRecordings')
}
const exportRecordings = () => {
  console.info('exportRecordings')
}
const saveToPlaylist = () => {
  console.info('saveToPlaylist')
}
const deleteRecording = () => {
  console.info('deleteRecording')
}
</script>
