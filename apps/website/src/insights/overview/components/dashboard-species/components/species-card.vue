<template>
  <div class="flex flex-col">
    <img
      :src="item.photoUrl"
      :alt="item.scientificName"
      class="w-full bg-util-gray-03 rounded-sm object-cover aspect-square"
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
