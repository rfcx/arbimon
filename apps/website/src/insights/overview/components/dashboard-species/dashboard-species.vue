<template>
  <h1>Threatened species</h1>
  <div class="dashboard-species">
    <div v-if="isLoading">
      loading
    </div>
    <div v-else-if="isError">
      something went wrong
    </div>
    <div
      v-else-if="data"
      class="threatened-species"
    >
      <StackDistribution
        :dataset="richnessByRisk"
        :known-total-count="dashboardStore.speciesCount"
        class="mt-6"
      />
      <DashboardThreatenedSpecies
        :species="speciesThreatened"
        class="mt-6"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject } from 'vue'

import { apiClientBioKey } from '@/globals'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { useDashboardStore } from '~/store'
import DashboardThreatenedSpecies from '../dashboard-threatened-species/dashboard-threatened-species.vue'
import StackDistribution from './components/stack-distribution.vue'
import { type HorizontalStack } from './components/stack-distribution.vue'
import { useSpecies } from './composables/use-species'
import type { ThreatenedSpeciesRow } from './types'

const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const { isLoading, isError, data } = useSpecies(apiClientBio)
dashboardStore.updateSpeciesThreatenedCount(data.value?.speciesThreatened.length ?? 0)

const richnessByRisk: ComputedRef<HorizontalStack[]> = computed(() => {
  return (data.value?.richnessByRisk ?? []).map(([taxonId, count]) => {
    const taxonClass = RISKS_BY_ID[taxonId]
    return {
      name: taxonClass.label,
      color: taxonClass.color,
      count
    }
  })
})

const speciesThreatened: ComputedRef<ThreatenedSpeciesRow[]> = computed(() => {
  if (data.value == null) {
    return []
  }

  return data.value.speciesThreatened.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => {
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
