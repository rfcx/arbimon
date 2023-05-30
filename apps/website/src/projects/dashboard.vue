<template>
  <project-navbar />
  <section class="max-w-screen-xl mx-auto px-2 sm:px-8">
    <div class="text-gray-900 dark:text-white">
      <h1 class="text-4xl pt-16 pb-1 font-bold">
        {{ store.selectedProject?.name }}
      </h1>
    </div>
    <div class="text-gray-900 dark:text-white">
      <h2 class="text-3xl pt-8 pb-6">
        Overview
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <DashboardOverview
          v-for="stat in stats"
          :key="stat.value"
          :stat="stat"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { useStore } from '~/store'
import DashboardOverview from './components/dashboard-overview.vue'

const store = useStore()

const stats = [
  { value: 'site', title: 'Sites created', count: 0, label: 'Create new sites' },
  { value: 'recording', title: 'Recordings uploaded', count: 0, label: 'Upload new recordings' },
  { value: 'species', title: 'Species added to library', count: 0, label: 'Add a new species' },
  { value: 'playlist', title: 'Playlists created', count: 0, label: 'Create a new playlist' }
]
</script>
