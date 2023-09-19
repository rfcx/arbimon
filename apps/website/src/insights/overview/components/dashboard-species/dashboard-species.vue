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
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, watch } from 'vue'

import { apiClientBioKey } from '@/globals'
import { RISKS_BY_ID } from '~/risk-ratings'
import { useDashboardStore } from '~/store'
import StackDistribution from './components/stack-distribution.vue'
import { type HorizontalStack } from './components/stack-distribution.vue'
import { useSpeciesRichnessByRisk } from './composables/use-species'

const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const { isLoading, isError, data } = useSpeciesRichnessByRisk(apiClientBio)

// const defaultSelectedRisk = computed(() => {
//   const risks = richnessByRisk.value.map(({ id }) => id)
//   return Math.max(...risks)
// })

watch(() => data.value?.totalSpeciesCount, () => {
  if (!data.value) return
  dashboardStore.updateSpeciesCount(`${data.value?.totalSpeciesCount ?? 0}`)
})

const richnessByRisk: ComputedRef<HorizontalStack[]> = computed(() => {
  return (data.value?.richnessByRisk ?? []).map(([taxonId, count]) => {
    const taxonClass = RISKS_BY_ID[taxonId]
    return {
      id: taxonId,
      name: taxonClass.label,
      color: taxonClass.color,
      count
    }
  })
})

</script>
