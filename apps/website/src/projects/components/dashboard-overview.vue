<template>
  <div class="bg-gray-300 border-2 border-gray-300 rounded-md p-6 dark:border-gray-600 h-32 md:h-46">
    <div class="flex justify-between rounded-t items-center">
      <h3 class="text-md text-gray-900">
        {{ stat.title }}
      </h3>
      <icon-fas-info-circle class="h-4 w-4 mr-2 text-gray-900" />
    </div>
    <div class="flex items-center pt-8 space-x-2 sm:space-x-3">
      <icon-fa-map-marker
        v-if="stat.value === 'site'"
        class="h-6 w-6 mr-2 text-gray-900"
      />
      <icon-fa-microphone
        v-if="stat.value === 'recording'"
        class="h-6 w-6 mr-2 text-gray-900"
      />
      <icon-fa-microphone
        v-if="stat.value === 'species'"
        class="h-6 w-6 mr-2 text-gray-900"
      />
      <icon-fa-list-ul
        v-if="stat.value === 'playlist'"
        class="h-6 w-6 mr-2 text-gray-900"
      />
      <span class="text-3xl text-gray-900">{{ stat.count }}</span>
    </div>
    <!-- <router-link
      :to="{ name: ROUTE_NAMES.createSite, params: { projectSlug: project.slug }}"
      class="pt-5"
    >
      <h5 class="text-xl underline text-cyan-600">
        Create new sites
      </h5>
    </router-link> -->
    <div class="pt-5">
      <a
        class="text-xl underline text-cyan-600"
      >
        {{ stat.label }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type Stat } from '../types'

defineProps<{stat: Stat}>()

</script>
