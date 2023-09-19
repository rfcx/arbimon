<template>
  <div v-if="isLoading">
    loading
  </div>
  <div v-else-if="isError">
    something went wrong
  </div>
  <div
    v-else-if="data"
    class="grid lg:grid-cols-4 gap-4"
  >
    <div
      v-for="item in species"
      :key="item.slug"
    >
      <router-link :to="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug, speciesSlug: item.slug } }">
        <species-card :item="item" />
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject } from 'vue'

import { apiClientBioKey } from '@/globals'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { type ThreatenedSpeciesRow } from '../dashboard-species/types'
import speciesCard from './components/species-card.vue'
import { useSpeciesByRisk } from './composables/use-species'

const store = useStore()

const props = defineProps<{
  selectedRisk: number
}>()

const params = computed(() => {
  return props.selectedRisk
})

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const { isLoading, isError, data } = useSpeciesByRisk(apiClientBio, params)

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

</script>
