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
      class="mt-4 ml-9"
    >
      <span class="ml-1 font-bold text-left reclist-total">
        {{ recordingsCount() }} {{ recordingsCount() > 1 ? "Recordings" : "Recording" }}
      </span>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject } from 'vue'

import { type RecordingSearchParams } from '@rfcx-bio/common/api-arbimon/audiodata/recording'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useRecordings } from './api/use-recordings'

const requestParams = computed<RecordingSearchParams>(() => ({
  limit: 10,
  offset: 0,
  output: ['count', 'date_range', 'list'],
  sortBy: 'r.site_id DESC, r.datetime DESC'
}))

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

const { isLoading: isLoadingRecordings, data: recordings } = useRecordings(apiClientArbimon, selectedProjectSlug, requestParams)

const recordingsCount = () => {
  return recordings.value?.count ?? 0
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
