<template>
  <div class="border-1 border-frequency rounded-2xl flex h-60 lg:(h-100 flex-col) bg-moss">
    <img
      :src="item.photoUrl"
      :alt="item.scientificName"
      class="bg-moss w-1/2 lg:(w-full h-60 rounded-t-2xl rounded-bl-none) rounded-l-2xl rounded-tr-none object-cover object-top"
    >
    <div class="flex flex-col h-full gap-y-4 p-4 justify-between">
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
import { type ThreatenedSpeciesRow } from '../../dashboard-threatened-species/dashboard-threatened-species'

defineProps<{
  item: ThreatenedSpeciesRow
}>()

</script>
