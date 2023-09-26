<template>
  <OnClickOutside
    class="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center flex mx-auto"
    @trigger="$emit('emitClose')"
  >
    <div class="relative w-full max-w-6xl max-h-full">
      <div class="relative rounded-lg shadow p-10 bg-pitch border-1 border-insight">
        <h2 class="text-3xl font-header text-insight text-left">
          Create new analysis
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 pt-6">
          <AnalysisCard
            v-for="analysis in analyses"
            :key="analysis.value"
            :analysis="analysis"
            @emit-selected-analysis="onSelectAnalysis"
          />
        </div>
        <div class="flex items-center pt-12 justify-between rounded-b">
          <button
            id="closeButton"
            type="button"
            class="btn btn-secondary w-60"
            @click="$emit('emitClose')"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary w-60 disabled:(bg-util-gray-03 cursor-not-allowed text-util-gray-01) disabled:hover:(bg-util-gray-03 cursor-not-allowed text-util-gray-01)"
            type="button"
            :disabled="!isAnalysisSelected"
            :title="isAnalysisSelected ? 'Create analysis' : 'Select analysis'"
          >
            <a
              :class="!isAnalysisSelected ? 'cursor-not-allowed' : ''"
              :href="analysisUrl"
              target="_blank"
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
import AnalysisCard from './analysis-card.vue'

defineEmits<{(e: 'emitClose'): void}>()

const store = useStore()
const selectedProject = computed(() => store.selectedProject)
const isAnalysisSelected = ref(false)
let analysisUrl = ''

const BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL

const analyses = computed(() => [
  { value: 'pm', title: 'Pattern Matching', description: "An automated sound detection tool that employs a single example of the target sound (template) to search for similar signals in a larger set of recordings, based on the user's correlation score (i.e., similarity). Valuable for swiftly identifying target species sounds within soundscape recordings.", url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/patternmatching?newJob`, link: 'https://support.rfcx.org/article/99-what-is-pattern-matching-pm-in-arbimon', label: 'Learn more about pattern matching.', selected: false },
  { value: 'soundscapes', title: 'Soundscapes', description: 'An analytical and visualization tool for summarizing and representing all environmental sounds, including animal calls, environmental factors, and human activity. Users can define parameters such as time scale of aggregation (e.g., hour, month, or year), frequency bin size, and minimum amplitude threshold for sound peaks (i.e., intensity). This tool is beneficial for extracting and comparing ecosystem conditions without the need to identify individual species.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/soundscapes?newJob`, link: 'https://support.rfcx.org/article/32-soundscapes', label: 'Learn more about pattern matching.', selected: false },
  { value: 'aed', title: 'AED & Clustering', description: 'An unsupervised approach for the automated detection and categorization of sounds within extensive audio datasets. This approach quickly identifies species communities and uncovers previously unknown sound categories.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/audio-event-detections-clustering?newJob`, link: 'https://support.rfcx.org/article/157-aed-and-clustering', label: 'Learn more about pattern matching.', selected: false },
  { value: 'rfm', title: 'Random Forest Model', description: 'A machine learning model, comprising multiple decision trees and trained with presence and absence data, designed to predict species presence in soundscape recordings. It serves as an efficient and accurate means of assessing species presence in diverse acoustic environments.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/random-forest-models/models?newJob`, link: 'https://support.rfcx.org/article/100-what-is-the-random-forest-model-rfm', label: 'Learn more about pattern matching.', selected: false }
])

const onSelectAnalysis = (url: string) => {
  isAnalysisSelected.value = true
  analysisUrl = url
}

</script>
