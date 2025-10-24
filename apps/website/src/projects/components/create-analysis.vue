<template>
  <OnClickOutside
    class="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center flex mx-auto bg-echo bg-opacity-70 fixed inset-0 z-40"
    @trigger="$emit('emitClose')"
  >
    <div class="relative w-full max-w-md max-h-full">
      <div class="grid grid-cols-1 gap-4 relative rounded-lg p-6 bg-pitch border-1 border-insight shadow-lg shadow-util-gray-03">
        <h2 class="text-3xl font-header text-insight text-left">
          Create new analysis
        </h2>
        <div class="grid grid-cols-1 gap-4">
          <AnalysisCardComponent
            v-for="analysis in analyses"
            :key="analysis.value"
            :analysis="analysis"
            @emit-selected-analysis="onSelectAnalysis"
          />
        </div>
        <div class="flex items-center justify-between rounded-b">
          <button
            id="closeButton"
            type="button"
            class="btn btn-secondary"
            @click="$emit('emitClose')"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary w-60 disabled:(bg-util-gray-04 cursor-not-allowed text-util-gray-02) disabled:hover:(bg-util-gray-04 cursor-not-allowed text-util-gray-02)"
            type="button"
            :disabled="!isAnalysisSelected"
          >
            <a
              :href="analysisUrl"
              :class="!isAnalysisSelected ? 'cursor-not-allowed' : ''"
            >
              Create analysis
            </a>
          </button>
        </div>
      </div>
    </div>
  </OnClickOutside>
</template>
<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { computed, ref } from 'vue'

import { useStore } from '~/store'
import { type AnalysisCard } from '../types'
import AnalysisCardComponent from './analysis-card.vue'

defineEmits<{(e: 'emitClose'): void}>()

const store = useStore()
const selectedProject = computed(() => store.project)
const isAnalysisSelected = ref(false)
const analysisUrl = ref('')

const BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const analyses = ref([
  { value: 'pm', title: 'Pattern Matching', description: "An automated sound detection tool that employs a single example of the target sound (template) to search for similar signals in a larger set of recordings, based on the user's correlation score (i.e., similarity). Valuable for swiftly identifying target species sounds within soundscape recordings.", url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/patternmatching?newJob`, link: 'https://help.arbimon.org/category/197-analyze-recordings-with-pattern-matching-pm', label: 'Learn more about Pattern Matching', isSelected: false },
  { value: 'soundscapes', title: 'Soundscapes', description: 'An analytical and visualization tool for summarizing and representing all environmental sounds, including animal calls, environmental factors, and human activity. Users can define parameters such as time scale of aggregation (e.g., hour, month, or year), frequency bin size, and minimum amplitude threshold for sound peaks (i.e., intensity). This tool is beneficial for extracting and comparing ecosystem conditions without the need to identify individual species.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/soundscapes?newJob`, link: 'https://help.arbimon.org/category/200-analyze-recordings-with-soundscapes', label: 'Learn more about Soundscapes', isSelected: false },
  { value: 'aed', title: 'AED & Clustering', description: 'An unsupervised approach for the automated detection and categorization of sounds within extensive audio datasets. This approach quickly identifies species communities and uncovers previously unknown sound categories.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/audio-event-detections-clustering?newJob`, link: 'https://help.arbimon.org/category/198-analyze-recordings-with-audio-event-detection-clustering-aed-c', label: 'Learn more about AED and Clustering', isSelected: false },
  { value: 'rfm', title: 'Random Forest Model', description: 'A machine learning model, comprising multiple decision trees and trained with presence and absence data, designed to predict species presence in soundscape recordings. It serves as an efficient and accurate means of assessing species presence in diverse acoustic environments.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/random-forest-models/models?newJob`, link: 'https://help.arbimon.org/category/199-analyze-recordings-with-random-forest-models-rfm', label: 'Learn more about RFM', isSelected: false }
])

const onSelectAnalysis = (url: string, value: string) => {
  analyses.value.forEach((analysis: AnalysisCard) => {
    if (analysis.value !== value) {
      analysis.isSelected = false
    } else analysis.isSelected = true
  })
  isAnalysisSelected.value = !!url
  analysisUrl.value = url
}

</script>
