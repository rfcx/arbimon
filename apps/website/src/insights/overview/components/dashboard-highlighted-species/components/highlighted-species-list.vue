<template>
  <ul class="flex flex-col gap-y-2">
    <li
      v-for="item in species"
      :key="'dashboard-highlighted-' + item.slug"
      class="flex flex-row justify-between"
    >
      <div class="flex flex-row items-center gap-x-2 h-21 basis-3/4">
        <SpecieCard
          :slug="item.slug"
          :scientific-name="item.scientificName"
          :common-name="item.commonName"
          :photo-url="item.photoUrl"
          :redirect="true"
        />
      </div>
      <div class="flex items-center">
        <el-tag
          class="species-highlights border-none text-md h-6"
          effect="dark"
          size="large"
          :color="item.riskRating.color"
          :title="item.riskRating.label"
        >
          {{ item.riskRating.code }}
        </el-tag>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { type HighlightedSpeciesRow } from '../../../types/highlighted-species'
import SpecieCard from './species-card.vue'

defineProps<{ species: HighlightedSpeciesRow[] }>()

</script>

<style lang="scss">
.species-highlights {
  height: 1rem;
}
</style>
