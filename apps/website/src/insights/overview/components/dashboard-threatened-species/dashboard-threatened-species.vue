<template>
  <div class="grid lg:grid-cols-4 gap-4">
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

import { type RiskRatingUi } from '~/risk-ratings'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import speciesCard from './components/species-card.vue'

export interface ThreatenedSpeciesRow {
  slug: string
  taxonSlug: string
  scientificName: string
  commonName?: string
  photoUrl: string
  riskRating: RiskRatingUi
}

const store = useStore()

defineProps<{
  species: ThreatenedSpeciesRow[]
}>()

</script>
