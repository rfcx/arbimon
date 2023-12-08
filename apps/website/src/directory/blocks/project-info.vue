<template>
  <div class="flex flex-col gap-4 inset-1/4 left-100 w-98 bg-pitch transition-transform -translate-x-full rounded-lg">
    <div class="rounded-t-lg bg-moss p-4 text-spoonbill">
      <div class="flex flex-row justify-between items-center">
        <span
          v-if="project?.countries.length === 0"
          class="text-xs text-spoonbill flex-1"
        >
          No site
        </span>
        <span
          v-if="project?.countries.length !== 0"
          class="text-spoonbill"
        >{{ project?.countries }}</span>
        <icon-fa-close
          class="text-fog m-auto self-end w-4 h-3.5"
          @click="emit('emitCloseProjectInfo')"
        />
      </div>
    </div>
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
const emit = defineEmits<{(e: 'emitCloseProjectInfo'): void }>()

const pdStore = useProjectDirectoryStore()
const project = computed<ProjectProfileWithMetrics | undefined>(() => {
  const project = pdStore.getProjectWithMetricsById(props.projectId)
  if (!project) { // TODO: fetch from api if there is no metrics in store
    const projectLight = pdStore.getProjectLightById(props.projectId)
    if (projectLight === undefined) return undefined
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
console.info(project)
console.info(project.value?.countries)

</script>
