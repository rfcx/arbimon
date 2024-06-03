<template>
  <div>
    <empty-box
      v-if="store.userIsProjectMember && !isViewingAsGuest && (!isLoadingMetrics && ((metrics?.totalRecordings ?? 0) === 0))"
      class="mb-6"
    />
    <dashboard-metrics
      :error="isErrorMetrics"
      :loading="isLoadingMetrics"
      :metrics="metrics"
    />
  </div>
  <div class="grid grid-col-1 lg:grid-cols-12 gap-20 mt-10 lg:mt-20">
    <div class="lg:col-span-8">
      <dashboard-project-summary
        :can-edit="store.userIsAdminProjectMember"
        :is-project-member="store.userIsProjectMember"
        :is-viewing-as-guest="isViewingAsGuest"
      />
    </div>
    <div class="lg:col-span-4 flex flex-col">
      <dashboard-highlighted-species
        :species="species?.speciesHighlighted"
        :can-edit="store.userIsAdminProjectMember"
        :is-project-member="store.userIsProjectMember"
        :is-viewing-as-guest="isViewingAsGuest"
        :is-loading="isLoadingSpecies || isRefetchingSpecies"
        @emit-refetch="refetchSpeciesRichnessByRisk"
      />
      <div class="mt-6">
        <h2 class="mt-6">
          Taxonomic groups
        </h2>
        <h6>Number of species detected in each taxonomic group.</h6>
        <stack-distribution
          v-if="!isErrorStackDistribution"
          :dataset="speciesRichnessByTaxon"
          :known-total-count="totalSpecies"
          class="my-6"
          @error="handleStackDistributionError"
        />
        <div
          v-else
          class="w-full rounded-lg p-4 shadow bg-util-gray-04 border border-util-gray-02 mt-3"
        >
          <p class="text-xs">
            It seems the section didn’t load as expected. Please refresh your browser to give it another go.
          </p>
        </div>
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
import { type ComputedRef, computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiClientKey } from '@/globals'
import { RISKS_BY_ID } from '~/risk-ratings'
import { useDashboardStore, useStore } from '~/store'
import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'
import EmptyBox from '../components/empty-box.vue'
import DashboardHighlightedSpecies from './components/dashboard-highlighted-species/dashboard-highlighted-species.vue'
import DashbordMap from './components/dashboard-map/dashboard-map.vue'
import DashboardMetrics from './components/dashboard-metrics/dashboard-metrics.vue'
import DashboardProjectSummary from './components/dashboard-project-summary/dashboard-project-summary.vue'
import { type HorizontalStack } from './components/dashboard-species/components/stack-distribution.vue'
import StackDistribution from './components/dashboard-species/components/stack-distribution.vue'
import { useSpeciesRichnessByRisk } from './components/dashboard-species/composables/use-species'
import DashboardSpeciesByRisk from './components/dashboard-species/dashboard-species-by-risk.vue'
import { useGetDashboardMetrics } from './composables/use-get-dashboard-metrics'

const apiClientBio = inject(apiClientKey) as AxiosInstance

const route = useRoute()
const store = useStore()
const dashboardStore = useDashboardStore()

// view type
const isViewingAsGuest = computed(() => route.query.guest === '1' || store.userIsExternalGuest)
const selectedProjectId = computed(() => store.project?.id)
const { isLoading: isLoadingMetrics, isError: isErrorMetrics, data: metrics } = useGetDashboardMetrics(apiClientBio, selectedProjectId)
const { isLoading: isLoadingSpecies, isError: isErrorSpecies, refetch: refetchData, data: species, isRefetching: isRefetchingSpecies } = useSpeciesRichnessByRisk(apiClientBio)

const speciesRichnessByTaxon: ComputedRef<HorizontalStack[]> = computed(() => {
  return (species.value?.richnessByTaxon ?? []).map(([taxonId, count]) => {
    const taxonClass = TAXON_CLASSES_BY_ID[taxonId]
    return {
      id: taxonId,
      name: taxonClass.label,
      color: taxonClass.color,
      text: taxonClass.text,
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
      text: taxonClass.text,
      count
    }
  })
})

const totalSpecies = computed(() => {
  return dashboardStore.speciesCount ?? `${species?.value?.totalSpeciesCount}` ?? '0'
})

const refetchSpeciesRichnessByRisk = async (): Promise<void> => {
  await refetchData()
}

watch(() => species.value?.totalSpeciesCount, () => {
  if (!species.value) return
  dashboardStore.updateSpeciesCount(`${species.value?.totalSpeciesCount ?? 0}`)
})

const isErrorStackDistribution = ref(false)
const handleStackDistributionError = () => {
  isErrorStackDistribution.value = true
}
</script>
