<template>
  <div
    ref="thumbnailContainer"
    class="p-[15px] bg-moss border-1 border-util-gray-04 overflow-y-auto max-h-[197px]"
  >
    <div
      class="max-h-[162px] text-insight"
    >
      <div
        v-if="isLoadingRecordings || isRefetchRecordings"
        class="loading-shimmer"
      />
      <div v-if="!recordings?.length">
        <p ng-if="browserType == 'rec'">
          Please, select a site and a date to browse
        </p>
        <p ng-if="browserType == 'playlist'">
          Please, select a playlist to browse
        </p>
        <p ng-if="browserType == 'soundscape'">
          No soundscapes found
        </p>
      </div>
      <div
        v-if="recordings?.length"
      >
        <div
          v-for="(recording, index) in recordings"
          :key="index"
          class="visobj-list-item h-full flex flex-col mb-2"
          :class="browserTypeId === String(recording.id) ? 'active ' : ' '"
          @click="onSelectedThumbnail(recording.id)"
        >
          <div>{{ getCaption(recording.site, recording.datetime) }}</div>
          <div class="flex overflow-hidden mx-0 my-1.5 h-32 max-w-full max-h-full">
            <YAxis
              :min="0"
              :max="recording.sample_rate/2000"
              :ticks="5"
              color="gray"
              font="5px"
              class="w-5 h-32"
            />
            <img
              :src="ARBIMON_BASE_URL + recording.thumbnail"
              class="h-32 max-w-full max-h-full"
              @error="setErrorImage($event)"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type RecordingResponse } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetListRecordings } from '../../_composables/use-visualizer'
import YAxis from './sidebar-thumbnail-yAxis.vue'

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const route = useRoute()
const store = useStore()

const recOffset = ref<number>(0)
const recLimit = 10
const browserTypes: string[] = ['rec', 'playlist', 'soundscape']
const selectedProjectSlug = computed(() => store.project?.slug)
const browserType = computed(() => browserTypes.includes(route.params.browserType as string) ? route.params.browserType : 'rec')
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)
const browserRecId = computed(() => route.params.browserRecId as string ?? undefined)
const isPlaylist = computed(() => browserType.value === 'playlist')

const thumbnailContainer = ref<HTMLElement | null>(null)
let recordings: RecordingResponse = []

const props = defineProps<{ recordingsItem: RecordingResponse | undefined }>()

const emits = defineEmits<{(e: 'onSelectedThumbnail', id: number): void}>()

const setErrorImage = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://rfcx-web-static.s3.eu-west-1.amazonaws.com/arbimon/unavaliable.png'
}

const getCaption = (site: string, datetime: string) => {
  return [site, dayjs.utc(datetime).format('lll')].join(', ')
}

const recordingListSearchParams = computed(() => {
  return {
    limit: recLimit,
    offset: recOffset.value * recLimit,
    key: `!q:13780-2024-6-25?recording_id=${isPlaylist.value ? browserRecId.value : browserTypeId.value}&show=thumbnail-path` // TODO: update it after the calendar date selection
  }
})

const { isLoading: isLoadingRecordings, data: recordingsResponse, refetch: refetchRecordings, isRefetching: isRefetchRecordings } = useGetListRecordings(apiClientArbimon, selectedProjectSlug, recordingListSearchParams)

const findVisObj = () => {
  setTimeout(async () => {
    const el = document.querySelector('.visobj-list-item.active') as HTMLElement
    if (el !== undefined) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, 300)
}

const handleScroll = (e: Event) => {
  const el = e.target as HTMLElement
  nextTick(() => {
    if (el.scrollTop > el.scrollHeight - 200) {
      if (isRefetchRecordings.value || isRefetchRecordings.value) return
      if (recordingsResponse.value === undefined || recordingsResponse.value?.length < 10) return
      recOffset.value++
      refetchRecordings()
    }
  })
}

const onSelectedThumbnail = (id: number) => {
  emits('onSelectedThumbnail', id)
}

watch(() => recordingsResponse.value, (newValue) => {
  if (!newValue || recordingsResponse.value === undefined) return
  recordings = [...recordings, ...recordingsResponse.value]
  findVisObj()
})

watch(() => browserType.value, () => {
  refetchRecordings()
})

watch(() => props.recordingsItem, (r) => {
  if (r === undefined) return
  recordings = [...r]
})

onMounted(() => {
  if (thumbnailContainer.value) {
    thumbnailContainer.value.addEventListener('scroll', handleScroll)
  }
})

onBeforeUnmount(() => {
  if (thumbnailContainer.value) {
    thumbnailContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>
