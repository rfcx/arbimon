<template>
  <div class="flex flex-col gap-4 inset-1/4 left-100 w-98 bg-moss transition-transform -translate-x-full p-6 lg:p-10 rounded-lg">
    <span class="text-flamingo"> ⚠️ work in progress ⚠️ </span>
    <span
      v-if="project?.countries.length !== 0"
      class="text-xxs text-spoonbill"
    >{{ project?.countries }}</span>
    <span class="text-lg">{{ project?.name }}</span>
    <router-link
      :to="`/p/${project?.slug}`"
      class="text-frequency"
    >
      <button
        class="btn btn-primary w-full"
        :disabled="project?.isMock"
        :class="{'opacity-50 cursor-not-allowed': project?.isMock}"
      >
        View Insights
      </button>
    </router-link>
    <span
      v-if="project?.isMock"
      class="text-sm text-gray-300 px-2"
    >Only fake data. This project is not on dev environment.</span>
  </div>
</template>
<script setup lang="ts">

import { computed } from 'vue'

import { useProjectDirectoryStore } from '~/store'
import { type ProjectProfileWithMetrics } from '../data/types'

const props = defineProps<{ projectId: number }>()

const pdStore = useProjectDirectoryStore()
const project = computed<ProjectProfileWithMetrics | undefined>(() => {
  const project = pdStore.getProjectWithMetricsById(props.projectId)
  if (!project) { // TODO: fetch from api if there is no metrics in store
    const projectLight = pdStore.getProjectLightById(props.projectId)
    if (!projectLight) { return undefined }
    return {
      ...projectLight,
      summary: 'This is a test project!',
      objectives: ['bio-baseline'],
      noOfSpecies: 0,
      noOfRecordings: 0,
      countries: [],
      isHighlighted: false,
      isMock: true,
      imageUrl: ''
    }
  }
  return project
})
</script>
