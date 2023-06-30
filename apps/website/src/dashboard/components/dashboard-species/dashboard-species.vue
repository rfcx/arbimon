<template>
  <div class="dashboard-species">
    <div class="dashboard-richness">
      <dashboard-sidebar-title
        title="Species highlights"
      />
      <StackDistribution
        :dataset="richnessByTaxon"
        :known-total-count="dashboardStore.speciesCount"
        class="mt-4"
      />
      <dashboard-highlighted-species
        :species="speciesHighlighted"
        class="mt-5"
      />
    </div>
    <div class="threatened-species">
      <dashboard-sidebar-title
        title="Threatened species"
        :route="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug } }"
        class="mt-5 sm:mt-0 lg:mt-5"
      />
      <StackDistribution
        :dataset="richnessByRisk"
        :known-total-count="dashboardStore.speciesCount"
        class="mt-4"
      />
      <dashboard-threatened-species
        :species="speciesThreatened"
        class="mt-5"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { apiBioGetDashboardSpeciesDataRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'

import { apiClientBioKey, routeNamesKey, storeKey } from '@/globals'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import type { RouteNames } from '~/router'
import { type BiodiversityStore } from '~/store'
import { useDashboardStore } from '~/store/use-dashboard-store'
import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'
import type { HighlightedSpeciesRow } from '../dashboard-highlighted-species/dashboard-highlighted-species'
import DashboardHighlightedSpecies from '../dashboard-highlighted-species/dashboard-highlighted-species.vue'
import DashboardSidebarTitle from '../dashboard-sidebar-title/dashboard-sidebar-title.vue'
import type { ThreatenedSpeciesRow } from '../dashboard-threatened-species/dashboard-threatened-species'
import dashboardThreatenedSpecies from '../dashboard-threatened-species/dashboard-threatened-species.vue'
import StackDistribution from './stack-distribution.vue'
import type { HorizontalStack } from './types'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = inject(storeKey) as BiodiversityStore
const dashboardStore = useDashboardStore()
const ROUTE_NAMES = inject(routeNamesKey) as RouteNames
const route = useRoute()

const data = ref(await apiBioGetDashboardSpeciesDataRoute(apiClientBio, store?.selectedProject?.id ?? -1))
dashboardStore.updateSpeciesThreatenedCount(data.value?.speciesThreatened.length ?? 0)

watch(() => route.params.projectSlug, async (newRoute, oldRoute) => {
  if (newRoute !== oldRoute) {
    data.value = await apiBioGetDashboardSpeciesDataRoute(apiClientBio, store?.selectedProject?.id ?? -1)
    dashboardStore.updateSpeciesThreatenedCount(data.value?.speciesThreatened.length ?? 0)
  }
})

// TODO: @charles-allen Different default photos per taxon
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getDefaultPhoto = (_taxonSlug: string): string =>
  new URL('../../../_assets/default-species-image.jpg', import.meta.url).toString()

const richnessByTaxon: ComputedRef<HorizontalStack[]> = computed(() => {
  return (data.value?.richnessByTaxon ?? []).map(([taxonId, count]) => {
    const name = store.projectFilters?.taxonClasses.find(tc => tc.id === taxonId)?.commonName ?? '-'
    const color = TAXON_CLASSES_BY_ID[taxonId].color
    return { name, color, count }
  })
})

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

const speciesHighlighted: ComputedRef<HighlightedSpeciesRow[]> = computed(() => {
  if (data.value == null) {
    return []
  }

  return data.value.speciesHighlighted.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => {
    return {
      slug,
      taxonSlug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? getDefaultPhoto(taxonSlug),
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
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
      photoUrl: photoUrl ?? getDefaultPhoto(taxonSlug),
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
    }
  })
})
</script>
