<template>
  <div class="bg-util-gray-03 p-4 border border-util-gray-01 rounded-md w-full flex flex-col gap-4 md:(flex-row items-center min-h-12) justify-between">
    <div class="font-medium flex flex-col gap-4 md:(flex-row items-center) justify-between">
      <div class="flex flex-row gap-2 flex-shrink-0">
        <icon-custom-ic-warning class="h-5 w-5" />
        No detections
      </div>
      <span class="text-insight text-base font-medium font-sans flex-1 flex-shrink">
        The Insight page will automatically update with results once the analysis and validation are complete.
      </span>
    </div>
    <a :href="analysisUrl" target="_blank" class="text-frequency cursor-pointer font-display flex-shrink-0">
      Run analysis
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useStore } from '~/store'

const store = useStore()

const selectedProject = computed(() => store.selectedProject)

const BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL
const analysisUrl = `${BASE_URL}/project/${selectedProject.value?.slug}/analysis`

</script>
