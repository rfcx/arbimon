<template>
  <ul class="flex flex-col gap-y-3">
    <li
      v-for="item in speciesList"
      :key="item.scientificName"
      class="flex flex-col justify-center items-center rounded-lg gap-x-3 p-4 max-w-80 bg-util-gray-01 md:(flex-row h-21) lg:(flex-row h-21 justify-between)"
    >
      <div class="flex flex-col justify-center items-center gap-x-4 md:flex-row lg:(flex-row justify-between)">
        <SpecieCard
          :slug="item.slug"
          :scientific-name="item.scientificName"
          :common-name="item.commonName"
          :photo-url="item.photoUrl"
        />
      </div>
      <icon-custom-fi-close-thin
        v-if="item.slug !== 'not-selected'"
        type="btn"
        class="h-6 w-6 cursor-pointer"
        @click="removeSpecie(item)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { type HighlightedSpeciesRow } from '../../../types/highlighted-species'
import SpecieCard from './species-card.vue'

export type SpecieRow = {
  slug: string
  scientificName: string
  commonName: string | undefined
  photoUrl: string | undefined
}

const props = defineProps<{ species: HighlightedSpeciesRow[] | undefined }>()
const emit = defineEmits<{(e: 'emitRemoveSpecie', specie: SpecieRow): void }>()

const emptyRow = {
  slug: 'not-selected',
  scientificName: 'Species',
  commonName: 'Not selected',
  photoUrl: undefined
}

const emptySpecies: SpecieRow[] = Array(5).fill(emptyRow).map((item, index) => {
  return {
    slug: emptyRow.slug,
    scientificName: `${emptyRow.scientificName} ${index + 1}`,
    commonName: emptyRow.commonName,
    photoUrl: emptyRow.photoUrl
  }
})

const speciesList = computed(() => {
  if (!props.species || !props.species.length) {
    return emptySpecies
  }
  const species = props.species.map(({ slug, scientificName, commonName, photoUrl }) => {
    return {
      slug,
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
      } else return { ...emptyRow, scientificName: `${emptyRow.scientificName} ${idx + 1}` }
    })
  }
  return species
})

const removeSpecie = (specie: SpecieRow): void => {
  emit('emitRemoveSpecie', specie)
}

</script>
