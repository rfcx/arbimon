<template>
  <div class="border-1 border-frequency rounded-2xl flex h-80 xl:h-116 flex-col bg-moss">
    <img
      :src="item.photoUrl"
      :alt="item.scientificName"
      class="w-full h-1/2 xl:h-2/3 bg-util-gray-03 rounded-t-2xl object-cover border-b-frequency border-b-1"
    >
    <div class="flex flex-col h-1/2 xl:h-1/3 gap-y-4 p-4 justify-between">
      <div>
        <div class="text-spoonbill font-eyebrow text-sm uppercase">
          {{ item.commonName }}
        </div>
        <div>{{ item.scientificName }}</div>
      </div>
      <a
        href="#"
        class="text-frequency"
      >
        View species >
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ThreatenedSpeciesRow } from '../types'

defineProps<{
  item: ThreatenedSpeciesRow
}>()

</script>
