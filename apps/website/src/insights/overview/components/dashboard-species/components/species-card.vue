<template>
  <div class="flex flex-row md:flex-col">
    <img
      :src="item.photoUrl"
      :alt="item.scientificName"
      class="bg-util-gray-03 rounded object-cover aspect-square min-h-16 h-16 md:h-full"
    >
    <div class="flex flex-col gap-y-4 p-4 items-center">
      <div class="italic text-sm text-center">
        {{ item.scientificName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ThreatenedSpeciesRow } from '../types'

defineProps<{
  item: ThreatenedSpeciesRow
}>()

</script>
