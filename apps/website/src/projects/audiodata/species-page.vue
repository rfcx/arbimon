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
    <div class="flex mt-6 px-8">
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
  </section>
</template>
<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { onMounted, ref } from 'vue'

import { useStore } from '~/store'

const store = useStore()
const speciesSelected = ref(undefined)

onMounted(() => {
  initTooltips()
})

const createSpecies = () => {
  console.info('createSpecies')
}

const bulkImport = () => {
  console.info('bulkImport')
}
</script>
