<template>
  <ul class="flex flex-col gap-y-2">
    <li
      v-for="item in species"
      :key="'dashboard-highlighted-' + item.slug"
      class="flex flex-row justify-between"
    >
      <div class="flex flex-row gap-x-4">
        <img
          :src="item.photoUrl"
          class="min-h-16 h-16 min-w-16 w-16 object-cover rounded bg-util-gray-02"
        >
        <div
          class="self-center hover:(text-subtle)"
        >
          <p class="italic">
            {{ item.scientificName }}
          </p>
          <p class="text-xs text-subtle">
            {{ item.commonName || 'Unknown' }}
          </p>
        </div>
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

defineProps<{ species: HighlightedSpeciesRow[] }>()

</script>

<style lang="scss">
.species-highlights {
  height: 1rem;
}
</style>
