<template>
  <div class="bg-util-gray-04 p-4 border border-util-gray-02 rounded-md w-full flex flex-col gap-4 md:(flex-row items-center min-h-12) justify-between">
    <div class="font-medium flex flex-col gap-4 md:(flex-row items-center) justify-between">
      <div class="flex flex-row gap-2 flex-shrink-0">
        <icon-custom-ic-warning class="h-5 w-5 text-insight" />
        No detections
      </div>
      <span class="text-insight text-base font-medium font-sans flex-1 flex-shrink">
        The Insight page will automatically update with results once the analysis and validation are complete.
      </span>
    </div>
    <a
      v-if="store.userIsFullProjectMember"
      target="_blank"
      class="text-frequency cursor-pointer font-display flex-shrink-0"
      @click="toggleAnalysisSelector(true)"
    >
      Run analysis
    </a>
    <CreateAnalysis
      v-if="hasOpenedAnalysisSelector"
      @emit-close="toggleAnalysisSelector(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import CreateAnalysis from '@/projects/components/create-analysis.vue'
import { useStore } from '~/store'

const store = useStore()
const hasOpenedAnalysisSelector = ref(false)

function toggleAnalysisSelector (isOpened: boolean): void {
  hasOpenedAnalysisSelector.value = isOpened
}
</script>
