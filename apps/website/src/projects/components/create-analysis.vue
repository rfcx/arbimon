<template>
  <on-click-outside>
    <div
      id="analysisModal"
      tabindex="-1"
      aria-hidden="true"
      class="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center flex hidden mx-auto"
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
            />
          </div>
          <div class="flex items-center pt-12 justify-between rounded-b">
            <button
              id="closeButton"
              type="button"
              class="btn btn-secondary w-60"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary w-60"
              :disabled="true"
            >
              Create analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  </on-click-outside>
</template>
<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { initDrawers, initModals, Modal } from 'flowbite'
import { computed, onMounted } from 'vue'

import { useStore } from '~/store'
import AnalysisCard from './analysis-card.vue'

const store = useStore()
const selectedProject = computed(() => store.selectedProject)

const BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL

const analyses = computed(() => [
  { value: 'pm', title: 'Pattern Matching', description: 'Pattern matching description. Brief pros and cons and when to use the pattern matching analysis. Lorem ipsum dolor sit amet consectetur. Tellus venenatis accumsan et tellus vitae elit adipiscing non bibendum. Learn more about pattern matching.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/patternmatching`, link: 'https://support.rfcx.org/article/99-what-is-pattern-matching-pm-in-arbimon', label: 'Learn more about pattern matching.', selected: false },
  { value: 'soundscapes', title: 'Soundscapes', description: 'Pattern matching description. Brief pros and cons and when to use the pattern matching analysis. Lorem ipsum dolor sit amet consectetur. Tellus venenatis accumsan et tellus vitae elit adipiscing non bibendum. Learn more about pattern matching.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/soundscapes`, link: 'https://support.rfcx.org/article/32-soundscapes', label: 'Learn more about pattern matching.', selected: false },
  { value: 'aed', title: 'AED & Clustering', description: 'Pattern matching description. Brief pros and cons and when to use the pattern matching analysis. Lorem ipsum dolor sit amet consectetur. Tellus venenatis accumsan et tellus vitae elit adipiscing non bibendum. Learn more about pattern matching.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/audio-event-detections-clustering`, link: 'https://support.rfcx.org/article/157-aed-and-clustering', label: 'Learn more about pattern matching.', selected: false },
  { value: 'rfm', title: 'Random Forest Model', description: 'Pattern matching description. Brief pros and cons and when to use the pattern matching analysis. Lorem ipsum dolor sit amet consectetur. Tellus venenatis accumsan et tellus vitae elit adipiscing non bibendum. Learn more about pattern matching.', url: `${BASE_URL}/project/${selectedProject.value?.slug}/analysis/random-forest-models/models`, link: 'https://support.rfcx.org/article/100-what-is-the-random-forest-model-rfm', label: 'Learn more about pattern matching.', selected: false }
])

onMounted(() => {
  initModals()
  initDrawers()
  const $modalElement = document.querySelector('#analysisModal') as HTMLElement
  const $closeButton = document.querySelector('#closeButton') as HTMLElement
  const modalOptions = { backdropClasses: 'bg-transparent bg-opacity-0' }
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if ($modalElement && $closeButton) {
    const modal = new Modal($modalElement, modalOptions)
    $closeButton.addEventListener('click', () => modal.hide())
  }
})

</script>
