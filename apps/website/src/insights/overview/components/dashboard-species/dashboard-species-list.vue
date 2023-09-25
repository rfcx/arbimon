<template>
  <!-- eslint-disable vue/no-unused-vars -->
  <!-- eslint-disable vue/require-v-for-key -->
  <div
    v-if="isLoading || !species || selectedRisk === null"
    class="flex gap-4 columns-2 md:columns-4"
  >
    <div
      v-for="n in 4"
      class="loading-shimmer rounded-xl p-4 min-w-32 <sm:min-w-24 grow flex-1"
    >
      <p class="font-bold text-4xl <sm:text-2xl">
        &nbsp;
      </p>
      <p>&nbsp;</p>
    </div>
  </div>
  <div v-else-if="isError">
    something went wrong!
  </div>
  <div
    v-else-if="data"
    @mouseover="isHoveringOnList = true"
    @mouseleave="isHoveringOnList = false"
  >
    <div
      class="grid gap-4 relative"
      :class="`lg:grid-cols-${NUMBER_OF_ITEMS_PER_PAGE}`"
    >
      <div
        v-for="item in currentSetOfData"
        :key="item.slug"
      >
        <router-link :to="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug, speciesSlug: item.slug } }">
          <species-card :item="item" />
        </router-link>
      </div>
      <!-- Page controls -->
      <button
        v-show="numberOfpages > 1 && isHoveringOnList"
        class="absolute inset-y-0 left-2 flex items-center justify-center"
      >
        <span
          class="inline-flex items-center w-10 h-10 bg-cloud text-pitch rounded-full"
          @click="currentPageIndex = (currentPageIndex !== 0) ? currentPageIndex - 1 : numberOfpages - 1"
        >
          <svg
            aria-hidden="true"
            class="w-10 h-6 text-pitch items-center dark:text-pitch"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          /></svg>
          <span class="sr-only">Previous</span>
        </span>
      </button>
      <button
        v-show="numberOfpages > 1 && isHoveringOnList"
        class="absolute inset-y-0 right-2 flex items-center justify-center"
      >
        <span
          class="inline-flex items-center bg-cloud text-pitch rounded-full w-10 h-10"
          @click="currentPageIndex = (currentPageIndex + 1 !== numberOfpages) ? currentPageIndex + 1 : 0"
        >
          <svg
            aria-hidden="true"
            class="w-10 h-6 text-pitch items-center dark:text-pitch"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          /></svg>
          <span class="sr-only">Next</span>
        </span>
      </button>
    </div>
    <!-- Page indicators -->
    <div class="flex space-x-3 p-10 m-auto justify-center">
      <button
        v-for="index in numberOfpages"
        :key="index"
        type="button"
        class="w-2 h-2 rounded-full border-insight border-1"
        :aria-label="'Page ' + (index) + ' of ' + numberOfpages"
        :data-carousel-slide-to="index"
        :class="{ 'bg-insight': currentPageIndex + 1 === index }"
        @click="currentPageIndex = index - 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, ref } from 'vue'

import { apiClientBioKey } from '@/globals'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { type ThreatenedSpeciesRow } from '../dashboard-species/types'
import speciesCard from './components/species-card.vue'
import { useSpeciesByRisk } from './composables/use-species'

const store = useStore()

const props = defineProps<{
  selectedRisk: number | null
}>()

const params = computed(() => {
  return props.selectedRisk
})

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const { isLoading, isError, data } = useSpeciesByRisk(apiClientBio, params)

// raw data
const species: ComputedRef<ThreatenedSpeciesRow[]> = computed(() => {
  if (data.value == null) {
    return []
  }

  return data.value.species.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => {
    return {
      slug,
      taxonSlug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? '',
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
    }
  })
})

// Data for rendering in the UI
const NUMBER_OF_ITEMS_PER_PAGE = 4
const numberOfpages = computed(() => {
  return Math.ceil(species.value.length / NUMBER_OF_ITEMS_PER_PAGE)
})

const currentPageIndex = ref(0)
const currentSetOfData = computed(() => {
  const startIndex = (currentPageIndex.value) * NUMBER_OF_ITEMS_PER_PAGE
  const endIndex = startIndex + NUMBER_OF_ITEMS_PER_PAGE
  return species.value.slice(startIndex, endIndex)
})

const isHoveringOnList = ref(false)

</script>
