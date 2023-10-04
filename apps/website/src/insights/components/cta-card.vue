<template>
  <div class="fixed top-0 left-0 right-0 z-49 w-full custom-backdrop overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center flex mx-auto">
    <div class="relative w-full max-w-sm max-h-full">
      <div class="relative rounded-md shadow p-6 bg-moss border-1 border-frequency">
        <h2 class="text-2xl font-header text-insight text-center">
          Uh oh!
        </h2>
        <div class="text-left text-base pt-6 text-insight">
          Your Insight dashboard is not ready yet.
        </div>
        <div class="text-left text-base pt-1 text-insight">
          Here's what you need to do:
        </div>
        <ul class="list-inside list-disc text-base">
          <li class="pt-2">
            Run an audio analysis
          </li>
          <li>
            Validate the result
          </li>
        </ul>
        <button
          class="btn btn-primary h-8 mr-0 py-0 grow-0 mt-6 w-full"
          type="button"
          title="Return to Audio Analysis"
        >
          <a
            :href="analysisUrl"
            target="_blank"
          >
            Return to Audio Analysis
          </a>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { useStore } from '~/store'

const store = useStore()

const selectedProject = computed(() => store.selectedProject)

const BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL
const analysisUrl = `${BASE_URL}/project/${selectedProject.value?.slug}/analysis`

</script>
