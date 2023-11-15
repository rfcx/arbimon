<template>
  <ul class="flex flex-col gap-y-2">
    <li
      v-for="item in speciesList"
      :key="item.scientificName"
      class="flex flex-row justify-between items-center rounded gap-x-3 p-4 h-21 bg-util-gray-01"
    >
      <div class="flex flex-row justify-between items-center gap-x-4">
        <img
          v-if="item.photoUrl"
          :src="item.photoUrl"
          class="min-h-14 h-14 min-w-14 w-14 object-cover rounded bg-util-gray-02"
        >
        <div
          v-else
          class="min-h-14 h-14 min-w-14 w-14 object-cover rounded bg-util-gray-02"
        />
        <div class="self-center min-w-40">
          <p class="italic">
            {{ item.scientificName }}
          </p>
          <p class="text-xs text-subtle">
            {{ item.commonName }}
          </p>
        </div>
      </div>
      <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { type HighlightedSpeciesRow } from '../../../types/highlighted-species'

const props = defineProps<{ species: HighlightedSpeciesRow[] | undefined }>()

type specieRow = {
  scientificName: string
  commonName: string
  photoUrl: string | undefined
}

const emptyRow = {
  scientificName: 'Specie',
  commonName: 'Not selected',
  photoUrl: undefined
}

const emptySpecies: specieRow[] = Array(5).fill(emptyRow).map((item, index) => {
  return {
    scientificName: emptyRow.scientificName + ' ' + (index + 1),
    commonName: emptyRow.commonName,
    photoUrl: emptyRow.photoUrl
  }
})

const speciesList = computed(() => {
  if (!props.species || !props.species.length) {
    return emptySpecies
  }
  const species = props.species.map(({ scientificName, commonName, photoUrl }) => {
    return {
      scientificName,
      commonName,
      photoUrl: photoUrl ?? ''
    }
  })
  if (props.species.length < 5) {
    return Array.from({ length: 5 }, (_, idx) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (species[idx]) {
        return species[idx]
      } else return emptyRow
    })
  }
  return species
})

</script>
