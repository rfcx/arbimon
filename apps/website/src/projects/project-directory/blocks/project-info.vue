<template>
  <div class="flex flex-col gap-4 inset-1/4 left-100 w-98 bg-moss transition-transform -translate-x-full p-6 lg:p-10 rounded-lg">
    <span class="text-flamingo"> ⚠️ work in progress ⚠️ </span>
    {{ project?.name }}
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
const project = computed<ProjectProfileWithMetrics | undefined>(() => pdStore.getProjectWithMetricsById(props.projectId))
</script>
