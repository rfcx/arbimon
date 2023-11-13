<template>
  <h2>Highlighted species</h2>
  <h6 class="mt-3">
    Focal species of this project.
  </h6>
  <div
    v-if="speciesList && speciesList.length > 0"
    class="mt-6"
  >
    <HightlightedSpeciesList
      :species="speciesList"
    />
  </div>
  <div
    v-else
    class="mt-6"
  >
    <EmptySpeciesList />
  </div>
  <div
    v-if="isProjectMember"
    class="mt-4"
  >
    <router-link
      :to="{ name: ROUTE_NAMES.myProjects }"
      class="flex flex-row baseline"
    >
      <button class="btn btn-secondary group w-full">
        Select Species <icon-custom-ic-edit class="ml-2 group-hover:stroke-pitch" />
      </button>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { type ComputedRef, computed } from 'vue'

import { type DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'

import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { type HighlightedSpeciesRow } from '../../types/highlighted-species'
import EmptySpeciesList from './components/empty-species-list.vue'
import HightlightedSpeciesList from './components/highlighted-species-list.vue'

const store = useStore()

const props = defineProps<{ species: DashboardSpecies[] | undefined }>()
const isProjectMember = computed(() => store.selectedProject?.isMyProject ?? false)
const speciesList: ComputedRef<HighlightedSpeciesRow[]> = computed(() => {
  if (props.species === undefined) {
    return []
  }

  return props.species.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => {
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
