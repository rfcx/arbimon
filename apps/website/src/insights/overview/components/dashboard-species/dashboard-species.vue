<template>
  <h1>Threatened species</h1>
  <div class="dashboard-species">
    <div
      v-if="isLoading"
      class="loading-shimmer rounded-xl mt-6 p-4 min-w-32"
    >
      <p class="font-bold text-4xl <sm:text-2xl">
        &nbsp;
      </p>
      <!-- <div
      v-for="n in 4"
      class="loading-shimmer rounded-xl p-4 min-w-32 <sm:min-w-24 grow flex-1"
    >
      <p class="font-bold text-4xl <sm:text-2xl">
        &nbsp;
      </p>
      <p>&nbsp;</p>
    </div> -->
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
        :selected-id="selectedRisk ?? -1"
        class="my-6"
        @emit-select-item="onEmitSelectRiskRating"
      />
    </div>
    <SpeciesList
      :selected-risk="selectedRisk"
      class="mt-6"
    />
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, ref, watch } from 'vue'

import { apiClientBioKey } from '@/globals'
import { RISKS_BY_ID } from '~/risk-ratings'
import { useDashboardStore } from '~/store'
import StackDistribution from './components/stack-distribution.vue'
import { type HorizontalStack } from './components/stack-distribution.vue'
import { useSpeciesRichnessByRisk } from './composables/use-species'
import SpeciesList from './dashboard-species-list.vue'

const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const { isLoading, isError, data } = useSpeciesRichnessByRisk(apiClientBio)

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

const defaultSelectedRisk = computed(() => {
  const risks = richnessByRisk.value.map(({ id }) => id)
  if (risks.length === 0) return null
  return Math.max(...risks)
})

const selectedRisk = ref(defaultSelectedRisk.value)

watch(() => richnessByRisk.value, () => {
  if (selectedRisk.value === null) {
    selectedRisk.value = defaultSelectedRisk.value
  }
})

watch(() => data.value?.totalSpeciesCount, () => {
  if (!data.value) return
  dashboardStore.updateSpeciesCount(`${data.value?.totalSpeciesCount ?? 0}`)
})

const onEmitSelectRiskRating = (id: number) => {
  selectedRisk.value = id
}

</script>
