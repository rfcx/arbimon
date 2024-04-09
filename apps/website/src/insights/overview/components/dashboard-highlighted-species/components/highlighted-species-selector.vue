<template>
  <ul class="flex flex-col gap-y-3">
    <li
      v-for="item in speciesList"
      :key="item.scientificName"
      class="flex flex-row justify-center items-center rounded-lg space-x-3 p-4 bg-util-gray-01 h-23 md:(flex-row) lg:(flex-row justify-between)"
    >
      <SpecieCard
        :slug="item.slug"
        :scientific-name="item.scientificName"
        :common-name="item.commonName"
        :photo-url="item.photoUrl"
        :redirect="false"
        :text-black="true"
      />
      <svg
        v-if="item.slug !== 'not-selected'"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="h-5 w-5 cursor-pointer basis-1/6"
        type="btn"
        @click="removeSpecie(item)"
      >
        <path
          d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"
        />
      </svg>
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
const emit = defineEmits<{(e: 'emitRemoveSpecie', slug: string): void }>()

const speciesList = computed(() => {
  if (!props.species || !props.species.length) {
    return
  }
  const species = props.species.map(({ slug, scientificName, commonName, photoUrl }) => {
    return {
      slug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? ''
    }
  })
  return species
})

const removeSpecie = (specie: SpecieRow): void => {
  emit('emitRemoveSpecie', specie.slug)
}

</script>
