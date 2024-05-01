<template>
  <div class="flex flex-row md:flex-col">
    <div 
      v-if="errorLoadImage"
      class="bg-util-gray-04 rounded object-cover aspect-square min-h-16 h-16 md:(h-30 w-30) mx-auto"
    >
    </div>
    <img
      v-else
      :src="item.photoUrl"
      :alt="item.scientificName"
      @error="errorLoadImage = true"
      class="bg-util-gray-04 rounded object-cover aspect-square min-h-16 h-16 md:(h-30 w-30) mx-auto"
    >
    <div class="flex flex-col gap-y-4 p-4 items-center basis-3/4">
      <div class="italic text-sm text-center">
        {{ item.scientificName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type ThreatenedSpeciesRow } from '../types'

const errorLoadImage = ref(false)

defineProps<{
  item: ThreatenedSpeciesRow
}>()

</script>
