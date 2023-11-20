<template>
  <ul class="flex flex-col gap-y-2">
    <li
      v-for="item in speciesList"
      :key="item.scientificName"
      class="flex flex-row justify-between items-center rounded-lg gap-x-3 p-4 h-21 max-w-80 bg-util-gray-01"
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
        <div class="self-center">
          <p
            class="italic overflow-hidden tracking-tight line-clamp-2 inline-block"
            :title="item.scientificName"
          >
            {{ item.scientificName }}
          </p>
          <p
            class="text-xs text-subtle tracking-tight overflow-hidden line-clamp-2 inline-block"
            :title="item.commonName"
          >
            {{ item.commonName }}
          </p>
        </div>
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
  scientificName: 'Specie',
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
