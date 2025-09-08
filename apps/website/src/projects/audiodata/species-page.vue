<template>
  <section class="py-20 bg-white dark:bg-pitch pl-18 site-page">
    <div class="flex items-center px-8 bg-white dark:bg-pitch">
      <h1 class="ml-1 text-gray-900 dark:text-insight">
        Species
      </h1>
      <button
        class="btn btn-primary btn-medium ml-2 btn-small text-[14px] h-[34px] items-center inline-flex px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!store.userIsDataEntryMember"
        data-tooltip-style="light"
        data-tooltip-target="newSpeciesTooltip"
        @click="createSpecies()"
      >
        <span>New species</span>
        <icon-custom-ic-plus-icon class="ml-2 w-4 h-4" />
      </button>
      <div
        id="newSpeciesTooltip"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ store.userIsDataEntryMember ? 'Add a new species + call type' : 'You do not have permission to add species' }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
      <button
        class="btn btn-primary btn-medium ml-2 btn-small items-center inline-flex text-[14px] h-[34px] px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!store.userIsDataEntryMember"
        data-tooltip-style="light"
        data-tooltip-target="importSpeciesTooltip"
        @click="bulkImport()"
      >
        <span>Bulk import species</span>
        <icon-custom-cloud-upload-dark class="ml-2 w-4 h-4" />
      </button>
    </div>
    <div
      id="importSpeciesTooltip"
      role="tooltip"
      class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
    >
      {{ store.userIsDataEntryMember ? 'Import species' : 'You do not have permission to add species' }}
      <div
        class="tooltip-arrow"
        data-popper-arrow
      />
    </div>
    <div class="flex mt-5 px-8">
      <button
        class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex text-[14px] h-[34px] px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!store.userIsFullProjectMember"
        data-tooltip-style="light"
        data-tooltip-target="exportSpecieTooltip"
        @click="bulkImport()"
      >
        <span>Export species list</span>
      </button>
      <div
        id="exportSpecieTooltip"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ store.userIsFullProjectMember ? 'Export species list' : 'You do not have permission to add species' }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
      <button
        class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex text-[14px] h-[34px] px-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :disabled="!store.userIsExpertMember || speciesSelected === undefined"
        data-tooltip-style="light"
        data-tooltip-target="deleteSpeciesTooltip"
        @click="bulkImport()"
      >
        <span>Delete species</span>
      </button>
      <div
        id="deleteSpeciesTooltip"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ store.userIsExpertMember ? 'Select species sound' : 'You do not have permission to remove species' }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </div>
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
    <div class="flex mt-5 px-9">
      <SortableTable
        class="mt-5"
        :columns="columns"
        :rows="filteredSpecies ?? []"
        :selected-row="selectedSpecies"
        :default-sort-key="'updated_at'"
        :default-sort-order="'desc'"
        @selected-item="onSelectedItem"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { initTooltips } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'

import { type SpeciesClassesParams, type SpeciesType } from '@rfcx-bio/common/api-arbimon/audiodata/species'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetSpecies } from './api/use-species'
import SortableTable from './component/sortable-table.vue'

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

const speciesSelected = ref(undefined)

const searchKeyword = ref('')
const searchTimeout = ref<number | undefined>(undefined)

const LIMIT = 10
const currentPage = ref(1)

const offset = computed(() => (currentPage.value - 1) * LIMIT)

const speciesParams = computed<SpeciesClassesParams>(() => {
  return {
    limit: LIMIT,
    offset: offset.value,
    q: searchKeyword.value
  }
})

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const { data: speciesData } = useGetSpecies(apiClientArbimon, selectedProjectSlug, speciesParams.value)

const columns = [
  { label: 'Species', key: 'species_name', maxWidth: 150 },
  { label: 'Taxon', key: 'taxon', maxWidth: 50 },
  { label: 'Sound', key: 'songtype_name', maxWidth: 50 },
  { label: 'Project Templates', key: 'templates', maxWidth: 50 },
  { label: 'Public Templates', key: 'public_templates', maxWidth: 50 }
]

const selectedSpecies = ref<SpeciesType | undefined>(undefined)

const filteredSpecies = computed(() => {
  if (!speciesData.value) return []
  return speciesData.value.list
})

const onSelectedItem = (row?: Record<string, any>) => {
  selectedSpecies.value = row as SpeciesType
  console.info(selectedSpecies.value)
}

onMounted(() => {
  initTooltips()

  console.info(speciesData)
})

const onSearchInput = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = window.setTimeout(() => {
    // debounce
  }, 300)
}

const createSpecies = () => {
  console.info('createSpecies')
}

const bulkImport = () => {
  console.info('bulkImport')
}
</script>
