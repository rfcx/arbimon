<template>
  <!-- eslint-disable vue/no-unused-vars -->
  <!-- eslint-disable vue/require-v-for-key -->
  <div
    v-if="isLoading"
    class="flex gap-4 columns-6"
  >
    <div
      v-for="n in 6"
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
    id="dashboard-species-list"
  >
    <div
      v-if="selectedRiskUI"
      class="flex flex-row gap-x-6 my-6"
    >
      <h3 class="font-medium">
        {{ riskTitle }}
      </h3>
      <span
        class="rounded-sm px-2 py-0.5 self-center"
        :style="{ backgroundColor: selectedRiskUI.color, color: selectedRiskUI.text}"
      >{{ selectedRiskUI?.code }}</span>
    </div>
    <div
      class="grid gap-4 relative grid-cols-1 md:grid-cols-8"
    >
      <router-link
        v-for="item in currentSetOfData"
        :key="item.slug"
        :to="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.project?.slug, speciesSlug: item.slug } }"
      >
        <species-card :item="item" />
      </router-link>
    </div>
    <div
      v-if="shouldShowViewOrHideAllButton"
      class="flex lg:justify-center mt-6"
    >
      <button
        v-if="currentSetOfData.length < species.length"
        class="flex flex-row text-frequency gap-x-2 items-center"
        @click="isViewAll = true"
      >
        View all {{ selectedRiskUI?.label }} species <icon-custom-ic-arrow-view-more />
      </button>
      <button
        v-else
        class="flex flex-row text-frequency gap-x-2 items-center"
        @click="viewLess()"
      >
        View less <icon-custom-ic-arrow-view-more class="transform rotate-180" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, ref, watch } from 'vue'

import { apiClientKey } from '@/globals'
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

const apiClientBio = inject(apiClientKey) as AxiosInstance
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

const selectedRiskUI = computed(() => {
  if (props.selectedRisk === null) { return undefined }
  return RISKS_BY_ID[props.selectedRisk]
})

const riskTitle = computed(() => {
  if (selectedRiskUI.value === undefined) { return '' }
  return `${selectedRiskUI.value.label} (${species.value.length})`
})

// Data for rendering in the UI
const NUMBER_OF_ITEMS_PER_ROW = 8
const isViewAll = ref(false)

const shouldShowViewOrHideAllButton = computed(() => {
  return species.value.length > NUMBER_OF_ITEMS_PER_ROW
})

const currentSetOfData = computed(() => {
  return isViewAll.value ? species.value : species.value.slice(0, NUMBER_OF_ITEMS_PER_ROW)
})

watch(() => props.selectedRisk, () => {
  isViewAll.value = false
})

const viewLess = () => {
  isViewAll.value = false
}

</script>
