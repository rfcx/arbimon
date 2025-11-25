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
        <p v-show="browserType === 'rec'">
          Please, select a site and a date to browse
        </p>
        <p v-show="browserType === 'playlist'">
          Please, select a playlist to browse
        </p>
        <p v-show="browserType === 'soundscape' && soundscape.length === 0">
          No soundscapes found
        </p>
      </div>
      <div
        v-if="recordings?.length !== 0 && soundscape.length === 0"
      >
        <div
          v-for="(recording, index) in recordings"
          :key="index"
          class="visobj-list-item h-full flex flex-col mb-2 cursor-pointer"
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
      <div v-show="soundscape.length !== 0">
        <div
          v-for="(ss, index) in soundscape"
          :key="index"
          class="visobj-list-item h-full flex flex-col mb-2"
          :class="browserTypeId === String(ss.id) ? 'active ' : ' '"
          :data-ss-id="ss.id"
          @click="onSelectedThumbnail(ss.id)"
        >
          <div class="flex flex-row justify-between text-sm">
            <div>{{ ss.name }}</div>
            <div>{{ 'scale:' + ss.max_value }}</div>
          </div>
          <div class="flex overflow-hidden mx-0 my-1.5 h-32 max-w-full max-h-full">
            <img
              :src="ss.thumbnail"
              class="w-full h-full object-fill object-fill"
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

import { type RecordingResponse, type SoundscapeResponse, type Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useSites } from '../../_composables/use-sites'
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
const isSoundscape = computed(() => browserType.value === 'soundscape')

const thumbnailContainer = ref<HTMLElement | null>(null)
const recordings = ref<RecordingResponse>([])
const soundscape = ref<SoundscapeResponse>([])

const props = defineProps<{
  recordingsItem: RecordingResponse | undefined,
  soundscapeResponse: SoundscapeResponse | undefined,
  initialDate: string
  siteSelected: string | number | undefined
  visobject: Visobject | undefined
}>()

const emits = defineEmits<{(e: 'onSelectedThumbnail', id: number): void}>()

const setErrorImage = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://rfcx-web-static.s3.eu-west-1.amazonaws.com/arbimon/unavaliable.png'
}

const getCaption = (site: string, datetime: string) => {
  return [site, dayjs.utc(datetime).format('lll')].join(', ')
}

const siteSelectedRef = ref<string | number | undefined>()
const idRecording = ref(0)
const idSelectedRecording = computed(() =>
  idRecording.value === 0 ? '' : idRecording.value.toString()
)

const selectedRecordingId = computed(() => {
  if (isPlaylist.value) {
    const notEmtpy = idSelectedRecording.value !== undefined && idSelectedRecording.value !== ''
    return notEmtpy ? idSelectedRecording.value : browserRecId.value
  }
  return isSoundscape.value ? undefined : browserTypeId.value
})

const { data: sites } = useSites(apiClientArbimon, selectedProjectSlug, computed(() => ({ count: true, deployment: true, logs: true })))

const recordingListSearchParams = computed(() => {
  const formattedDate = dayjs.utc(props.initialDate).format('YYYY-MM-DD')
  if (!formattedDate) return
  const visobjSite = sites.value?.find(site => site.name === props.visobject?.site)
  const opts = {
    // when the user change selected site selectedRecordingId shouldn't be include
    key: `!q:${siteSelectedRef.value}-${formattedDate}${visobjSite && visobjSite.id !== props.siteSelected ? '' : '?recording_id=' + selectedRecordingId.value}`,
    show: 'thumbnail-path',
    limit: recLimit,
    offset: recOffset.value * recLimit
  }
  return opts
})

const { isLoading: isLoadingRecordings, data: recordingsResponse, refetch: refetchRecordings, isRefetching: isRefetchRecordings } = useGetListRecordings(apiClientArbimon, selectedProjectSlug, recordingListSearchParams)

const findVisObj = () => {
  setTimeout(async () => {
    const el = document.querySelector('.visobj-list-item.active') as HTMLElement
    if (el !== undefined && el !== null) {
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
  idRecording.value = id
  emits('onSelectedThumbnail', id)
}

watch(() => recordingsResponse.value, (newValue) => {
  if (!newValue || recordingsResponse.value === undefined) return
  if (recordingsResponse.value.length && recordings.value.length && recordingsResponse.value[0].site === recordings.value[0].site) {
    recordings.value = [...recordings.value, ...recordingsResponse.value]
    findVisObj()
  } else recordings.value = recordingsResponse.value
})

watch(() => browserType.value, () => {
  refetchRecordings()
})

watch(() => props.recordingsItem, (r) => {
  if (r === undefined) return
  recordings.value = [...r]
  soundscape.value = []
})

watch(() => props.soundscapeResponse, (ss) => {
  if (ss === undefined) return
  recordings.value = []
  soundscape.value = [...ss]
})

const selectedSoundscapeId = computed(() => {
  if (!isSoundscape.value) return null
  const raw = browserTypeId.value
  return raw ? Number(raw) : null
})

const scrollToSelectedSoundscape = async () => {
  await nextTick()

  if (!thumbnailContainer.value || selectedSoundscapeId.value == null) return

  const el = thumbnailContainer.value.querySelector(
    `[data-ss-id="${selectedSoundscapeId.value}"]`
  ) as HTMLElement | null

  if (!el) return

  el.scrollIntoView({
    block: 'center',
    behavior: 'smooth'
  })
}

watch(
  () => soundscape.value,
  () => {
    scrollToSelectedSoundscape()
  },
  { deep: true }
)

watch(() => props.initialDate, () => {
  refetchRecordings()
})

watch(() => props.siteSelected, () => {
  if (siteSelectedRef.value === props.siteSelected || props.siteSelected === undefined) return
  siteSelectedRef.value = props.siteSelected
})

onMounted(() => {
  if (thumbnailContainer.value) {
    thumbnailContainer.value.addEventListener('scroll', handleScroll)
  }
  scrollToSelectedSoundscape()
})

onBeforeUnmount(() => {
  if (thumbnailContainer.value) {
    thumbnailContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>
