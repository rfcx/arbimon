<template>
  <router-link
    :to="{ name: ROUTE_NAMES.dashboard, params: { projectSlug: project.slug }}"
    class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-moss dark:border-util-gray-02 dark:hover:bg-util-gray-02 h-38"
  >
    <h5
      class="mb-2 text-xl font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
      :title="project.name"
    >
      {{ project.name }}
    </h5>
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

import { ROUTE_NAMES } from '~/router'

defineProps<{project: Omit<Project, 'idArbimon'>}>()
</script>
