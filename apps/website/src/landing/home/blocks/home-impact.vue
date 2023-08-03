<template>
  <section
    class="relative min-h-168 md:h-212 bg-white dark:bg-pitch"
  >
    <client-only>
      <impact-globe
        :selected-visualization="selectedGlobeVisualization"
        class="absolute w-full lg:w-9/12 inset-y-0 left-0"
      />
    </client-only>
    <div class="absolute w-full right-auto bottom-0 lg:w-3/12 lg:inset-y-0 lg:right-0 py-8 sm:py-24 px-4 lg:mr-12 xl:mr-48 2xl:mr-75 lg:px-6 xl:px-12 2xl:px-24 pointer-events-none">
      <div class="text-left">
        <h1 class="mb-4 text-pitch dark:text-insight">
          Arbimon’s Impact at-a-Glance
        </h1>
        <p class="text-pitch dark:text-insight">
          With more than 110 million minutes of acoustic recordings uploaded, Arbimon has made it possible to uncover critical insights into the behavior and conservation of some of the world’s most endangered species, paving the way to transformative action and a better understanding of our planet.
        </p>

        <div class="flex flex-col mt-20">
          <h4 class="font-bold text-xs mb-1">
            Species identified
          </h4>
          <div>
            <span
              class="rounded inline-block h-2 w-2 mr-1"
              style="background-color: rgb(240, 30, 61)"
            />
            <span>100+</span>
          </div>
          <div>
            <span
              class="rounded inline-block h-2 w-2 mr-1"
              style="background-color: rgb(255, 104, 104)"
            />
            <span>10+</span>
          </div>
          <div>
            <span
              class="rounded inline-block h-2 w-2 mr-1"
              style="background-color: rgb(255, 175, 175)"
            />
            <span>1+</span>
          </div>
        </div>

        <!-- TODO: This component is commented since it's an unfinished feature. So the species-legend component is moving here for now instead. -->
        <!-- <ol -->
        <!--   v-show="false" -->
        <!--   role="tab" -->
        <!--   class="inline-flex mt-20 pointer-events-auto" -->
        <!-- > -->
        <!--   <li -->
        <!--     class="inline-block p-2.5 border-b-2 text-sm hover:text-frequency hover:border-frequency" -->
        <!--     :class="{ 'text-frequency border-frequency border-b-2': selectedGlobeVisualization === 'species' }" -->
        <!--     :aria-selected="selectedGlobeVisualization === 'species'" -->
        <!--     @click="selectedGlobeVisualization = 'species'" -->
        <!--   > -->
        <!--     <button>Species</button> -->
        <!--   </li> -->
        <!--   <li -->
        <!--     class="inline-block p-2.5 border-b-2 text-sm hover:text-frequency hover:border-frequency" -->
        <!--     :class="{ 'text-frequency border-frequency border-b-2': selectedGlobeVisualization === 'countries' }" -->
        <!--     :aria-selected="selectedGlobeVisualization === 'countries'" -->
        <!--     @click="selectedGlobeVisualization = 'countries'" -->
        <!--   > -->
        <!--     <button>Countries</button> -->
        <!--   </li> -->
        <!--   <li -->
        <!--     class="inline-block p-2.5 border-b-2 text-sm hover:text-frequency hover:border-frequency" -->
        <!--     :class="{ 'text-frequency border-frequency border-b-2': selectedGlobeVisualization === 'projects' }" -->
        <!--     :aria-selected="selectedGlobeVisualization === 'projects'" -->
        <!--     @click="selectedGlobeVisualization = 'projects'" -->
        <!--   > -->
        <!--     <button>Projects</button> -->
        <!--   </li> -->
        <!-- </ol> -->
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
