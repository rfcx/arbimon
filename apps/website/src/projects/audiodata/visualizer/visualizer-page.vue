<template>
  <section class="bg-white dark:bg-pitch">
    <VisualizerSidebar
      :visobject="visobject"
      :is-loading-visobject="isLoadingVisobject"
      :pointer="pointer"
      :is-sidebar-tags-updated="isSidebarTagsUpdated"
      @update-current-time="handleCurrentTime"
      @update-color-spectrogram="handleColorSpectrogram"
      @update-validations="updateValidations"
      @update-freq-filter="handleFreqFilter"
      @update-tags="updateSpectrogramrTags"
      @emit-training-set="handleTrainingSet"
      @emit-training-set-visibility="handleTrainingSetVisibility"
      @emit-visible-soundscapes="handleSoundscapeRegions"
      @emit-active-layer="handleActiveLayer"
      @emit-species-visibility="handleSpeciesVisibility"
      @emit-template-visibility="handleTemplateVisibility"
      @emit-selected-thumbnail="handleSelectedThumbnail"
      @emit-selected-playlist="handleSelectedPlaylist"
      @emit-active-aed-boxes="handleAedJobs"
      @emit-active-clustering="handleClustering"
      @emit-set-browser-type="setBrowserType"
    />
    <div
      v-if="isLoadingVisobject || isRefetching"
      class="ml-120 relative"
    >
      <div class="flex h-90vh justify-center items-center bg-util-gray-04 mt-4 mr-4 ml-16 mb-0">
        <div class="inline-flex items-center">
          <icon-custom-ic-loading class="animate-spin h-8 w-8" />
          <span class="ml-2 text-xl">
            Loading...
          </span>
        </div>
      </div>
    </div>
    <VisualizerSpectrogram
      v-else
      :visobject="visobject"
      :visobject-soundscape="visobjectSoundscape"
      :current-time="currentTime"
      :freq-filter="freqFilter"
      :is-spectrogram-tags-updated="isSpectrogramTagsUpdated"
      :active-layer="activeLayer"
      :training-set="selectedTrainingSet"
      :aed-jobs="selectedAedJobs"
      :clustering="selectedClustering"
      :layer-visibility="layerVisibility"
      :visible-soundscapes="visibleSoundscapes"
      @emit-pointer="handlePointer"
      @update-tags="updateSidebarTags"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { type SoundscapeItem, type SoundscapeResponse, apiGetSoundscapes } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'
import type { TrainingSet } from '@rfcx-bio/common/src/api-arbimon/audiodata/training-sets'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetRecording } from '../_composables/use-visualizer'
import type { VisibleSoundscapes } from './components/sidebar-soundscape-regions.vue'
import VisualizerSidebar, { type AedJob, type ClusteringPlaylist } from './components/visualizer-sidebar.vue'
import VisualizerSpectrogram, { type Pointer } from './components/visualizer-spectrogram.vue'
import { type FreqFilter } from './types'

export interface LayerVisibility {
  tag: boolean
  species: boolean
  ts: boolean
  template: boolean
  aed: boolean
  cluster: boolean
  soundscape: boolean
}

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const route = useRoute()
const router = useRouter()
const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)
const currentTime = ref(0)
const spectroColor = ref('spectroColor=mtrue')
const freqFilter = ref<FreqFilter | undefined>(undefined)
const isSpectrogramTagsUpdated = ref<boolean>(false)
const isSidebarTagsUpdated = ref<boolean>(false)
const activeLayer = ref<string | undefined>(undefined)
const layerVisibility = ref<LayerVisibility>({
  tag: true,
  species: true,
  ts: true,
  template: true,
  aed: true,
  cluster: true,
  soundscape: true
})
const selectedTrainingSet = ref<TrainingSet | undefined>(undefined)
const selectedAedJobs = ref<AedJob[] | undefined>([])
const selectedClustering = ref<ClusteringPlaylist[] | undefined>([])
const visibleAedJobs = ref<Record<number, boolean>>({})
const visibleClustering = ref<Record<number, boolean>>({})
const visibleSoundscapes = ref<VisibleSoundscapes>({
  showAllNames: true,
  showAllTags: true,
  showBoxes: [],
  activeBox: null,
  activeTag: null,
  toggleVisible: true
})

const pointer = reactive<Pointer>({
  hz: 0,
  sec: 0
})

const browserTypes: string[] = ['rec', 'playlist', 'soundscape']
const browserType = computed(() => browserTypes.includes(route.params.browserType as string) ? route.params.browserType as string : undefined)
const isPlaylist = computed(() => browserType.value === 'playlist')
const isSoundscape = computed(() => browserType.value === 'soundscape')
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)
const browserRecId = computed(() => route.params.browserRecId as string ?? undefined)
const soundscapeResponse = ref<SoundscapeResponse | undefined>(undefined)
const visobjectSoundscape = ref<SoundscapeItem | undefined>(undefined)
const idRecording = ref(0)
const selectedPlaylist = ref(0)

const lastPlaylistId = ref(0)
const lastSoundscapeRecId = ref(0)
const lastPlaylistRecordingId = ref(0)
const lastRecordingId = ref(0)

const selectedRecordingId = computed(() => {
  return isPlaylist.value ? isSoundscape.value ? undefined : browserRecId.value : browserTypeId.value
})

const { isLoading: isLoadingVisobject, data: visobject, refetch: refetchRecording, isRefetching } = useGetRecording(apiClientArbimon, selectedProjectSlug, selectedRecordingId)

const handleCurrentTime = (value: number): void => {
  currentTime.value = value
}

const handleColorSpectrogram = (value: string): void => {
  spectroColor.value = value
  refetchRecording()
}

const updateValidations = (): void => {
  refetchRecording()
}

const handleFreqFilter = (filter: FreqFilter) => {
  freqFilter.value = filter
}

const updateSpectrogramrTags = () => {
  isSpectrogramTagsUpdated.value = false
  isSpectrogramTagsUpdated.value = true
}

const updateSidebarTags = () => {
  isSidebarTagsUpdated.value = false
  isSidebarTagsUpdated.value = true
}

const handleTrainingSet = (trainingSet: TrainingSet) => {
  selectedTrainingSet.value = trainingSet
}

const handleTrainingSetVisibility = (value: boolean) => {
  layerVisibility.value.ts = value
}

const handleSpeciesVisibility = (value: boolean) => {
  layerVisibility.value.species = value
}

const handleTemplateVisibility = (value: boolean) => {
  layerVisibility.value.template = value
}

const handleSoundscapeRegions = (value: VisibleSoundscapes) => {
  layerVisibility.value.soundscape = value.toggleVisible
  visibleSoundscapes.value = value
}

const setBrowserType = (value: string) => {
  if (value === 'playlist') {
    if (lastPlaylistId.value !== 0) {
      if (lastPlaylistRecordingId.value !== 0) {
        router.replace(
          `/p/${selectedProjectSlug.value}/visualizer/playlist/${lastPlaylistId.value}/${lastPlaylistRecordingId.value}`
        )
      } else {
        router.replace(
          `/p/${selectedProjectSlug.value}/visualizer/playlist/${lastPlaylistId.value}`
        )
      }
    } else {
      router.replace(
        `/p/${selectedProjectSlug.value}/visualizer/${value}`
      )
    }
  } else {
    if (value === 'soundscape') {
      if (lastSoundscapeRecId.value === 0) {
        router.replace(
          `/p/${selectedProjectSlug.value}/visualizer/${value}`
        )
        return
      }
      router.replace(
        `/p/${selectedProjectSlug.value}/visualizer/${value}/${lastSoundscapeRecId.value}`
      )
    } else {
      if (lastRecordingId.value === 0) {
        router.replace(
          `/p/${selectedProjectSlug.value}/visualizer/${value}`
        )
        return
      }
      router.replace(
        `/p/${selectedProjectSlug.value}/visualizer/${value}/${lastRecordingId.value}`
      )
    }
  }
}

const handleActiveLayer = (layer: string | undefined) => {
  activeLayer.value = layer
}

const handleSelectedThumbnail = async (value: number) => {
  idRecording.value = value
  if (browserType.value === 'soundscape') {
    soundscapeResponse.value = await apiGetSoundscapes(apiClientArbimon, selectedProjectSlug.value ?? '')
    if (browserTypeId.value !== undefined) {
      visobjectSoundscape.value = soundscapeResponse.value?.find(it => it.id === value) ?? undefined
    }
  } else refetchRecording()
}

const handleSelectedPlaylist = (value: number) => {
  selectedPlaylist.value = value
  refetchRecording()
}

const handleAedJobs = (visibleJobs: Record<number, boolean>, job: AedJob) => {
  visibleAedJobs.value = visibleJobs
  selectedAedJobs.value?.push(job)
  selectedAedJobs.value = selectedAedJobs.value?.filter(j => visibleJobs[j.jobId] === true)
}

const handleClustering = (visiblePl: Record<number, boolean>, pl: ClusteringPlaylist) => {
  visibleClustering.value = visiblePl
  selectedClustering.value?.push(pl)
  selectedClustering.value = selectedClustering.value?.filter(cl => visiblePl[cl.playlistId] === true)
}

const handlePointer = (data: Pointer) => {
  pointer.sec = data.sec
  pointer.hz = data.hz
}

onMounted(() => {
  if (isPlaylist.value) {
    if (browserTypeId.value !== undefined && browserTypeId.value !== '') lastPlaylistId.value = Number(browserTypeId.value)
    if (browserRecId.value !== undefined && browserRecId.value !== '') lastPlaylistRecordingId.value = Number(browserRecId.value)
  } else {
    if (browserTypeId.value === undefined || browserTypeId.value === '') return
    if (isSoundscape.value) {
      lastSoundscapeRecId.value = Number(browserTypeId.value)
      handleSelectedThumbnail(lastSoundscapeRecId.value)
    } else {
      lastRecordingId.value = Number(browserTypeId.value)
    }
  }
})

watch(idRecording, (newId) => {
  if (!newId) return
  if (isPlaylist.value && browserRecId.value !== newId.toString()) {
    router.replace(
      `/p/${selectedProjectSlug.value}/visualizer/playlist/${browserTypeId.value}/${newId}`
    )
    lastPlaylistRecordingId.value = newId
  } else {
    if (browserTypeId.value !== newId.toString()) {
      router.replace(
        `/p/${selectedProjectSlug.value}/visualizer/${browserType.value}/${newId}`
      )
    }
    if (isSoundscape.value) {
      lastSoundscapeRecId.value = newId
    } else {
      lastRecordingId.value = newId
    }
  }
})

watch(selectedPlaylist, (newId) => {
  if (!newId) return
  if (newId.toString() !== browserTypeId.value) {
    router.replace(
      `/p/${selectedProjectSlug.value}/visualizer/playlist/${newId}`
    )
  }
  idRecording.value = 0
  lastPlaylistId.value = newId
})

watch(() => browserType.value, () => {
  refetchRecording()
  if (!visobject.value) return
  visobject.value.type = browserType.value as string
})

watch(() => browserTypeId.value, () => {
  refetchRecording()
})
</script>
