<template>
  <section class="bg-white dark:bg-pitch">
    <VisualizerSidebar
      :visobject="visobject"
      :is-loading-visobject="isLoadingVisobject"
      @update-current-time="handleCurrentTime"
      @update-color-spectrogram="handleColorSpectrogram"
      @update-freq-filter="handleFreqFilter"
      @update-tags="handleTags"
      @emit-training-set="handleTrainingSet"
      @emit-training-set-visibility="handleTrainingSetVisibility"
      @emit-active-layer="handleActiveLayer"
      @emit-species-visibility="handleSpeciesVisibility"
      @emit-template-visibility="handleTemplateVisibility"
      @emit-selected-thumbnail="handleSelectedThumbnail"
      @emit-selected-playlist="handleSelectedPlaylist"
      @emit-active-aed-boxes="handleAedJobs"
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
      :current-time="currentTime"
      :freq-filter="freqFilter"
      :is-spectrogram-tags-updated="isSpectrogramTagsUpdated"
      :active-layer="activeLayer"
      :training-set="selectedTrainingSet"
      :aed-jobs="selectedAedJobs"
      :visible-aed-jobs="visibleAedJobs"
      :layer-visibility="layerVisibility"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { TrainingSet } from '@rfcx-bio/common/src/api-arbimon/audiodata/training-sets'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetRecording } from '../_composables/use-visualizer'
import VisualizerSidebar, { type AedJob } from './components/visualizer-sidebar.vue'
import VisualizerSpectrogram from './components/visualizer-spectrogram.vue'
import { type FreqFilter } from './types'

export interface LayerVisibility {
  tag: boolean
  species: boolean
  ts: boolean
  template: boolean
  aed: boolean
  cluster: boolean
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
const activeLayer = ref<string | undefined>(undefined)
const layerVisibility = ref<LayerVisibility>({
  tag: true,
  species: true,
  ts: true,
  template: true,
  aed: true,
  cluster: true
})
const selectedTrainingSet = ref<TrainingSet | undefined>(undefined)
const selectedAedJobs = ref<AedJob[] | undefined>([])
const visibleAedJobs = ref<Record<number, boolean>>({})

const browserTypes: string[] = ['rec', 'playlist', 'soundscape']
const browserType = computed(() => browserTypes.includes(route.params.browserType as string) ? route.params.browserType as string : undefined)
const isPlaylist = computed(() => browserType.value === 'playlist')
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)
const browserRecId = computed(() => route.params.browserRecId as string ?? undefined)

const idRecording = ref(0)
const selectedPlaylist = ref(0)
const idSelectedRecording = computed(() =>
  idRecording.value === 0 ? '' : idRecording.value.toString()
)

const selectedRecordingId = computed(() => {
  if (isPlaylist.value) {
    const notEmtpy = idSelectedRecording.value !== undefined && idSelectedRecording.value !== ''
    return notEmtpy ? idSelectedRecording.value : browserRecId.value
  }
  return browserTypeId.value
})
const { isLoading: isLoadingVisobject, data: visobject, refetch: refetchRecording, isRefetching } = useGetRecording(apiClientArbimon, selectedProjectSlug, selectedRecordingId)

const handleCurrentTime = (value: number): void => {
  currentTime.value = value
}

const handleColorSpectrogram = (value: string): void => {
  spectroColor.value = value
  refetchRecording()
}

const handleFreqFilter = (filter: FreqFilter) => {
  freqFilter.value = filter
}

const handleTags = () => {
  isSpectrogramTagsUpdated.value = false
  isSpectrogramTagsUpdated.value = true
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

const handleActiveLayer = (layer: string | undefined) => {
  activeLayer.value = layer
}

const handleSelectedThumbnail = (value: number) => {
  idRecording.value = value
  refetchRecording()
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

watch(selectedRecordingId, (newId) => {
  if (!newId) return

  router.replace(
    `/p/${selectedProjectSlug.value}/visualizer/playlist/${browserTypeId.value}/${newId}`
  )
})

watch(selectedPlaylist, (newId) => {
  if (!newId) return
  if (newId.toString() !== browserTypeId.value) {
    router.replace(
      `/p/${selectedProjectSlug.value}/visualizer/playlist/${newId}`
    )
  }
  idRecording.value = 0
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
