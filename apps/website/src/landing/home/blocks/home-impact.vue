<template>
  <section
    class="relative min-h-168 md:h-168 bg-white dark:bg-pitch"
  >
    <client-only>
      <impact-globe
        :selected-visualization="selectedGlobeVisualization"
        class="absolute w-full lg:w-9/12 inset-y-0 left-0"
      />
    </client-only>
    <div class="absolute w-full right-auto bottom-0 lg:w-3/12 lg:inset-y-0 lg:right-0 py-8 sm:py-24 px-4 lg:mr-12 xl:mr-48 2xl:mr-75 lg:px-6 xl:px-12 2xl:px-24 pointer-events-none">
      <div class="text-left">
        <h2 class="mb-4 text-2xl tracking-tight font-bold text-pitch dark:text-insight md:text-3xl lg:text-4xl">
          Arbimon’s Impact at-a-Glance
        </h2>
        <p class="text-pitch dark:text-insight">
          With more than 110 million minutes of acoustic recordings uploaded, Arbimon has made it possible to uncover critical insights into the behavior and conservation of some of the world’s most endangered species, paving the way to transformative action and a better understanding of our planet.
        </p>
        <ol
          role="tab"
          class="inline-flex mt-4 pointer-events-auto"
        >
          <li
            class="inline-block p-2.5 border-b-2 text-sm hover:text-frequency hover:border-frequency"
            :class="{ 'text-frequency border-frequency border-b-2': selectedGlobeVisualization === 'species' }"
            :aria-selected="selectedGlobeVisualization === 'species'"
            @click="selectedGlobeVisualization = 'species'"
          >
            <button>Species</button>
          </li>
          <li
            class="inline-block p-2.5 border-b-2 text-sm hover:text-frequency hover:border-frequency"
            :class="{ 'text-frequency border-frequency border-b-2': selectedGlobeVisualization === 'countries' }"
            :aria-selected="selectedGlobeVisualization === 'countries'"
            @click="selectedGlobeVisualization = 'countries'"
          >
            <button>Countries</button>
          </li>
          <li
            class="inline-block p-2.5 border-b-2 text-sm hover:text-frequency hover:border-frequency"
            :class="{ 'text-frequency border-frequency border-b-2': selectedGlobeVisualization === 'projects' }"
            :aria-selected="selectedGlobeVisualization === 'projects'"
            @click="selectedGlobeVisualization = 'projects'"
          >
            <button>Projects</button>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import ImpactGlobe from '../components/impact-globe.vue'

type GlobeVisualization = 'species' | 'countries' | 'projects' | undefined
const selectedGlobeVisualization = ref<GlobeVisualization>('species')
</script>
