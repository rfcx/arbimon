<template>
  <router-link
    :to="{ name: ROUTE_NAMES.dashboard, params: { projectSlug: project.slug }}"
    class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-moss dark:border-util-gray-02 dark:hover:bg-util-gray-02 h-auto"
  >
    <imageCard
      class="image-size"
      :src="image"
    />
    <h6
      class="mb-2 mt-6 font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
      :title="project?.name"
    >
      {{ project.name }}
    </h6>
    <div
      class="flex flex-row items-center font-display text-sm mr-2 h-5 overflow-hidden"
      style="{ overflow: hidden; white-space: nowrap; text-overflow: ellipsis }"
    >
      <p class="text-spoonbill">
        {{ project?.countries?.length !== 0 ? project?.countries : 'Multiple countries' }}
      </p>
      <div
        class="ml-1 border-l-2"
        style="overflow: hidden; text-overflow: ellipsis;"
      >
        <span class="ml-1">
          {{ objective }}
        </span>
      </div>
    </div>
    <p
      class="font-normal line-clamp-2 text-gray-700 dark:text-insight"
      :title="project?.name"
    >
      {{ project?.name }}
    </p>
  </router-link>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import type { Project } from '@rfcx-bio/common/dao/types'

import image from '@/_assets/cta/frog-hero.webp'
import imageCard from '@/landing/team/components/image-card.vue'
import { ROUTE_NAMES } from '~/router'

const props = defineProps<{project: Omit<Project, 'idArbimon'>}>()

const objective = computed(() => {
  let text = ''
  props.project.objectives?.forEach(obj => {
    if (obj === 'bio-baseline') {
      text = text + 'Establish baseline'
    } else if (obj === 'monitor-species') {
      text = text + 'Detect rare species'
    } else if (obj === 'monitor-illegal-act') {
      text = text + 'Detect illegal activity'
    } else if (obj === 'impact-human') {
      text = text + 'Evaluate human impact'
    } else if (obj === 'impact-conservation') {
      text = text + 'Evaluate conservation impact'
    } else {
      text = text + 'Others'
    }

    if (props.project.objectives?.length !== 1 && obj !== props.project.objectives?.slice(-1)[0]) {
      text = text + ', '
    }
  })
  return text
})
</script>

<style lang="scss">
.image-size {
  height: 7rem !important;
  width: 7rem !important;
}
</style>
