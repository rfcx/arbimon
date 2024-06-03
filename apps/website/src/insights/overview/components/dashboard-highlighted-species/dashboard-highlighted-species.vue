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
      class="w-full rounded-lg p-4 shadow bg-util-gray-04 border border-util-gray-02"
    >
      <span>No content</span>
    </div>
    <div v-if="isLoading">
      <li
        v-for="n in 2"
        :key="n"
        class="flex flex-row justify-between"
      >
        <div class="flex flex-row items-center gap-x-2 h-21 basis-11/12">
          <div class="h-14 w-14 aspect-square object-cover rounded bg-util-gray-03 loading-shimmer" />
          <div class="md:overflow-hidden basis-3/4">
            <div class="bg-util-gray-03 loading-shimmer h-4" />
            <div class="bg-util-gray-03 loading-shimmer h-3 mt-2" />
          </div>
        </div>
      </li>
    </div>
    <HighlightedSpeciesList
      v-if="speciesList && speciesList.length > 0 && !isLoading"
      :species="speciesList"
    />
    <div
      v-else-if="props.species === undefined && !isLoading"
      class="w-full rounded-lg p-4 shadow bg-util-gray-04 border border-util-gray-02"
    >
      <span>It seems the section didn’t load as expected. Please refresh your browser to give it another go.</span>
    </div>
    <EmptySpeciesList
      v-if="canEdit && !speciesList.length && !isLoading"
    />
    <div
      v-if="isProjectMember && !isViewingAsGuest"
      class="flex flex-row baseline"
    >
      <button
        v-if="store.userIsAdminProjectMember"
        class="btn btn-secondary group w-full disabled:hover:btn-disabled disabled:btn-disabled"
        data-modal-target="species-highlighted-modal"
        data-modal-toggle="species-highlighted-modal"
        :data-tooltip-target="!canEdit ? 'selectSpeciesTooltipId' : null"
        data-tooltip-placement="bottom"
        type="button"
        :disabled="!canEdit"
        @click="openModalToSelectSpecies"
      >
        Select Species <icon-custom-ic-edit class="ml-2 group-hover:!disabled:stroke-pitch disabled:hover:btn-disabled" />
      </button>
      <div
        v-if="!canEdit"
        id="selectSpeciesTooltipId"
        role="tooltip"
        class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ disableText }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </div>
    <HighlightedSpeciesModal
      :highlighted-species="speciesList"
      :toggle-show-modal="toggleShowModal"
      @emit-close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'flowbite'
import { type ComputedRef, type Ref, computed, onMounted, ref } from 'vue'

import { type DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'

import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { useStore } from '~/store'
import { type HighlightedSpeciesRow } from '../../types/highlighted-species'
import EmptySpeciesList from './components/empty-species-list.vue'
import HighlightedSpeciesList from './components/highlighted-species-list.vue'
import HighlightedSpeciesModal from './components/highlighted-species-modal.vue'

const props = defineProps<{ species: DashboardSpecies[] | undefined, canEdit: boolean, isProjectMember: boolean, isViewingAsGuest: boolean, isLoading: boolean }>()
const emit = defineEmits<{(e: 'emitRefetch'): void }>()
const modal = ref() as Ref<Modal>
const toggleShowModal = ref(false)
const disableText = ref('Contact your project administrator for permission to select species')
const store = useStore()

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
  toggleShowModal.value = !toggleShowModal.value
}

const closeModal = (): void => {
  modal.value.hide()
  emit('emitRefetch')
}
</script>
