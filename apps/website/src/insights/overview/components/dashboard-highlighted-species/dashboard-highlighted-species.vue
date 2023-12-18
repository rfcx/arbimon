<template>
  <div class="flex flex-col gap-y-6">
    <div>
      <h2>Highlighted species</h2>
      <h6 class="mt-3">
        Focal species of this project.
      </h6>
    </div>
    <div
      v-if="!canEdit && !speciesList.length && !isLoading"
      class="w-full rounded-lg p-6 shadow bg-util-gray-03"
    >
      <h6>The project owner has not selected highlighted species for this project.</h6>
    </div>
    <div
      v-if="isLoading"
      class="flex justify-center"
    >
      <icon-fas-spinner class="animate-spin w-8 h-8 lg:mx-24" />
    </div>
    <HighlightedSpeciesList
      v-if="speciesList && speciesList.length > 0 && !isLoading"
      :species="speciesList"
    />
    <EmptySpeciesList
      v-if="canEdit && !speciesList.length && !isLoading"
    />
    <GuestBanner v-if="projectUserPermissionsStore.isGuest" />
    <div
      v-if="canEdit && !projectUserPermissionsStore.isGuest"
      class="flex flex-row baseline"
    >
      <button
        class="btn btn-secondary group w-full"
        data-modal-target="species-highlighted-modal"
        data-modal-toggle="species-highlighted-modal"
        type="button"
        @click="openModalToSelectSpecies"
      >
        Select Species <icon-custom-ic-edit class="ml-2 group-hover:!disabled:stroke-pitch disabled:hover:btn-disabled" />
      </button>
    </div>
    <HighlightedSpeciesModal
      :highlighted-species="speciesList"
      @emit-close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'flowbite'
import { type ComputedRef, type Ref, computed, onMounted, ref } from 'vue'

import { type DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'

import GuestBanner from '@/_layout/components/guest-banner/guest-banner.vue'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { useProjectUserPermissionsStore } from '~/store'
import { type HighlightedSpeciesRow } from '../../types/highlighted-species'
import EmptySpeciesList from './components/empty-species-list.vue'
import HighlightedSpeciesList from './components/highlighted-species-list.vue'
import HighlightedSpeciesModal from './components/highlighted-species-modal.vue'

const props = defineProps<{ species: DashboardSpecies[] | undefined, canEdit: boolean, isLoading: boolean }>()
const emit = defineEmits<{(e: 'emitRefetch'): void }>()
const modal = ref() as Ref<Modal>
const projectUserPermissionsStore = useProjectUserPermissionsStore()

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
  modal.value = new Modal(document.getElementById('species-highlighted-modal'), {
    placement: 'center',
    backdrop: 'dynamic',
    backdropClasses: 'bg-pitch bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: true
  })
})

const openModalToSelectSpecies = (): void => {
  modal.value.show()
}

const closeModal = (): void => {
  modal.value.hide()
  emit('emitRefetch')
}
</script>
