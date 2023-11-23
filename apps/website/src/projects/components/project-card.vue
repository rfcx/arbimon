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
      :title="project.name"
    >
      {{ project.name }}
    </h6>
    <div class="flex flex-row items-center font-display text-sm mr-2 h-5 overflow-hidden text-ellipsis">
      <span class="text-spoonbill">
        PuertoRico
      </span>
      <div class="ml-1 border-l-2">
        <span class="ml-1 whitespace-nowrap">
          List of project cards that each of them includes
        </span>
      </div>
    </div>
    <p
      class="font-normal line-clamp-2 text-gray-700 dark:text-insight"
      :title="project.name"
    >
      {{ project.name }}
    </p>
  </router-link>
</template>
<script setup lang="ts">
import type { Project } from '@rfcx-bio/common/dao/types'

import image from '@/_assets/cta/frog-hero.webp'
import imageCard from '@/landing/team/components/image-card.vue'
import { ROUTE_NAMES } from '~/router'

defineProps<{project: Omit<Project, 'idArbimon'>}>()
</script>

<style lang="scss">
.image-size {
  height: 7rem !important;
  width: 7rem !important;
}
</style>
