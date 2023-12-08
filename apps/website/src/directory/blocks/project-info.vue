<template>
  <div class="flex flex-col inset-1/4 left-100 w-98 bg-moss transition-transform -translate-x-full rounded-lg">
    <div class="rounded-t-lg bg-moss p-4">
      <div class="flex flex-row justify-between items-center">
        <span
          v-if="project?.countries.length === 0"
          class="text-sm text-spoonbill font-medium flex-1"
        >
          No site
        </span>
        <span
          v-if="project?.countries.length !== 0"
          class="text-spoonbill font-medium text-xs flex-1"
        >{{ project?.countries }}</span>
        <icon-fa-close
          class="text-fog m-auto self-end w-4 h-3.5"
          @click="emit('emitCloseProjectInfo')"
        />
      </div>
    </div>
    <div class="overflow-scroll">
      <img
        :src="project?.imageUrl"
        class="w-full h-full object-cover bg-pitch object-center h-52"
      >
      <div class="p-4 border-b border-util-gray-01">
        <span class="text-lg font-medium">{{ project?.name }}</span>
        <div
          class="flex font-medium text-sm flex-row border-gray-300 mt-3 space-x-4 items-center"
        >
          <span>
            Project dates:
          </span>
          <span class="uppercase">
            {{ formatDateRange(new Date()) }}
          </span>
          <icon-custom-arrow-right-white class="self-start" />
          <span
            class="uppercase"
          >
            {{ formatDateRange(null) }}
          </span>
        </div>
      </div>
      <div class=" p-4">
        <div class="mt-16"></div>
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
        >Only fake data. This project is not on dev environment. </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
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

const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'present'
  else return dayjs(date).format('MM/DD/YYYY')
}

</script>
