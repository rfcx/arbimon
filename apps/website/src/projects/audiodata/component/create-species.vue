<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
  >
    <div class="bg-moss text-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
      <button
        class="absolute right-4"
        type="button"
        data-modal-toggle="project-delete-modal"
        title="Cancel"
        @click="close"
      >
        <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
      </button>
      <h2 class="text-2xl font-bold mb-4">
        Species Library
      </h2>

      <div class="flex mt-5 px-9">
        <div class="input-item search form-element">
          <icon-fa-search class="h-3 w-3 mt-3 fa-search text-insight" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Search species by scientific name or family"
            class="form-control placeholder-style rounded px-3 py-2 h-[34px] w-[470px] items-center inline-flex rounded border-1 border-util-gray-03 bg-echo"
            @input="onSearchInput"
          >
        </div>
      </div>
      <div class="flex gap-4 mt-5">
        <SortableTable
          :columns="columns"
          :rows="speciesData ?? []"
          class="flex-1 max-h-[300px] overflow-y-auto"
          @selected-item="onSelectedSpecies"
        />

        <SortableTable
          :columns="[{ label: 'Sound', key: 'name', maxWidth: 120 }]"
          :rows="songtypesSpecies ?? []"
          class="w-[200px] max-h-[300px] overflow-y-auto"
          @selected-item="onSelectSongtypes"
        />
      </div>
      <div class="flex flex-row justify-center items-center mt-8 gap-x-4">
        <button
          class="px-4 py-2 btn btn-secondary btn-medium w-full"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 btn btn-medium w-full btn-primary disabled:hover:btn-disabled disabled:btn-disabled"
          :disabled="isDisabled"
          @click="speciesSelect"
        >
          Select
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { type SongtypeResponse, type SpeciesSearchResponse, type SpeciesSongtypeRequest } from '@rfcx-bio/common/api-arbimon/audiodata/species'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useSearchSpecies, useSongtypesSpecies } from '../api/use-species'
import SortableTable from './sortable-table.vue'

const isOpen = ref(false)

const emit = defineEmits<{(e: 'speciesSelect', species: SpeciesSongtypeRequest): void}>()

const searchKeyword = ref('')
const searchTimeout = ref<number | undefined>(undefined)

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const { data: speciesData, refetch: refetchSearchSpecies } = useSearchSpecies(apiClientArbimon, computed(() => searchKeyword.value))
const { data: songtypesSpecies } = useSongtypesSpecies(apiClientArbimon)

const columns = [
  { label: 'Species', key: 'scientific_name', maxWidth: 90 },
  { label: 'Family', key: 'family', maxWidth: 70 },
  { label: 'Taxon', key: 'taxon', maxWidth: 70 }
]

function open () {
  isOpen.value = true
}

function close () {
  isOpen.value = false
}

const selectedSpecies = ref<SpeciesSearchResponse | undefined>(undefined)
const selectedSongtype = ref<SongtypeResponse | undefined>(undefined)

const onSelectedSpecies = (row?: Record<string, any>) => {
    selectedSpecies.value = row as SpeciesSearchResponse
}
const onSelectSongtypes = (row?: Record<string, any>) => {
    selectedSongtype.value = row as SongtypeResponse
}
const speciesSelect = () => {
  if (!selectedSpecies.value && !selectedSongtype.value) return
  emit('speciesSelect', { species: selectedSpecies.value?.scientific_name ?? '', songtype: selectedSongtype.value?.name ?? '' })
  close()
}

const onSearchInput = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = window.setTimeout(() => {
    refetchSearchSpecies()
  }, 300)
}

const isDisabled = computed(() => {
  return selectedSpecies.value === undefined || selectedSongtype.value === undefined
})

defineExpose({ open })
</script>
