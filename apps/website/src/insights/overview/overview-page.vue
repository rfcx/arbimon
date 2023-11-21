<template>
  <div>
    <dashboard-metrics
      :error="isErrorMetrics"
      :loading="isLoadingMetrics"
      :metrics="metrics"
    />
  </div>
  <div class="grid grid-col-1 lg:grid-cols-12 gap-20 mt-10 lg:mt-20">
    <div class="lg:col-span-8">
      <dashboard-project-summary
        :can-edit="isProjectMember && !isViewingAsGuest"
        :is-project-member="isProjectMember"
        :is-viewing-as-guest="isViewingAsGuest"
      />
    </div>
    <div class="lg:col-span-4 flex flex-col">
      <dashboard-highlighted-species
        :species="species?.speciesHighlighted"
        :can-edit="isProjectMember && !isViewingAsGuest"
        :is-loading="isLoadingSpecies"
        @emit-refetch="refetchSpeciesRichnessByRisk"
      />
      <div class="mt-6">
        <dashboard-species-by-taxon
          :dataset="speciesRichnessByTaxon"
          :known-total-count="totalSpecies"
        />
      </div>
    </div>
  </div>
  <div class="mt-10 lg:mt-20">
    <dashboard-species-by-risk
      :is-loading="isLoadingSpecies"
      :is-error="isErrorSpecies"
      :richness-by-risk="speciesRichnessByRisk"
      :known-total-count="totalSpecies"
    />
  </div>
  <dashbord-map />
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiClientBioKey } from '@/globals'
import { RISKS_BY_ID } from '~/risk-ratings'
import { useDashboardStore, useStore } from '~/store'
import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'
import DashboardHighlightedSpecies from './components/dashboard-highlighted-species/dashboard-highlighted-species.vue'
import DashbordMap from './components/dashboard-map/dashboard-map.vue'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectSummary from './components/dashboard-project-summary/dashboard-project-summary.vue'
import { type HorizontalStack } from './components/dashboard-species/components/stack-distribution.vue'
import { useSpeciesRichnessByRisk } from './components/dashboard-species/composables/use-species'
import DashboardSpeciesByRisk from './components/dashboard-species/dashboard-species-by-risk.vue'
import DashboardSpeciesByTaxon from './components/dashboard-species/dashboard-species-by-taxon.vue'
import { useGetDashboardMetrics } from './composables/use-get-dashboard-metrics'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const route = useRoute()
const store = useStore()
const dashboardStore = useDashboardStore()

// view type
const isProjectMember = computed(() => store.selectedProject?.isMyProject ?? false)
const isViewingAsGuest = computed(() => {
  return route.query.guest === '1'
})
const selectedProjectId = computed(() => store.selectedProject?.id)
const { isLoading: isLoadingMetrics, isError: isErrorMetrics, data: metrics } = useGetDashboardMetrics(apiClientBio, selectedProjectId)
const { isLoading: isLoadingSpecies, isError: isErrorSpecies, refetch: refetchData, data: species } = useSpeciesRichnessByRisk(apiClientBio)

const speciesRichnessByTaxon: ComputedRef<HorizontalStack[]> = computed(() => {
  return (species.value?.richnessByTaxon ?? []).map(([taxonId, count]) => {
    const taxonClass = TAXON_CLASSES_BY_ID[taxonId]
    return {
      id: taxonId,
      name: taxonClass.label,
      color: taxonClass.color,
      count
    }
  })
})

const speciesRichnessByRisk: ComputedRef<HorizontalStack[]> = computed(() => {
  return (species.value?.richnessByRisk ?? []).map(([taxonId, count]) => {
    const taxonClass = RISKS_BY_ID[taxonId]
    return {
      id: taxonId,
      name: taxonClass.label,
      color: taxonClass.color,
      count
    }
  })
})

const totalSpecies = computed(() => {
  return dashboardStore.speciesCount ?? `${species?.value?.totalSpeciesCount}` ?? '0'
})

const refetchSpeciesRichnessByRisk = () => {
  refetchData.value()
}

watch(() => species.value?.totalSpeciesCount, () => {
  if (!species.value) return
  dashboardStore.updateSpeciesCount(`${species.value?.totalSpeciesCount ?? 0}`)
})

</script>
