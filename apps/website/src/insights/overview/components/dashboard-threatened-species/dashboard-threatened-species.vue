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

import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { type ThreatenedSpeciesRow } from '../types'
import speciesCard from './components/species-card.vue'

const store = useStore()

defineProps<{
  species: ThreatenedSpeciesRow[]
}>()

</script>
