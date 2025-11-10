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
      :layer-visibility="layerVisibility"
    />
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { TrainingSet } from '@rfcx-bio/common/src/api-arbimon/audiodata/training-sets'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetRecording } from '../_composables/use-visualizer'
import VisualizerSidebar from './components/visualizer-sidebar.vue'
import VisualizerSpectrogram from './components/visualizer-spectrogram.vue'
import { type FreqFilter } from './types'

export interface LayerVisibility {
  tag: boolean
  ts: boolean
  aed: boolean
  cluster: boolean
}

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const route = useRoute()
const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)
const currentTime = ref(0)
const spectroColor = ref('spectroColor=mtrue')
const freqFilter = ref<FreqFilter | undefined>(undefined)
const isSpectrogramTagsUpdated = ref<boolean>(false)
const activeLayer = ref<string | undefined>(undefined)
const layerVisibility = ref<LayerVisibility>({
  tag: true,
  ts: true,
  aed: true,
  cluster: true
})
const selectedTrainingSet = ref<TrainingSet | undefined>(undefined)

const browserTypes: string[] = ['rec', 'playlist', 'soundscape']
const browserType = computed(() => browserTypes.includes(route.params.browserType as string) ? route.params.browserType as string : undefined)
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)

const { isLoading: isLoadingVisobject, data: visobject, refetch: refetchRecording, isRefetching } = useGetRecording(apiClientArbimon, selectedProjectSlug, browserTypeId)

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

const handleActiveLayer = (layer: string | undefined) => {
  activeLayer.value = layer
}

watch(() => browserType.value, () => {
  refetchRecording()
  if (!visobject.value) return
  visobject.value.type = browserType.value as string
})

watch(() => browserTypeId.value, () => {
  refetchRecording()
})
</script>
