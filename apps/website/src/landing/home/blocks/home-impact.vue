<template>
  <section class="relative h-168 bg-white dark:bg-mirage-gray">
    <client-only>
      <impact-globe
        :selected-visualization="selectedGlobeVisualization"
        class="absolute w-9/12 inset-y-0 left-0"
      />
    </client-only>
    <div class="absolute w-3/12 inset-y-0 right-0 py-8 sm:py-24 px-4 mr-75 lg:px-6 pointer-events-none">
      <div class="text-right">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Impact at a Glance
        </h2>
        <p class="text-gray-500 sm:text-xl dark:text-gray-400">
          With more than 100 million recordings, Arbimon uncovers the behaviour of some of the world's most endangered species, paving the way for a better understanding of our planet.
        </p>

        <div
          class="inline-flex rounded-md shadow-sm mt-12 ml-auto pointer-events-auto"
          role="group"
        >
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-900  border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            :class="{ 'bg-gray-200 dark:bg-gray-600': selectedGlobeVisualization === 'species' }"
            @click="selectedGlobeVisualization = 'species'"
          >
            Species
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-900 border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700  dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            :class="{ 'bg-gray-200 dark:bg-gray-600': selectedGlobeVisualization === 'countries' }"
            @click="selectedGlobeVisualization = 'countries'"
          >
            Countries
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700  dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            :class="{ 'bg-gray-200 dark:bg-gray-600': selectedGlobeVisualization === 'projects' }"
            @click="selectedGlobeVisualization = 'projects'"
          >
            Projects
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import ImpactGlobe from '../components/impact-globe.vue'

type GlobeVisualization = 'species' | 'countries' | 'projects' | undefined
const selectedGlobeVisualization = ref<GlobeVisualization>()
</script>
