<template>
  <h2>Highlighted species</h2>
  <h6 class="mt-3">
    Focal species of this project.
  </h6>
  <div
    v-if="speciesList && speciesList.length > 0"
    class="mt-6"
  >
    <HightlightedSpeciesList
      :species="speciesList"
    />
  </div>
  <div
    v-else
    class="mt-6"
  >
    <EmptySpeciesList />
  </div>
  <div
    v-if="canEdit"
    class="mt-6 flex flex-row baseline"
  >
    <button
      class="btn btn-secondary group w-full"
      data-modal-target="species-hightlighted-modal"
      data-modal-toggle="species-hightlighted-modal"
      type="button"
      @click="openModalToSelectSpecies"
    >
      Select Species <icon-custom-ic-edit class="ml-2 group-hover:stroke-pitch" />
    </button>
  </div>
  <HighlightedSpeciesSelector />
</template>

<script setup lang="ts">
import { Modal } from 'flowbite'
import { type ComputedRef, type Ref, computed, onMounted, ref } from 'vue'

import { type DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'

import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { type HighlightedSpeciesRow } from '../../types/highlighted-species'
import EmptySpeciesList from './components/empty-species-list.vue'
import HightlightedSpeciesList from './components/highlighted-species-list.vue'
import HighlightedSpeciesSelector from './components/highlighted-species-selector.vue'

const props = defineProps<{ species: DashboardSpecies[] | undefined, canEdit: boolean }>()
const modal = ref() as Ref<Modal>

const speciesList: ComputedRef<HighlightedSpeciesRow[]> = computed(() => {
  if (props.species === undefined) {
    return []
  }

  return props.species.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => {
    return {
      slug,
      taxonSlug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? '',
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
    }
  })
})

onMounted(() => {
  modal.value = new Modal(document.getElementById('species-hightlighted-modal'), {
    placement: 'center',
    backdrop: 'dynamic',
    backdropClasses: 'bg-pitch bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
})

const openModalToSelectSpecies = (): void => {
  modal.value.show()
}
</script>
